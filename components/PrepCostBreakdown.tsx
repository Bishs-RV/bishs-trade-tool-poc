'use client';

import { formatCurrency } from '@/lib/calculations';

interface PrepCostBreakdownProps {
  pdiCost: number;
  reconCost: number;
  soldPrepCost: number;
  additionalPrepCost: number;
  totalPrepCosts: number;
  bishTIVBase: number;
  totalUnitCosts: number;
}

export default function PrepCostBreakdown({
  pdiCost,
  reconCost,
  soldPrepCost,
  additionalPrepCost,
  totalPrepCosts,
  bishTIVBase,
  totalUnitCosts,
}: PrepCostBreakdownProps) {
  return (
    <>
      {/* Total Prep Cost Output - BREAKDOWN STRUCTURE */}
      <div className="p-3 bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg border border-gray-300 shadow-md">
        <div className="grid grid-cols-4 gap-1 border-b border-gray-300 pb-2 mb-2">
          <div className="text-center">
            <span className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">
              PDI
            </span>
            <span className="text-sm font-extrabold text-gray-900">
              {formatCurrency(pdiCost)}
            </span>
          </div>
          <div className="text-center">
            <span className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">
              Recon
            </span>
            <span className="text-base font-extrabold text-gray-900">
              {formatCurrency(reconCost)}
            </span>
          </div>
          <div className="text-center">
            <span className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">
              Sold Prep
            </span>
            <span className="text-base font-extrabold text-gray-900">
              {formatCurrency(soldPrepCost)}
            </span>
          </div>
          <div className="text-center">
            <span className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">
              Add&apos;l
            </span>
            <span className="text-base font-extrabold text-gray-900">
              {formatCurrency(additionalPrepCost)}
            </span>
          </div>
        </div>

        {/* Total Row */}
        <div className="flex justify-between items-center pt-1">
          <span className="font-bold text-gray-800 uppercase tracking-wide text-xs">
            Total Prep:
          </span>
          <span className="text-xl font-black text-gray-900">
            {formatCurrency(totalPrepCosts)}
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
        <span className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">
          Bish&apos;s Trade-In Value (Base)
        </span>
        <span className="block text-xl font-black text-gray-900">
          {formatCurrency(bishTIVBase)}
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
        <span className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">
          Total Bank Cost
        </span>
        <span className="block text-xl font-black text-gray-900">
          {formatCurrency(totalUnitCosts)}
        </span>
      </div>
    </>
  );
}
