'use client';

import { formatPercent } from '@/lib/calculations';
import { TARGET_MARGIN_PERCENT } from '@/lib/constants';
import { Slider } from '@/components/ui/slider';
import { Field, FieldLabel } from '@/components/ui/field';

interface ValuationSlidersProps {
  tradeInPercent: number;
  targetMarginPercent: number;
  onUpdate: (updates: { tradeInPercent?: number; targetMarginPercent?: number }) => void;
}

export default function ValuationSliders({
  tradeInPercent,
  targetMarginPercent,
  onUpdate,
}: ValuationSlidersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 border-b pb-3">
      {/* SLIDER 1: Trade-In % of Total Unit Costs */}
      <div className="space-y-2 bg-gradient-to-br from-slate-50 to-gray-50 p-3 rounded-lg border border-slate-200">
        <Field>
          <FieldLabel className="text-sm font-bold text-gray-900">
            Trade-In Offer as % of Total Unit Costs
          </FieldLabel>
          <Slider
            min={70}
            max={130}
            step={1}
            value={[tradeInPercent * 100]}
            onValueChange={(values) => {
              if (values[0] !== undefined) onUpdate({ tradeInPercent: values[0] / 100 });
            }}
            className="mt-2"
          />
        </Field>
        <div className="flex justify-between text-sm font-semibold pt-0.5">
          <span className="text-gray-500 text-xs">70% (Low)</span>
          <span className="text-blue-900">
            <span className="text-lg font-extrabold">{formatPercent(tradeInPercent)}</span>
          </span>
          <span className="text-gray-500 text-sm">130% (High)</span>
        </div>
      </div>

      {/* SLIDER 2: Target Margin % */}
      <div className="space-y-2 relative bg-gradient-to-br from-slate-50 to-gray-50 p-3 rounded-lg border border-slate-200">
        <Field>
          <FieldLabel className="text-sm font-bold text-gray-900">
            Target Calculated Margin %
          </FieldLabel>

          {/* Target tick mark and label */}
          <div className="relative pt-3">
            <div
              className="absolute top-0 left-0 right-0 flex justify-start pointer-events-none"
              style={{ paddingLeft: `${(TARGET_MARGIN_PERCENT / 0.4) * 100}%` }}
            >
              <div className="relative" style={{ marginLeft: '-28px' }}>
                <span className="block text-xs font-bold text-green-600 whitespace-nowrap mb-0.5">
                  18% Target
                </span>
                <div className="w-0.5 h-3 bg-green-600 mx-auto"></div>
              </div>
            </div>

            <Slider
              min={0}
              max={40}
              step={0.5}
              value={[targetMarginPercent * 100]}
              onValueChange={(values) => {
                if (values[0] !== undefined) onUpdate({ targetMarginPercent: values[0] / 100 });
              }}
            />
          </div>
        </Field>

        <div className="flex justify-between text-sm font-semibold pt-0.5">
          <span className="text-gray-500 text-xs">0% (Break Even)</span>
          <span className="text-blue-900">
            <span className="text-lg font-extrabold">{formatPercent(targetMarginPercent)}</span>
          </span>
          <span className="text-gray-500 text-xs">40%</span>
        </div>
      </div>
    </div>
  );
}
