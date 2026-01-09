import { NextRequest, NextResponse } from "next/server";
import { decodeVin } from "@/lib/services/vin-decoder";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const vin = searchParams.get("vin");

  if (!vin) {
    return NextResponse.json(
      { error: "vin query parameter is required" },
      { status: 400 }
    );
  }

  if (vin.length !== 17) {
    return NextResponse.json(
      { error: "VIN must be exactly 17 characters" },
      { status: 400 }
    );
  }

  try {
    const result = await decodeVin(vin);
    return NextResponse.json(result);
  } catch (error) {
    console.error("VIN decode error:", error);
    return NextResponse.json(
      { error: "Failed to decode VIN" },
      { status: 500 }
    );
  }
}
