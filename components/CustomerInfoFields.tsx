'use client';

import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';

interface CustomerInfoFieldsProps {
  customerFirstName: string;
  customerLastName: string;
  customerPhone: string;
  customerEmail: string;
  onUpdate: (updates: {
    customerFirstName?: string;
    customerLastName?: string;
    customerPhone?: string;
    customerEmail?: string;
  }) => void;
}

export default function CustomerInfoFields({
  customerFirstName,
  customerLastName,
  customerPhone,
  customerEmail,
  onUpdate,
}: CustomerInfoFieldsProps) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <Field>
          <FieldLabel className="text-xs font-semibold text-gray-700">First Name</FieldLabel>
          <Input
            type="text"
            className="mt-0.5"
            value={customerFirstName}
            onChange={(e) => onUpdate({ customerFirstName: e.target.value })}
          />
        </Field>
        <Field>
          <FieldLabel className="text-xs font-semibold text-gray-700">Last Name</FieldLabel>
          <Input
            type="text"
            className="mt-0.5"
            value={customerLastName}
            onChange={(e) => onUpdate({ customerLastName: e.target.value })}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field>
          <FieldLabel className="text-xs font-semibold text-gray-700">
            Phone <span className="text-red-500">*</span>
          </FieldLabel>
          <Input
            type="tel"
            className="mt-0.5"
            required
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
