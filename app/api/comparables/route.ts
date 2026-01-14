import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { evoMajorunit, evoSalesdealdetail, evoSalesdealdetailunits } from '@/lib/db/schema'
import { and, eq, gte, lte, ilike, sql, isNotNull } from 'drizzle-orm'
import type { ComparablesResponse, HistoricalComparable } from '@/lib/types/comparables'

const UNIT_TYPE_USED = 'U'
const UNIT_STATUS_AVAILABLE = ''
const MAX_YEAR_RANGE = 10
const MAX_RESULTS = 50

const NOISE_WORDS = new Set([
  'series', 'by', 'inc', 'llc', 'corp', 'corporation', 'co', 'company',
  'rv', 'rvs', 'trailer', 'trailers', 'motorhome', 'motorhomes',
  'industries', 'manufacturing', 'mfg',
])

function buildFuzzyPattern(input: string): string {
  const normalized = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')

  const words = normalized
    .split(' ')
    .filter(w => w.length > 1 && !NOISE_WORDS.has(w))

  if (words.length === 0) {
    return `%${normalized}%`
  }

  return `%${words[0]}%`
}

function buildModelPattern(input: string): string {
  const normalized = input.toLowerCase().trim()
  // Extract alphanumeric parts for flexible matching
  // "M-19" should match "M-19", "M19", "M 19"
  const alphaNum = normalized.replace(/[^a-z0-9]/g, '')
  return `%${alphaNum}%`
}

function parseYearSafely(year: string | null): number | null {
  if (!year) return null
  const parsed = parseInt(year, 10)
  return isNaN(parsed) ? null : parsed
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const make = searchParams.get('make')
  const model = searchParams.get('model')
  const yearStr = searchParams.get('year')
  const yearRangeStr = searchParams.get('yearRange')

  if (!make || !model || !yearStr) {
    return NextResponse.json(
      { error: 'make, model, and year are required' },
      { status: 400 }
    )
  }

  const year = parseInt(yearStr, 10)
  if (isNaN(year)) {
    return NextResponse.json(
      { error: 'year must be a valid number' },
      { status: 400 }
    )
  }

  let yearRange = yearRangeStr ? parseInt(yearRangeStr, 10) : 2
  if (isNaN(yearRange) || yearRange < 0 || yearRange > MAX_YEAR_RANGE) {
    yearRange = 2
  }

  const minYear = year - yearRange
  const maxYear = year + yearRange
  const makePattern = buildFuzzyPattern(make)
  const modelPattern = buildModelPattern(model)

  try {
    // Use REGEXP_REPLACE to normalize DB values for comparison
    // This allows "M-19" in DB to match pattern "%m19%"
    const listedUnitsRaw = await db
      .select({
        id: evoMajorunit.majorUnitHeaderId,
        make: evoMajorunit.make,
        model: evoMajorunit.model,
        year: evoMajorunit.modelYear,
        manufacturer: evoMajorunit.manufacturer,
        location: evoMajorunit.storeLocation,
        listedPrice: evoMajorunit.webPrice,
        listingDate: evoMajorunit.dateReceived,
        stockNumber: evoMajorunit.stockNumber,
        vin: evoMajorunit.vin,
      })
      .from(evoMajorunit)
      .where(
        and(
          ilike(evoMajorunit.make, makePattern),
          sql`LOWER(REGEXP_REPLACE(${evoMajorunit.model}, '[^a-zA-Z0-9]', '', 'g')) LIKE ${modelPattern}`,
          gte(evoMajorunit.modelYear, minYear),
          lte(evoMajorunit.modelYear, maxYear),
          eq(evoMajorunit.newUsed, UNIT_TYPE_USED),
          eq(evoMajorunit.unitStatus, UNIT_STATUS_AVAILABLE),
          isNotNull(evoMajorunit.webPrice)
        )
      )
      .limit(MAX_RESULTS)

    const soldUnitsRaw = await db
      .select({
        id: evoSalesdealdetailunits.dealUnitId,
        make: evoSalesdealdetailunits.make,
        model: evoSalesdealdetailunits.model,
        year: evoSalesdealdetailunits.year,
        manufacturer: evoSalesdealdetailunits.manufacturer,
        soldPrice: evoSalesdealdetailunits.unitSoldPrice,
        daysInStore: evoSalesdealdetailunits.daysInStore,
        listingDate: evoSalesdealdetailunits.dateReceived,
        stockNumber: evoSalesdealdetailunits.stocknumber,
        vin: evoSalesdealdetailunits.vin,
        salesDealId: evoSalesdealdetailunits.salesDealId,
        dealerId: evoSalesdealdetailunits.dealerId,
        soldDate: evoSalesdealdetail.deliveryDate,
      })
      .from(evoSalesdealdetailunits)
      .innerJoin(
        evoSalesdealdetail,
        eq(evoSalesdealdetailunits.salesDealId, evoSalesdealdetail.dealNoCmf)
      )
      .where(
        and(
          ilike(evoSalesdealdetailunits.make, makePattern),
          sql`LOWER(REGEXP_REPLACE(${evoSalesdealdetailunits.model}, '[^a-zA-Z0-9]', '', 'g')) LIKE ${modelPattern}`,
          gte(sql`CAST(${evoSalesdealdetailunits.year} AS INTEGER)`, minYear),
          lte(sql`CAST(${evoSalesdealdetailunits.year} AS INTEGER)`, maxYear),
          eq(evoSalesdealdetailunits.newused, UNIT_TYPE_USED),
          isNotNull(evoSalesdealdetailunits.unitSoldPrice)
        )
      )
      .limit(MAX_RESULTS)

    const listedUnits: HistoricalComparable[] = listedUnitsRaw.map(unit => ({
      id: String(unit.id),
      make: unit.make,
      model: unit.model,
      year: unit.year,
      manufacturer: unit.manufacturer,
      location: unit.location,
      listedPrice: unit.listedPrice ? parseFloat(unit.listedPrice) : null,
      soldPrice: null,
      soldDate: null,
      listingDate: unit.listingDate,
      daysToSale: null,
      stockNumber: unit.stockNumber,
      vin: unit.vin,
    }))

    const soldUnits: HistoricalComparable[] = soldUnitsRaw.map(unit => ({
      id: String(unit.id),
      make: unit.make,
      model: unit.model,
      year: parseYearSafely(unit.year),
      manufacturer: unit.manufacturer,
      location: unit.dealerId,
      listedPrice: null,
      soldPrice: unit.soldPrice ? parseFloat(unit.soldPrice) : null,
      soldDate: unit.soldDate,
      listingDate: unit.listingDate,
      daysToSale: unit.daysInStore,
      stockNumber: unit.stockNumber,
      vin: unit.vin,
    }))

    const listedPrices = listedUnits
      .map(u => u.listedPrice)
      .filter((p): p is number => p !== null)
    const soldPrices = soldUnits
      .map(u => u.soldPrice)
      .filter((p): p is number => p !== null)
    const daysToSaleValues = soldUnits
      .map(u => u.daysToSale)
      .filter((d): d is number => d !== null)

    const avgListedPrice = listedPrices.length > 0
      ? listedPrices.reduce((a, b) => a + b, 0) / listedPrices.length
      : null
    const avgSoldPrice = soldPrices.length > 0
      ? soldPrices.reduce((a, b) => a + b, 0) / soldPrices.length
      : null
    const avgDaysToSale = daysToSaleValues.length > 0
      ? Math.round(daysToSaleValues.reduce((a, b) => a + b, 0) / daysToSaleValues.length)
      : null

    const response: ComparablesResponse = {
      listedUnits,
      soldUnits,
      metrics: {
        avgListedPrice,
        avgSoldPrice,
        avgDaysToSale,
        listedCount: listedUnits.length,
        soldCount: soldUnits.length,
      },
    }

    return NextResponse.json(response)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error fetching comparables:', errorMessage)
    return NextResponse.json(
      { error: 'Failed to fetch comparable units' },
      { status: 500 }
    )
  }
}
