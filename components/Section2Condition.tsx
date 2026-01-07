'use client';

import { TradeData, CalculatedValues } from '@/lib/types';
import { formatCurrency } from '@/lib/calculations';

interface Section2Props {
  data: TradeData;
  calculated: CalculatedValues;
  onUpdate: (updates: Partial<TradeData>) => void;
  isLocked: boolean;
}

export default function Section2Condition({
  data,
  calculated,
  onUpdate,
  isLocked,
}: Section2Props) {
  return (
    <div className="relative">
      <div className={`bg-white p-4 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 h-full ${isLocked ? 'pointer-events-none select-none' : ''}`}>
      
      {isLocked && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/95 to-gray-100/95 backdrop-blur-md z-20 rounded-xl flex items-center justify-center pointer-events-auto">
          <div className="text-center border-2 border-dashed border-gray-400 rounded-lg p-4 bg-white/70 shadow-lg">
            <div className="text-3xl font-black text-gray-300 mb-1">2</div>
            <p className="text-lg font-bold text-gray-600">
              Complete Step 1 to unlock
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Finish Unit Lookup first
            </p>
          </div>
        </div>
      )}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-100">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            2
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Condition & Prep Costs
          </h2>
        </div>
        <div className="space-y-6">
          {/* Combined Condition Score 1-9 */}
          <div className="bg-gradient-to-br from-slate-50 to-gray-50 p-4 rounded-xl border border-slate-200">
            <label htmlFor="condition-score" className="block text-sm font-bold text-gray-800 mb-2">
              Condition Score (<span className="text-blue-600">1-9 Scale</span>)
            </label>
            <input
              type="range"
              id="condition-score"
              min="1"
              max="9"
              step="1"
              value={data.conditionScore}
              onChange={(e) => onUpdate({ conditionScore: parseInt(e.target.value) })}
              className="mt-4 w-full h-2 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg appearance-none cursor-pointer accent-blue-600 shadow-inner"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>1 (Poor)</span>
              <span className="font-bold text-blue-900 text-base">{data.conditionScore}</span>
              <span>9 (Excellent)</span>
            </div>
          </div>

          {/* NOTES & MANUAL COST OVERRIDE */}
          <div className="p-3 bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg border border-gray-200 space-y-2">
            {/* Major Issues (Deductions) */}
            <div>
              <label htmlFor="major-issues" className="block text-sm font-bold text-gray-800 mb-1">
                Major Issues (Deductions)
              </label>
              <textarea
                id="major-issues"
                rows={3}
                className="mt-1 block w-full rounded-lg border-2 border-gray-200 shadow-sm p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
                placeholder="List frame damage, non-working AC, or anything requiring substantial cost/reduction."
                value={data.majorIssues}
                onChange={(e) => onUpdate({ majorIssues: e.target.value })}
              />
            </div>

            {/* Unit Add-Ons (Value Adds) */}
            <div>
              <label htmlFor="unit-add-ons" className="block text-sm font-bold text-gray-800 mb-1">
                Unit Add-Ons (Value Adds)
              </label>
              <textarea
                id="unit-add-ons"
                rows={3}
                className="mt-1 block w-full rounded-lg border-2 border-gray-200 shadow-sm p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
                placeholder="List high-value aftermarket options (e.g., Solar package, upgraded stabilizer system)."
                value={data.unitAddOns}
                onChange={(e) => onUpdate({ unitAddOns: e.target.value })}
              />
            </div>

            {/* Manual Cost Override */}
            <div className="pt-2">
              <label htmlFor="additional-prep-cost" className="block text-sm font-bold text-gray-800 mb-1">
                Additional Costs Override
              </label>
              <div className="mt-1 flex shadow-sm">
                <span className="inline-flex items-center rounded-l-lg border-2 border-r-0 border-gray-200 bg-gray-100 px-4 text-gray-600 text-sm font-semibold">
                  $
                </span>
                <input
                  type="number"
                  id="additional-prep-cost"
                  className="block w-full flex-1 rounded-r-lg border-2 border-gray-200 p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
                  placeholder="0"
                  value={data.additionalPrepCost || ''}
                  onChange={(e) => onUpdate({ additionalPrepCost: e.target.value ? parseFloat(e.target.value) : 0 })}
                />
              </div>
            </div>
          </div>

          {/* Total Prep Cost Output - BREAKDOWN STRUCTURE */}
          <div className="p-3 bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg border border-gray-300 shadow-md">
            <div className="grid grid-cols-4 gap-1 border-b border-gray-300 pb-2 mb-2">
              <div className="text-center">
                <span className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-0.5">PDI</span>
                <span className="text-sm font-extrabold text-gray-900">
                  {formatCurrency(calculated.pdiCost)}
                </span>
              </div>
              <div className="text-center">
                <span className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Recon</span>
                <span className="text-base font-extrabold text-gray-900">
                  {formatCurrency(calculated.reconCost)}
                </span>
              </div>
              <div className="text-center">
                <span className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Sold Prep</span>
                <span className="text-base font-extrabold text-gray-900">
                  {formatCurrency(calculated.soldPrepCost)}
                </span>
              </div>
              <div className="text-center">
                <span className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Add&apos;l</span>
                <span className="text-base font-extrabold text-gray-900">
                  {formatCurrency(data.additionalPrepCost)}
                </span>
              </div>
            </div>

            {/* Total Row */}
            <div className="flex justify-between items-center pt-1">
              <span className="font-bold text-gray-800 uppercase tracking-wide text-xs">Total Prep:</span>
              <span className="text-xl font-black text-gray-900">
                {formatCurrency(calculated.totalPrepCosts)}
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1 italic">
              Fixed internal costs plus Additional Costs Override
            </p>
          </div>

          <hr className="border-gray-200" />

          {/* PLUS OPERATOR */}
          <div className="flex justify-center items-center h-8">
            <span className="text-5xl font-black text-gray-700">+</span>
          </div>

          {/* Bish's Value (CALCULATED & READ-ONLY DISPLAY) */}
          <div className="bg-gradient-to-br from-gray-100 to-slate-200 rounded-lg p-3 text-center shadow-md border border-gray-300">
            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">
              Bish&apos;s Trade-In Value (Base)
            </label>
            <span className="block text-xl font-black text-gray-900">
              {formatCurrency(calculated.bishTIVBase)}
            </span>
            <p className="text-xs text-gray-600 mt-2">
              Factor of JD Power, Condition, Depreciation, and Likely Sales Date
            </p>
          </div>

          {/* EQUALS OPERATOR */}
          <div className="flex justify-center items-center h-8">
            <span className="text-5xl font-black text-gray-700">=</span>
          </div>

          {/* Total Bank Cost */}
          <div className="bg-gradient-to-br from-gray-100 to-slate-200 rounded-lg p-3 text-center shadow-md border border-gray-300">
            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">
              Total Bank Cost
            </label>
            <span className="block text-xl font-black text-gray-900">
              {formatCurrency(calculated.totalUnitCosts)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
