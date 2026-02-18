import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { evoMajorunit, evoSalesdealdetail, evoSalesdealdetailunits, locationDetail } from '@/lib/db/schema'
import { and, eq, gte, lte, ilike, sql, or, isNotNull, desc, asc } from 'drizzle-orm'
import type { ComparablesResponse, HistoricalComparable } from '@/lib/types/comparables'

const DEFAULT_YEAR_RANGE = 1
const MAX_YEAR_RANGE = 5

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
  // Split into segments and find the longest alphanumeric segment
  // "M-273QBXL" -> ["m", "273qbxl"] -> use "273qbxl"
  // This handles cases where JD Power has prefixes the DB doesn't
  const segments = normalized.split(/[^a-z0-9]+/).filter(s => s.length > 0)
  const longest = segments.length > 0
    ? segments.reduce((a, b) => a.length >= b.length ? a : b)
    : normalized.replace(/[^a-z0-9]/g, '')
  return `%${longest}%`
}

function parseNumeric(value: string | null): number | null {
  if (!value) return null
  const parsed = parseFloat(value)
  return isNaN(parsed) ? null : parsed
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const make = searchParams.get('make')
  const model = searchParams.get('model')
  const manufacturer = searchParams.get('manufacturer')
  const yearStr = searchParams.get('year')
  const yearRangeStr = searchParams.get('yearRange')

  if (!model || !yearStr || (!make && !manufacturer)) {
    return NextResponse.json(
      { error: 'model, year, and at least one of make/manufacturer are required' },
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

  let yearRange = yearRangeStr ? parseInt(yearRangeStr, 10) : DEFAULT_YEAR_RANGE
  if (isNaN(yearRange) || yearRange < 0 || yearRange > MAX_YEAR_RANGE) {
    yearRange = DEFAULT_YEAR_RANGE
  }

  const minYear = year - yearRange
  const maxYear = year + yearRange
  const makePattern = make ? buildFuzzyPattern(make) : null
  const manufacturerPattern = manufacturer ? buildFuzzyPattern(manufacturer) : null
  const modelPattern = buildModelPattern(model)

  try {
    // Use REGEXP_REPLACE to normalize DB values for comparison
    // This allows "M-19" in DB to match pattern "%m19%"
    // Join to location_detail to get proper location code from Cmf_id
    // Include Days on Lot calculation for currently listed units
    const listedUnitsRaw = await db
      .select({
        id: evoMajorunit.majorUnitHeaderId,
        make: evoMajorunit.make,
        model: evoMajorunit.model,
        year: evoMajorunit.modelYear,
        manufacturer: evoMajorunit.manufacturer,
        location: locationDetail.location,
        webPrice: evoMajorunit.webPrice,
        dsrp: evoMajorunit.dsrp,
        listingDate: evoMajorunit.dateReceived,
        stockNumber: evoMajorunit.stockNumber,
        vin: evoMajorunit.vin,
        newUsed: evoMajorunit.newUsed,
        region: locationDetail.region,
        daysOnLot: sql<number | null>`(NOW()::date - ${evoMajorunit.dateReceived}::date)`.as('days_on_lot'),
      })
      .from(evoMajorunit)
      .leftJoin(
        locationDetail,
        sql`CAST(${evoMajorunit.cmfId} AS INTEGER) = ${locationDetail.cmf}`
      )
      .where(
        and(
          // Flexible manufacturer/make matching - check both fields with both patterns
          // This handles cases where JD Power "Flagstaff by Forest River" maps to DB "FOREST RIVER" manufacturer + "FLAGSTAFF CLASSIC" make
          or(
            makePattern ? ilike(evoMajorunit.make, makePattern) : undefined,
            manufacturerPattern ? ilike(evoMajorunit.make, manufacturerPattern) : undefined,
            makePattern ? ilike(evoMajorunit.manufacturer, makePattern) : undefined,
            manufacturerPattern ? ilike(evoMajorunit.manufacturer, manufacturerPattern) : undefined,
          ),
          sql`LOWER(REGEXP_REPLACE(${evoMajorunit.model}, '[^a-zA-Z0-9]', '', 'g')) LIKE ${modelPattern}`,
          gte(evoMajorunit.modelYear, minYear),
          lte(evoMajorunit.modelYear, maxYear),
          or(isNotNull(evoMajorunit.webPrice), isNotNull(evoMajorunit.dsrp)),
          sql`${evoMajorunit.stockNumber} NOT ILIKE 'L%'`
        )
      )
      .orderBy(desc(evoMajorunit.modelYear), asc(locationDetail.location))

    // Query 1: Sold units from deal details (has soldPrice, soldDate)
    // Join to location_detail to get proper location code from cmfId
    // Calculate days to sale as: deliveryDate - dateReceived
    const soldFromDealsRaw = await db
      .select({
        id: evoSalesdealdetailunits.dealUnitId,
        make: evoSalesdealdetailunits.make,
        model: evoSalesdealdetailunits.model,
        year: evoSalesdealdetailunits.year,
        manufacturer: evoSalesdealdetailunits.manufacturer,
        soldPrice: evoSalesdealdetailunits.unitSoldPrice,
        listingDate: evoSalesdealdetailunits.dateReceived,
        stockNumber: evoSalesdealdetailunits.stocknumber,
        vin: evoSalesdealdetailunits.vin,
        newUsed: evoSalesdealdetailunits.newused,
        region: locationDetail.region,
        salesDealId: evoSalesdealdetailunits.salesDealId,
        soldDate: evoSalesdealdetail.deliveryDate,
        location: locationDetail.location,
        daysToSale: sql<number | null>`(${evoSalesdealdetail.deliveryDate}::date - ${evoSalesdealdetailunits.dateReceived}::date)`.as('days_to_sale'),
      })
      .from(evoSalesdealdetailunits)
      .innerJoin(
        evoSalesdealdetail,
        eq(evoSalesdealdetailunits.salesDealId, evoSalesdealdetail.dealNoCmf)
      )
      .leftJoin(
        locationDetail,
        sql`CAST(${evoSalesdealdetail.cmfId} AS INTEGER) = ${locationDetail.cmf}`
      )
      .where(
        and(
          // Flexible manufacturer/make matching - check both fields with both patterns
          or(
            makePattern ? ilike(evoSalesdealdetailunits.make, makePattern) : undefined,
            manufacturerPattern ? ilike(evoSalesdealdetailunits.make, manufacturerPattern) : undefined,
            makePattern ? ilike(evoSalesdealdetailunits.manufacturer, makePattern) : undefined,
            manufacturerPattern ? ilike(evoSalesdealdetailunits.manufacturer, manufacturerPattern) : undefined,
          ),
          sql`LOWER(REGEXP_REPLACE(${evoSalesdealdetailunits.model}, '[^a-zA-Z0-9]', '', 'g')) LIKE ${modelPattern}`,
          gte(sql`CAST(${evoSalesdealdetailunits.year} AS INTEGER)`, minYear),
          lte(sql`CAST(${evoSalesdealdetailunits.year} AS INTEGER)`, maxYear),
          isNotNull(evoSalesdealdetailunits.unitSoldPrice),
          sql`evo_salesdealdetail.stagename = 'Delivered'`
        )
      )
      .orderBy(desc(sql`CAST(${evoSalesdealdetailunits.year} AS INTEGER)`), asc(locationDetail.location))

    const listedUnits: HistoricalComparable[] = listedUnitsRaw.map(unit => ({
      id: String(unit.id),
      make: unit.make,
      model: unit.model,
      year: unit.year,
      manufacturer: unit.manufacturer,
      location: unit.location,
      listedPrice: parseNumeric(unit.webPrice) ?? parseNumeric(unit.dsrp),
      soldPrice: null,
      soldDate: null,
      listingDate: unit.listingDate,
      daysToSale: null,
      daysOnLot: unit.daysOnLot,
      stockNumber: unit.stockNumber,
      vin: unit.vin,
      newUsed: unit.newUsed ?? null,
      region: unit.region ?? null,
    }))

    const soldUnits: HistoricalComparable[] = soldFromDealsRaw.map(unit => ({
      id: String(unit.id),
      make: unit.make,
      model: unit.model,
      year: parseNumeric(unit.year),
      manufacturer: unit.manufacturer,
      location: unit.location,
      listedPrice: null,
      soldPrice: parseNumeric(unit.soldPrice),
      soldDate: unit.soldDate,
      listingDate: unit.listingDate,
      daysToSale: unit.daysToSale,
      stockNumber: unit.stockNumber,
      vin: unit.vin,
      newUsed: unit.newUsed ?? null,
      region: unit.region ?? null,
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
