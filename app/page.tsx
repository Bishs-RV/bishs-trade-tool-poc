'use client';

import { useState, useEffect } from 'react';
import { TradeData, CalculatedValues, RVType } from '@/lib/types';
import type { TradeEvaluation } from '@/lib/db/schema';
import { calculateValuation, calculateTradeInPercentFromMargin, DriverId, TradeValues } from '@/lib/calculations';
import Section1UnitData from '@/components/Section1UnitData';
import Section2Condition from '@/components/Section2Condition';
import Section3Market from '@/components/Section3Market';
import Section4Valuation from '@/components/Section4Valuation';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [isLookupComplete, setIsLookupComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tradeValues, setTradeValues] = useState<TradeValues | undefined>(undefined);
  const [data, setData] = useState<TradeData>({
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
    targetMarginPercent: 0.25,
    retailSource: 'bish',
    customRetailPrice: 0,
    retailPriceSource: 'jdpower',
    customRetailValue: 0,
    valuationNotes: '',
  });

  const [calculated, setCalculated] = useState<CalculatedValues>({
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
  });

  // Initial calculation on mount to set Trade-In % based on default margin
  useEffect(() => {
    recalculate('initial-load');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recalculate whenever data changes
  const recalculate = (driverId: DriverId, updates?: Partial<TradeData>, newTradeValues?: TradeValues) => {
    const newData = updates ? { ...data, ...updates } : data;
    // Use provided tradeValues, or fall back to stored tradeValues
    const currentTradeValues = newTradeValues ?? tradeValues;

    // Handle slider inverse calculation
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

      // Update target margin percent based on calculated margin
      if (driverId === 'trade-in-percent-slider' ||
          driverId === 'condition-score' ||
          driverId === 'additional-prep-cost' ||
          driverId === 'avg-listing-price' ||
          driverId === 'custom-retail-price' ||
          driverId === 'retail-source' ||
          driverId === 'rv-type') {
        setData({ ...newData, targetMarginPercent: newCalc.calculatedMarginPercent });
      } else {
        setData(newData);
      }

      setCalculated(newCalc);
    }
  };

  const handleUpdate = (updates: Partial<TradeData>, driverId: DriverId = 'trade-in-percent-slider') => {
    // Reset lookup state when vehicle selection fields change
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
    // Check if we're in custom input mode
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
        // Use fuzzy match endpoint for custom inputs
        // All name fields (manufacturerName, make, model) are stored regardless of JD Power vs custom
        const params = new URLSearchParams({
          year: data.year!.toString(),
          manufacturer: data.manufacturerName,
          model: data.model,
          condition: data.conditionScore.toString(),
        });
        if (data.make) {
          params.set('make', data.make);
        }
        if (data.mileage) {
          params.set('mileage', data.mileage.toString());
        }

        console.log('[handleLookup] Using fuzzy match with params:', Object.fromEntries(params));
        response = await fetch(`/api/trade-value/fuzzy?${params}`);
      } else {
        // Standard JD Power lookup
        const params = new URLSearchParams({
          modelTrimId: data.jdPowerModelTrimId!.toString(),
          condition: data.conditionScore.toString(),
        });
        if (data.mileage) {
          params.set('mileage', data.mileage.toString());
        }

        response = await fetch(`/api/trade-value?${params}`);
      }

      if (!response.ok) {
        throw new Error('Failed to fetch trade value');
      }

      const result = await response.json();
      console.log('[handleLookup] API response:', result);

      // Use trade values from response, defaulting to 0 if not found (custom input may not have values)
      const newTradeValues: TradeValues = {
        jdPowerTradeIn: result.jdPowerTradeIn ?? 0,
        bishAdjustedTradeIn: result.bishAdjustedTradeIn ?? 0,
        usedRetail: result.usedRetail ?? 0,
        valuationResults: result.valuationResults,
      };
      console.log('[handleLookup] Trade values received:', newTradeValues);

      // Store the trade values for future recalculations
      setTradeValues(newTradeValues);

      // Update with trade value (or 0 if no match) and trigger recalculation
      const updates: Partial<TradeData> = {
        avgListingPrice: newTradeValues.bishAdjustedTradeIn > 0
          ? newTradeValues.bishAdjustedTradeIn * 1.15
          : data.avgListingPrice,
      };

      console.log('[handleLookup] Calling recalculate with tradeValues:', newTradeValues);
      recalculate('lookup-complete', updates, newTradeValues);
      setIsLookupComplete(true);
    } catch (error: unknown) {
      console.error('Lookup error:', error);
      // Still allow user to continue even if lookup fails
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
        // Customer Info
        customerName: data.customerName || undefined,
        customerPhone: data.customerPhone || undefined,
        customerEmail: data.customerEmail || undefined,

        // Unit Data
        stockNumber: data.stockNumber || undefined,
        location: data.location || undefined,
        year: data.year || undefined,
        make: data.make || undefined,
        model: data.model || undefined,
        vin: data.vin || undefined,
        rvType: data.rvType || undefined,
        mileage: data.mileage || undefined,

        // JD Power Data
        jdPowerModelTrimId: data.jdPowerModelTrimId || undefined,
        jdPowerManufacturerId: data.jdPowerManufacturerId || undefined,

        // Condition Data
        conditionScore: data.conditionScore,
        majorIssues: data.majorIssues || undefined,
        unitAddOns: data.unitAddOns || undefined,
        additionalPrepCost: data.additionalPrepCost || undefined,

        // Market Data
        avgListingPrice: data.avgListingPrice || undefined,

        // Valuation Inputs
        tradeInPercent: data.tradeInPercent,
        targetMarginPercent: data.targetMarginPercent,
        retailPriceSource: data.retailPriceSource,
        customRetailValue: data.customRetailValue || undefined,

        // Calculated Outputs
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

        // Notes
        valuationNotes: data.valuationNotes || undefined,

        // Audit
        createdBy: 'trade-tool-user', // TODO: Replace with actual user from auth
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
      console.log('Valuation saved:', result.evaluation);
      alert(`Valuation saved successfully! ID: ${result.evaluation.tradeEvaluationId}`);
    } catch (error: unknown) {
      console.error('Submit error:', error);
      const message = error instanceof Error ? error.message : 'Failed to save valuation';
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoadEvaluation = (evaluation: TradeEvaluation) => {
    // Map database fields back to TradeData state
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
      rvType: (evaluation.rvType as RVType) || 'FW',
      mileage: evaluation.mileage,
      jdPowerManufacturerId: evaluation.jdPowerManufacturerId,
      jdPowerModelTrimId: evaluation.jdPowerModelTrimId,
      conditionScore: evaluation.conditionScore || 8,
      majorIssues: evaluation.majorIssues || '',
      unitAddOns: evaluation.unitAddOns || '',
      additionalPrepCost: evaluation.additionalPrepCost ? parseFloat(evaluation.additionalPrepCost) : 0,
      avgListingPrice: evaluation.avgListingPrice ? parseFloat(evaluation.avgListingPrice) : 0,
      tradeInPercent: evaluation.tradeInPercent ? parseFloat(evaluation.tradeInPercent) : 1.0,
      targetMarginPercent: evaluation.targetMarginPercent ? parseFloat(evaluation.targetMarginPercent) : 0.25,
      retailPriceSource: (evaluation.retailPriceSource as 'jdpower' | 'custom') || 'jdpower',
      customRetailValue: evaluation.customRetailValue ? parseFloat(evaluation.customRetailValue) : 0,
      valuationNotes: evaluation.valuationNotes || '',
    };

    setData(prev => ({ ...prev, ...loadedData }));
    // Reset lookup state - user must re-lookup for fresh API values
    setIsLookupComplete(false);
    setTradeValues(undefined);
    // Trigger recalculation
    recalculate('initial-load', loadedData);
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-100 via-blue-50 to-gray-100 p-2">
      <div className="h-full flex flex-col">
        {/* Header */}
        <header className="relative overflow-hidden text-center mb-2 py-2 px-4 bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 rounded-lg shadow-lg border border-slate-600 flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-500/10 to-transparent" />
          <h1 className="relative z-10 text-2xl font-black text-white tracking-tight">
            Bish&apos;s Trade-In Tool
          </h1>

          {/* User Name Display */}
          <div className="absolute top-1/2 -translate-y-1/2 right-4 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
            <p className="text-xs text-white">
              <span className="opacity-80">User:</span>{' '}
              <span className="font-bold">Julian Baden</span>
            </p>
          </div>
        </header>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 gap-2">
          {/* 3-Column Grid for Sections 1, 2, 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 flex-1 min-h-0">
            {/* COLUMN 1: Section 1 - Unit & Base Data */}
            <div className="lg:col-span-1 overflow-auto">
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
            <div className="lg:col-span-1 overflow-auto">
              <Section2Condition
                data={data}
                calculated={calculated}
                onUpdate={(updates) => {
                  const driverId = updates.conditionScore !== undefined 
                    ? 'condition-score' 
                    : updates.additionalPrepCost !== undefined
                    ? 'additional-prep-cost'
                    : 'trade-in-percent-slider';
                  handleUpdate(updates, driverId);
                }}
                isLocked={!isLookupComplete}
              />
            </div>

            {/* COLUMN 3: Section 3 - Market Data */}
            <div className="lg:col-span-1 overflow-auto">
              <Section3Market
                data={data}
                onUpdate={(updates) => handleUpdate(updates, 'avg-listing-price')}
                isLocked={!isLookupComplete}
              />
            </div>
          </div>

          {/* Full-Width Section 4 - Valuation Levers */}
          <div className="flex-shrink-0">
            <Section4Valuation
              data={data}
              calculated={calculated}
              onUpdate={(updates) => {
                const driverId = updates.tradeInPercent !== undefined
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

          {/* Notes + Submit Row */}
          <div className="flex-shrink-0 flex gap-2">
            <div className="flex-1 p-2 bg-white rounded-lg shadow-md border border-gray-200">
              <Textarea
                id="valuation-notes"
                rows={2}
                className="resize-none"
                placeholder="Valuation notes: negotiations, sign-off, special terms..."
                value={data.valuationNotes}
                onChange={(e) => setData({ ...data, valuationNotes: e.target.value })}
                disabled={!isLookupComplete}
              />
            </div>
            <Button
              type="submit"
              className="px-8 py-3 text-lg text-white font-bold rounded-lg shadow-lg bg-gradient-to-r from-slate-600 via-slate-700 to-slate-800 hover:from-slate-700 hover:via-slate-800 hover:to-slate-900 hover:scale-[1.02] active:scale-[0.98] border border-slate-500 disabled:hover:scale-100 flex-shrink-0"
              disabled={!isLookupComplete || isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  <span>SAVING...</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>SUBMIT</span>
                  <span className="text-xl">→</span>
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
