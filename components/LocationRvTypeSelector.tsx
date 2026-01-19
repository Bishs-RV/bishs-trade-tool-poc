'use client';

import { RVType } from '@/lib/types';
import { LOCATIONS, RV_TYPE_OPTIONS } from '@/lib/constants';
import { Field, FieldLabel } from '@/components/ui/field';
import { SearchableCombobox, type ComboboxOption } from '@/components/ui/searchable-combobox';

// Static options - derived from constants, no need for useMemo
const locationOptions: ComboboxOption[] = LOCATIONS.map((loc) => ({
  value: loc,
  label: loc,
}));

const rvTypeOptions: ComboboxOption[] = RV_TYPE_OPTIONS.map((opt) => ({
  value: opt.value,
  label: opt.label,
}));

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
        <SearchableCombobox
          label="Location"
          placeholder="Select Store"
          searchPlaceholder="Search locations..."
          options={locationOptions}
          value={location || null}
          onChange={(option) => onLocationChange(option.value)}
        />
      </Field>

      {/* RV Type */}
      <Field>
        <FieldLabel className={labelClass}>
          RV Type <span className="text-red-600">*</span>
        </FieldLabel>
        <SearchableCombobox
          label="RV Type"
          placeholder="Select RV Type"
          searchPlaceholder="Search RV types..."
          options={rvTypeOptions}
          value={rvType || null}
          onChange={(option) => onRvTypeChange(option.value as RVType)}
        />
      </Field>
    </>
  );
}
