import { ilike } from "drizzle-orm";
import { db } from "@/lib/db";
import { evoMajorunit, type InventoryUnit } from "@/lib/db/schema";

function sanitizeForLike(input: string): string {
  return input.replace(/[%_\\]/g, "\\$&");
}

export async function findByStockNumber(
  stockNumber: string
): Promise<InventoryUnit | null> {
  const sanitized = sanitizeForLike(stockNumber);
  const results = await db
    .select()
    .from(evoMajorunit)
    .where(ilike(evoMajorunit.stockNumber, sanitized))
    .limit(1);

  return results[0] || null;
}

export async function findByVin(vin: string): Promise<InventoryUnit | null> {
  const sanitized = sanitizeForLike(vin);
  const results = await db
    .select()
    .from(evoMajorunit)
    .where(ilike(evoMajorunit.vin, sanitized))
    .limit(1);

  return results[0] || null;
}

export async function searchInventory(query: string): Promise<InventoryUnit[]> {
  const sanitized = sanitizeForLike(query);
  const results = await db
    .select()
    .from(evoMajorunit)
    .where(ilike(evoMajorunit.stockNumber, `%${sanitized}%`))
    .limit(10);

  return results;
}
