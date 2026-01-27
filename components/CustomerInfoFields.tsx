'use client';

import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';

interface CustomerInfoFieldsProps {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  onUpdate: (updates: { customerName?: string; customerPhone?: string; customerEmail?: string }) => void;
}

export default function CustomerInfoFields({
  customerName,
  customerPhone,
  customerEmail,
  onUpdate,
}: CustomerInfoFieldsProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wide">Customer Info</h3>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Field>
          <FieldLabel className="text-xs font-semibold text-gray-700">Name</FieldLabel>
          <Input
            type="text"
            className="mt-0.5"
            value={customerName}
            onChange={(e) => onUpdate({ customerName: e.target.value })}
          />
        </Field>
        <Field>
          <FieldLabel className="text-xs font-semibold text-gray-700">Phone</FieldLabel>
          <Input
            type="tel"
            className="mt-0.5"
            value={customerPhone}
            onChange={(e) => onUpdate({ customerPhone: e.target.value })}
          />
        </Field>
        <Field>
          <FieldLabel className="text-xs font-semibold text-gray-700">Email</FieldLabel>
          <Input
            type="email"
            className="mt-0.5"
            value={customerEmail}
            onChange={(e) => onUpdate({ customerEmail: e.target.value })}
          />
        </Field>
      </div>
    </div>
  );
}