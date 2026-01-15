"use client";

import { useState } from 'react';
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

export type ComboboxOption = {
  value: string;
  label: string;
  isCustom?: boolean;
};

type SearchableComboboxProps = {
  id?: string;
  label: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  options?: ComboboxOption[];
  value: string | null;
  onChange: (option: ComboboxOption) => void;
  isLoading?: boolean;
  disabled?: boolean;
  allowCustom?: boolean;
};

export function SearchableCombobox({
  id,
  label,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  options,
  value,
  onChange,
  isLoading = false,
  disabled = false,
  allowCustom = false,
}: SearchableComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const handleSelect = (option: ComboboxOption) => {
    if (option.value === value) {
      setOpen(false);
      return;
    }
    onChange(option);
    setSearchValue('');
    setOpen(false);
  };

  const handleCustomSelect = () => {
    const trimmed = searchValue.trim();
    if (trimmed) {
      onChange({ value: `custom:${trimmed}`, label: trimmed, isCustom: true });
      setSearchValue('');
      setOpen(false);
    }
  };

  const hasOptions = options && options.length > 0;
  const isDisabled = disabled || (!hasOptions && !allowCustom) || isLoading;

  // Check if current value is a custom value or find in options
  const isCustomValue = value?.startsWith('custom:') ?? false;
  const currentLabel = isCustomValue && value
    ? value.replace('custom:', '')
    : options?.find((item) => item.value === value)?.label ?? value;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'min-h-10 w-full justify-between rounded-md border-slate-200 px-3 py-2 font-sans text-sm font-normal',
            isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
          )}
          disabled={isDisabled}
        >
          <span className="grow text-left">
            {currentLabel ?? placeholder ?? `Select ${label}`}
          </span>
          <ChevronsUpDown className="size-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={true}>
          <CommandInput
            placeholder={searchPlaceholder ?? `Search ${label}...`}
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>{emptyMessage ?? `No ${label} found.`}</CommandEmpty>
            <CommandGroup>
              {/* Custom input option - first when typing */}
              {allowCustom && searchValue.trim() && (
                <CommandItem
                  value={searchValue.trim()}
                  onSelect={() => handleCustomSelect()}
                  className="cursor-pointer"
                >
                  Use &ldquo;{searchValue.trim()}&rdquo; as custom value
                </CommandItem>
              )}
              {options?.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => handleSelect(option)}
                  className="cursor-pointer"
                >
                  {option.label}
                  <Check
                    className={cn('ml-auto', value === option.value ? 'opacity-100' : 'opacity-0')}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
