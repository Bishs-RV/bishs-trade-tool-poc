import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { db } from '@/lib/db'
import { vwBishsEmployeeMaster } from '@/lib/db/schema'
import { ilike } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    )
  }

  const searchParams = request.nextUrl.searchParams
  const email = searchParams.get('email')

  if (!email) {
    return NextResponse.json(
      { error: 'Email parameter is required' },
      { status: 400 }
    )
  }

  try {
    // Use ilike for case-insensitive email matching (email input is controlled by authenticated users)
    const result = await db
      .select({
        firstName: vwBishsEmployeeMaster.firstName,
        lastName: vwBishsEmployeeMaster.lastName,
      })
      .from(vwBishsEmployeeMaster)
      .where(ilike(vwBishsEmployeeMaster.emailAddress, email))
      .limit(1)

    if (result.length === 0) {
      return NextResponse.json(
        { firstName: null, lastName: null },
        { status: 200 }
      )
    }

    return NextResponse.json({
      firstName: result[0].firstName,
      lastName: result[0].lastName,
    })
  } catch (error) {
    console.error('Error looking up user:', error)
    return NextResponse.json(
      { error: 'Failed to lookup user' },
      { status: 500 }
    )
  }
}
