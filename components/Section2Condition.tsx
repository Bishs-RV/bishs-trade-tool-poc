'use client';

import { TradeData, CalculatedValues } from '@/lib/types';
import ConditionScoreSlider from '@/components/ConditionScoreSlider';
import ConditionNotesFields from '@/components/ConditionNotesFields';
import PrepCostBreakdown from '@/components/PrepCostBreakdown';

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
      <div
        className={`bg-white p-4 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 h-full ${isLocked ? 'pointer-events-none select-none' : ''}`}
      >
        {isLocked && (
          <div className="absolute inset-0 bg-gradient-to-br from-white/95 to-gray-100/95 backdrop-blur-md z-20 rounded-xl flex items-center justify-center pointer-events-auto">
            <div className="text-center border-2 border-dashed border-gray-400 rounded-lg p-4 bg-white/70 shadow-lg">
              <div className="text-3xl font-black text-gray-300 mb-1">2</div>
              <p className="text-lg font-bold text-gray-600">Complete Step 1 to unlock</p>
              <p className="text-sm text-gray-500 mt-1">Finish Unit Lookup first</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center text-white font-bold text-sm shadow-lg">
            2
          </div>
          <h2 className="text-lg font-bold text-gray-900">Condition & Prep Costs</h2>
        </div>

        <div className="space-y-3">
          {/* Condition Score Slider */}
          <ConditionScoreSlider
            conditionScore={data.conditionScore}
            onUpdate={(conditionScore) => onUpdate({ conditionScore })}
          />

          {/* Notes & Manual Cost Override */}
          <ConditionNotesFields
            majorIssues={data.majorIssues}
            unitAddOns={data.unitAddOns}
            additionalPrepCost={data.additionalPrepCost}
            onUpdate={onUpdate}
          />

          {/* Prep Cost Breakdown & Totals */}
          <PrepCostBreakdown
            pdiCost={calculated.pdiCost}
            reconCost={calculated.reconCost}
            soldPrepCost={calculated.soldPrepCost}
            additionalPrepCost={data.additionalPrepCost}
            totalPrepCosts={calculated.totalPrepCosts}
            bishTIVBase={calculated.bishTIVBase}
            totalUnitCosts={calculated.totalUnitCosts}
          />
        </div>
      </div>
    </div>
  );
}
