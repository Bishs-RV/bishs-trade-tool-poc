'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { TradeData, CalculatedValues, RVType } from '@/lib/types';
import { LOCATIONS, RV_TYPE_OPTIONS, isMotorized } from '@/lib/constants';
import { formatCurrency } from '@/lib/calculations';
import { getCategoryId } from '@/lib/jdpower/rv-types';
import type { MakeCategory, ModelTrim } from '@/lib/jdpower/types';
import { SearchableCombobox, type ComboboxOption } from '@/components/ui/searchable-combobox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface Section1Props {
  data: TradeData;
  calculated: CalculatedValues;
  onUpdate: (updates: Partial<TradeData>) => void;
  onLookup: () => void;
  isLookupComplete: boolean;
  isLoading?: boolean;
}

export default function Section1UnitData({
  data,
  calculated,
  onUpdate,
  onLookup,
  isLookupComplete,
  isLoading = false,
}: Section1Props) {
  const isMileageEnabled = isMotorized(data.rvType);

  // JD Power cascading data
  const [manufacturers, setManufacturers] = useState<MakeCategory[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [modelTrims, setModelTrims] = useState<ModelTrim[]>([]);
  const [isLoadingMakes, setIsLoadingMakes] = useState(false);
  const [isLoadingYears, setIsLoadingYears] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  // Use ref to avoid onUpdate in dependency arrays (prevents infinite loops)
  const onUpdateRef = useRef(onUpdate);
  useEffect(() => { onUpdateRef.current = onUpdate; });

  // Derived data for dropdowns
  const uniqueMakes = Array.from(new Set(modelTrims.map(m => m.ModelSeries))).filter(Boolean).sort();
  const filteredModels = modelTrims.filter(m => m.ModelSeries === data.make);

  // Memoized options for comboboxes
  const yearOptions = useMemo<ComboboxOption[]>(
    () => years.map(y => ({ value: y.toString(), label: y.toString() })),
    [years]
  );

  const manufacturerOptions = useMemo<ComboboxOption[]>(
    () => manufacturers.map(m => ({
      value: m.makeReturnTO.MakeID.toString(),
      label: m.makeReturnTO.MakeDisplayName,
    })),
    [manufacturers]
  );

  const makeOptions = useMemo<ComboboxOption[]>(
    () => uniqueMakes.map(make => ({ value: make, label: make })),
    [uniqueMakes]
  );

  const modelOptions = useMemo<ComboboxOption[]>(
    () => filteredModels.map(model => ({
      value: model.ModelTrimID.toString(),
      label: model.ModelTrimName,
    })),
    [filteredModels]
  );

  // Fetch manufacturers when RV type changes
  useEffect(() => {
    if (!data.rvType) {
      setManufacturers([]);
      return;
    }

    const abortController = new AbortController();

    const fetchMakes = async () => {
      setIsLoadingMakes(true);
      try {
        const categoryId = getCategoryId(data.rvType);
        // Fetch manufacturers for current year (no year filter needed)
        const response = await fetch(
          `/api/jdpower/makes?rvCategoryId=${categoryId}`,
          { signal: abortController.signal }
        );
        if (!response.ok) throw new Error('Failed to fetch manufacturers');
        const result = await response.json();
        if (!abortController.signal.aborted) {
          setManufacturers(result.makes || []);
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error('Error fetching manufacturers:', error);
          setManufacturers([]);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoadingMakes(false);
        }
      }
    };

    fetchMakes();
    // Reset downstream selections when RV type changes
    setYears([]);
    setModelTrims([]);
    onUpdateRef.current({
      jdPowerManufacturerId: null,
      manufacturerName: '',
      year: null,
      make: '',
      model: '',
      jdPowerModelTrimId: null,
    });

    return () => abortController.abort();
  }, [data.rvType]);

  // Fetch years when manufacturer changes
  useEffect(() => {
    if (!data.jdPowerManufacturerId) {
      setYears([]);
      return;
    }

    const abortController = new AbortController();

    const fetchYearsData = async () => {
      setIsLoadingYears(true);
      try {
        const response = await fetch(
          `/api/jdpower/years?makeId=${data.jdPowerManufacturerId}`,
          { signal: abortController.signal }
        );
        if (!response.ok) throw new Error('Failed to fetch years');
        const result = await response.json();
        if (!abortController.signal.aborted) {
          setYears(result.years || []);
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error('Error fetching years:', error);
          setYears([]);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoadingYears(false);
        }
      }
    };

    fetchYearsData();
    // Reset downstream selections when manufacturer changes
    setModelTrims([]);
    onUpdateRef.current({
      year: null,
      make: '',
      model: '',
      jdPowerModelTrimId: null,
    });

    return () => abortController.abort();
  }, [data.jdPowerManufacturerId]);

  // Fetch model trims when year changes (manufacturer already selected)
  useEffect(() => {
    if (!data.year || !data.rvType || !data.jdPowerManufacturerId) {
      setModelTrims([]);
      return;
    }

    const abortController = new AbortController();

    const fetchModels = async () => {
      setIsLoadingModels(true);
      try {
        const categoryId = getCategoryId(data.rvType);
        const response = await fetch(
          `/api/jdpower/model-trims?makeId=${data.jdPowerManufacturerId}&year=${data.year}&rvCategoryId=${categoryId}`,
          { signal: abortController.signal }
        );
        if (!response.ok) throw new Error('Failed to fetch models');
        const result = await response.json();
        if (!abortController.signal.aborted) {
          setModelTrims(result.modelTrims || []);
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error('Error fetching models:', error);
          setModelTrims([]);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoadingModels(false);
        }
      }
    };

    // Reset make/model selections when year changes (before fetch to avoid race condition)
    setModelTrims([]);
    onUpdateRef.current({
      make: '',
      model: '',
      jdPowerModelTrimId: null,
    });

    fetchModels();

    return () => abortController.abort();
  }, [data.year, data.jdPowerManufacturerId, data.rvType]);

  // Check if we're in custom input mode (any custom values set)
  const isCustomInputMode =
    data.customManufacturer !== undefined ||
    data.customMake !== undefined ||
    data.customModel !== undefined;

  // For standard JD Power flow, need modelTrimId
  // For custom input flow, need year, manufacturer name, and model name
  const isLookupReady = isCustomInputMode
    ? data.year !== null &&
      (data.customManufacturer || data.jdPowerManufacturerId !== null) &&
      data.model.trim() !== '' &&
      data.rvType !== null
    : data.year !== null &&
      data.jdPowerManufacturerId !== null &&
      data.make.trim() !== '' &&
      data.model.trim() !== '' &&
      data.rvType !== null &&
      data.jdPowerModelTrimId !== null;

  const handleYearChange = (option: ComboboxOption) => {
    // Handle custom year input (user typed a year not in list)
    const yearValue = option.isCustom
      ? parseInt(option.label, 10)
      : parseInt(option.value, 10);

    if (!isNaN(yearValue) && yearValue >= 1980 && yearValue <= 2100) {
      onUpdate({ year: yearValue });
    }
  };

  const handleRvTypeChange = (value: string) => {
    onUpdate({ rvType: value as RVType, mileage: null });
  };

  const handleManufacturerChange = (option: ComboboxOption) => {
    if (option.isCustom) {
      // Custom manufacturer - store the label as the manufacturer name
      onUpdate({
        jdPowerManufacturerId: null,
        manufacturerName: option.label,
        customManufacturer: option.label,
      });
    } else {
      onUpdate({
        jdPowerManufacturerId: parseInt(option.value, 10),
        manufacturerName: option.label,
        customManufacturer: undefined,
      });
    }
  };

  const handleMakeChange = (option: ComboboxOption) => {
    if (option.isCustom) {
      onUpdate({
        make: option.label,
        customMake: option.label,
        model: '',
        jdPowerModelTrimId: null,
      });
    } else {
      onUpdate({
        make: option.value,
        customMake: undefined,
        model: '',
        jdPowerModelTrimId: null,
      });
    }
  };

  const handleModelChange = (option: ComboboxOption) => {
    if (option.isCustom) {
      onUpdate({
        model: option.label,
        customModel: option.label,
        jdPowerModelTrimId: null,
      });
    } else {
      const selectedModel = modelTrims.find(m => m.ModelTrimID.toString() === option.value);
      if (selectedModel) {
        onUpdate({
          model: selectedModel.ModelTrimName,
          customModel: undefined,
          jdPowerModelTrimId: selectedModel.ModelTrimID,
        });
      }
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 h-full">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center text-white font-bold text-sm shadow-lg">
          1
        </div>
        <h2 className="text-lg font-bold text-gray-900">Unit & Base Data</h2>
      </div>
      <div className="space-y-2">
        {/* Customer Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wide">Customer Info</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="customer-name" className="text-xs font-semibold text-gray-700">
                Name
              </Label>
              <Input
                type="text"
                id="customer-name"
                className="mt-0.5"
                value={data.customerName}
                onChange={(e) => onUpdate({ customerName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="customer-phone" className="text-xs font-semibold text-gray-700">
                Phone
              </Label>
              <Input
                type="tel"
                id="customer-phone"
                className="mt-0.5"
                value={data.customerPhone}
                onChange={(e) => onUpdate({ customerPhone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="customer-email" className="text-xs font-semibold text-gray-700">
                Email
              </Label>
              <Input
                type="email"
                id="customer-email"
                className="mt-0.5"
                value={data.customerEmail}
                onChange={(e) => onUpdate({ customerEmail: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Stock Number and VIN */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="stock-number" className="text-xs font-semibold text-gray-700">
              Stock Number
            </Label>
            <Input
              type="text"
              id="stock-number"
              className="mt-0.5 font-mono"
              placeholder="Enter Stock Number"
              value={data.stockNumber}
              onChange={(e) => onUpdate({ stockNumber: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="vin" className="text-xs font-semibold text-gray-700">
              VIN
            </Label>
            <Input
              type="text"
              id="vin"
              maxLength={17}
              className="mt-0.5 font-mono"
              placeholder="17-Digit VIN"
              value={data.vin}
              onChange={(e) => onUpdate({ vin: e.target.value.toUpperCase() })}
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <Label htmlFor="location" className="text-xs font-semibold text-gray-700">
            Location <span className="text-red-600">*</span>
          </Label>
          <Select value={data.location} onValueChange={(value) => onUpdate({ location: value })}>
            <SelectTrigger id="location" className="mt-0.5">
              <SelectValue placeholder="Select Store" />
            </SelectTrigger>
            <SelectContent>
              {LOCATIONS.map(loc => (
                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* RV Type - triggers manufacturer fetch */}
        <div>
          <Label htmlFor="rv-type" className="text-xs font-semibold text-gray-700">
            RV Type <span className="text-red-600">*</span>
          </Label>
          <Select value={data.rvType} onValueChange={handleRvTypeChange}>
            <SelectTrigger id="rv-type" className="mt-0.5">
              <SelectValue placeholder="Select RV Type" />
            </SelectTrigger>
            <SelectContent>
              {RV_TYPE_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Manufacturer - from JD Power (depends on RV Type) */}
        <div>
          <Label htmlFor="manufacturer" className="text-xs font-semibold text-gray-700">
            Manufacturer <span className="text-red-600">*</span>
          </Label>
          <SearchableCombobox
            id="manufacturer"
            label="Manufacturer"
            placeholder="Select Manufacturer"
            searchPlaceholder="Search manufacturers..."
            options={manufacturerOptions}
            value={data.customManufacturer ? `custom:${data.customManufacturer}` : data.jdPowerManufacturerId?.toString() ?? null}
            onChange={handleManufacturerChange}
            isLoading={isLoadingMakes}
            disabled={!data.rvType}
            allowCustom={true}
          />
        </div>

        {/* Year - from JD Power (depends on Manufacturer) or custom entry */}
        <div>
          <Label htmlFor="year" className="text-xs font-semibold text-gray-700">
            Year <span className="text-red-600">*</span>
          </Label>
          <SearchableCombobox
            id="year"
            label="Year"
            placeholder="Select Year"
            searchPlaceholder="Search years..."
            options={yearOptions}
            value={data.year?.toString() ?? null}
            onChange={handleYearChange}
            isLoading={isLoadingYears}
            disabled={!data.jdPowerManufacturerId && !data.customManufacturer}
            allowCustom={true}
          />
        </div>

        {/* Make (ModelSeries from JD Power - depends on Year) */}
        <div>
          <Label htmlFor="make" className="text-xs font-semibold text-gray-700">
            Make <span className="text-red-600">*</span>
          </Label>
          <SearchableCombobox
            id="make"
            label="Make"
            placeholder="Select Make"
            searchPlaceholder="Search makes..."
            options={makeOptions}
            value={data.customMake ? `custom:${data.customMake}` : data.make || null}
            onChange={handleMakeChange}
            isLoading={isLoadingModels}
            disabled={!data.year && !data.customManufacturer}
            allowCustom={true}
          />
        </div>

        {/* Model (ModelTrimName from JD Power - depends on Make) */}
        <div>
          <Label htmlFor="model" className="text-xs font-semibold text-gray-700">
            Model/Floorplan <span className="text-red-600">*</span>
          </Label>
          <SearchableCombobox
            id="model"
            label="Model"
            placeholder="Select Model"
            searchPlaceholder="Search models..."
            options={modelOptions}
            value={data.customModel ? `custom:${data.customModel}` : data.jdPowerModelTrimId?.toString() ?? null}
            onChange={handleModelChange}
            disabled={!data.make && !data.customMake}
            allowCustom={true}
          />
        </div>

        {/* Mileage */}
        <div>
          <Label htmlFor="mileage" className="text-xs font-semibold text-gray-700">
            Mileage / Engine Hours
          </Label>
          <Input
            type="number"
            id="mileage"
            className="mt-0.5 disabled:bg-gray-100 disabled:text-gray-500"
            placeholder="e.g., 15000"
            disabled={!isMileageEnabled}
            value={data.mileage || ''}
            onChange={(e) => onUpdate({ mileage: e.target.value ? parseInt(e.target.value) : null })}
          />
        </div>

        <hr className="border-gray-200 mt-2" />

        {/* JD Power Trade-In (Read-Only Reference) */}
        <div className="bg-gradient-to-br from-gray-100 to-slate-200 rounded-lg p-3 text-center shadow-md border border-gray-300">
          <span className="block text-xs font-bold text-gray-600 uppercase tracking-wide">
            JD Power Trade-In (Reference)
          </span>
          <span className="block text-lg font-black text-gray-900 mt-1">
            {formatCurrency(calculated.jdPowerTradeIn)}
          </span>
        </div>

        {/* Lookup Button */}
        <Button
          type="button"
          onClick={onLookup}
          disabled={!isLookupReady || isLookupComplete || isLoading}
          className="w-full mt-2 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span> Loading...
            </span>
          ) : isLookupComplete ? (
            <span className="flex items-center justify-center gap-2">
              <span className="text-xl">✓</span> Trade Value Loaded
            </span>
          ) : (
            'Get Trade Value'
          )}
        </Button>
      </div>
    </div>
  );
}
