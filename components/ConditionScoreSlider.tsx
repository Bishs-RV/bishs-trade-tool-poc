'use client';

import { Slider } from '@/components/ui/slider';
import { Field, FieldLabel } from '@/components/ui/field';

interface ConditionScoreSliderProps {
  conditionScore: number;
  onUpdate: (conditionScore: number) => void;
}

export default function ConditionScoreSlider({
  conditionScore,
  onUpdate,
}: ConditionScoreSliderProps) {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-gray-50 p-4 rounded-xl border border-slate-200">
      <Field>
        <FieldLabel className="text-sm font-bold text-gray-800">
          Condition Score (<span className="text-blue-600">1-9 Scale</span>)
        </FieldLabel>
        <Slider
          min={1}
          max={9}
          step={1}
          value={[conditionScore]}
          onValueChange={(values) => {
            if (values[0] !== undefined) onUpdate(values[0]);
          }}
          className="mt-4"
        />
      </Field>
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>1 (Poor)</span>
        <span className="font-bold text-blue-900 text-base">{conditionScore}</span>
        <span>9 (Excellent)</span>
      </div>
    </div>
  );
}
