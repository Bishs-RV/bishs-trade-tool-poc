'use client';

import { useEffect, useState, useRef } from 'react';
import { formatCurrency, formatPercent } from '@/lib/calculations';
import { Input } from '@/components/ui/input';

interface FinancialMetricsGridProps {
  retailPriceSource: 'jdpower' | 'custom';
  customRetailValue: number;
  jdPowerRetailValue: number;
  finalTradeOffer: number;
  calculatedMarginAmount: number;
  calculatedMarginPercent: number;
  onUpdate: (updates: { retailPriceSource?: 'jdpower' | 'custom'; customRetailValue?: number }) => void;
  // Metadata for display
  currentUserName?: string;
  location?: string;
  createdBy?: string;
  createdDate?: Date;
}

const RETAIL_SOURCES = ['jdpower', 'custom'] as const;

export default function FinancialMetricsGrid({
  retailPriceSource,
  customRetailValue,
  jdPowerRetailValue,
  finalTradeOffer,
  calculatedMarginAmount,
  calculatedMarginPercent,
  onUpdate,
  currentUserName,
  location,
  createdBy,
  createdDate,
}: FinancialMetricsGridProps) {
  const [lookedUpName, setLookedUpName] = useState<string | null>(null);
  const lastLookedUpEmailRef = useRef<string | undefined>(undefined);

  // Look up creator's name for loaded evaluations
  useEffect(() => {
    if (!createdBy || createdBy === lastLookedUpEmailRef.current) return;

    lastLookedUpEmailRef.current = createdBy;
    let cancelled = false;

    const lookupUser = async () => {
      try {
        const res = await fetch(`/api/user/lookup?email=${encodeURIComponent(createdBy)}`);
        if (!res.ok) throw new Error('Lookup failed');
        const data = await res.json();

        if (cancelled) return;

        const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
        setLookedUpName(fullName || createdBy.split('@')[0]);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to lookup user:', err);
        setLookedUpName(createdBy.split('@')[0]);
      }
    };

    lookupUser();
    return () => { cancelled = true; };
  }, [createdBy]);

  // Use looked up name for loaded evaluations, current user for new evaluations
  const userName = createdBy ? lookedUpName : currentUserName;
  const displayDate = createdDate ? new Date(createdDate) : new Date();
  const dateStr = displayDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 items-stretch">
        {/* 1. Retail Price (JD Power or Custom) */}
        <div className="bg-gradient-to-br from-gray-100 to-slate-200 rounded-lg p-3 text-center shadow-md border border-gray-300 hover:shadow-lg transition-all">
          <span className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">
            Retail Price
          </span>

          {/* Retail Price Source Selector */}
          <div className="flex gap-0.5 bg-gray-100 p-0.5 rounded-md mb-2">
            {RETAIL_SOURCES.map((source) => (
              <label
                key={source}
                className={`flex-1 text-center py-1 rounded-md cursor-pointer text-xs font-bold transition-all ${
                  retailPriceSource === source
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <input
                  type="radio"
                  name="retail-price-source"
                  value={source}
                  checked={retailPriceSource === source}
                  onChange={() => onUpdate({ retailPriceSource: source })}
                  className="hidden"
                />
                {source === 'jdpower' ? '90% JDP Retail' : 'Custom'}
              </label>
            ))}
          </div>

          {/* Sublabel below toggle */}
          <p className="text-xs text-gray-500 italic mb-2 text-center">
            90% of JD Power Retail Value
          </p>

          {/* Price Display/Input Area */}
          {retailPriceSource === 'jdpower' ? (
            <span className="block text-lg font-black text-gray-900">
              {formatCurrency(jdPowerRetailValue)}
            </span>
          ) : (
            <div className="flex">
              <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-gray-50 px-2 text-gray-600 text-xs font-bold">
                $
              </span>
              <Input
                type="number"
                className="rounded-l-none text-center font-bold"
                placeholder="0"
                value={customRetailValue || ''}
                onChange={(e) => {
                  const parsed = parseFloat(e.target.value);
                  onUpdate({ customRetailValue: isNaN(parsed) ? 0 : parsed });
                }}
              />
            </div>
          )}
        </div>

        {/* 2. Bish's Replacement Cost */}
        <div className="bg-gradient-to-br from-gray-100 to-slate-200 rounded-lg p-3 text-center shadow-md border border-gray-300 hover:shadow-lg transition-all">
          <span className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">
            Bish&apos;s Replacement Cost
          </span>
          <span className="block text-lg font-black text-gray-400 italic">
            COMING SOON
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
              {formatCurrency(finalTradeOffer)}
            </span>
            <div className="mt-2 h-1 w-20 mx-auto bg-white/50 rounded-full" />
            {/* Metadata: Date | User | Store */}
            {(userName || location) && (
              <p className="mt-2 text-xs text-orange-100/80 font-medium">
                {[dateStr, userName, location].filter(Boolean).join(' | ')}
              </p>
            )}
          </div>
        </div>

        {/* 4. Calculated Margin Amount */}
        <div className="bg-gradient-to-br from-gray-100 to-slate-200 rounded-xl p-5 text-center shadow-md border-2 border-gray-300 hover:shadow-lg transition-all">
          <span className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
            Margin Amount
          </span>
          <span className="block text-2xl font-black text-gray-900">
            {formatCurrency(calculatedMarginAmount)}
          </span>
        </div>

        {/* 5. Calculated Margin % */}
        <div className="bg-gradient-to-br from-gray-100 to-slate-200 rounded-xl p-5 text-center shadow-md border-2 border-gray-300 hover:shadow-lg transition-all">
          <span className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
            Margin %
          </span>
          <span className="block text-2xl font-black text-gray-900">
            {formatPercent(calculatedMarginPercent)}
          </span>
        </div>
    </div>
  );
}
