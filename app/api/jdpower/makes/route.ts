import { NextRequest, NextResponse } from 'next/server'
import { fetchMakes } from '@/lib/jdpower/client'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const year = searchParams.get('year')
  const rvCategoryId = searchParams.get('rvCategoryId')

  if (!year || !rvCategoryId) {
    return NextResponse.json(
      { error: 'year and rvCategoryId are required' },
      { status: 400 }
    )
  }

  const yearNum = parseInt(year, 10)
  const categoryNum = parseInt(rvCategoryId, 10)

  if (isNaN(yearNum) || isNaN(categoryNum)) {
    return NextResponse.json(
      { error: 'year and rvCategoryId must be valid numbers' },
      { status: 400 }
    )
  }

  try {
    const makes = await fetchMakes(yearNum, categoryNum)
    return NextResponse.json({ makes })
  } catch (error: unknown) {
    console.error('Error fetching makes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch makes from JD Power' },
      { status: 500 }
    )
  }
}
