'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { TradeData, CalculatedValues, RVType } from '@/lib/types';
import { LOCATIONS, RV_TYPE_OPTIONS, isMotorized } from '@/lib/constants';
import { formatCurrency } from '@/lib/calculations';
import { getCategoryId } from '@/lib/jdpower/rv-types';
import type { MakeCategory, ModelTrim } from '@/lib/jdpower/types';
import type { TradeEvaluation } from '@/lib/db/schema';
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
import PriorEvaluationsDialog from '@/components/PriorEvaluationsDialog';
import CustomerInfoFields from '@/components/CustomerInfoFields';

interface Section1Props {
  data: TradeData;
  calculated: CalculatedValues;
  onUpdate: (updates: Partial<TradeData>) => void;
  onLookup: () => void;
  isLookupComplete: boolean;
  isLoading?: boolean;
  onLoadEvaluation?: (evaluation: TradeEvaluation) => void;
}

export default function Section1UnitData({
  data,
  calculated,
  onUpdate,
  onLookup,
  isLookupComplete,
  isLoading = false,
  onLoadEvaluation,
}: Section1Props) {
  const isMileageEnabled = isMotorized(data.rvType);
  const [isPriorEvaluationsOpen, setIsPriorEvaluationsOpen] = useState(false);

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

  useEffect(() => {
    if (!data.rvType) {
      setManufacturers([]);
      return;
    }

    const abortController = new AbortController();
    setIsLoadingMakes(true);

    (async () => {
      try {
        const categoryId = getCategoryId(data.rvType);
        const response = await fetch(
          `/api/jdpower/makes?rvCategoryId=${categoryId}`,
          { signal: abortController.signal }
        );
        if (!response.ok) throw new Error('Failed to fetch manufacturers');
        const result = await response.json();
        setManufacturers(result.makes || []);
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error('Error fetching manufacturers:', error);
          setManufacturers([]);
        }
      } finally {
        setIsLoadingMakes(false);
      }
    })();

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

  useEffect(() => {
    if (!data.jdPowerManufacturerId) {
      setYears([]);
      return;
    }

    const abortController = new AbortController();
    setIsLoadingYears(true);

    (async () => {
      try {
        const response = await fetch(
          `/api/jdpower/years?makeId=${data.jdPowerManufacturerId}`,
          { signal: abortController.signal }
        );
        if (!response.ok) throw new Error('Failed to fetch years');
        const result = await response.json();
        setYears(result.years || []);
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error('Error fetching years:', error);
          setYears([]);
        }
      } finally {
        setIsLoadingYears(false);
      }
    })();

    setModelTrims([]);
    onUpdateRef.current({
      year: null,
      make: '',
      model: '',
      jdPowerModelTrimId: null,
    });

    return () => abortController.abort();
  }, [data.jdPowerManufacturerId]);

  useEffect(() => {
    if (!data.year || !data.rvType || !data.jdPowerManufacturerId) {
      setModelTrims([]);
      return;
    }

    const abortController = new AbortController();
    setIsLoadingModels(true);
    setModelTrims([]);
    onUpdateRef.current({
      make: '',
      model: '',
      jdPowerModelTrimId: null,
    });

    (async () => {
      try {
        const categoryId = getCategoryId(data.rvType);
        const response = await fetch(
          `/api/jdpower/model-trims?makeId=${data.jdPowerManufacturerId}&year=${data.year}&rvCategoryId=${categoryId}`,
          { signal: abortController.signal }
        );
        if (!response.ok) throw new Error('Failed to fetch models');
        const result = await response.json();
        setModelTrims(result.modelTrims || []);
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error('Error fetching models:', error);
          setModelTrims([]);
        }
      } finally {
        setIsLoadingModels(false);
      }
    })();

    return () => abortController.abort();
  }, [data.year, data.jdPowerManufacturerId, data.rvType]);

  const isCustomInputMode = !!(
    data.customManufacturer ||
    data.customMake ||
    data.customModel
  );

  const isLookupReady =
    data.year !== null &&
    data.rvType !== null &&
    data.model.trim() !== '' &&
    (isCustomInputMode
      ? (data.customManufacturer || data.jdPowerManufacturerId !== null)
      : (data.jdPowerManufacturerId !== null &&
         data.make.trim() !== '' &&
         data.jdPowerModelTrimId !== null));

  const handleYearChange = (option: ComboboxOption) => {
    const yearValue = parseInt(option.isCustom ? option.label : option.value, 10);
    if (!isNaN(yearValue) && yearValue >= 1980 && yearValue <= 2100) {
      onUpdate({ year: yearValue });
    }
  };

  const handleRvTypeChange = (value: string) => {
    onUpdate({ rvType: value as RVType, mileage: null });
  };

  const handleManufacturerChange = (option: ComboboxOption) => {
    onUpdate(option.isCustom ? {
      jdPowerManufacturerId: null,
      manufacturerName: option.label,
      customManufacturer: option.label,
    } : {
      jdPowerManufacturerId: parseInt(option.value, 10),
      manufacturerName: option.label,
      customManufacturer: undefined,
    });
  };

  const handleMakeChange = (option: ComboboxOption) => {
    onUpdate({
      make: option.isCustom ? option.label : option.value,
      customMake: option.isCustom ? option.label : undefined,
      model: '',
      jdPowerModelTrimId: null,
    });
  };

  const handleModelChange = (option: ComboboxOption) => {
    if (option.isCustom) {
      onUpdate({
        model: option.label,
        customModel: option.label,
        jdPowerModelTrimId: null,
      });
      return;
    }

    const selectedModel = modelTrims.find(m => m.ModelTrimID.toString() === option.value);
    if (selectedModel) {
      onUpdate({
        model: selectedModel.ModelTrimName,
        customModel: undefined,
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
        <CustomerInfoFields
          customerName={data.customerName}
          customerPhone={data.customerPhone}
          customerEmail={data.customerEmail}
          onUpdate={onUpdate}
        />

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

        {/* Search Prior Evaluations Button */}
        {onLoadEvaluation && (
          <button
            type="button"
            onClick={() => setIsPriorEvaluationsOpen(true)}
            disabled={!data.vin && !data.stockNumber}
            className={`w-full py-1.5 text-xs font-medium rounded-md border transition-colors ${
              data.vin || data.stockNumber
                ? 'text-blue-700 border-blue-300 bg-blue-50 hover:bg-blue-100'
                : 'text-gray-400 border-gray-200 bg-gray-50 cursor-not-allowed'
            }`}
          >
            Search Prior Evaluations
          </button>
        )}

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

      {/* Prior Evaluations Dialog */}
      {onLoadEvaluation && (
        <PriorEvaluationsDialog
          open={isPriorEvaluationsOpen}
          onOpenChange={setIsPriorEvaluationsOpen}
          vin={data.vin}
          stockNumber={data.stockNumber}
          onLoadEvaluation={onLoadEvaluation}
        />
      )}
    </div>
  );
}
