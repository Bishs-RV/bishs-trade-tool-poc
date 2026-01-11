import { NextRequest, NextResponse } from 'next/server'
import { fetchModelTrims } from '@/lib/jdpower/client'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const makeId = searchParams.get('makeId')
  const year = searchParams.get('year')
  const rvCategoryId = searchParams.get('rvCategoryId')

  if (!makeId || !year || !rvCategoryId) {
    return NextResponse.json(
      { error: 'makeId, year, and rvCategoryId are required' },
      { status: 400 }
    )
  }

  const makeIdNum = parseInt(makeId, 10)
  const yearNum = parseInt(year, 10)
  const categoryNum = parseInt(rvCategoryId, 10)

  if (isNaN(makeIdNum) || isNaN(yearNum) || isNaN(categoryNum)) {
    return NextResponse.json(
      { error: 'makeId, year, and rvCategoryId must be valid numbers' },
      { status: 400 }
    )
  }

  try {
    const modelTrims = await fetchModelTrims(makeIdNum, yearNum, categoryNum)
    return NextResponse.json({ modelTrims })
  } catch (error: unknown) {
    console.error('Error fetching model trims:', error)
    return NextResponse.json(
      { error: 'Failed to fetch model trims from JD Power' },
      { status: 500 }
    )
  }
}
