'use client';

import { formatCurrency } from '@/lib/calculations';
import { Button } from '@/components/ui/button';

interface TradeValueCardProps {
  jdPowerTradeIn: number;
  isLookupReady: boolean;
  isLookupComplete: boolean;
  isLoading: boolean;
  onLookup: () => void;
}

export default function TradeValueCard({
  jdPowerTradeIn,
  isLookupReady,
  isLookupComplete,
  isLoading,
  onLookup,
}: TradeValueCardProps) {
  return (
    <>
      <hr className="border-gray-200 mt-2" />

      {/* JD Power Trade-In (Read-Only Reference) */}
      <div className="bg-gradient-to-br from-gray-100 to-slate-200 rounded-lg p-3 text-center shadow-md border border-gray-300">
        <span className="block text-xs font-bold text-gray-600 uppercase tracking-wide">
          JD Power Trade-In (Reference)
        </span>
        <span className="block text-lg font-black text-gray-900 mt-1">
          {formatCurrency(jdPowerTradeIn)}
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
    </>
  );
}
