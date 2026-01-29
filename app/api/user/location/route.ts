import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { db } from '@/lib/db'
import { vwBishsEmployeeMaster, locationDetail, evoDealer } from '@/lib/db/schema'
import { ilike, eq, sql } from 'drizzle-orm'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    )
  }

  try {
    // Query UKG employee view for the user's store code
    // Join with location_detail and evo_dealer to get zipcode
    const result = await db
      .select({
        storeCode: vwBishsEmployeeMaster.storeCode,
        store: vwBishsEmployeeMaster.store,
        cmf: vwBishsEmployeeMaster.cmf,
        zipCode: evoDealer.zipCode,
      })
      .from(vwBishsEmployeeMaster)
      .leftJoin(
        locationDetail,
        eq(vwBishsEmployeeMaster.cmf, sql`${locationDetail.cmf}::VARCHAR`)
      )
      .leftJoin(
        evoDealer,
        eq(evoDealer.cmf, vwBishsEmployeeMaster.cmf)
      )
      .where(ilike(vwBishsEmployeeMaster.emailAddress, session.user.email))
      .limit(1)

    if (result.length === 0 || !result[0].storeCode) {
      return NextResponse.json(
        { location: null, zipCode: null },
        { status: 200 }
      )
    }

    return NextResponse.json({
      location: result[0].storeCode,
      storeName: result[0].store,
      zipCode: result[0].zipCode,
    })
  } catch (error) {
    console.error('Error fetching user location:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user location' },
      { status: 500 }
    )
  }
}
