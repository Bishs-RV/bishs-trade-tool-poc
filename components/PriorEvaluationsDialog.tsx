'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type { TradeEvaluation } from '@/lib/db/schema';

interface PriorEvaluationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vin: string;
  stockNumber: string;
  customerName: string;
  customerPhone: string;
  onLoadEvaluation: (evaluation: TradeEvaluation) => void;
}

export default function PriorEvaluationsDialog({
  open,
  onOpenChange,
  vin,
  stockNumber,
  customerName,
  customerPhone,
  onLoadEvaluation,
}: PriorEvaluationsDialogProps) {
  const [evaluations, setEvaluations] = useState<TradeEvaluation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (vin) params.set('vin', vin);
      if (stockNumber) params.set('stockNumber', stockNumber);
      if (customerName) params.set('customerName', customerName);
      if (customerPhone) params.set('customerPhone', customerPhone);

      const response = await fetch(`/api/valuations?${params}`);
      if (!response.ok) {
        throw new Error('Failed to search evaluations');
      }

      const result = await response.json();
      setEvaluations(result.evaluations || []);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search for prior evaluations');
    } finally {
      setIsLoading(false);
    }
  }, [vin, stockNumber, customerName, customerPhone]);

  // Auto-search when dialog opens
  useEffect(() => {
    if (open) {
      handleSearch();
    }
  }, [open, handleSearch]);

  const handleLoad = (evaluation: TradeEvaluation) => {
    onLoadEvaluation(evaluation);
    onOpenChange(false);
  };

  const formatCurrency = (value: string | null | undefined) => {
    if (!value) return '-';
    const num = parseFloat(value);
    if (isNaN(num)) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return '-';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  };

  const formatCustomerName = (evaluation: TradeEvaluation) => {
    const parts = [evaluation.customerFirstName, evaluation.customerLastName].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : '-';
  };

  // Build search description
  const searchTerms = [
    vin && `VIN "${vin}"`,
    stockNumber && `Stock "${stockNumber}"`,
    customerName && `Name "${customerName}"`,
    customerPhone && `Phone "${customerPhone}"`,
  ].filter(Boolean);

  // Reset state when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setEvaluations([]);
      setError(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Prior Trade Evaluations</DialogTitle>
          <DialogDescription>
            {searchTerms.length > 0
              ? `Searching for ${searchTerms.join(' or ')}`
              : 'Enter search criteria in Section 1'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Error State */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
              <button
                type="button"
                onClick={handleSearch}
                className="mt-2 w-full py-1.5 text-xs font-medium text-red-700 border border-red-300 hover:bg-red-100 rounded transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="py-8 text-center text-gray-500">
              Searching for evaluations...
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && evaluations.length === 0 && (
            <div className="py-8 text-center text-gray-500">
              No prior evaluations found.
            </div>
          )}

          {/* Results Table */}
          {evaluations.length > 0 && (
            <div className="max-h-80 overflow-y-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700">
                      Customer
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700">
                      Year/Make/Model
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-700">
                      Trade Offer
                    </th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {evaluations.map((evaluation) => (
                    <tr
                      key={evaluation.tradeEvaluationId}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-3 py-2 text-gray-900">
                        {formatDate(evaluation.createdDate)}
                      </td>
                      <td className="px-3 py-2 text-gray-900">
                        <div>{formatCustomerName(evaluation)}</div>
                        {evaluation.customerPhone && (
                          <div className="text-xs text-gray-500">{evaluation.customerPhone}</div>
                        )}
                      </td>
                      <td className="px-3 py-2 text-gray-900">
                        {[evaluation.year, evaluation.make, evaluation.model]
                          .filter(Boolean)
                          .join(' ') || '-'}
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-gray-900">
                        {formatCurrency(evaluation.finalTradeOffer)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleLoad(evaluation)}
                          className="px-3 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                        >
                          Load
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
