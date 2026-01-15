import { NextRequest, NextResponse } from 'next/server'
import { fetchMakes } from '@/lib/jdpower/client'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const rvCategoryId = searchParams.get('rvCategoryId')

  // Parse optional category ID (0 = all categories)
  const categoryNum = rvCategoryId ? parseInt(rvCategoryId, 10) : 0

  if (isNaN(categoryNum)) {
    return NextResponse.json(
      { error: 'rvCategoryId must be a valid number' },
      { status: 400 }
    )
  }

  try {
    // fetchMakes uses sensible defaults for year range (15 years back to next year)
    const makes = await fetchMakes(undefined, undefined, categoryNum)
    return NextResponse.json({ makes })
  } catch (error: unknown) {
    console.error('Error fetching makes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch makes from JD Power' },
      { status: 500 }
    )
  }
}
