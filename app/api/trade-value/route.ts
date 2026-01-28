import { NextRequest, NextResponse } from 'next/server'
import { getTradeValue } from '@/lib/bishconnect/client'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const modelTrimId = searchParams.get('modelTrimId')
  const condition = searchParams.get('condition')
  const mileage = searchParams.get('mileage')
  const options = searchParams.get('options')

  if (!modelTrimId || !condition) {
    return NextResponse.json(
      { error: 'modelTrimId and condition are required' },
      { status: 400 }
    )
  }

  const modelTrimIdNum = parseInt(modelTrimId, 10)
  const conditionNum = parseInt(condition, 10)

  if (isNaN(modelTrimIdNum) || isNaN(conditionNum)) {
    return NextResponse.json(
      { error: 'modelTrimId and condition must be valid numbers' },
      { status: 400 }
    )
  }

  if (conditionNum < 1 || conditionNum > 10) {
    return NextResponse.json(
      { error: 'condition must be between 1 and 10' },
      { status: 400 }
    )
  }

  const mileageNum = mileage ? parseInt(mileage, 10) : undefined
  if (mileageNum !== undefined && isNaN(mileageNum)) {
    return NextResponse.json(
      { error: 'mileage must be a valid number' },
      { status: 400 }
    )
  }

  try {
    const result = await getTradeValue({
      modelTrimId: modelTrimIdNum,
      condition: conditionNum,
      mileage: mileageNum,
      options: options || undefined,
    })

    return NextResponse.json(result)
  } catch (error: unknown) {
    console.error('Error fetching trade value:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trade value from BishConnect' },
      { status: 500 }
    )
  }
}
