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
      <div className="space-y-3">
        {/* Customer & Unit Identification Card */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
          <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wide">Customer & Unit ID</h3>
          <CustomerInfoFields
            customerFirstName={data.customerFirstName}
            customerLastName={data.customerLastName}
            customerPhone={data.customerPhone}
            customerEmail={data.customerEmail}
            onUpdate={onUpdate}
          />
          <StockVinFields
            stockNumber={data.stockNumber}
            vin={data.vin}
            onUpdate={onUpdate}
          />
          {onLoadEvaluation && (
            <Button
              type="button"
              variant="primary"
              onClick={() => setIsPriorEvaluationsOpen(true)}
              disabled={!data.vin && !data.stockNumber && !data.customerFirstName && !data.customerLastName && !data.customerPhone}
              className="w-full mt-2"
            >
              Search Prior Evaluations
            </Button>
          )}
        </div>

        {/* JD Power Lookup Card */}
        <div className="p-3 bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg border border-gray-300 space-y-2">
          <LocationRvTypeSelector
            location={data.location}
            rvType={data.rvType}
            onLocationChange={(location) => onUpdate({ location })}
            onRvTypeChange={handleRvTypeChange}
          />
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
              onChange={(e) => {
              const parsed = parseInt(e.target.value, 10);
              onUpdate({ mileage: isNaN(parsed) ? null : parsed });
            }}
            />
          </div>
        </div>

        {/* Trade Value Reference & CTA */}
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
          customerName={[data.customerFirstName, data.customerLastName].filter(Boolean).join(' ')}
          customerPhone={data.customerPhone}
          onLoadEvaluation={onLoadEvaluation}
        />
      )}
    </div>
  );
}
