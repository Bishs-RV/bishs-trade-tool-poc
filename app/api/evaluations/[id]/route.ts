import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tradeEvaluations } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const evaluationId = parseInt(id, 10);

    if (isNaN(evaluationId)) {
      return NextResponse.json({ error: 'Invalid evaluation ID' }, { status: 400 });
    }

    const [evaluation] = await db
      .select()
      .from(tradeEvaluations)
      .where(eq(tradeEvaluations.id, evaluationId));

    if (!evaluation) {
      return NextResponse.json({ error: 'Evaluation not found' }, { status: 404 });
    }

    return NextResponse.json(evaluation);
  } catch (error) {
    console.error('Failed to fetch evaluation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch evaluation' },
      { status: 500 }
    );
  }
}
