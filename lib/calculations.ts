import { TradeData, CalculatedValues } from './types';
import {
  getPrepCostTier,
  DEFAULT_TRADE_IN_PERCENT,
  TRADE_IN_PERCENT_MAX,
} from './constants';
import type { TradeValueResult } from './bishconnect/client';

export type DriverId =
  | 'trade-in-percent-slider'
  | 'margin-percent-slider'
  | 'rv-type'
  | 'condition-score'
  | 'avg-listing-price'
  | 'additional-prep-cost'
  | 'initial-load'
  | 'lookup-complete';

export type TradeValues = TradeValueResult;

/**
 * Core calculation engine for the Trade-In Tool
 * Implements the complex interdependent formulas with two-way slider logic
 *
 * @param tradeValues - Trade values from BishConnect API (both raw and adjusted)
 */
export function calculateValuation(
  data: TradeData,
  driverId: DriverId,
  isLookupComplete: boolean,
  tradeValues?: TradeValues
): CalculatedValues {

  // Initialize calculated values
  const calculated: CalculatedValues = {
    jdPowerTradeIn: 0,
    jdPowerRetailValue: 0,
    bishAdjustedTradeIn: 0,
    pdiCost: 0,
    reconCost: 0,
    soldPrepCost: 0,
    totalPrepCosts: 0,
    bishTIVBase: 0,
    totalUnitCosts: 0,
    avgCompPrice: 0,
    calculatedRetailPrice: 0,
    replacementCost: 0,
    activeRetailPrice: 0,
    finalTradeOffer: 0,
    calculatedMarginAmount: 0,
    calculatedMarginPercent: 0,
  };

  // Calculate Bish's Likely Retail Price from average listing price
  calculated.calculatedRetailPrice = data.avgListingPrice > 0
    ? data.avgListingPrice
    : 40000;

  // Replacement Cost: Not yet implemented (requires inventory data)
  // TODO: Integrate with inventory system to get actual replacement cost
  calculated.replacementCost = 0;

  // Trade values from API
  calculated.jdPowerTradeIn = tradeValues?.jdPowerTradeIn ?? 0;
  calculated.bishAdjustedTradeIn = tradeValues?.bishAdjustedTradeIn ?? 0;
  calculated.jdPowerRetailValue = tradeValues?.usedRetail ?? 0;

  // Get prep cost tier based on Bish adjusted trade-in value (for PDI, sold prep, etc.)
  const prepTier = getPrepCostTier(calculated.bishAdjustedTradeIn);

  // PDI Cost from tier
  calculated.pdiCost = prepTier.pdiLabor;

  // Recon Cost: Lookup based on JD Power Trade-In value (raw, not adjusted)
  const reconTier = getPrepCostTier(calculated.jdPowerTradeIn);
  calculated.reconCost = reconTier.recon;

  // Sold Prep Cost: Sum of Get Ready + Orientation + Detail + Gift Certificate + Shop Supplies
  calculated.soldPrepCost =
    prepTier.getReady +
    prepTier.orientation +
    prepTier.detail +
    prepTier.giftCertificate +
    prepTier.shopSupplies;

  // Total Prep Costs
  calculated.totalPrepCosts =
    calculated.pdiCost +
    calculated.reconCost +
    calculated.soldPrepCost +
    data.additionalPrepCost;

  // Bish's TIV Base = condition-specific adjusted_value from API
  const conditionKey = data.conditionScore.toString();
  const conditionResult = tradeValues?.valuationResults?.[conditionKey];
  calculated.bishTIVBase = conditionResult?.adjusted_value ?? calculated.bishAdjustedTradeIn;

  // Total Unit Costs = Bish's TIV Base + Total Prep Costs
  calculated.totalUnitCosts = calculated.bishTIVBase + calculated.totalPrepCosts;

  // Determine active retail price based on source
  // When using JD Power, apply 90% factor (90% of JD Power Retail)
  calculated.activeRetailPrice =
    (data.retailPriceSource === 'custom' && data.customRetailValue > 0)
      ? data.customRetailValue
      : calculated.jdPowerRetailValue * 0.90;

  // TWO-WAY SLIDER LOGIC
  // Only calculate final offer when we have real data (after lookup)
  const hasRealData = isLookupComplete || driverId === 'lookup-complete';
  let finalTradeOffer = 0;

  if (!hasRealData) {
    // Before lookup: don't calculate, preserve defaults
    calculated.finalTradeOffer = 0;
    calculated.calculatedMarginAmount = 0;
    calculated.calculatedMarginPercent = data.targetMarginPercent;
    return calculated;
  }

  if (driverId === 'trade-in-percent-slider') {
    // Scenario 1: User adjusts Trade-In %
    // Final Trade Offer = Trade-In % * Bish's TIV Base (the JD Power adjusted value)
    // Prep costs affect margin, not the offer amount
    finalTradeOffer = calculated.bishTIVBase * data.tradeInPercent;
  } else {
    // Scenario 2: All other cases use margin-driven formula
    // Margin = Retail - Final Offer - Prep Costs
    // So: Final Offer = Retail - Margin - Prep Costs
    const targetMarginAmount = calculated.activeRetailPrice * data.targetMarginPercent;
    finalTradeOffer = calculated.activeRetailPrice - targetMarginAmount - calculated.totalPrepCosts;
    finalTradeOffer = Math.max(0, finalTradeOffer);
  }

  // Final metrics
  // Margin = what we keep = Retail - Offer - Prep Costs
  calculated.finalTradeOffer = finalTradeOffer;
  calculated.calculatedMarginAmount = calculated.activeRetailPrice - finalTradeOffer - calculated.totalPrepCosts;
  calculated.calculatedMarginPercent = calculated.activeRetailPrice > 0
    ? calculated.calculatedMarginAmount / calculated.activeRetailPrice
    : 0;

  return calculated;
}

/**
 * Calculate the inverse Trade-In % based on margin slider movement
 * Trade-In % = Final Offer / Bish's TIV Base
 */
export function calculateTradeInPercentFromMargin(
  bishTIVBase: number,
  finalTradeOffer: number
): number {
  if (bishTIVBase <= 0) return DEFAULT_TRADE_IN_PERCENT;
  const percent = finalTradeOffer / bishTIVBase;
  // Allow up to 150% (TRADE_IN_PERCENT_MAX + 20% buffer for margin-driven calculations)
  return Math.min(TRADE_IN_PERCENT_MAX + 0.2, Math.max(0, percent));
}

/**
 * Format currency for display
 */
export function formatCurrency(value: number): string {
  if (typeof value !== 'number' || isNaN(value)) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

/**
 * Format percentage for display
 */
export function formatPercent(value: number): string {
  if (typeof value !== 'number' || isNaN(value)) return '0.0%';
  return (value * 100).toFixed(1) + '%';
}
