import { pgTable, varchar } from 'drizzle-orm/pg-core'

/**
 * evo_dealer - Dealer/store information from EVO
 * Schema: public
 * This table already exists in the database - DO NOT run migrations to create it.
 * Used for looking up dealer zipcode by CMF.
 */
export const evoDealer = pgTable('evo_dealer', {
  cmf: varchar('Cmf', { length: 255 }).primaryKey().notNull(),
  dealerId: varchar('DealerId', { length: 255 }),
  dealerName: varchar('DealerName', { length: 255 }),
  zipCode: varchar('zipCode', { length: 20 }),
})

export type EvoDealer = typeof evoDealer.$inferSelect
