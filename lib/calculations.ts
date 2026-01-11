import { TradeData, CalculatedValues } from './types';
import {
  SOLD_PREP_FIXED,
  MAX_CONDITION_SCORE,
  MOCK_COMP_DATA,
  getPrepCostTier,
} from './constants';
import type { TradeValueResult } from './bishconnect/client';

export type DriverId =
  | 'trade-in-percent-slider'
  | 'margin-percent-slider'
  | 'rv-type'
  | 'condition-score'
  | 'avg-listing-price'
  | 'additional-prep-cost'
  | 'custom-retail-price'
  | 'retail-source'
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
    soldPrepCost: SOLD_PREP_FIXED,
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

  // Calculate Average Comp Price
  if (MOCK_COMP_DATA.length > 0) {
    const totalComp = MOCK_COMP_DATA.reduce((sum, comp) => sum + comp.price, 0);
    calculated.avgCompPrice = totalComp / MOCK_COMP_DATA.length;
  }

  // Calculate Bish's Likely Retail Price (weighted average)
  const compWeight = MOCK_COMP_DATA.length > 0 ? 0.6 : 0;
  const alpWeight = 0.4;
  calculated.calculatedRetailPrice =
    (calculated.avgCompPrice * compWeight) + (data.avgListingPrice * alpWeight);

  // Default to 40000 if too low
  if (calculated.calculatedRetailPrice < 1000) {
    calculated.calculatedRetailPrice = 40000;
  }

  // Replacement Cost: Mocked to $40,500 on successful lookup
  if (isLookupComplete) {
    calculated.replacementCost = 40500;
  }

  // Trade values from API
  calculated.jdPowerTradeIn = tradeValues?.jdPowerTradeIn ?? 0;
  calculated.bishAdjustedTradeIn = tradeValues?.bishAdjustedTradeIn ?? 0;
  calculated.jdPowerRetailValue = tradeValues?.usedRetail ?? 0;

  console.log('[calculateValuation] tradeValues:', tradeValues);

  // Get the appropriate prep cost tier based on Bish adjusted trade-in value
  const prepTier = getPrepCostTier(calculated.bishAdjustedTradeIn);

  // PDI Cost from tier
  calculated.pdiCost = prepTier.pdiLabor;

  // Recon Cost: Base recon from tier + $500 per condition point below 9
  // Condition score 9 = base only, score 8 = base + $500, score 7 = base + $1000, etc.
  const conditionPenalty = (MAX_CONDITION_SCORE - data.conditionScore) * 500;
  calculated.reconCost = prepTier.recon + conditionPenalty;

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

  // Bish's TIV Base = Bish Adjusted Trade-In (depreciation already applied by API)
  calculated.bishTIVBase = calculated.bishAdjustedTradeIn;

  // Total Unit Costs = Bish's TIV Base + Total Prep Costs
  calculated.totalUnitCosts = calculated.bishTIVBase + calculated.totalPrepCosts;

  // Determine active retail price based on source
  calculated.activeRetailPrice = 
    (data.retailPriceSource === 'custom' && data.customRetailValue > 0)
      ? data.customRetailValue
      : calculated.jdPowerRetailValue;

  // TWO-WAY SLIDER LOGIC
  let finalTradeOffer = 0;

  const driversForTradeInPercentRecalc: DriverId[] = [
    'trade-in-percent-slider',
    'rv-type',
    'condition-score',
    'avg-listing-price',
    'additional-prep-cost',
    'custom-retail-price',
    'retail-source',
    'lookup-complete',
  ];

  if (driversForTradeInPercentRecalc.includes(driverId)) {
    // Scenario 1: User adjusts Trade-In % or any INPUT that changes Bish's Value/Costs
    // Final Trade Offer = Trade-In % * Total Unit Costs
    finalTradeOffer = calculated.totalUnitCosts * data.tradeInPercent;

  } else if (driverId === 'margin-percent-slider' || driverId === 'initial-load') {
    // Scenario 2: User adjusts Target Margin % (Relative to Active Retail Price) OR Initial Load
    const targetMarginAmount = calculated.activeRetailPrice * data.targetMarginPercent;

    // Final Trade Offer = Active Retail Price - Target Margin Amount
    finalTradeOffer = calculated.activeRetailPrice - targetMarginAmount;
    finalTradeOffer = Math.max(0, finalTradeOffer);
  }

  // Final metrics
  calculated.finalTradeOffer = finalTradeOffer;
  calculated.calculatedMarginAmount = calculated.activeRetailPrice - finalTradeOffer;
  calculated.calculatedMarginPercent = calculated.activeRetailPrice > 0
    ? calculated.calculatedMarginAmount / calculated.activeRetailPrice
    : 0;

  return calculated;
}

/**
 * Calculate the inverse Trade-In % based on margin slider movement
 */
export function calculateTradeInPercentFromMargin(
  totalUnitCosts: number,
  finalTradeOffer: number
): number {
  if (totalUnitCosts <= 0) return 1.0;
  const percent = finalTradeOffer / totalUnitCosts;
  return Math.min(1.5, Math.max(0, percent));
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
