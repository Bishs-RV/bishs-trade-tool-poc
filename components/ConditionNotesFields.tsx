'use client';

import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';

interface ConditionNotesFieldsProps {
  majorIssues: string;
  unitAddOns: string;
  additionalPrepCost: number;
  onUpdate: (updates: {
    majorIssues?: string;
    unitAddOns?: string;
    additionalPrepCost?: number;
  }) => void;
}

export default function ConditionNotesFields({
  majorIssues,
  unitAddOns,
  additionalPrepCost,
  onUpdate,
}: ConditionNotesFieldsProps) {
  return (
    <div className="p-3 bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg border border-gray-200 space-y-2">
      {/* Major Issues (Deductions) */}
      <Field>
        <FieldLabel className="text-sm font-bold text-gray-800">
          Major Issues (Deductions)
        </FieldLabel>
        <Textarea
          rows={3}
          className="mt-1"
          placeholder="List frame damage, non-working AC, or anything requiring substantial cost/reduction."
          value={majorIssues}
          onChange={(e) => onUpdate({ majorIssues: e.target.value })}
        />
      </Field>

      {/* Unit Add-Ons (Value Adds) */}
      <Field>
        <FieldLabel className="text-sm font-bold text-gray-800">
          Unit Add-Ons (Value Adds)
        </FieldLabel>
        <Textarea
          rows={3}
          className="mt-1"
          placeholder="List high-value aftermarket options (e.g., Solar package, upgraded stabilizer system)."
          value={unitAddOns}
          onChange={(e) => onUpdate({ unitAddOns: e.target.value })}
        />
      </Field>

      {/* Manual Cost Override */}
      <Field className="pt-2">
        <FieldLabel className="text-sm font-bold text-gray-800">
          Additional Costs Override
        </FieldLabel>
        <div className="mt-1 flex shadow-sm">
          <span className="inline-flex items-center rounded-l-lg border border-r-0 border-input bg-gray-100 px-4 text-gray-600 text-sm font-semibold">
            $
          </span>
          <Input
            type="number"
            className="rounded-l-none"
            placeholder="0"
            value={additionalPrepCost || ''}
            onChange={(e) => {
              const parsed = parseFloat(e.target.value);
              onUpdate({ additionalPrepCost: isNaN(parsed) ? 0 : parsed });
            }}
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          $1500 is the average additional service costs for a unit (does not include prep or recon)
        </p>
      </Field>
    </div>
  );
}
