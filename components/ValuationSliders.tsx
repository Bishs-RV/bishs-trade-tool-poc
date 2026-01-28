'use client';

import { formatPercent } from '@/lib/calculations';
import {
  TARGET_MARGIN_PERCENT,
  TRADE_IN_PERCENT_MIN,
  TRADE_IN_PERCENT_MAX,
  MARGIN_PERCENT_MIN,
  MARGIN_PERCENT_MAX,
} from '@/lib/constants';
import { Slider } from '@/components/ui/slider';
import { Field, FieldLabel } from '@/components/ui/field';

interface ValuationSlidersProps {
  tradeInPercent: number;
  targetMarginPercent: number;
  calculatedMarginPercent: number;
  onUpdate: (updates: { tradeInPercent?: number; targetMarginPercent?: number }) => void;
}

export default function ValuationSliders({
  tradeInPercent,
  targetMarginPercent,
  calculatedMarginPercent,
  onUpdate,
}: ValuationSlidersProps) {
  const isMarginInvalid = targetMarginPercent < 0 || calculatedMarginPercent < 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 border-b pb-3">
      {isMarginInvalid && (
        <div className="col-span-full bg-amber-100 border border-amber-300 text-amber-800 px-4 py-2 rounded-lg text-sm font-medium">
          Warning: Negative margin — this deal will lose money.
        </div>
      )}
      {/* SLIDER 1: Trade-In % of Total Unit Costs */}
      <div className="space-y-2 bg-gradient-to-br from-slate-50 to-gray-50 p-3 rounded-lg border border-slate-200">
        <Field>
          <FieldLabel className="text-sm font-bold text-gray-900">
            Trade-In Offer as % of Total Unit Costs
          </FieldLabel>
          <Slider
            min={TRADE_IN_PERCENT_MIN * 100}
            max={TRADE_IN_PERCENT_MAX * 100}
            step={1}
            value={[tradeInPercent * 100]}
            onValueChange={(values) => {
              if (values[0] !== undefined) onUpdate({ tradeInPercent: values[0] / 100 });
            }}
            className="mt-2"
          />
        </Field>
        <div className="flex justify-between text-sm font-semibold pt-0.5">
          <span className="text-gray-500 text-xs">{formatPercent(TRADE_IN_PERCENT_MIN)} (Low)</span>
          <span className="text-blue-900">
            <span className="text-lg font-extrabold">{formatPercent(tradeInPercent)}</span>
          </span>
          <span className="text-gray-500 text-sm">{formatPercent(TRADE_IN_PERCENT_MAX)} (High)</span>
        </div>
      </div>

      {/* SLIDER 2: Target Margin % */}
      <div className="space-y-2 relative bg-gradient-to-br from-slate-50 to-gray-50 p-3 rounded-lg border border-slate-200">
        <Field>
          <FieldLabel className="text-sm font-bold text-gray-900">
            Target Calculated Margin %
          </FieldLabel>

          {/* Slider with target tick mark */}
          <div className="relative mt-6">
            {/* Target tick mark positioned above slider */}
            <div
              className="absolute bottom-full mb-1 pointer-events-none"
              style={{ left: `${(TARGET_MARGIN_PERCENT / MARGIN_PERCENT_MAX) * 100}%`, transform: 'translateX(-50%)' }}
            >
              <span className="block text-xs font-bold text-green-600 whitespace-nowrap text-center">
                {formatPercent(TARGET_MARGIN_PERCENT)} Target
              </span>
              <div className="w-0.5 h-2 bg-green-600 mx-auto"></div>
            </div>

            <Slider
              min={MARGIN_PERCENT_MIN * 100}
              max={MARGIN_PERCENT_MAX * 100}
              step={0.5}
              value={[targetMarginPercent * 100]}
              onValueChange={(values) => {
                if (values[0] !== undefined) onUpdate({ targetMarginPercent: values[0] / 100 });
              }}
            />
          </div>
        </Field>

        <div className="flex justify-between text-sm font-semibold pt-0.5">
          <span className="text-gray-500 text-xs">{formatPercent(MARGIN_PERCENT_MIN)} (Break Even)</span>
          <span className="text-blue-900">
            <span className="text-lg font-extrabold">{formatPercent(targetMarginPercent)}</span>
          </span>
          <span className="text-gray-500 text-xs">{formatPercent(MARGIN_PERCENT_MAX)}</span>
        </div>
      </div>
    </div>
  );
}
