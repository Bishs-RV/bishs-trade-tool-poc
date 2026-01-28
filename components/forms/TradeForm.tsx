'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useMockAuth } from '@bishs-rv/bishs-global-header';
import { toast } from 'sonner';
import type { TradeValues, DriverId } from '@/lib/calculations';
import type { TradeData } from '@/lib/types';
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
  const evaluationCreatedBy = useEvaluationCreatedBy();
  const evaluationCreatedDate = useEvaluationCreatedDate();

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
    loadEvaluation,
    reset,
  } = useTradeStore();

  // Success dialog state
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  // User's location zipcode for RVTrader search
  const [userZipCode, setUserZipCode] = useState<string | null>(null);

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
          if (result.zipCode) {
            setUserZipCode(result.zipCode);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user location:', error);
      }
    }
    fetchUserLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdate = (updates: Partial<TradeData>, driverId: DriverId = 'initial-load') => {
    updateFields(updates, driverId);
  };

  const handleLookup = async () => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        customerFirstName: data.customerFirstName || undefined,
        customerLastName: data.customerLastName || undefined,
        customerPhone: data.customerPhone,
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
        // TODO: tradeInPercent is dead code - remove after schema migration
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
        createdBy: userEmail,
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
          if (error.details) {
            // Format validation errors
            const fields = Object.entries(error.details)
              .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
              .join('; ');
            errorMessage = fields || error.error || errorMessage;
          } else {
            errorMessage = error.error || errorMessage;
          }
        } catch {
          // Response body is not valid JSON
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      if (!result.evaluation?.tradeEvaluationId) {
        throw new Error('Invalid response from server');
      }
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
            onUpdate={(updates) => handleUpdate(updates, 'initial-load')}
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
                    : 'initial-load';
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
              zipCode={userZipCode}
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
                  : 'initial-load';
            handleUpdate(updates, driverId);
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
        data={data}
        calculated={calculated}
        depreciation={depreciation}
        currentUserName={currentUserName}
        createdBy={evaluationCreatedBy}
        createdDate={evaluationCreatedDate}
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
