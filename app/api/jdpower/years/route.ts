import { NextRequest, NextResponse } from 'next/server'
import { fetchYears } from '@/lib/jdpower/client'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const makeId = searchParams.get('makeId')

  if (!makeId) {
    return NextResponse.json(
      { error: 'makeId is required' },
      { status: 400 }
    )
  }

  const makeIdNum = parseInt(makeId, 10)

  if (isNaN(makeIdNum)) {
    return NextResponse.json(
      { error: 'makeId must be a valid number' },
      { status: 400 }
    )
  }

  try {
    const years = await fetchYears(makeIdNum)
    return NextResponse.json({ years })
  } catch (error: unknown) {
    console.error('Error fetching years:', error)
    return NextResponse.json(
      { error: 'Failed to fetch years from JD Power' },
      { status: 500 }
    )
  }
}
