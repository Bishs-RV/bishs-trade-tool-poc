'use client';

import { TradeData, CalculatedValues } from '@/lib/types';
import { Button } from '@/components/ui/button';
import ValuationSliders from '@/components/ValuationSliders';
import FinancialMetricsGrid from '@/components/FinancialMetricsGrid';

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
      <div
        className={`bg-white p-4 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 ${isLocked ? 'pointer-events-none select-none' : ''}`}
      >
        {isLocked && (
          <div className="absolute inset-0 bg-gradient-to-br from-white/95 to-gray-100/95 backdrop-blur-md z-20 rounded-2xl flex items-center justify-center pointer-events-auto">
            <div className="text-center border-2 border-dashed border-gray-400 rounded-xl p-8 bg-white/70 shadow-lg">
              <div className="text-5xl font-black text-gray-300 mb-2">4</div>
              <p className="text-lg font-bold text-gray-600">Complete Step 1 to unlock</p>
              <p className="text-sm text-gray-500 mt-1">Finish Unit Lookup first</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center text-white font-bold text-sm shadow-lg">
            4
          </div>
          <h2 className="text-lg font-bold text-gray-900">Valuation Levers & Final Metrics</h2>
        </div>

        {/* Valuation Sliders */}
        <ValuationSliders
          tradeInPercent={data.tradeInPercent}
          targetMarginPercent={data.targetMarginPercent}
          onUpdate={onUpdate}
        />

        {/* Financial Metrics Grid */}
        <FinancialMetricsGrid
          retailPriceSource={data.retailPriceSource}
          customRetailValue={data.customRetailValue}
          jdPowerRetailValue={calculated.jdPowerRetailValue}
          replacementCost={calculated.replacementCost}
          finalTradeOffer={calculated.finalTradeOffer}
          calculatedMarginAmount={calculated.calculatedMarginAmount}
          calculatedMarginPercent={calculated.calculatedMarginPercent}
          onUpdate={onUpdate}
        />

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
