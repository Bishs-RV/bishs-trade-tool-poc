import {
  pgTable,
  varchar,
  integer,
  numeric,
  timestamp,
  text,
} from "drizzle-orm/pg-core";

// Current inventory units from evo_majorunit
export const evoMajorunit = pgTable("evo_majorunit", {
  majorUnitHeaderId: integer("MajorUnitHeaderId").notNull(),
  dealerId: varchar("DealerId", { length: 255 }),
  stockNumber: varchar("StockNumber", { length: 255 }),
  vin: varchar("VIN", { length: 255 }),
  modelYear: integer("ModelYear"),
  make: varchar("Make", { length: 255 }),
  model: varchar("Model", { length: 255 }),
  manufacturer: varchar("Manufacturer", { length: 255 }),
  msrp: numeric("MSRP", { precision: 19, scale: 2 }),
  condition: varchar("Condition", { length: 255 }),
  newUsed: varchar("NewUsed", { length: 255 }),
  odometer: varchar("Odometer", { length: 255 }),
  class: varchar("Class", { length: 255 }),
  unitType: varchar("UnitType", { length: 255 }),
  floorLayout: varchar("FloorLayout", { length: 255 }),
  fuelType: varchar("FuelType", { length: 255 }),
  location: varchar("Location", { length: 255 }),
  storeLocation: varchar("StoreLocation", { length: 255 }),
  unitStatus: varchar("UnitStatus", { length: 255 }),
  invoiceAmt: numeric("InvoiceAmt", { precision: 19, scale: 2 }),
  totalCost: numeric({ precision: 19, scale: 2 }),
  color: varchar("Color", { length: 255 }),
  interiorColor: varchar("InteriorColor", { length: 255 }),
  exteriorColor: varchar("ExteriorColor", { length: 255 }),
  length: numeric("Length", { precision: 19, scale: 2 }),
  gvwr: integer("GVWR"),
  comments: text("Comments"),
  dateReceived: timestamp("DateReceived", { withTimezone: true, mode: "string" }),
  dateGathered: timestamp("DateGathered", { withTimezone: true, mode: "string" }),
});

// Type for inventory unit (inferred from schema)
export type InventoryUnit = typeof evoMajorunit.$inferSelect;
