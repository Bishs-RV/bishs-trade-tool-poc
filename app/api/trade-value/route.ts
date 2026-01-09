import { NextRequest, NextResponse } from "next/server";
import { fetchTradeValue, type TradeValueParams } from "@/lib/services/bishconnect";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const year = searchParams.get("year");
  const manufacturer = searchParams.get("manufacturer");
  const make = searchParams.get("make");
  const model = searchParams.get("model");
  const mileage = searchParams.get("mileage");
  const condition = searchParams.get("condition");

  if (!year || !manufacturer || !model) {
    return NextResponse.json(
      { error: "year, manufacturer, and model are required parameters" },
      { status: 400 }
    );
  }

  const yearNum = parseInt(year, 10);
  if (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 1) {
    return NextResponse.json(
      { error: "Invalid year" },
      { status: 400 }
    );
  }

  const params: TradeValueParams = {
    year: yearNum,
    manufacturer,
    model,
  };

  if (make) {
    params.make = make;
  }
  if (mileage) {
    const mileageNum = parseInt(mileage, 10);
    if (!isNaN(mileageNum)) {
      params.mileage = mileageNum;
    }
  }
  if (condition) {
    const conditionNum = parseInt(condition, 10);
    if (!isNaN(conditionNum) && conditionNum >= 1 && conditionNum <= 10) {
      params.condition = conditionNum;
    }
  }

  try {
    const result = await fetchTradeValue(params);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Trade value error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch trade value";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
