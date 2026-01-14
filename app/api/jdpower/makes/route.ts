import { NextRequest, NextResponse } from 'next/server'
import { fetchMakes } from '@/lib/jdpower/client'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const year = searchParams.get('year')
  const rvCategoryId = searchParams.get('rvCategoryId')

  if (!rvCategoryId) {
    return NextResponse.json(
      { error: 'rvCategoryId is required' },
      { status: 400 }
    )
  }

  const categoryNum = parseInt(rvCategoryId, 10)

  if (isNaN(categoryNum)) {
    return NextResponse.json(
      { error: 'rvCategoryId must be a valid number' },
      { status: 400 }
    )
  }

  // If year not provided, use current year (manufacturers available now)
  const currentYear = new Date().getFullYear()
  const yearNum = year ? parseInt(year, 10) : currentYear

  if (isNaN(yearNum)) {
    return NextResponse.json(
      { error: 'year must be a valid number' },
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
