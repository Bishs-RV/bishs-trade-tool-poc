'use client';

import { useState, useEffect } from 'react';
import { RVType } from '@/lib/types';
import { RV_TYPE_OPTIONS } from '@/lib/constants';
import { Field, FieldLabel } from '@/components/ui/field';
import { SearchableCombobox, type ComboboxOption } from '@/components/ui/searchable-combobox';

interface LocationOption {
  cmf: number;
  location: string | null;
  storename: string | null;
}

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
  // Location data from API
  const [locationOptions, setLocationOptions] = useState<ComboboxOption[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // Fetch locations on mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('/api/locations');
        if (!response.ok) throw new Error('Failed to fetch locations');
        const result = await response.json();
        // Filter out locations with null location codes and map to ComboboxOption
        const validLocations = (result.locations || [])
          .filter((loc: LocationOption) => loc.location !== null)
          .map((loc: LocationOption) => ({
            value: loc.location!,
            label: loc.storename ? `${loc.location} - ${loc.storename}` : loc.location!,
          }));
        setLocationOptions(validLocations);
      } catch (error) {
        console.error('Error fetching locations:', error);
        setLoadError(true);
        setLocationOptions([]);
      } finally {
        setIsLoadingLocations(false);
      }
    };

    fetchLocations();
  }, []);

  return (
    <>
      {/* Location */}
      <Field>
        <FieldLabel className={labelClass}>
          Location <span className="text-red-600">*</span>
        </FieldLabel>
        <SearchableCombobox
          label="Location"
          placeholder={loadError ? 'Error loading stores' : isLoadingLocations ? 'Loading...' : 'Select Store'}
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
