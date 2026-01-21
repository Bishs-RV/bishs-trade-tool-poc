'use client';

import { useState, useMemo } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { ModelTrim } from '@/lib/jdpower/types';

interface GroupedModelPickerProps {
  modelTrims: ModelTrim[];
  value: number | null; // ModelTrimID
  customModel?: string; // Custom model value when no JD Power match
  make?: string; // Current make (ModelSeries) for display
  onChange: (modelTrim: ModelTrim | null, isCustom?: boolean, customValue?: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  allowCustom?: boolean;
}

export function GroupedModelPicker({
  modelTrims,
  value,
  customModel,
  make,
  onChange,
  isLoading = false,
  disabled = false,
  allowCustom = false,
}: GroupedModelPickerProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  // Group model trims by ModelSeries
  const groupedTrims = useMemo(() => {
    const groups: Record<string, ModelTrim[]> = {};
    for (const trim of modelTrims) {
      const series = trim.ModelSeries || 'Other';
      if (!groups[series]) {
        groups[series] = [];
      }
      groups[series].push(trim);
    }
    // Sort groups alphabetically and sort items within each group
    const sortedEntries = Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
    return sortedEntries.map(([series, trims]) => ({
      series,
      trims: trims.sort((a, b) => a.ModelTrimName.localeCompare(b.ModelTrimName)),
    }));
  }, [modelTrims]);

  // Find the selected model trim
  const selectedTrim = useMemo(
    () => modelTrims.find((t) => t.ModelTrimID === value),
    [modelTrims, value]
  );

  const handleSelect = (trim: ModelTrim) => {
    onChange(trim);
    setSearchValue('');
    setOpen(false);
  };

  const handleCustomSelect = () => {
    const trimmed = searchValue.trim();
    if (trimmed) {
      onChange(null, true, trimmed);
      setSearchValue('');
      setOpen(false);
    }
  };

  const hasOptions = modelTrims.length > 0;
  const isDisabled = disabled || (!hasOptions && !allowCustom) || isLoading;

  // Display value - show both series and name for context
  const displayValue = selectedTrim
    ? `${selectedTrim.ModelTrimName} (${selectedTrim.ModelSeries || 'Other'})`
    : customModel
      ? `${customModel}${make ? ` (${make})` : ' (Custom)'}`
      : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'min-h-10 w-full justify-between rounded-md border-slate-200 px-3 py-2 font-sans text-sm font-normal',
            isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
          )}
          disabled={isDisabled}
        >
          <span className="grow truncate text-left">
            {displayValue ?? 'Select Model/Floorplan'}
          </span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={true}>
          <CommandInput
            placeholder="Search model (e.g., 264BH)..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>No models found.</CommandEmpty>
            {/* Custom input option - show when typing */}
            {allowCustom && searchValue.trim() && (
              <CommandGroup>
                <CommandItem
                  value={searchValue.trim()}
                  onSelect={() => handleCustomSelect()}
                  className="cursor-pointer"
                >
                  Use &ldquo;{searchValue.trim()}&rdquo; as custom value
                </CommandItem>
              </CommandGroup>
            )}
            {/* Grouped model trims */}
            {groupedTrims.map(({ series, trims }) => (
              <CommandGroup
                key={series}
                heading={series}
                className="[&_[cmdk-group-heading]]:bg-muted [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-sm [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-foreground"
              >
                {trims.map((trim) => (
                  <CommandItem
                    key={trim.ModelTrimID}
                    value={`${trim.ModelSeries} ${trim.ModelTrimName}`}
                    onSelect={() => handleSelect(trim)}
                    className="cursor-pointer"
                  >
                    {trim.ModelTrimName}
                    <Check
                      className={cn(
                        'ml-auto',
                        value === trim.ModelTrimID ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
