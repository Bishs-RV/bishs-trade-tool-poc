'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/calculations'
import type { HistoricalComparable, ComparablesMetrics } from '@/lib/types/comparables'

interface ComparableTabsProps {
  listedUnits: HistoricalComparable[]
  soldUnits: HistoricalComparable[]
  metrics: ComparablesMetrics
  isLoading: boolean
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '----'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '----'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
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

export default function ComparableTabs({
  listedUnits,
  soldUnits,
  metrics,
  isLoading,
}: ComparableTabsProps) {
  return (
    <Tabs defaultValue="sold" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="sold" className="text-xs">
          Sold Units
          <Badge variant="secondary" className="ml-2 text-xs">
            {metrics.soldCount}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="listed" className="text-xs">
          Currently Listed
          <Badge variant="secondary" className="ml-2 text-xs">
            {metrics.listedCount}
          </Badge>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="sold" className="mt-2">
        {isLoading ? (
          <LoadingSkeleton />
        ) : soldUnits.length === 0 ? (
          <EmptyState message="No sold units found matching criteria" />
        ) : (
          <div className="border rounded-lg max-h-72 overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-gray-50">
                <TableRow>
                  <TableHead className="text-xs">Location</TableHead>
                  <TableHead className="text-xs">Year</TableHead>
                  <TableHead className="text-xs">Sold Price</TableHead>
                  <TableHead className="text-xs">Days to Sale</TableHead>
                  <TableHead className="text-xs">Sold Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {soldUnits.map((unit) => (
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
        ) : listedUnits.length === 0 ? (
          <EmptyState message="No listed units found matching criteria" />
        ) : (
          <div className="border rounded-lg max-h-72 overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-gray-50">
                <TableRow>
                  <TableHead className="text-xs">Location</TableHead>
                  <TableHead className="text-xs">Year</TableHead>
                  <TableHead className="text-xs">Listed Price</TableHead>
                  <TableHead className="text-xs">Stock #</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listedUnits.map((unit) => (
                  <TableRow key={unit.id} className="text-xs">
                    <TableCell className="py-2">{unit.location || '----'}</TableCell>
                    <TableCell className="py-2">{unit.year || '----'}</TableCell>
                    <TableCell className="py-2 font-medium">
                      {unit.listedPrice ? formatCurrency(unit.listedPrice) : '----'}
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
  )
}
