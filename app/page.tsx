'use client';

import { useState, useEffect } from 'react';
import { TradeData, CalculatedValues } from '@/lib/types';
import { calculateValuation, calculateTradeInPercentFromMargin, DriverId } from '@/lib/calculations';
import Section1UnitData from '@/components/Section1UnitData';
import Section2Condition from '@/components/Section2Condition';
import Section3Market from '@/components/Section3Market';
import Section4Valuation from '@/components/Section4Valuation';

export default function Home() {
  const [isLookupComplete, setIsLookupComplete] = useState(false);
  const [data, setData] = useState<TradeData>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    stockNumber: '5642',
    location: 'BMT',
    year: 2020,
    make: 'Forest River',
    model: 'Rockwood Ultra Lite',
    vin: '5FBY26H52EGA78912',
    rvType: 'FW',
    mileage: null,
    originalListPrice: 85000,
    conditionScore: 8,
    majorIssues: '',
    unitAddOns: '',
    additionalPrepCost: 0,
    avgListingPrice: 0,
    tradeInPercent: 1.0,
    targetMarginPercent: 0.25,
    retailSource: 'bish',
    customRetailPrice: 0,
    retailPriceSource: 'jdpower',
    customRetailValue: 0,
    valuationNotes: '',
  });

  const [calculated, setCalculated] = useState<CalculatedValues>({
    jdPowerTradeIn: 0,
    jdPowerRetailValue: 0,
    pdiCost: 0,
    reconCost: 0,
    soldPrepCost: 0,
    totalPrepCosts: 0,
    bishTIVBase: 0,
    totalUnitCosts: 0,
    avgCompPrice: 0,
    calculatedRetailPrice: 0,
    replacementCost: 0,
    activeRetailPrice: 0,
    finalTradeOffer: 0,
    calculatedMarginAmount: 0,
    calculatedMarginPercent: 0,
    activePrepTier: null,
  });

  // Initial calculation on mount to set Trade-In % based on default margin
  useEffect(() => {
    recalculate('initial-load');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recalculate whenever data changes
  const recalculate = (driverId: DriverId, updates?: Partial<TradeData>) => {
    const newData = updates ? { ...data, ...updates } : data;
    
    // Handle slider inverse calculation
    if (driverId === 'margin-percent-slider' || driverId === 'initial-load') {
      const newCalc = calculateValuation(newData, driverId, isLookupComplete);
      const newTradeInPercent = calculateTradeInPercentFromMargin(
        newCalc.totalUnitCosts,
        newCalc.finalTradeOffer
      );
      
      setData({ ...newData, tradeInPercent: newTradeInPercent });
      setCalculated(newCalc);
    } else {
      const newCalc = calculateValuation(newData, driverId, isLookupComplete);
      
      // Update target margin percent based on calculated margin
      if (driverId === 'trade-in-percent-slider' || 
          driverId === 'condition-score' || 
          driverId === 'additional-prep-cost' ||
          driverId === 'avg-listing-price' ||
          driverId === 'custom-retail-price' ||
          driverId === 'retail-source' ||
          driverId === 'rv-type') {
        setData({ ...newData, targetMarginPercent: newCalc.calculatedMarginPercent });
      } else {
        setData(newData);
      }
      
      setCalculated(newCalc);
    }
  };

  const handleUpdate = (updates: Partial<TradeData>, driverId: DriverId = 'trade-in-percent-slider') => {
    recalculate(driverId, updates);
  };

  const handleLookup = () => {
    setIsLookupComplete(true);
    // Populate with mock data
    const updates: Partial<TradeData> = {
      avgListingPrice: 52000,
      conditionScore: 8,
      additionalPrepCost: 500,
    };
    recalculate('lookup-complete', updates);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalData = {
      stockNumber: data.stockNumber,
      location: data.location,
      finalOffer: calculated.finalTradeOffer,
      marginAmount: calculated.calculatedMarginAmount,
      marginPercent: calculated.calculatedMarginPercent,
      totalUnitCosts: calculated.totalUnitCosts,
      valuationNotes: data.valuationNotes,
      rvType: data.rvType,
      conditionScore: data.conditionScore,
      additionalPrepCost: data.additionalPrepCost,
    };

    console.log('--- FINAL VALUATION SUBMITTED ---');
    console.log(JSON.stringify(finalData, null, 2));
    alert('Valuation submitted! Check console for details.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-blue-50 to-gray-100 p-4 sm:p-8">
      <div className="max-w-screen-2xl mx-auto">
        {/* Header */}
        <header className="relative overflow-hidden text-center mb-12 p-8 bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-600">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-500/10 to-transparent"></div>
          <div className="relative z-10">
            <h1 className="text-5xl font-black text-white tracking-tight mb-2">
              Bish&apos;s Trade-In Tool
            </h1>
            <p className="text-slate-300 text-sm font-medium">Internal Valuation System</p>
          </div>
          
          {/* User Name Display */}
          <div className="absolute top-6 right-8 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
            <p className="text-sm text-white">
              <span className="opacity-80">User:</span>{' '}
              <span className="font-bold">Julian Baden</span>
            </p>
          </div>
        </header>

        {/* Main Form */}
        <form onSubmit={handleSubmit}>
          {/* 3-Column Grid for Sections 1, 2, 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* COLUMN 1: Section 1 - Unit & Base Data */}
            <div className="lg:col-span-1">
              <Section1UnitData
                data={data}
                calculated={calculated}
                onUpdate={(updates) => handleUpdate(updates, 'trade-in-percent-slider')}
                onLookup={handleLookup}
                isLookupComplete={isLookupComplete}
              />
            </div>

            {/* COLUMN 2: Section 2 - Condition & Prep Costs */}
            <div className="lg:col-span-1">
              <Section2Condition
                data={data}
                calculated={calculated}
                onUpdate={(updates) => {
                  const driverId = updates.conditionScore !== undefined 
                    ? 'condition-score' 
                    : updates.additionalPrepCost !== undefined
                    ? 'additional-prep-cost'
                    : 'trade-in-percent-slider';
                  handleUpdate(updates, driverId);
                }}
                isLocked={!isLookupComplete}
              />
            </div>

            {/* COLUMN 3: Section 3 - Market Data */}
            <div className="lg:col-span-1">
              <Section3Market
                data={data}
                onUpdate={(updates) => handleUpdate(updates, 'avg-listing-price')}
                isLocked={!isLookupComplete}
              />
            </div>
          </div>

          {/* Full-Width Section 4 - Valuation Levers */}
          <div className="mb-6">
            <Section4Valuation
              data={data}
              calculated={calculated}
              onUpdate={(updates) => {
                const driverId = updates.tradeInPercent !== undefined
                  ? 'trade-in-percent-slider'
                  : updates.targetMarginPercent !== undefined
                  ? 'margin-percent-slider'
                  : updates.retailSource !== undefined
                  ? 'retail-source'
                  : updates.customRetailPrice !== undefined
                  ? 'custom-retail-price'
                  : 'trade-in-percent-slider';
                handleUpdate(updates, driverId);
              }}
              isLocked={!isLookupComplete}
            />
          </div>

          {/* Notes Section */}
          <div className="mt-8 p-6 bg-white rounded-2xl shadow-xl border border-gray-200">
            <h2 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2">
              <span>📝</span>
              <span>Valuation Notes</span>
            </h2>
            <textarea
              id="valuation-notes"
              rows={3}
              className="mt-1 block w-full rounded-xl border-2 border-gray-200 shadow-sm p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
              placeholder="Document customer negotiations, final sign-off, or special terms here."
              value={data.valuationNotes}
              onChange={(e) => setData({ ...data, valuationNotes: e.target.value })}
              disabled={!isLookupComplete}
            />
          </div>

          {/* Submit Button */}
          <div className="mt-6">
            <button
              type="submit"
              className="w-full py-5 text-xl text-white font-black rounded-2xl shadow-2xl bg-gradient-to-r from-slate-600 via-slate-700 to-slate-800 hover:from-slate-700 hover:via-slate-800 hover:to-slate-900 transition-all transform hover:scale-[1.02] active:scale-[0.98] border border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              disabled={!isLookupComplete}
            >
              <span className="flex items-center justify-center gap-3">
                <span>SUBMIT VALUATION</span>
                <span className="text-2xl">→</span>
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
