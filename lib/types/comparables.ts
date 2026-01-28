/**
 * Comparable unit from Bish's historical data (evo tables)
 * Used for displaying sold and listed units in Section 3
 */
export interface HistoricalComparable {
  id: string
  make: string | null
  model: string | null
  year: number | null
  manufacturer: string | null
  location: string | null
  listedPrice: number | null
  soldPrice: number | null
  soldDate: string | null
  listingDate: string | null
  daysToSale: number | null
  daysOnLot?: number | null
  stockNumber: string | null
  vin: string | null
}

export interface ComparablesMetrics {
  avgSoldPrice: number | null
  avgListedPrice: number | null
  avgDaysToSale: number | null
  soldCount: number
  listedCount: number
}

export interface ComparablesResponse {
  soldUnits: HistoricalComparable[]
  listedUnits: HistoricalComparable[]
  metrics: ComparablesMetrics
}
