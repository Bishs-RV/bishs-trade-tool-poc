import { NextRequest, NextResponse } from "next/server";

// TODO: Implement VIN lookup for previous evaluations
// This should query a table storing previous trade evaluations by VIN
// and return any matching records for the user to review/reference

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const vin = searchParams.get("vin");

  if (!vin) {
    return NextResponse.json({ error: "VIN is required" }, { status: 400 });
  }

  // TODO: Replace with actual database query for previous evaluations
  // Example: const evaluations = await db.select().from(tradeEvaluations).where(eq(tradeEvaluations.vin, vin));

  return NextResponse.json({
    message: "VIN lookup not yet implemented",
    vin,
    evaluations: [],
  });
}
