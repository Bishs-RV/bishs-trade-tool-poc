import { NextRequest, NextResponse } from 'next/server'
import { fetchModelTrimOptions } from '@/lib/jdpower/client'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const modelTrimId = searchParams.get('modelTrimId')

  if (!modelTrimId) {
    return NextResponse.json(
      { error: 'modelTrimId is required' },
      { status: 400 }
    )
  }

  const modelTrimIdNum = parseInt(modelTrimId, 10)

  if (isNaN(modelTrimIdNum)) {
    return NextResponse.json(
      { error: 'modelTrimId must be a valid number' },
      { status: 400 }
    )
  }

  try {
    const options = await fetchModelTrimOptions(modelTrimIdNum)
    return NextResponse.json({ options })
  } catch (error: unknown) {
    console.error('Error fetching model trim options:', error)
    return NextResponse.json(
      { error: 'Failed to fetch options from JD Power' },
      { status: 500 }
    )
  }
}
