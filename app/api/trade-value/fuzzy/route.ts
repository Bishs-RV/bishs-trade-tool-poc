import { NextRequest, NextResponse } from 'next/server'
import { getFuzzyTradeValue } from '@/lib/bishconnect/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Required parameters
    const yearStr = searchParams.get('year')
    const manufacturer = searchParams.get('manufacturer')
    const model = searchParams.get('model')

    if (!yearStr || !manufacturer || !model) {
      return NextResponse.json(
        { error: 'Missing required parameters: year, manufacturer, model' },
        { status: 400 }
      )
    }

    const year = parseInt(yearStr, 10)
    if (isNaN(year) || year < 1980 || year > 2100) {
      return NextResponse.json(
        { error: 'Invalid year parameter' },
        { status: 400 }
      )
    }

    // Optional parameters
    const make = searchParams.get('make') ?? undefined
    const mileageStr = searchParams.get('mileage')
    const conditionStr = searchParams.get('condition')
    const unitClass = searchParams.get('unitClass') ?? undefined

    const mileage = mileageStr ? parseInt(mileageStr, 10) : undefined
    const condition = conditionStr ? parseInt(conditionStr, 10) : 5

    if (mileage !== undefined && (isNaN(mileage) || mileage < 0)) {
      return NextResponse.json(
        { error: 'mileage must be a valid positive number' },
        { status: 400 }
      )
    }

    if (isNaN(condition) || condition < 1 || condition > 10) {
      return NextResponse.json(
        { error: 'condition must be a number between 1 and 10' },
        { status: 400 }
      )
    }

    console.log('[API /trade-value/fuzzy] Request:', {
      year,
      manufacturer,
      model,
      make,
      mileage,
      condition,
      unitClass,
    })

    const result = await getFuzzyTradeValue({
      year,
      manufacturer,
      model,
      make,
      mileage,
      condition,
      unitClass,
    })

    console.log('[API /trade-value/fuzzy] Result:', result)

    return NextResponse.json(result)
  } catch (error) {
    console.error('[API /trade-value/fuzzy] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch fuzzy trade value' },
      { status: 500 }
    )
  }
}
