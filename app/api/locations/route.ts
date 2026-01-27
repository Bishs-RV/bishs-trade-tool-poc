import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { locationDetail } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'

export async function GET() {
  try {
    const locations = await db
      .select({
        cmf: locationDetail.cmf,
        location: locationDetail.location,
        storename: locationDetail.storename,
      })
      .from(locationDetail)
      .where(eq(locationDetail.isActiveLocation, true))
      .orderBy(asc(locationDetail.location))

    return NextResponse.json({ locations })
  } catch (error: unknown) {
    console.error('Error fetching locations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    )
  }
}
