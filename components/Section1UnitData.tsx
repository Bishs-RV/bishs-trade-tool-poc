'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { TradeData, CalculatedValues, RVType } from '@/lib/types';
import { LOCATIONS, RV_TYPE_OPTIONS, isMotorized, getTradeInYears } from '@/lib/constants';
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
  const [modelTrims, setModelTrims] = useState<ModelTrim[]>([]);
  const [isLoadingMakes, setIsLoadingMakes] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  // Use ref to avoid onUpdate in dependency arrays (prevents infinite loops)
  const onUpdateRef = useRef(onUpdate);
  useEffect(() => { onUpdateRef.current = onUpdate; });

  // Derived data for dropdowns
  const uniqueMakes = Array.from(new Set(modelTrims.map(m => m.ModelSeries))).filter(Boolean).sort();
  const filteredModels = modelTrims.filter(m => m.ModelSeries === data.make);

  // Memoized options for comboboxes
  const yearOptions = useMemo<ComboboxOption[]>(
    () => getTradeInYears().map(y => ({ value: y.toString(), label: y.toString() })),
    []
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

  // Fetch manufacturers when year + RV type change
  useEffect(() => {
    if (!data.year || !data.rvType) {
      setManufacturers([]);
      return;
    }

    const abortController = new AbortController();

    const fetchMakes = async () => {
      setIsLoadingMakes(true);
      try {
        const categoryId = getCategoryId(data.rvType);
        const response = await fetch(
          `/api/jdpower/makes?year=${data.year}&rvCategoryId=${categoryId}`,
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
    // Reset downstream selections
    onUpdateRef.current({
      jdPowerManufacturerId: null,
      make: '',
      model: '',
      jdPowerModelTrimId: null,
    });

    return () => abortController.abort();
  }, [data.year, data.rvType]);

  // Fetch model trims when manufacturer changes
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

    fetchModels();
    // Reset make/model selections when manufacturer changes
    onUpdateRef.current({
      make: '',
      model: '',
      jdPowerModelTrimId: null,
    });

    return () => abortController.abort();
  }, [data.jdPowerManufacturerId, data.year, data.rvType]);

  const isLookupReady =
    data.year !== null &&
    data.jdPowerManufacturerId !== null &&
    data.make.trim() !== '' &&
    data.model.trim() !== '' &&
    data.rvType !== null &&
    data.jdPowerModelTrimId !== null;

  const handleYearChange = (option: ComboboxOption) => {
    onUpdate({ year: parseInt(option.value, 10) });
  };

  const handleRvTypeChange = (value: string) => {
    onUpdate({ rvType: value as RVType, mileage: null });
  };

  const handleManufacturerChange = (option: ComboboxOption) => {
    onUpdate({ jdPowerManufacturerId: parseInt(option.value, 10) });
  };

  const handleMakeChange = (option: ComboboxOption) => {
    onUpdate({
      make: option.value,
      model: '',
      jdPowerModelTrimId: null,
    });
  };

  const handleModelChange = (option: ComboboxOption) => {
    const selectedModel = modelTrims.find(m => m.ModelTrimID.toString() === option.value);
    if (selectedModel) {
      onUpdate({
        model: selectedModel.ModelTrimName,
        jdPowerModelTrimId: selectedModel.ModelTrimID,
      });
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
              <label htmlFor="customer-name" className="block text-xs font-semibold text-gray-700 mb-0.5">
                Name
              </label>
              <input
                type="text"
                id="customer-name"
                className="mt-0.5 block w-full rounded-md border border-gray-200 shadow-sm p-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
                value={data.customerName}
                onChange={(e) => onUpdate({ customerName: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="customer-phone" className="block text-xs font-semibold text-gray-700 mb-0.5">
                Phone
              </label>
              <input
                type="tel"
                id="customer-phone"
                className="mt-0.5 block w-full rounded-md border border-gray-200 shadow-sm p-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
                value={data.customerPhone}
                onChange={(e) => onUpdate({ customerPhone: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="customer-email" className="block text-xs font-semibold text-gray-700 mb-0.5">
                Email
              </label>
              <input
                type="email"
                id="customer-email"
                className="mt-0.5 block w-full rounded-md border border-gray-200 shadow-sm p-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
                value={data.customerEmail}
                onChange={(e) => onUpdate({ customerEmail: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Stock Number and VIN */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="stock-number" className="block text-xs font-semibold text-gray-700 mb-0.5">
              Stock Number
            </label>
            <input
              type="text"
              id="stock-number"
              className="mt-0.5 block w-full rounded-md border border-gray-200 shadow-sm p-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300 font-mono"
              placeholder="Enter Stock Number"
              value={data.stockNumber}
              onChange={(e) => onUpdate({ stockNumber: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="vin" className="block text-xs font-semibold text-gray-700 mb-0.5">
              VIN
            </label>
            <input
              type="text"
              id="vin"
              maxLength={17}
              className="mt-0.5 block w-full rounded-md border border-gray-200 shadow-sm p-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300 font-mono"
              placeholder="17-Digit VIN"
              value={data.vin}
              onChange={(e) => onUpdate({ vin: e.target.value.toUpperCase() })}
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-xs font-semibold text-gray-700 mb-0.5">
            Location <span className="text-red-600">*</span>
          </label>
          <select
            id="location"
            className="mt-0.5 block w-full rounded-md border border-gray-200 shadow-sm p-2 text-sm bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
            required
            value={data.location}
            onChange={(e) => onUpdate({ location: e.target.value })}
          >
            <option value="" disabled>Select Store</option>
            {LOCATIONS.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        {/* Year and RV Type - triggers manufacturer fetch */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="year" className="block text-xs font-semibold text-gray-700 mb-0.5">
              Year <span className="text-red-600">*</span>
            </label>
            <SearchableCombobox
              id="year"
              label="Year"
              placeholder="Select Year"
              searchPlaceholder="Search years..."
              options={yearOptions}
              value={data.year?.toString() ?? null}
              onChange={handleYearChange}
            />
          </div>
          <div>
            <label htmlFor="rv-type" className="block text-xs font-semibold text-gray-700 mb-0.5">
              RV Type <span className="text-red-600">*</span>
            </label>
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
        </div>

        {/* Manufacturer - from JD Power */}
        <div>
          <label htmlFor="manufacturer" className="block text-xs font-semibold text-gray-700 mb-0.5">
            Manufacturer <span className="text-red-600">*</span>
          </label>
          <SearchableCombobox
            id="manufacturer"
            label="Manufacturer"
            placeholder="Select Manufacturer"
            searchPlaceholder="Search manufacturers..."
            options={manufacturerOptions}
            value={data.jdPowerManufacturerId?.toString() ?? null}
            onChange={handleManufacturerChange}
            isLoading={isLoadingMakes}
            disabled={!data.year}
          />
        </div>

        {/* Make (ModelSeries from JD Power) */}
        <div>
          <label htmlFor="make" className="block text-xs font-semibold text-gray-700 mb-0.5">
            Make <span className="text-red-600">*</span>
          </label>
          <SearchableCombobox
            id="make"
            label="Make"
            placeholder="Select Make"
            searchPlaceholder="Search makes..."
            options={makeOptions}
            value={data.make || null}
            onChange={handleMakeChange}
            isLoading={isLoadingModels}
            disabled={!data.jdPowerManufacturerId}
          />
        </div>

        {/* Model (ModelTrimName from JD Power) */}
        <div>
          <label htmlFor="model" className="block text-xs font-semibold text-gray-700 mb-0.5">
            Model/Floorplan <span className="text-red-600">*</span>
          </label>
          <SearchableCombobox
            id="model"
            label="Model"
            placeholder="Select Model"
            searchPlaceholder="Search models..."
            options={modelOptions}
            value={data.jdPowerModelTrimId?.toString() ?? null}
            onChange={handleModelChange}
            disabled={!data.make}
          />
        </div>

        {/* Mileage */}
        <div>
          <label htmlFor="mileage" className="block text-xs font-semibold text-gray-700 mb-0.5">
            Mileage / Engine Hours
          </label>
          <input
            type="number"
            id="mileage"
            className={`mt-0.5 block w-full rounded-md border border-gray-200 shadow-sm p-2 text-sm transition-all ${
              isMileageEnabled
                ? 'bg-white text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300'
                : 'bg-gray-100 text-gray-500 cursor-not-allowed'
            }`}
            placeholder="e.g., 15000"
            disabled={!isMileageEnabled}
            value={data.mileage || ''}
            onChange={(e) => onUpdate({ mileage: e.target.value ? parseInt(e.target.value) : null })}
          />
        </div>

        <hr className="border-gray-200 mt-2" />

        {/* JD Power Trade-In (Read-Only Reference) */}
        <div className="bg-gradient-to-br from-gray-100 to-slate-200 rounded-lg p-3 text-center shadow-md border border-gray-300">
          <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">
            JD Power Trade-In (Reference)
          </label>
          <span className="block text-lg font-black text-gray-900">
            {formatCurrency(calculated.jdPowerTradeIn)}
          </span>
        </div>

        {/* Lookup Button */}
        <button
          type="button"
          onClick={onLookup}
          disabled={!isLookupReady || isLookupComplete || isLoading}
          className={`w-full py-2 mt-2 text-sm text-white font-bold rounded-lg shadow-md transition-all transform ${
            isLookupReady && !isLookupComplete && !isLoading
              ? 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]'
              : 'bg-gray-400 cursor-not-allowed opacity-60'
          }`}
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
        </button>
      </div>
    </div>
  );
}
