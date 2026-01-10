import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tradeEvaluations } from '@/db/schema';
import { desc } from 'drizzle-orm';
import type { TradeData, CalculatedValues } from '@/lib/types';

interface CreateEvaluationBody {
  tradeData: TradeData;
  calculated: CalculatedValues;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateEvaluationBody = await request.json();
    const { tradeData, calculated } = body;

    // Validate required fields
    if (!tradeData || !calculated) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!tradeData.location || !tradeData.rvType) {
      return NextResponse.json({ error: 'Missing required unit data' }, { status: 400 });
    }

    if (typeof tradeData.conditionScore !== 'number' || tradeData.conditionScore < 1 || tradeData.conditionScore > 9) {
      return NextResponse.json({ error: 'Invalid condition score' }, { status: 400 });
    }

    const [evaluation] = await db
      .insert(tradeEvaluations)
      .values({
        // User (stub for now)
        userId: 'stub-user',
        userName: 'System User',

        // Customer Info
        customerName: tradeData.customerName || null,
        customerPhone: tradeData.customerPhone || null,
        customerEmail: tradeData.customerEmail || null,

        // Unit Data
        stockNumber: tradeData.stockNumber || null,
        location: tradeData.location,
        year: tradeData.year,
        make: tradeData.make || null,
        model: tradeData.model || null,
        vin: tradeData.vin || null,
        rvType: tradeData.rvType,
        mileage: tradeData.mileage,
        originalListPrice: tradeData.originalListPrice?.toString() ?? null,

        // Condition & Prep
        conditionScore: tradeData.conditionScore,
        majorIssues: tradeData.majorIssues || null,
        unitAddOns: tradeData.unitAddOns || null,
        additionalPrepCost: tradeData.additionalPrepCost.toString(),

        // Market Data
        avgListingPrice: tradeData.avgListingPrice?.toString() ?? null,

        // Valuation Inputs
        tradeInPercent: tradeData.tradeInPercent.toString(),
        targetMarginPercent: tradeData.targetMarginPercent.toString(),
        retailPriceSource: tradeData.retailPriceSource,
        customRetailValue: tradeData.customRetailValue?.toString() ?? null,
        valuationNotes: tradeData.valuationNotes || null,

        // Calculated Outputs - JD Power
        jdPowerTradeIn: calculated.jdPowerTradeIn.toString(),
        jdPowerRetailValue: calculated.jdPowerRetailValue.toString(),

        // Calculated Outputs - Prep Costs
        pdiCost: calculated.pdiCost.toString(),
        reconCost: calculated.reconCost.toString(),
        soldPrepCost: calculated.soldPrepCost.toString(),
        totalPrepCosts: calculated.totalPrepCosts.toString(),

        // Calculated Outputs - Bish's Values
        bishTivBase: calculated.bishTIVBase.toString(),
        totalUnitCosts: calculated.totalUnitCosts.toString(),

        // Calculated Outputs - Market
        avgCompPrice: calculated.avgCompPrice?.toString() ?? null,
        calculatedRetailPrice: calculated.calculatedRetailPrice.toString(),
        replacementCost: calculated.replacementCost?.toString() ?? null,
        activeRetailPrice: calculated.activeRetailPrice.toString(),

        // Calculated Outputs - Final
        finalTradeOffer: calculated.finalTradeOffer.toString(),
        calculatedMarginAmount: calculated.calculatedMarginAmount.toString(),
        calculatedMarginPercent: calculated.calculatedMarginPercent.toString(),
      })
      .returning({ id: tradeEvaluations.id, createdAt: tradeEvaluations.createdAt });

    return NextResponse.json(
      { id: evaluation.id, createdAt: evaluation.createdAt },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create evaluation:', error);
    return NextResponse.json(
      { error: 'Failed to create evaluation' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawLimit = parseInt(searchParams.get('limit') || '20', 10);
    const rawOffset = parseInt(searchParams.get('offset') || '0', 10);

    // Validate and cap pagination params
    if (isNaN(rawLimit) || isNaN(rawOffset)) {
      return NextResponse.json({ error: 'Invalid pagination parameters' }, { status: 400 });
    }

    const limit = Math.min(Math.max(1, rawLimit), 100); // Cap at 100
    const offset = Math.max(0, rawOffset);

    const evaluations = await db
      .select()
      .from(tradeEvaluations)
      .orderBy(desc(tradeEvaluations.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({ evaluations, limit, offset });
  } catch (error) {
    console.error('Failed to fetch evaluations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch evaluations' },
      { status: 500 }
    );
  }
}
