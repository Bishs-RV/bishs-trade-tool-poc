'use client';

import { RVType } from '@/lib/types';
import { LOCATIONS, RV_TYPE_OPTIONS } from '@/lib/constants';
import { Field, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LocationRvTypeSelectorProps {
  location: string;
  rvType: RVType;
  onLocationChange: (location: string) => void;
  onRvTypeChange: (rvType: RVType) => void;
}

const labelClass = 'text-xs font-semibold text-gray-700';

export default function LocationRvTypeSelector({
  location,
  rvType,
  onLocationChange,
  onRvTypeChange,
}: LocationRvTypeSelectorProps) {
  return (
    <>
      {/* Location */}
      <Field>
        <FieldLabel className={labelClass}>
          Location <span className="text-red-600">*</span>
        </FieldLabel>
        <Select value={location} onValueChange={onLocationChange}>
          <SelectTrigger className="mt-0.5">
            <SelectValue placeholder="Select Store" />
          </SelectTrigger>
          <SelectContent>
            {LOCATIONS.map((loc) => (
              <SelectItem key={loc} value={loc}>
                {loc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {/* RV Type */}
      <Field>
        <FieldLabel className={labelClass}>
          RV Type <span className="text-red-600">*</span>
        </FieldLabel>
        <Select value={rvType} onValueChange={(value) => onRvTypeChange(value as RVType)}>
          <SelectTrigger className="mt-0.5">
            <SelectValue placeholder="Select RV Type" />
          </SelectTrigger>
          <SelectContent>
            {RV_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    </>
  );
}
