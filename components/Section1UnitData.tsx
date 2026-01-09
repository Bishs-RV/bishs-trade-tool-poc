'use client';

import { useState } from 'react';
import { TradeData, CalculatedValues } from '@/lib/types';
import { LOCATIONS, RV_TYPE_OPTIONS, isMotorized } from '@/lib/constants';
import { formatCurrency } from '@/lib/calculations';

interface Section1Props {
  data: TradeData;
  calculated: CalculatedValues;
  onUpdate: (updates: Partial<TradeData>) => void;
  onLookup: () => void;
  onGetTradeValue: () => Promise<void>;
  isLookupComplete: boolean;
}

export default function Section1UnitData({
  data,
  calculated,
  onUpdate,
  onLookup,
  onGetTradeValue,
  isLookupComplete,
}: Section1Props) {
  const [isLoadingStock, setIsLoadingStock] = useState(false);
  const [isLoadingVin, setIsLoadingVin] = useState(false);
  const [isLoadingTradeValue, setIsLoadingTradeValue] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const isMileageEnabled = isMotorized(data.rvType);

  const isLookupReady =
    data.year !== null &&
    data.manufacturer.trim() !== '' &&
    data.model.trim() !== '';

  const handleStockLookup = async () => {
    if (!data.stockNumber.trim()) return;

    setIsLoadingStock(true);
    setLookupError(null);

    try {
      const response = await fetch(`/api/inventory/lookup?stockNumber=${encodeURIComponent(data.stockNumber)}`);

      if (!response.ok) {
        if (response.status === 404) {
          setLookupError('Stock number not found');
          return;
        }
        throw new Error('Lookup failed');
      }

      const unit = await response.json();

      const parsedMileage = unit.odometer ? parseInt(unit.odometer, 10) : NaN;
      const parsedPrice = unit.msrp ? parseFloat(unit.msrp) : NaN;

      onUpdate({
        vin: unit.vin || data.vin,
        year: unit.modelYear || data.year,
        manufacturer: unit.manufacturer || data.manufacturer,
        make: unit.make || data.make,
        model: unit.model || data.model,
        mileage: !isNaN(parsedMileage) ? parsedMileage : data.mileage,
        originalListPrice: !isNaN(parsedPrice) ? parsedPrice : data.originalListPrice,
      });
    } catch {
      setLookupError('Failed to lookup stock number');
    } finally {
      setIsLoadingStock(false);
    }
  };

  const handleVinDecode = async () => {
    if (!data.vin.trim() || data.vin.length !== 17) return;

    setIsLoadingVin(true);
    setLookupError(null);

    try {
      const response = await fetch(`/api/vin/decode?vin=${encodeURIComponent(data.vin)}`);

      if (!response.ok) {
        throw new Error('VIN decode failed');
      }

      const result = await response.json();

      onUpdate({
        year: result.year || data.year,
        manufacturer: result.manufacturer || data.manufacturer,
        make: result.make || data.make,
        model: result.model || data.model,
      });
    } catch {
      setLookupError('Failed to decode VIN');
    } finally {
      setIsLoadingVin(false);
    }
  };

  const handleGetTradeValue = async () => {
    setIsLoadingTradeValue(true);
    setLookupError(null);

    try {
      await onGetTradeValue();
      onLookup();
    } catch (error) {
      setLookupError(error instanceof Error ? error.message : 'Failed to get trade value');
    } finally {
      setIsLoadingTradeValue(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 h-full">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center text-white font-bold text-sm shadow-lg">
          1
        </div>
        <h2 className="text-lg font-bold text-gray-900">
          Unit & Base Data
        </h2>
      </div>
      <div className="space-y-2">
        {/* Customer Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wide">Customer Info</h3>
            <button
              type="button"
              onClick={() => {
                if (data.customerPhone || data.customerEmail) {
                  alert('Customer lookup feature coming soon! This will search for prior valuations by phone/email.');
                }
              }}
              disabled={!data.customerPhone && !data.customerEmail}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                data.customerPhone || data.customerEmail
                  ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Load Prior Valuation
            </button>
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

        {/* Stock Number with Lookup Button */}
        <div className="flex gap-2">
          <div className="flex-1">
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
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleStockLookup}
              disabled={!data.stockNumber.trim() || isLoadingStock}
              className={`px-3 py-2 text-xs font-bold rounded-md transition-all ${
                data.stockNumber.trim() && !isLoadingStock
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoadingStock ? '...' : 'Lookup'}
            </button>
          </div>
        </div>

        {/* VIN with Decode Button */}
        <div className="flex gap-2">
          <div className="flex-1">
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
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleVinDecode}
              disabled={data.vin.length !== 17 || isLoadingVin}
              className={`px-3 py-2 text-xs font-bold rounded-md transition-all ${
                data.vin.length === 17 && !isLoadingVin
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoadingVin ? '...' : 'Decode'}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {lookupError && (
          <div className="text-xs text-red-600 bg-red-50 p-2 rounded-md">
            {lookupError}
          </div>
        )}

        {/* Location Dropdown */}
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

        {/* Year, RV Type */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="year" className="block text-xs font-semibold text-gray-700 mb-0.5">
              Year <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              id="year"
              className="mt-0.5 block w-full rounded-md border border-gray-200 shadow-sm p-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
              placeholder="2020"
              required
              value={data.year || ''}
              onChange={(e) => onUpdate({ year: e.target.value ? parseInt(e.target.value) : null })}
            />
          </div>
          <div>
            <label htmlFor="rv-type" className="block text-xs font-semibold text-gray-700 mb-0.5">
              RV Type <span className="text-red-600">*</span>
            </label>
            <select
              id="rv-type"
              className="mt-0.5 block w-full rounded-md border border-gray-200 shadow-sm p-2 text-sm bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
              required
              value={data.rvType}
              onChange={(e) => onUpdate({ rvType: e.target.value as TradeData['rvType'], mileage: null })}
            >
              {RV_TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Manufacturer - Free Form */}
        <div>
          <label htmlFor="manufacturer" className="block text-xs font-semibold text-gray-700 mb-0.5">
            Manufacturer <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            id="manufacturer"
            className="mt-0.5 block w-full rounded-md border border-gray-200 shadow-sm p-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
            placeholder="e.g., Forest River, Thor, Winnebago"
            required
            value={data.manufacturer}
            onChange={(e) => onUpdate({ manufacturer: e.target.value })}
          />
        </div>

        {/* Make - Free Form */}
        <div>
          <label htmlFor="make" className="block text-xs font-semibold text-gray-700 mb-0.5">
            Make
          </label>
          <input
            type="text"
            id="make"
            className="mt-0.5 block w-full rounded-md border border-gray-200 shadow-sm p-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
            placeholder="e.g., Rockwood, Jayco, Airstream"
            value={data.make}
            onChange={(e) => onUpdate({ make: e.target.value })}
          />
        </div>

        {/* Model - Free Form */}
        <div>
          <label htmlFor="model" className="block text-xs font-semibold text-gray-700 mb-0.5">
            Model/Floorplan <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            id="model"
            className="mt-0.5 block w-full rounded-md border border-gray-200 shadow-sm p-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
            placeholder="e.g., Ultra Lite 2608BS"
            required
            value={data.model}
            onChange={(e) => onUpdate({ model: e.target.value })}
          />
        </div>

        {/* Mileage field - enabled/disabled by RV type */}
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

        <div>
          <label htmlFor="original-list-price" className="block text-xs font-semibold text-gray-700 mb-0.5">
            Original List Price
          </label>
          <input
            type="number"
            id="original-list-price"
            className="mt-0.5 block w-full rounded-md border border-gray-200 shadow-sm p-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
            placeholder="e.g., 85000"
            value={data.originalListPrice || ''}
            onChange={(e) => onUpdate({ originalListPrice: e.target.value ? parseInt(e.target.value) : null })}
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

        {/* Get Trade Value Button */}
        <button
          type="button"
          onClick={handleGetTradeValue}
          disabled={!isLookupReady || isLookupComplete || isLoadingTradeValue}
          className={`w-full py-2 mt-2 text-sm text-white font-bold rounded-lg shadow-md transition-all transform ${
            isLookupReady && !isLookupComplete && !isLoadingTradeValue
              ? 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]'
              : 'bg-gray-400 cursor-not-allowed opacity-60'
          }`}
        >
          {isLoadingTradeValue ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⟳</span> Getting Trade Value...
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
