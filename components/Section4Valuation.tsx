'use client';

import { TradeData, CalculatedValues } from '@/lib/types';
import { formatCurrency, formatPercent } from '@/lib/calculations';
import { TARGET_MARGIN_PERCENT } from '@/lib/constants';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface Section4Props {
  data: TradeData;
  calculated: CalculatedValues;
  onUpdate: (updates: Partial<TradeData>) => void;
  isLocked: boolean;
}

export default function Section4Valuation({
  data,
  calculated,
  onUpdate,
  isLocked,
}: Section4Props) {
  return (
    <div className="relative">
      <div className={`bg-white p-4 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 ${isLocked ? 'pointer-events-none select-none' : ''}`}>
      
      {isLocked && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/95 to-gray-100/95 backdrop-blur-md z-20 rounded-2xl flex items-center justify-center pointer-events-auto">
          <div className="text-center border-2 border-dashed border-gray-400 rounded-xl p-8 bg-white/70 shadow-lg">
            <div className="text-5xl font-black text-gray-300 mb-2">4</div>
            <p className="text-lg font-bold text-gray-600">
              Complete Step 1 to unlock
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Finish Unit Lookup first
            </p>
          </div>
        </div>
      )}
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center text-white font-bold text-sm shadow-lg">
            4
          </div>
          <h2 className="text-lg font-bold text-gray-900">
            Valuation Levers & Final Metrics
          </h2>
        </div>

        {/* TWO-WAY SLIDERS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 border-b pb-3">
          {/* SLIDER 1: Trade-In % of Total Unit Costs */}
          <div className="space-y-2 bg-gradient-to-br from-slate-50 to-gray-50 p-3 rounded-lg border border-slate-200">
            <Label htmlFor="trade-in-percent-slider" className="text-sm font-bold text-gray-900">
              Trade-In Offer as % of Total Unit Costs
            </Label>
            <Slider
              id="trade-in-percent-slider"
              min={70}
              max={130}
              step={1}
              value={[data.tradeInPercent * 100]}
              onValueChange={([val]) => onUpdate({ tradeInPercent: val / 100 })}
              className="mt-2"
            />
            <div className="flex justify-between text-sm font-semibold pt-0.5">
              <span className="text-gray-500 text-xs">70% (Low)</span>
              <span className="text-blue-900">
                <span className="text-lg font-extrabold">{formatPercent(data.tradeInPercent)}</span>
              </span>
              <span className="text-gray-500 text-sm">130% (High)</span>
            </div>
          </div>

          {/* SLIDER 2: Target Margin % */}
          <div className="space-y-2 relative bg-gradient-to-br from-slate-50 to-gray-50 p-3 rounded-lg border border-slate-200" id="margin-slider-container">
            <Label htmlFor="margin-percent-slider" className="text-sm font-bold text-gray-900">
              Target Calculated Margin %
            </Label>

            {/* Target tick mark and label */}
            <div className="relative pt-3">
              <div
                className="absolute top-0 left-0 right-0 flex justify-start pointer-events-none"
                style={{ paddingLeft: `${(TARGET_MARGIN_PERCENT / 0.40) * 100}%` }}
              >
                <div className="relative" style={{ marginLeft: '-28px' }}>
                  <span className="block text-xs font-bold text-green-600 whitespace-nowrap mb-0.5">
                    18% Target
                  </span>
                  <div className="w-0.5 h-3 bg-green-600 mx-auto"></div>
                </div>
              </div>

              <Slider
                id="margin-percent-slider"
                min={0}
                max={40}
                step={0.5}
                value={[data.targetMarginPercent * 100]}
                onValueChange={([val]) => onUpdate({ targetMarginPercent: val / 100 })}
              />
            </div>

            <div className="flex justify-between text-sm font-semibold pt-0.5">
              <span className="text-gray-500 text-xs">0% (Break Even)</span>
              <span className="text-blue-900">
                <span className="text-lg font-extrabold">{formatPercent(data.targetMarginPercent)}</span>
              </span>
              <span className="text-gray-500 text-xs">40%</span>
            </div>
          </div>
        </div>

        {/* FINANCIAL METRICS GRID */}
        <h3 className="text-base font-bold text-gray-900 mb-2">Final Outputs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 items-stretch">
          {/* 1. Retail Price (JD Power or Custom) */}
          <div className="bg-gradient-to-br from-gray-100 to-slate-200 rounded-lg p-3 text-center shadow-md border border-gray-300 hover:shadow-lg transition-all">
            <span className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">
              Retail Price
            </span>

            {/* Retail Price Source Selector */}
            <div className="flex gap-0.5 bg-gray-100 p-0.5 rounded-md mb-2">
              {['jdpower', 'custom'].map((source) => (
                <label
                  key={source}
                  className={`flex-1 text-center py-1 rounded-md cursor-pointer text-xs font-bold transition-all ${
                    data.retailPriceSource === source
                      ? 'bg-slate-700 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="retail-price-source"
                    value={source}
                    checked={data.retailPriceSource === source}
                    onChange={() => onUpdate({ retailPriceSource: source as 'jdpower' | 'custom' })}
                    className="hidden"
                  />
                  {source === 'jdpower' ? 'Likely Retail' : 'Custom'}
                </label>
              ))}
            </div>

            {/* Sublabel below toggle */}
            <p className="text-xs text-gray-500 italic mb-2 text-center">
              Recent historical, less overages of ACV
            </p>

            {/* Price Display/Input Area */}
            {data.retailPriceSource === 'jdpower' ? (
              <span className="block text-lg font-black text-gray-900">
                {formatCurrency(calculated.jdPowerRetailValue)}
              </span>
            ) : (
              <div className="flex">
                <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-gray-50 px-2 text-gray-600 text-xs font-bold">
                  $
                </span>
                <Input
                  type="number"
                  id="custom-retail-value"
                  className="rounded-l-none text-center font-bold"
                  placeholder="0"
                  value={data.customRetailValue || ''}
                  onChange={(e) => onUpdate({ customRetailValue: e.target.value ? parseFloat(e.target.value) : 0 })}
                />
              </div>
            )}
          </div>

          {/* 2. Bish's Replacement Cost */}
          <div className="bg-gradient-to-br from-gray-100 to-slate-200 rounded-lg p-3 text-center shadow-md border border-gray-300 hover:shadow-lg transition-all">
            <span className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">
              Bish&apos;s Replacement Cost
            </span>
            <span className="block text-lg font-black text-gray-900">
              {formatCurrency(calculated.replacementCost)}
            </span>
          </div>

          {/* 3. Final Trade-in Offer (PROMINENT HIGHLIGHT) */}
          <div className="relative overflow-hidden p-4 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-xl shadow-xl border-2 border-orange-400 flex flex-col justify-center items-center transform hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.3),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(0,0,0,0.2),transparent_50%)]" />
            <div className="relative z-10 text-center">
              <span className="block text-xs font-black text-orange-100 uppercase tracking-wider mb-0.5">
                Final Trade Offer
              </span>
              <span className="block font-black text-2xl text-white leading-tight drop-shadow-xl">
                {formatCurrency(calculated.finalTradeOffer)}
              </span>
              <div className="mt-2 h-1 w-20 mx-auto bg-white/50 rounded-full" />
            </div>
          </div>

          {/* 4. Calculated Margin Amount */}
          <div className="bg-gradient-to-br from-gray-100 to-slate-200 rounded-xl p-5 text-center shadow-md border-2 border-gray-300 hover:shadow-lg transition-all">
            <span className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
              Margin Amount
            </span>
            <span className="block text-2xl font-black text-gray-900">
              {formatCurrency(calculated.calculatedMarginAmount)}
            </span>
          </div>

          {/* 5. Calculated Margin % */}
          <div className="bg-gradient-to-br from-gray-100 to-slate-200 rounded-xl p-5 text-center shadow-md border-2 border-gray-300 hover:shadow-lg transition-all">
            <span className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
              Margin %
            </span>
            <span className="block text-2xl font-black text-gray-900">
              {formatPercent(calculated.calculatedMarginPercent)}
            </span>
          </div>
        </div>

        {/* Print Button */}
        <div className="pt-3 flex justify-end">
          <Button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 text-xs text-white font-bold shadow-md bg-slate-700 hover:bg-slate-800 hover:scale-105 active:scale-95 border border-slate-600 flex items-center gap-2"
          >
            <span>🖨</span>
            <span>PDF PRINTOUT</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
