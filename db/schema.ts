import {
  pgSchema,
  serial,
  integer,
  varchar,
  text,
  numeric,
  timestamp,
  boolean,
  jsonb,
  doublePrecision,
  index,
} from 'drizzle-orm/pg-core';

export const nada = pgSchema('nada');

// ============================================
// EXISTING TABLES (introspected - do not modify)
// ============================================

export const tradeValueHistory = nada.table('trade_value_history', {
  id: serial().notNull(),
  nadaModelTrimId: integer('nada_model_trim_id').notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
  expiresAt: timestamp('expires_at', { mode: 'string' }).notNull(),
  pricingPeriod: text('pricing_period').notNull(),
  unitYear: integer('unit_year'),
  unitModel: text('unit_model'),
  unitMileage: integer('unit_mileage'),
  unitCondition: text('unit_condition'),
  unitManufacturer: text('unit_manufacturer'),
  specsSlides: integer('specs_slides'),
  specsFloorPlan: text('specs_floor_plan'),
  specsCoachDesign: text('specs_coach_design'),
  specsLengthInches: integer('specs_length_inches'),
  specsSelfContained: boolean('specs_self_contained'),
  valueTradeIn: numeric('value_trade_in', { precision: 12, scale: 2 }),
  valueUsedRetail: numeric('value_used_retail', { precision: 12, scale: 2 }),
  modelDetailsCategory: text('model_details_category'),
  modelDetailsModelTrim: text('model_details_model_trim'),
  modelDetailsModelSeries: text('model_details_model_series'),
  modelDetailsSuggestedList: numeric('model_details_suggested_list', { precision: 12, scale: 2 }),
  valuationDate: timestamp('valuation_date', { mode: 'string' }),
  selectedOptions: jsonb('selected_options'),
  mileageAdjustmentTradeIn: numeric('mileage_adjustment_trade_in', { precision: 12, scale: 2 }),
  mileageAdjustmentRetail: numeric('mileage_adjustment_retail', { precision: 12, scale: 2 }),
  baseTradeIn: numeric('base_trade_in', { precision: 12, scale: 2 }),
  baseRetail: numeric('base_retail', { precision: 12, scale: 2 }),
  totalTradeIn: numeric('total_trade_in', { precision: 12, scale: 2 }),
  totalRetail: numeric('total_retail', { precision: 12, scale: 2 }),
  schemaVersion: integer('schema_version').default(1),
  searchHash: varchar('search_hash', { length: 32 }),
  specsFuelType: text('specs_fuel_type'),
  stockNumber: varchar('stock_number', { length: 100 }),
});

export const usedMakeModel = nada.table('used_make_model', {
  usedMakeModelId: integer('used_make_model_id').generatedAlwaysAsIdentity(),
  versionId: integer('version_id'),
  versionName: varchar('version_name', { length: 255 }),
  manufacturerId: integer('manufacturer_id'),
  manufacturerDisplayName: varchar('manufacturer_display_name', { length: 255 }),
  manufacturerNotes: text('manufacturer_notes'),
  categoryId: integer('category_id'),
  categoryName: varchar('category_name', { length: 255 }),
  fuelType: varchar('fuel_type', { length: 255 }),
  lengthInches: integer('length_inches'),
  makeName: varchar('make_name', { length: 255 }),
  modelId: integer('model_id'),
  modelName: varchar('model_name', { length: 255 }),
  modelNotes: text('model_notes'),
  yearManufactured: integer('year_manufactured'),
  yearNotes: text('year_notes'),
  searchText: text('search_text'),
}, (table) => [
  index('used_make_model_year_search_idx').using('gin', table.searchText),
]);

export const corpToManufacturer = nada.table('corp_to_manufacturer', {
  corpToManufacturerId: integer('corp_to_manufacturer_id').generatedAlwaysAsIdentity(),
  corpName: varchar('corp_name', { length: 255 }),
  friendlyCorpManufacturer: varchar('friendly_corp_manufacturer', { length: 255 }),
  manufacturerId: integer('manufacturer_id'),
  manufacturerDisplayName: varchar('manufacturer_display_name', { length: 255 }),
  categoryId: integer('category_id'),
  categoryName: varchar('category_name', { length: 255 }),
});

export const manufacturerToMake = nada.table('manufacturer_to_make', {
  manufacturerToMakeId: integer('manufacturer_to_make_id').generatedAlwaysAsIdentity(),
  makeName: varchar('make_name', { length: 255 }),
  friendlyManufacturerMake: varchar('friendly_manufacturer_make', { length: 255 }),
  manufacturerId: integer('manufacturer_id'),
  manufacturerDisplayName: varchar('manufacturer_display_name', { length: 255 }),
  categoryId: integer('category_id'),
  categoryName: varchar('category_name', { length: 255 }),
});

export const searchHistory = nada.table('search_history', {
  id: serial().notNull(),
  searchHash: text('search_hash').notNull(),
  rawInput: text('raw_input').notNull(),
  rawInputJson: jsonb('raw_input_json').notNull(),
  nadaModelTrimId: integer('nada_model_trim_id'),
  matchConfidence: doublePrecision('match_confidence'),
  searchCount: integer('search_count').default(1),
  firstSeenAt: timestamp('first_seen_at', { mode: 'string' }).defaultNow(),
  lastSeenAt: timestamp('last_seen_at', { mode: 'string' }).defaultNow(),
  aiConfidence: doublePrecision('ai_confidence'),
  aiExplanation: text('ai_explanation'),
  options: jsonb('options'),
  mileage: integer('mileage'),
});

export const usedCategory = nada.table('used_category', {
  usedCategoryId: integer('used_category_id').generatedAlwaysAsIdentity(),
  categoryId: integer('category_id'),
  categoryDisplayName: varchar('category_display_name', { length: 255 }),
  categoryName: varchar('category_name', { length: 255 }),
});

export const usedYear = nada.table('used_year', {
  usedYearId: integer('used_year_id').generatedAlwaysAsIdentity(),
  versionId: integer('version_id'),
  versionName: varchar('version_name', { length: 255 }),
  manufacturerId: integer('manufacturer_id'),
  manufacturerDisplayName: varchar('manufacturer_display_name', { length: 255 }),
  yearManufactured: integer('year_manufactured'),
  yearType: varchar('year_type', { length: 255 }),
});

export const usedManufacturer = nada.table('used_manufacturer', {
  usedManufacturerId: integer('used_manufacturer_id').generatedAlwaysAsIdentity(),
  versionId: integer('version_id'),
  versionName: varchar('version_name', { length: 255 }),
  manufacturerId: integer('manufacturer_id'),
  manufacturerDisplayName: varchar('manufacturer_display_name', { length: 255 }),
  categoryId: integer('category_id'),
  categoryDisplayName: varchar('category_display_name', { length: 255 }),
  categoryName: varchar('category_name', { length: 255 }),
});

// ============================================
// NEW TABLE - Trade Evaluations from UI
// ============================================

export const tradeEvaluations = nada.table('trade_evaluations', {
  // Primary Key
  id: serial().primaryKey(),

  // FK to trade_value_history (nullable - may not have NADA lookup)
  tradeValueHistoryId: integer('trade_value_history_id').references(() => tradeValueHistory.id),

  // User (stub for now - will integrate with auth later)
  userId: varchar('user_id', { length: 255 }).notNull().default('stub-user'),
  userName: varchar('user_name', { length: 255 }).notNull().default('System User'),

  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),

  // Customer Info
  customerName: varchar('customer_name', { length: 255 }),
  customerPhone: varchar('customer_phone', { length: 50 }),
  customerEmail: varchar('customer_email', { length: 255 }),

  // Unit Data
  stockNumber: varchar('stock_number', { length: 50 }),
  location: varchar('location', { length: 10 }).notNull(),
  year: integer('year'),
  make: varchar('make', { length: 100 }),
  model: varchar('model', { length: 100 }),
  vin: varchar('vin', { length: 17 }),
  rvType: varchar('rv_type', { length: 10 }).notNull(),
  mileage: integer('mileage'),
  originalListPrice: numeric('original_list_price', { precision: 12, scale: 2 }),

  // Condition & Prep
  conditionScore: integer('condition_score').notNull(),
  majorIssues: text('major_issues'),
  unitAddOns: text('unit_add_ons'),
  additionalPrepCost: numeric('additional_prep_cost', { precision: 12, scale: 2 }).notNull().default('0'),

  // Market Data
  avgListingPrice: numeric('avg_listing_price', { precision: 12, scale: 2 }),

  // Valuation Inputs
  tradeInPercent: numeric('trade_in_percent', { precision: 5, scale: 4 }).notNull(),
  targetMarginPercent: numeric('target_margin_percent', { precision: 5, scale: 4 }).notNull(),
  retailPriceSource: varchar('retail_price_source', { length: 20 }).notNull(),
  customRetailValue: numeric('custom_retail_value', { precision: 12, scale: 2 }),
  valuationNotes: text('valuation_notes'),

  // Calculated Outputs - JD Power Values
  jdPowerTradeIn: numeric('jd_power_trade_in', { precision: 12, scale: 2 }).notNull(),
  jdPowerRetailValue: numeric('jd_power_retail_value', { precision: 12, scale: 2 }).notNull(),

  // Calculated Outputs - Prep Costs
  pdiCost: numeric('pdi_cost', { precision: 12, scale: 2 }).notNull(),
  reconCost: numeric('recon_cost', { precision: 12, scale: 2 }).notNull(),
  soldPrepCost: numeric('sold_prep_cost', { precision: 12, scale: 2 }).notNull(),
  totalPrepCosts: numeric('total_prep_costs', { precision: 12, scale: 2 }).notNull(),

  // Calculated Outputs - Bish's Values
  bishTivBase: numeric('bish_tiv_base', { precision: 12, scale: 2 }).notNull(),
  totalUnitCosts: numeric('total_unit_costs', { precision: 12, scale: 2 }).notNull(),

  // Calculated Outputs - Market
  avgCompPrice: numeric('avg_comp_price', { precision: 12, scale: 2 }),
  calculatedRetailPrice: numeric('calculated_retail_price', { precision: 12, scale: 2 }).notNull(),
  replacementCost: numeric('replacement_cost', { precision: 12, scale: 2 }),
  activeRetailPrice: numeric('active_retail_price', { precision: 12, scale: 2 }).notNull(),

  // Calculated Outputs - Final
  finalTradeOffer: numeric('final_trade_offer', { precision: 12, scale: 2 }).notNull(),
  calculatedMarginAmount: numeric('calculated_margin_amount', { precision: 12, scale: 2 }).notNull(),
  calculatedMarginPercent: numeric('calculated_margin_percent', { precision: 5, scale: 4 }).notNull(),
});

// Type exports for TypeScript
export type TradeValueHistory = typeof tradeValueHistory.$inferSelect;
export type NewTradeValueHistory = typeof tradeValueHistory.$inferInsert;
export type TradeEvaluation = typeof tradeEvaluations.$inferSelect;
export type NewTradeEvaluation = typeof tradeEvaluations.$inferInsert;
