'use client';

import { useState } from 'react';
import { TradeData, CalculatedValues, RVType } from '@/lib/types';
import { isMotorized } from '@/lib/constants';
import type { TradeEvaluation } from '@/lib/db/schema';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import PriorEvaluationsDialog from '@/components/PriorEvaluationsDialog';
import CustomerInfoFields from '@/components/CustomerInfoFields';
import StockVinFields from '@/components/StockVinFields';
import LocationRvTypeSelector from '@/components/LocationRvTypeSelector';
import JDPowerCascadingLookup from '@/components/JDPowerCascadingLookup';
import TradeValueCard from '@/components/TradeValueCard';

interface Section1Props {
  data: TradeData;
  calculated: CalculatedValues;
  onUpdate: (updates: Partial<TradeData>) => void;
  onLookup: () => void;
  isLookupComplete: boolean;
  isLoading?: boolean;
  onLoadEvaluation?: (evaluation: TradeEvaluation) => void;
}

export default function Section1UnitData({
  data,
  calculated,
  onUpdate,
  onLookup,
  isLookupComplete,
  isLoading = false,
  onLoadEvaluation,
}: Section1Props) {
  const isMileageEnabled = isMotorized(data.rvType);
  const [isPriorEvaluationsOpen, setIsPriorEvaluationsOpen] = useState(false);

  const isCustomInputMode = !!(data.customManufacturer || data.customMake || data.customModel);

  const isLookupReady =
    data.year !== null &&
    data.rvType !== null &&
    data.model.trim() !== '' &&
    (isCustomInputMode
      ? !!data.customManufacturer || data.jdPowerManufacturerId !== null
      : data.jdPowerManufacturerId !== null &&
        data.make.trim() !== '' &&
        data.jdPowerModelTrimId !== null);

  const handleRvTypeChange = (rvType: RVType) => {
    onUpdate({ rvType, mileage: null });
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 h-full">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center text-white font-bold text-sm shadow-lg">
          1
        </div>
        <h2 className="text-lg font-bold text-gray-900">Unit & Base Data</h2>
      </div>
      <div className="space-y-2">
        {/* Customer Info Section */}
        <CustomerInfoFields
          customerName={data.customerName}
          customerPhone={data.customerPhone}
          customerEmail={data.customerEmail}
          onUpdate={onUpdate}
        />

        {/* Stock Number and VIN */}
        <StockVinFields
          stockNumber={data.stockNumber}
          vin={data.vin}
          onUpdate={onUpdate}
        />

        {/* Search Prior Evaluations Button */}
        {onLoadEvaluation && (
          <Button
            type="button"
            variant="primary"
            onClick={() => setIsPriorEvaluationsOpen(true)}
            disabled={!data.vin && !data.stockNumber}
            className="w-full"
          >
            {!data.vin && !data.stockNumber ? (
              <span className="text-gray-300">Enter VIN or Stock # to search</span>
            ) : (
              'Search Prior Evaluations'
            )}
          </Button>
        )}

        {/* Location and RV Type */}
        <LocationRvTypeSelector
          location={data.location}
          rvType={data.rvType}
          onLocationChange={(location) => onUpdate({ location })}
          onRvTypeChange={handleRvTypeChange}
        />

        {/* JD Power Cascading Lookup (Manufacturer → Year → Make → Model) */}
        <JDPowerCascadingLookup
          rvType={data.rvType}
          jdPowerManufacturerId={data.jdPowerManufacturerId}
          customManufacturer={data.customManufacturer}
          year={data.year}
          make={data.make}
          customMake={data.customMake}
          customModel={data.customModel}
          jdPowerModelTrimId={data.jdPowerModelTrimId}
          onUpdate={onUpdate}
        />

        {/* Mileage */}
        <div>
          <Label htmlFor="mileage" className="text-xs font-semibold text-gray-700">
            Mileage / Engine Hours
          </Label>
          <Input
            type="number"
            id="mileage"
            className="mt-0.5 disabled:bg-gray-100 disabled:text-gray-500"
            placeholder="e.g., 15000"
            disabled={!isMileageEnabled}
            value={data.mileage !== null ? data.mileage : ''}
            onChange={(e) => onUpdate({ mileage: e.target.value ? parseInt(e.target.value, 10) : null })}
          />
        </div>

        {/* Trade Value Display and Lookup Button */}
        <TradeValueCard
          jdPowerTradeIn={calculated.jdPowerTradeIn}
          isLookupReady={isLookupReady}
          isLookupComplete={isLookupComplete}
          isLoading={isLoading}
          onLookup={onLookup}
        />
      </div>

      {/* Prior Evaluations Dialog */}
      {onLoadEvaluation && (
        <PriorEvaluationsDialog
          open={isPriorEvaluationsOpen}
          onOpenChange={setIsPriorEvaluationsOpen}
          vin={data.vin}
          stockNumber={data.stockNumber}
          onLoadEvaluation={onLoadEvaluation}
        />
      )}
    </div>
  );
}
