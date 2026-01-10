import { NextRequest, NextResponse } from "next/server";
import { findByStockNumber, findByVin } from "@/lib/services/inventory";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const stockNumber = searchParams.get("stockNumber");
  const vin = searchParams.get("vin");

  if (!stockNumber && !vin) {
    return NextResponse.json(
      { error: "Either stockNumber or vin query parameter is required" },
      { status: 400 }
    );
  }

  try {
    let unit = null;

    if (stockNumber) {
      unit = await findByStockNumber(stockNumber);
    } else if (vin) {
      unit = await findByVin(vin);
    }

    if (!unit) {
      return NextResponse.json(
        { error: "Unit not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(unit);
  } catch (error) {
    console.error("Inventory lookup error:", error);
    return NextResponse.json(
      { error: "Failed to lookup inventory" },
      { status: 500 }
    );
  }
}
