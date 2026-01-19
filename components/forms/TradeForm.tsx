'use client';

import { useState, useEffect } from 'react';
import { TradeData, CalculatedValues, RVType } from '@/lib/types';
import type { TradeEvaluation } from '@/lib/db/schema';
import {
  calculateValuation,
  calculateTradeInPercentFromMargin,
  DriverId,
  TradeValues,
} from '@/lib/calculations';
import { TARGET_MARGIN_PERCENT } from '@/lib/constants';
import Section1UnitData from '@/components/Section1UnitData';
import Section2Condition from '@/components/Section2Condition';
import Section3Market from '@/components/Section3Market';
import Section4Valuation from '@/components/Section4Valuation';
import StickyActionBar from '@/components/StickyActionBar';
import { Textarea } from '@/components/ui/textarea';

const VALID_RV_TYPES = ['TT', 'FW', 'POP', 'TC', 'CAG', 'CAD', 'CCG', 'CCD'] as const;
const isValidRvType = (type: string | null): type is RVType =>
  type !== null && VALID_RV_TYPES.includes(type as RVType);

const initialData: TradeData = {
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  stockNumber: '',
  location: 'BMT',
  year: null,
  make: '',
  model: '',
  vin: '',
  rvType: 'FW',
  mileage: null,
  originalListPrice: null,
  jdPowerManufacturerId: null,
  jdPowerModelTrimId: null,
  manufacturerName: '',
  conditionScore: 8,
  majorIssues: '',
  unitAddOns: '',
  additionalPrepCost: 0,
  avgListingPrice: 0,
  tradeInPercent: 1.0,
  targetMarginPercent: TARGET_MARGIN_PERCENT,
  retailSource: 'bish',
  customRetailPrice: 0,
  retailPriceSource: 'jdpower',
  customRetailValue: 0,
  valuationNotes: '',
};

const initialCalculated: CalculatedValues = {
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

export default function TradeForm() {
  const [isLookupComplete, setIsLookupComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tradeValues, setTradeValues] = useState<TradeValues | undefined>(undefined);
  const [data, setData] = useState<TradeData>(initialData);
  const [calculated, setCalculated] = useState<CalculatedValues>(initialCalculated);

  // Initial calculation on mount to set Trade-In % based on default margin
  useEffect(() => {
    recalculate('initial-load');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recalculate whenever data changes
  const recalculate = (
    driverId: DriverId,
    updates?: Partial<TradeData>,
    newTradeValues?: TradeValues
  ) => {
    const newData = updates ? { ...data, ...updates } : data;
    const currentTradeValues = newTradeValues ?? tradeValues;

    if (driverId === 'margin-percent-slider' || driverId === 'initial-load') {
      const newCalc = calculateValuation(newData, driverId, isLookupComplete, currentTradeValues);
      const newTradeInPercent = calculateTradeInPercentFromMargin(
        newCalc.totalUnitCosts,
        newCalc.finalTradeOffer
      );

      setData({ ...newData, tradeInPercent: newTradeInPercent });
      setCalculated(newCalc);
    } else {
      const newCalc = calculateValuation(newData, driverId, isLookupComplete, currentTradeValues);

      if (
        driverId === 'trade-in-percent-slider' ||
        driverId === 'condition-score' ||
        driverId === 'additional-prep-cost' ||
        driverId === 'avg-listing-price' ||
        driverId === 'custom-retail-price' ||
        driverId === 'retail-source' ||
        driverId === 'rv-type'
      ) {
        setData({ ...newData, targetMarginPercent: newCalc.calculatedMarginPercent });
      } else {
        setData(newData);
      }

      setCalculated(newCalc);
    }
  };

  const handleUpdate = (
    updates: Partial<TradeData>,
    driverId: DriverId = 'trade-in-percent-slider'
  ) => {
    const vehicleFieldsChanged =
      'year' in updates ||
      'rvType' in updates ||
      'jdPowerManufacturerId' in updates ||
      'jdPowerModelTrimId' in updates ||
      'make' in updates ||
      'model' in updates;

    if (vehicleFieldsChanged && isLookupComplete) {
      setIsLookupComplete(false);
      setTradeValues(undefined);
    }

    recalculate(driverId, updates);
  };

  const handleLookup = async () => {
    const isCustomInputMode =
      data.customManufacturer !== undefined ||
      data.customMake !== undefined ||
      data.customModel !== undefined;

    if (!isCustomInputMode && !data.jdPowerModelTrimId) {
      alert('Please select a model to get trade value');
      return;
    }

    setIsLoading(true);
    try {
      let response: Response;

      if (isCustomInputMode) {
        const params = new URLSearchParams({
          year: data.year!.toString(),
          manufacturer: data.manufacturerName,
          model: data.model,
          condition: data.conditionScore.toString(),
        });
        if (data.make) params.set('make', data.make);
        if (data.mileage) params.set('mileage', data.mileage.toString());

        response = await fetch(`/api/trade-value/fuzzy?${params}`);
      } else {
        const params = new URLSearchParams({
          modelTrimId: data.jdPowerModelTrimId!.toString(),
          condition: data.conditionScore.toString(),
        });
        if (data.mileage) params.set('mileage', data.mileage.toString());

        response = await fetch(`/api/trade-value?${params}`);
      }

      if (!response.ok) throw new Error('Failed to fetch trade value');

      const result = await response.json();
      const newTradeValues: TradeValues = {
        jdPowerTradeIn: result.jdPowerTradeIn ?? 0,
        bishAdjustedTradeIn: result.bishAdjustedTradeIn ?? 0,
        usedRetail: result.usedRetail ?? 0,
        valuationResults: result.valuationResults,
      };

      setTradeValues(newTradeValues);

      const updates: Partial<TradeData> = {
        avgListingPrice:
          newTradeValues.bishAdjustedTradeIn > 0
            ? newTradeValues.bishAdjustedTradeIn * 1.15
            : data.avgListingPrice,
      };

      recalculate('lookup-complete', updates, newTradeValues);
      setIsLookupComplete(true);
    } catch (error) {
      console.error('Lookup error:', error);
      setIsLookupComplete(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        customerName: data.customerName || undefined,
        customerPhone: data.customerPhone || undefined,
        customerEmail: data.customerEmail || undefined,
        stockNumber: data.stockNumber || undefined,
        location: data.location || undefined,
        year: data.year || undefined,
        make: data.make || undefined,
        model: data.model || undefined,
        vin: data.vin || undefined,
        rvType: data.rvType || undefined,
        mileage: data.mileage || undefined,
        jdPowerModelTrimId: data.jdPowerModelTrimId || undefined,
        jdPowerManufacturerId: data.jdPowerManufacturerId || undefined,
        conditionScore: data.conditionScore,
        majorIssues: data.majorIssues || undefined,
        unitAddOns: data.unitAddOns || undefined,
        additionalPrepCost: data.additionalPrepCost || undefined,
        avgListingPrice: data.avgListingPrice || undefined,
        tradeInPercent: data.tradeInPercent,
        targetMarginPercent: data.targetMarginPercent,
        retailPriceSource: data.retailPriceSource,
        customRetailValue: data.customRetailValue || undefined,
        jdPowerTradeIn: calculated.jdPowerTradeIn,
        jdPowerRetailValue: calculated.jdPowerRetailValue,
        pdiCost: calculated.pdiCost,
        reconCost: calculated.reconCost,
        soldPrepCost: calculated.soldPrepCost,
        totalPrepCosts: calculated.totalPrepCosts,
        bishTivBase: calculated.bishTIVBase,
        totalUnitCosts: calculated.totalUnitCosts,
        avgCompPrice: calculated.avgCompPrice,
        calculatedRetailPrice: calculated.calculatedRetailPrice,
        replacementCost: calculated.replacementCost,
        activeRetailPrice: calculated.activeRetailPrice,
        finalTradeOffer: calculated.finalTradeOffer,
        calculatedMarginAmount: calculated.calculatedMarginAmount,
        calculatedMarginPercent: calculated.calculatedMarginPercent,
        valuationNotes: data.valuationNotes || undefined,
        createdBy: 'trade-tool-user',
      };

      const response = await fetch('/api/valuations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to save valuation';
        try {
          const error = await response.json();
          errorMessage = error.error || errorMessage;
        } catch {
          // Response body is not valid JSON
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      if (!result.evaluation?.tradeEvaluationId) {
        throw new Error('Invalid response from server');
      }
      alert(`Valuation saved successfully! ID: ${result.evaluation.tradeEvaluationId}`);
    } catch (error) {
      console.error('Submit error:', error);
      const message = error instanceof Error ? error.message : 'Failed to save valuation';
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoadEvaluation = (evaluation: TradeEvaluation) => {
    const loadedData: Partial<TradeData> = {
      customerName: evaluation.customerName || '',
      customerPhone: evaluation.customerPhone || '',
      customerEmail: evaluation.customerEmail || '',
      stockNumber: evaluation.stockNumber || '',
      location: evaluation.location || 'BMT',
      year: evaluation.year,
      make: evaluation.make || '',
      model: evaluation.model || '',
      vin: evaluation.vin || '',
      rvType: isValidRvType(evaluation.rvType) ? evaluation.rvType : 'FW',
      mileage: evaluation.mileage,
      jdPowerManufacturerId: evaluation.jdPowerManufacturerId,
      jdPowerModelTrimId: evaluation.jdPowerModelTrimId,
      conditionScore: evaluation.conditionScore || 8,
      majorIssues: evaluation.majorIssues || '',
      unitAddOns: evaluation.unitAddOns || '',
      additionalPrepCost: evaluation.additionalPrepCost ? parseFloat(evaluation.additionalPrepCost) : 0,
      avgListingPrice: evaluation.avgListingPrice ? parseFloat(evaluation.avgListingPrice) : 0,
      tradeInPercent: evaluation.tradeInPercent ? parseFloat(evaluation.tradeInPercent) : 1.0,
      targetMarginPercent: evaluation.targetMarginPercent ? parseFloat(evaluation.targetMarginPercent) : TARGET_MARGIN_PERCENT,
      retailPriceSource: (evaluation.retailPriceSource as 'jdpower' | 'custom') || 'jdpower',
      customRetailValue: evaluation.customRetailValue ? parseFloat(evaluation.customRetailValue) : 0,
      valuationNotes: evaluation.valuationNotes || '',
    };

    setData((prev) => ({ ...prev, ...loadedData }));
    setIsLookupComplete(false);
    setTradeValues(undefined);
    recalculate('initial-load', loadedData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      {/* 3-Column Grid for Sections 1, 2, 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        {/* COLUMN 1: Section 1 - Unit & Base Data */}
        <div className="lg:col-span-1">
          <Section1UnitData
            data={data}
            calculated={calculated}
            onUpdate={(updates) => handleUpdate(updates, 'trade-in-percent-slider')}
            onLookup={handleLookup}
            isLookupComplete={isLookupComplete}
            isLoading={isLoading}
            onLoadEvaluation={handleLoadEvaluation}
          />
        </div>

        {/* COLUMN 2: Section 2 - Condition & Prep Costs */}
        <div className="lg:col-span-1">
          <Section2Condition
            data={data}
            calculated={calculated}
            onUpdate={(updates) => {
              const driverId =
                updates.conditionScore !== undefined
                  ? 'condition-score'
                  : updates.additionalPrepCost !== undefined
                    ? 'additional-prep-cost'
                    : 'trade-in-percent-slider';
              handleUpdate(updates, driverId);
            }}
            isLocked={!isLookupComplete}
          />
        </div>

        {/* COLUMN 3: Section 3 - Market Data + Valuation Notes */}
        <div className="lg:col-span-1 flex flex-col gap-2">
          <div className="flex-1">
            <Section3Market
              data={data}
              onUpdate={(updates) => handleUpdate(updates, 'avg-listing-price')}
              isLocked={!isLookupComplete}
            />
          </div>

          {/* Valuation Notes Card */}
          <div className="relative flex-1 flex flex-col">
            <div
              className={`bg-white p-4 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 flex-1 flex flex-col ${!isLookupComplete ? 'pointer-events-none select-none' : ''}`}
            >
              {!isLookupComplete && (
                <div className="absolute inset-0 bg-gradient-to-br from-white/95 to-gray-100/95 backdrop-blur-md z-20 rounded-xl flex items-center justify-center pointer-events-auto">
                  <div className="text-center border-2 border-dashed border-gray-400 rounded-lg p-4 bg-white/70 shadow-lg">
                    <p className="text-sm font-bold text-gray-600">Complete Step 1 to unlock</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Valuation Notes</h2>
              </div>

              <Textarea
                className="resize-none flex-1 min-h-[100px]"
                placeholder="Negotiations, sign-off, special terms..."
                value={data.valuationNotes}
                onChange={(e) => setData({ ...data, valuationNotes: e.target.value })}
                disabled={!isLookupComplete}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Full-Width Section 4 - Valuation Levers */}
      <div>
        <Section4Valuation
          data={data}
          calculated={calculated}
          onUpdate={(updates) => {
            const driverId =
              updates.tradeInPercent !== undefined
                ? 'trade-in-percent-slider'
                : updates.targetMarginPercent !== undefined
                  ? 'margin-percent-slider'
                  : updates.retailSource !== undefined
                    ? 'retail-source'
                    : updates.customRetailPrice !== undefined
                      ? 'custom-retail-price'
                      : 'trade-in-percent-slider';
            handleUpdate(updates, driverId);
          }}
          isLocked={!isLookupComplete}
        />
      </div>

      {/* Sticky Action Bar */}
      <StickyActionBar
        isLocked={!isLookupComplete}
        isSubmitting={isSubmitting}
      />
    </form>
  );
}
