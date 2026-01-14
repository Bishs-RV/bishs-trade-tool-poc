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
}: SearchableComboboxProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (option: ComboboxOption) => {
    if (option.value === value) {
      setOpen(false);
      return;
    }
    onChange(option);
    setOpen(false);
  };

  const hasOptions = options && options.length > 0;
  const isDisabled = disabled || !hasOptions || isLoading;
  const currentLabel = options?.find((item) => item.value === value)?.label;

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
        <Command>
          <CommandInput placeholder={searchPlaceholder ?? `Search ${label}...`} />
          <CommandList>
            <CommandEmpty>{emptyMessage ?? `No ${label} found.`}</CommandEmpty>
            <CommandGroup>
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
