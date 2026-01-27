'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useMockAuth } from '@bishs-rv/bishs-global-header';
import type { TradeValues } from '@/lib/calculations';
import {
  useTradeStore,
  useTradeData,
  useCalculated,
  useIsLookupComplete,
  useIsLoading,
  useIsSubmitting,
  useDepreciation,
} from '@/lib/store';
import {
  DEFAULT_CONDITION_SCORE,
  TARGET_MARGIN_PERCENT,
} from '@/lib/constants';
import Section1UnitData from '@/components/Section1UnitData';
import Section2Condition from '@/components/Section2Condition';
import Section3Market from '@/components/Section3Market';
import Section4Valuation from '@/components/Section4Valuation';
import StickyActionBar from '@/components/StickyActionBar';
import { Textarea } from '@/components/ui/textarea';

export default function TradeForm() {
  // Get user from real auth (NextAuth) or fall back to mock auth
  const { data: session, status } = useSession();
  const mockAuth = useMockAuth();

  const isRealAuthActive = status === "authenticated" && session?.user;
  const userName = isRealAuthActive
    ? (session.user.name ?? "Unknown User")
    : (mockAuth.user?.name ?? "Test User");

  // Zustand store state
  const data = useTradeData();
  const calculated = useCalculated();
  const isLookupComplete = useIsLookupComplete();
  const isLoading = useIsLoading();
  const isSubmitting = useIsSubmitting();
  const depreciation = useDepreciation();

  // Zustand store actions
  const {
    updateFields,
    recalculate,
    setTradeValues,
    setIsLookupComplete,
    setIsLoading,
    setIsSubmitting,
    loadEvaluation,
  } = useTradeStore();

  // Initial calculation on mount
  useEffect(() => {
    recalculate('initial-load');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdate = (
    updates: Parameters<typeof updateFields>[0],
    driverId: Parameters<typeof updateFields>[1] = 'trade-in-percent-slider'
  ) => {
    updateFields(updates, driverId);
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

      // Reset condition-related fields for new valuation + set avgListingPrice
      const updates = {
        avgListingPrice:
          newTradeValues.bishAdjustedTradeIn > 0
            ? newTradeValues.bishAdjustedTradeIn * 1.15
            : data.avgListingPrice,
        // Reset fields that should not persist between valuations
        conditionScore: DEFAULT_CONDITION_SCORE,
        majorIssues: '',
        unitAddOns: '',
        additionalPrepCost: 0,
        valuationNotes: '',
        targetMarginPercent: TARGET_MARGIN_PERCENT,
        retailPriceSource: 'jdpower' as const,
        customRetailValue: 0,
      };

      recalculate('lookup-complete', updates, newTradeValues);
      setIsLookupComplete(true);
    } catch (error) {
      console.error('Lookup error:', error);
      setIsLookupComplete(false);
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
        createdBy: userName,
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
            onLoadEvaluation={loadEvaluation}
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
                onChange={(e) => handleUpdate({ valuationNotes: e.target.value })}
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
        data={data}
        calculated={calculated}
        depreciation={depreciation}
      />
    </form>
  );
}
