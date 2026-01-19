'use client';

import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';

interface StockVinFieldsProps {
  stockNumber: string;
  vin: string;
  onUpdate: (updates: { stockNumber?: string; vin?: string }) => void;
}

const labelClass = 'text-xs font-semibold text-gray-700';
const inputClass = 'mt-0.5 font-mono';

export default function StockVinFields({
  stockNumber,
  vin,
  onUpdate,
}: StockVinFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Field>
        <FieldLabel className={labelClass}>Stock Number</FieldLabel>
        <Input
          className={inputClass}
          placeholder="Enter Stock Number"
          value={stockNumber}
          onChange={(e) => onUpdate({ stockNumber: e.target.value })}
        />
      </Field>
      <Field>
        <FieldLabel className={labelClass}>VIN</FieldLabel>
        <Input
          className={inputClass}
          placeholder="17-Digit VIN"
          maxLength={17}
          value={vin}
          onChange={(e) => onUpdate({ vin: e.target.value.toUpperCase() })}
        />
      </Field>
    </div>
  );
}
