'use client';

import { useState } from 'react';
import { TradeData, CalculatedValues, RVType } from '@/lib/types';
import { isMotorized } from '@/lib/constants';
import { formatCurrency } from '@/lib/calculations';
import type { TradeEvaluation } from '@/lib/db/schema';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import PriorEvaluationsDialog from '@/components/PriorEvaluationsDialog';
import CustomerInfoFields from '@/components/CustomerInfoFields';
import StockVinFields from '@/components/StockVinFields';
import LocationRvTypeSelector from '@/components/LocationRvTypeSelector';
import JDPowerCascadingLookup from '@/components/JDPowerCascadingLookup';

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
      ? data.customManufacturer || data.jdPowerManufacturerId !== null
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
          <button
            type="button"
            onClick={() => setIsPriorEvaluationsOpen(true)}
            disabled={!data.vin && !data.stockNumber}
            className={`w-full py-1.5 text-xs font-medium rounded-md border transition-colors ${
              data.vin || data.stockNumber
                ? 'text-blue-700 border-blue-300 bg-blue-50 hover:bg-blue-100'
                : 'text-gray-400 border-gray-200 bg-gray-50 cursor-not-allowed'
            }`}
          >
            Search Prior Evaluations
          </button>
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

        <hr className="border-gray-200 mt-2" />

        {/* JD Power Trade-In (Read-Only Reference) */}
        <div className="bg-gradient-to-br from-gray-100 to-slate-200 rounded-lg p-3 text-center shadow-md border border-gray-300">
          <span className="block text-xs font-bold text-gray-600 uppercase tracking-wide">
            JD Power Trade-In (Reference)
          </span>
          <span className="block text-lg font-black text-gray-900 mt-1">
            {formatCurrency(calculated.jdPowerTradeIn)}
          </span>
        </div>

        {/* Lookup Button */}
        <Button
          type="button"
          onClick={onLookup}
          disabled={!isLookupReady || isLookupComplete || isLoading}
          className="w-full mt-2 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span> Loading...
            </span>
          ) : isLookupComplete ? (
            <span className="flex items-center justify-center gap-2">
              <span className="text-xl">✓</span> Trade Value Loaded
            </span>
          ) : (
            'Get Trade Value'
          )}
        </Button>
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
