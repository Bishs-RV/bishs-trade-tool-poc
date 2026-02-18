'use client'

import { useState, useMemo, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/calculations'
import type { HistoricalComparable, ComparablesMetrics } from '@/lib/types/comparables'

interface ComparableTabsProps {
  listedUnits: HistoricalComparable[]
  soldUnits: HistoricalComparable[]
  metrics: ComparablesMetrics
  isLoading: boolean
  onMetricsChange?: (metrics: ComparablesMetrics) => void
}

type SortDirection = 'asc' | 'desc' | null
type SoldSortField = 'soldPrice' | 'location' | 'soldDate'
type ListedSortField = 'listedPrice' | 'location' | 'daysOnLot'

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '----'
  const date = new Date(dateStr)
  return isNaN(date.getTime())
    ? '----'
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
      {message}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-2 p-4">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-8 w-full" />
      ))}
    </div>
  )
}

function cycleSortDirection(current: SortDirection): SortDirection {
  if (current === null) return 'asc'
  if (current === 'asc') return 'desc'
  return null
}

function SortableHeader({
  label,
  direction,
  onClick,
}: {
  label: string
  direction: SortDirection
  onClick: () => void
}) {
  return (
    <TableHead
      className="text-xs cursor-pointer select-none hover:bg-gray-100 transition-colors"
      onClick={onClick}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {direction === 'asc' && <span className="text-gray-600">&#9650;</span>}
        {direction === 'desc' && <span className="text-gray-600">&#9660;</span>}
      </span>
    </TableHead>
  )
}

function compareValues(a: string | number | null | undefined, b: string | number | null | undefined, dir: 'asc' | 'desc'): number {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  if (a < b) return dir === 'asc' ? -1 : 1
  if (a > b) return dir === 'asc' ? 1 : -1
  return 0
}

const NEW_USED_VALUES: Record<string, string[]> = {
  new: ['n', 'new'],
  used: ['u', 'used'],
}

function applyFilters(
  units: HistoricalComparable[],
  newUsedFilter: string,
  regionFilter: string,
  retailOnly: boolean,
): HistoricalComparable[] {
  return units.filter((unit) => {
    if (newUsedFilter !== 'all') {
      const unitValue = unit.newUsed?.trim().toLowerCase() ?? ''
      if (!NEW_USED_VALUES[newUsedFilter]?.includes(unitValue)) return false
    }
    if (regionFilter !== 'all' && (unit.region ?? '') !== regionFilter) return false
    if (retailOnly && !unit.stockNumber?.toUpperCase().startsWith('R')) return false
    return true
  })
}

function avgOrNull(values: number[]): number | null {
  if (values.length === 0) return null
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length)
}

function computeMetrics(
  filteredListed: HistoricalComparable[],
  filteredSold: HistoricalComparable[],
): ComparablesMetrics {
  const listedPrices = filteredListed.map((u) => u.listedPrice).filter((p): p is number => p !== null)
  const soldPrices = filteredSold.map((u) => u.soldPrice).filter((p): p is number => p !== null)
  const daysToSaleValues = filteredSold.map((u) => u.daysToSale).filter((d): d is number => d !== null)

  return {
    avgListedPrice: avgOrNull(listedPrices),
    avgSoldPrice: avgOrNull(soldPrices),
    avgDaysToSale: avgOrNull(daysToSaleValues),
    listedCount: filteredListed.length,
    soldCount: filteredSold.length,
  }
}

export default function ComparableTabs({
  listedUnits,
  soldUnits,
  metrics,
  isLoading,
  onMetricsChange,
}: ComparableTabsProps) {
  // Filter state
  const [newUsedFilter, setNewUsedFilter] = useState('all')
  const [regionFilter, setRegionFilter] = useState('all')
  const [retailOnly, setRetailOnly] = useState(false)

  // Sort state -- independent per tab
  const [soldSortField, setSoldSortField] = useState<SoldSortField | null>(null)
  const [soldSortDir, setSoldSortDir] = useState<SortDirection>(null)
  const [listedSortField, setListedSortField] = useState<ListedSortField | null>(null)
  const [listedSortDir, setListedSortDir] = useState<SortDirection>(null)

  // Unique regions derived from combined data
  const regionOptions = useMemo(() => {
    const regions = new Set<string>()
    for (const unit of [...listedUnits, ...soldUnits]) {
      if (unit.region) regions.add(unit.region)
    }
    return Array.from(regions).sort()
  }, [listedUnits, soldUnits])

  // Filtered data
  const filteredListed = useMemo(
    () => applyFilters(listedUnits, newUsedFilter, regionFilter, retailOnly),
    [listedUnits, newUsedFilter, regionFilter, retailOnly],
  )
  const filteredSold = useMemo(
    () => applyFilters(soldUnits, newUsedFilter, regionFilter, retailOnly),
    [soldUnits, newUsedFilter, regionFilter, retailOnly],
  )

  // Recalculate metrics when filters change
  const filteredMetrics = useMemo(
    () => computeMetrics(filteredListed, filteredSold),
    [filteredListed, filteredSold],
  )

  useEffect(() => {
    onMetricsChange?.(filteredMetrics)
  }, [filteredMetrics, onMetricsChange])

  // Sorted data
  const sortedSold = useMemo(() => {
    if (!soldSortField || !soldSortDir) return filteredSold
    return [...filteredSold].sort((a, b) =>
      compareValues(a[soldSortField], b[soldSortField], soldSortDir),
    )
  }, [filteredSold, soldSortField, soldSortDir])

  const sortedListed = useMemo(() => {
    if (!listedSortField || !listedSortDir) return filteredListed
    return [...filteredListed].sort((a, b) =>
      compareValues(a[listedSortField], b[listedSortField], listedSortDir),
    )
  }, [filteredListed, listedSortField, listedSortDir])

  function handleSoldSort(field: SoldSortField) {
    if (soldSortField === field) {
      const next = cycleSortDirection(soldSortDir)
      setSoldSortDir(next)
      if (next === null) setSoldSortField(null)
    } else {
      setSoldSortField(field)
      setSoldSortDir('asc')
    }
  }

  function handleListedSort(field: ListedSortField) {
    if (listedSortField === field) {
      const next = cycleSortDirection(listedSortDir)
      setListedSortDir(next)
      if (next === null) setListedSortField(null)
    } else {
      setListedSortField(field)
      setListedSortDir('asc')
    }
  }

  const isFiltered = newUsedFilter !== 'all' || regionFilter !== 'all' || retailOnly

  return (
    <div className="space-y-2">
      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Select value={newUsedFilter} onValueChange={setNewUsedFilter}>
          <SelectTrigger size="sm" className="h-7 text-xs w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="used">Used</SelectItem>
          </SelectContent>
        </Select>

        <Select value={regionFilter} onValueChange={setRegionFilter}>
          <SelectTrigger size="sm" className="h-7 text-xs w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {regionOptions.map((region) => (
              <SelectItem key={region} value={region}>
                {region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
          <Checkbox
            checked={retailOnly}
            onCheckedChange={(checked) => setRetailOnly(checked === true)}
            className="size-3.5"
          />
          Retail Only (R#)
        </label>
      </div>

      <Tabs defaultValue="sold" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sold" className="text-xs">
            Sold Units
            <Badge variant="secondary" className="ml-2 text-xs">
              {isFiltered ? `${filteredMetrics.soldCount}/${metrics.soldCount}` : metrics.soldCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="listed" className="text-xs">
            Currently Listed
            <Badge variant="secondary" className="ml-2 text-xs">
              {isFiltered ? `${filteredMetrics.listedCount}/${metrics.listedCount}` : metrics.listedCount}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sold" className="mt-2">
          {isLoading ? (
            <LoadingSkeleton />
          ) : sortedSold.length === 0 ? (
            <EmptyState message={isFiltered ? 'No sold units match current filters' : 'No sold units found matching criteria'} />
          ) : (
            <div className="border rounded-lg max-h-72 overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-gray-50">
                  <TableRow>
                    <SortableHeader
                      label="Location"
                      direction={soldSortField === 'location' ? soldSortDir : null}
                      onClick={() => handleSoldSort('location')}
                    />
                    <TableHead className="text-xs">Year</TableHead>
                    <SortableHeader
                      label="Sold Price"
                      direction={soldSortField === 'soldPrice' ? soldSortDir : null}
                      onClick={() => handleSoldSort('soldPrice')}
                    />
                    <TableHead className="text-xs">Days to Sale</TableHead>
                    <SortableHeader
                      label="Sold Date"
                      direction={soldSortField === 'soldDate' ? soldSortDir : null}
                      onClick={() => handleSoldSort('soldDate')}
                    />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedSold.map((unit) => (
                    <TableRow key={unit.id} className="text-xs">
                      <TableCell className="py-2">{unit.location || '----'}</TableCell>
                      <TableCell className="py-2">{unit.year || '----'}</TableCell>
                      <TableCell className="py-2 font-medium text-green-700">
                        {unit.soldPrice ? formatCurrency(unit.soldPrice) : '----'}
                      </TableCell>
                      <TableCell className="py-2">
                        {unit.daysToSale !== null ? `${unit.daysToSale} days` : '----'}
                      </TableCell>
                      <TableCell className="py-2 text-gray-600">
                        {formatDate(unit.soldDate)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="listed" className="mt-2">
          {isLoading ? (
            <LoadingSkeleton />
          ) : sortedListed.length === 0 ? (
            <EmptyState message={isFiltered ? 'No listed units match current filters' : 'No listed units found matching criteria'} />
          ) : (
            <div className="border rounded-lg max-h-72 overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-gray-50">
                  <TableRow>
                    <SortableHeader
                      label="Location"
                      direction={listedSortField === 'location' ? listedSortDir : null}
                      onClick={() => handleListedSort('location')}
                    />
                    <TableHead className="text-xs">Year</TableHead>
                    <SortableHeader
                      label="Listed Price"
                      direction={listedSortField === 'listedPrice' ? listedSortDir : null}
                      onClick={() => handleListedSort('listedPrice')}
                    />
                    <SortableHeader
                      label="Days on Lot"
                      direction={listedSortField === 'daysOnLot' ? listedSortDir : null}
                      onClick={() => handleListedSort('daysOnLot')}
                    />
                    <TableHead className="text-xs">Stock #</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedListed.map((unit) => (
                    <TableRow key={unit.id} className="text-xs">
                      <TableCell className="py-2">{unit.location || '----'}</TableCell>
                      <TableCell className="py-2">{unit.year || '----'}</TableCell>
                      <TableCell className="py-2 font-medium">
                        {unit.listedPrice ? formatCurrency(unit.listedPrice) : '----'}
                      </TableCell>
                      <TableCell className="py-2">
                        {unit.daysOnLot != null ? `${unit.daysOnLot} days` : '----'}
                      </TableCell>
                      <TableCell className="py-2 text-gray-600">
                        {unit.stockNumber || '----'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
