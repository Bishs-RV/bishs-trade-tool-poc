'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useMockAuth } from '@bishs-rv/bishs-global-header';
import { toast } from 'sonner';
import type { TradeValues } from '@/lib/calculations';
import type { ValuationResult } from '@/lib/bishconnect/client';
import { saveValuation } from '@/lib/save-valuation';
import {
  useTradeStore,
  useTradeData,
  useCalculated,
  useIsLookupComplete,
  useIsLoading,
  useIsSubmitting,
  useDepreciation,
  useEvaluationCreatedBy,
  useEvaluationCreatedDate,
  useEvaluationId,
  useTradeValues,
  useIsRefreshingDepreciation,
} from '@/lib/store';
import Section1UnitData from '@/components/Section1UnitData';
import Section2Condition from '@/components/Section2Condition';
import Section3Market from '@/components/Section3Market';
import Section4Valuation from '@/components/Section4Valuation';
import StickyActionBar from '@/components/StickyActionBar';
import SubmissionSuccessDialog from '@/components/SubmissionSuccessDialog';
import { Textarea } from '@/components/ui/textarea';

export default function TradeForm() {
  // Get user from real auth (NextAuth) or fall back to mock auth
  const { data: session, status } = useSession();
  const mockAuth = useMockAuth();

  const isRealAuthActive = status === "authenticated" && session?.user;
  const userEmail = isRealAuthActive
    ? (session.user.email ?? "unknown@bishs.com")
    : (mockAuth.user?.email ?? "test@bishs.com");

  // Zustand store state
  const data = useTradeData();
  const calculated = useCalculated();
  const isLookupComplete = useIsLookupComplete();
  const isLoading = useIsLoading();
  const isSubmitting = useIsSubmitting();
  const depreciation = useDepreciation();
  const isRefreshingDepreciation = useIsRefreshingDepreciation();
  const evaluationCreatedBy = useEvaluationCreatedBy();
  const evaluationCreatedDate = useEvaluationCreatedDate();
  const evaluationId = useEvaluationId();
  const tradeValues = useTradeValues();

  // Get current user name from session or mock auth
  const currentUserName = isRealAuthActive
    ? (session.user.name ?? undefined)
    : (mockAuth.user?.name ?? undefined);

  // Zustand store actions
  const {
    updateField,
    updateFields,
    recalculate,
    resetForNewValuation,
    setTradeValues,
    setIsLookupComplete,
    setIsLoading,
    setIsSubmitting,
    setEvaluationId,
    setIsRefreshingDepreciation,
    loadEvaluation,
    reset,
  } = useTradeStore();

  // Success dialog state
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  // Initial calculation on mount
  useEffect(() => {
    recalculate('initial-load');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch user's default location from UKG on mount
  useEffect(() => {
    async function fetchUserLocation() {
      try {
        const response = await fetch('/api/user/location');
        if (response.ok) {
          const result = await response.json();
          if (result.location) {
            updateField('location', result.location);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user location:', error);
      }
    }
    fetchUserLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Wrap loadEvaluation to also re-fetch depreciation data from API
  const handleLoadEvaluation = useCallback(
    (evaluation: import('@/lib/db/schema').TradeEvaluation) => {
      loadEvaluation(evaluation);

      // Re-fetch depreciation data if we have a model trim ID
      const modelTrimId = evaluation.jdPowerModelTrimId;
      if (!modelTrimId) return;

      setIsRefreshingDepreciation(true);

      const params = new URLSearchParams({
        modelTrimId: modelTrimId.toString(),
        condition: (evaluation.conditionScore || 7).toString(),
      });
      if (evaluation.mileage) params.set('mileage', evaluation.mileage.toString());

      fetch(`/api/trade-value?${params}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((result) => {
          if (!result?.valuationResults) return;

          // Abort if a different unit has been loaded/looked up since
          const storeState = useTradeStore.getState();
          if (storeState.data.jdPowerModelTrimId !== modelTrimId) return;

          const current = storeState.tradeValues;
          if (!current) return;

          // Merge depreciation fields from fresh API into existing tradeValues
          const mergedResults: Record<string, ValuationResult> = {};
          for (const [key, apiResult] of Object.entries(
            result.valuationResults as Record<string, ValuationResult>
          )) {
            const existing = current.valuationResults?.[key];
            mergedResults[key] = {
              // Keep saved financial values if they exist
              ...(existing || apiResult),
              // Overlay fresh depreciation/market metadata from API
              months_to_sell: apiResult.months_to_sell,
              vehicle_age: apiResult.vehicle_age,
              depreciation_months: apiResult.depreciation_months,
              min_value: apiResult.min_value,
              max_value: apiResult.max_value,
            };
          }

          storeState.setTradeValues({
            ...current,
            valuationResults: mergedResults,
          });
        })
        .catch((err) =>
          console.error('Failed to fetch depreciation data:', err)
        )
        .finally(() => {
          setIsRefreshingDepreciation(false);
        });
    },
    [loadEvaluation, setIsRefreshingDepreciation]
  );

  const handleLookup = async () => {
    // Clear stale depreciation refresh flag from any prior loaded evaluation
    setIsRefreshingDepreciation(false);

    const isCustomInputMode =
      data.customManufacturer !== undefined ||
      data.customMake !== undefined ||
      data.customModel !== undefined;

    if (!isCustomInputMode && !data.jdPowerModelTrimId) {
      toast.warning('Please select a model to get trade value');
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

      // Set avgListingPrice based on lookup results
      const avgListingPrice = newTradeValues.bishAdjustedTradeIn > 0
        ? newTradeValues.bishAdjustedTradeIn * 1.15
        : data.avgListingPrice;

      // Set trade values and mark lookup complete first
      setTradeValues(newTradeValues);
      setIsLookupComplete(true);

      // Reset condition fields to defaults and clear evaluation metadata
      resetForNewValuation();

      // Update avgListingPrice separately (calculated from lookup results)
      updateField('avgListingPrice', avgListingPrice);
    } catch (error) {
      console.error('Lookup error:', error);
      setIsLookupComplete(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Guard against concurrent save-on-print calls
  const isSavingRef = useRef(false);

  // Save-on-print callback: saves if not already saved
  const handleSaveOnPrint = useCallback(async () => {
    // Skip if already saved (via submit or prior print) or loaded evaluation
    if (evaluationId || evaluationCreatedBy || isSavingRef.current) return;
    isSavingRef.current = true;

    try {
      const result = await saveValuation({ data, calculated, userEmail });
      setEvaluationId(result.evaluationId);
      toast.success('Evaluation saved');
      // Leave isSavingRef = true to prevent re-entry after success
    } catch (error) {
      console.error('Save-on-print error:', error);
      toast.error('Failed to save evaluation on print');
      isSavingRef.current = false; // Allow retry on failure only
    }
  }, [evaluationId, evaluationCreatedBy, data, calculated, userEmail, setEvaluationId]);

  // Get min/max values for comparable range
  const conditionResult = tradeValues?.valuationResults?.[data.conditionScore.toString()];
  const minValue = conditionResult?.min_value;
  const maxValue = conditionResult?.max_value;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Already saved via print — just show success
    if (evaluationId) {
      setSuccessDialogOpen(true);
      return;
    }
    setIsSubmitting(true);

    try {
      const result = await saveValuation({ data, calculated, userEmail });
      setEvaluationId(result.evaluationId);
      setSuccessDialogOpen(true);
    } catch (error) {
      console.error('Submit error:', error);
      const message = error instanceof Error ? error.message : 'Failed to save valuation';
      toast.error('Failed to save valuation', {
        description: message,
      });
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
            onUpdate={(updates) => updateFields(updates, 'initial-load')}
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
                    : 'initial-load';
              updateFields(updates, driverId);
            }}
            isLocked={!isLookupComplete}
          />
        </div>

        {/* COLUMN 3: Section 3 - Market Data + Valuation Notes */}
        <div className="lg:col-span-1 flex flex-col gap-2">
          <div className="flex-1">
            <Section3Market
              data={data}
              onUpdate={(updates) => updateFields(updates, 'avg-listing-price')}
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
                onChange={(e) => updateFields({ valuationNotes: e.target.value }, 'initial-load')}
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
                  : 'initial-load';
            updateFields(updates, driverId);
          }}
          isLocked={!isLookupComplete}
          currentUserName={currentUserName}
          createdBy={evaluationCreatedBy}
          createdDate={evaluationCreatedDate}
        />
      </div>

      {/* Sticky Action Bar */}
      <StickyActionBar
        isLocked={!isLookupComplete}
        isSubmitting={isSubmitting}
        isRefreshingDepreciation={isRefreshingDepreciation}
        data={data}
        calculated={calculated}
        depreciation={depreciation}
        currentUserName={currentUserName}
        createdBy={evaluationCreatedBy}
        createdDate={evaluationCreatedDate}
        onSave={handleSaveOnPrint}
        minValue={minValue}
        maxValue={maxValue}
      />

      {/* Success Dialog */}
      <SubmissionSuccessDialog
        open={successDialogOpen}
        onClose={() => setSuccessDialogOpen(false)}
        onStartNew={() => {
          setSuccessDialogOpen(false);
          reset();
        }}
      />
    </form>
  );
}
