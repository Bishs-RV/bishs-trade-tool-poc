'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { TradeData } from '@/lib/types'
import { formatCurrency } from '@/lib/calculations'
import ComparableTabs from './ComparableTabs'
import type { ComparablesResponse, HistoricalComparable, ComparablesMetrics } from '@/lib/types/comparables'

interface Section3Props {
  data: TradeData
  onUpdate: (updates: Partial<TradeData>) => void
  isLocked: boolean
}

const EMPTY_METRICS: ComparablesMetrics = {
  avgSoldPrice: null,
  avgListedPrice: null,
  avgDaysToSale: null,
  soldCount: 0,
  listedCount: 0,
}

export default function Section3Market({
  data,
  onUpdate,
  isLocked,
}: Section3Props) {
  const [listedUnits, setListedUnits] = useState<HistoricalComparable[]>([])
  const [soldUnits, setSoldUnits] = useState<HistoricalComparable[]>([])
  const [metrics, setMetrics] = useState<ComparablesMetrics>(EMPTY_METRICS)
  const [displayMetrics, setDisplayMetrics] = useState<ComparablesMetrics>(EMPTY_METRICS)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchComparables = useCallback(async () => {
    if (!data.model || !data.year) {
      setListedUnits([])
      setSoldUnits([])
      setMetrics(EMPTY_METRICS)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        model: data.model,
        year: data.year.toString(),
      })
      if (data.make) {
        params.set('make', data.make)
      }
      if (data.manufacturerName) {
        params.set('manufacturer', data.manufacturerName)
      }
      if (data.rvType) {
        params.set('rvType', data.rvType)
      }

      const response = await fetch(`/api/comparables?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch comparables')
      }

      const result: ComparablesResponse = await response.json()
      setListedUnits(result.listedUnits)
      setSoldUnits(result.soldUnits)
      setMetrics(result.metrics)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setListedUnits([])
      setSoldUnits([])
      setMetrics(EMPTY_METRICS)
    } finally {
      setIsLoading(false)
    }
  }, [data.make, data.manufacturerName, data.model, data.year, data.rvType])

  useEffect(() => {
    if (!isLocked) {
      fetchComparables()
    }
  }, [fetchComparables, isLocked])

  // Reset displayMetrics when source metrics change (new data fetch)
  useEffect(() => {
    setDisplayMetrics(metrics)
  }, [metrics])

  const onUpdateRef = useRef(onUpdate)
  useEffect(() => { onUpdateRef.current = onUpdate }, [onUpdate])

  useEffect(() => {
    if (displayMetrics.avgListedPrice !== null) {
      onUpdateRef.current({ avgListingPrice: displayMetrics.avgListedPrice })
    }
  }, [displayMetrics.avgListedPrice])

  const generateGoogleSearchLink = () => {
    const parts = [
      data.year?.toString(),
      data.manufacturerName,
      data.make,
      data.model,
      'for sale'
    ].filter(Boolean)
    return `https://www.google.com/search?q=${encodeURIComponent(parts.join(' '))}`
  }

  return (
    <div className="relative h-full">
      <div className={`bg-white p-4 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 h-full ${isLocked ? 'pointer-events-none select-none' : ''}`}>

      {isLocked && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/95 to-gray-100/95 backdrop-blur-md z-20 rounded-xl flex items-center justify-center pointer-events-auto">
          <div className="text-center border-2 border-dashed border-gray-400 rounded-lg p-4 bg-white/70 shadow-lg">
            <div className="text-3xl font-black text-gray-300 mb-1">3</div>
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
            3
          </div>
          <h2 className="text-lg font-bold text-gray-900">
            Market Data Reference
          </h2>
        </div>
        <div className="space-y-3">
          {/* Metrics Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <p className="text-xs text-gray-500">Avg Listed</p>
              <p className="text-sm font-bold text-gray-900">
                {displayMetrics.avgListedPrice !== null ? formatCurrency(displayMetrics.avgListedPrice) : '----'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <p className="text-xs text-gray-500">Avg Sold</p>
              <p className="text-sm font-bold text-green-700">
                {displayMetrics.avgSoldPrice !== null ? formatCurrency(displayMetrics.avgSoldPrice) : '----'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <p className="text-xs text-gray-500">Avg Days to Sale</p>
              <p className="text-sm font-bold text-gray-900">
                {displayMetrics.avgDaysToSale !== null ? `${displayMetrics.avgDaysToSale}` : '----'}
              </p>
            </div>
          </div>

          {error && (
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          {/* Comparable Units Tabs */}
          <div>
            <p className="text-xs font-bold text-gray-800 mb-2">
              Bish&apos;s Historical Comparables
            </p>
            <ComparableTabs
              listedUnits={listedUnits}
              soldUnits={soldUnits}
              metrics={metrics}
              isLoading={isLoading}
              onMetricsChange={setDisplayMetrics}
            />
          </div>

          {/* Google Search Link */}
          <div className="mt-2 p-2 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border border-slate-200 text-center hover:shadow-md transition-all">
            <a
              href={generateGoogleSearchLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 hover:text-blue-900 font-bold underline text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <span>Google Search for {data.year || ''} {data.manufacturerName || ''} {data.make || ''}</span>
              <span>→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
