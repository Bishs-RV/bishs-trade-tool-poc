import {
  pgTable,
  integer,
  varchar,
  text,
  boolean,
  interval,
} from 'drizzle-orm/pg-core'

/**
 * location_detail - Store/location reference data
 * Schema: public
 * This table already exists in the database - DO NOT run migrations to create it.
 * Used for looking up store information by CMF ID.
 */
export const locationDetail = pgTable('location_detail', {
  cmf: integer('cmf').primaryKey().notNull(),
  location: varchar('location'),
  bta: varchar('bta'),
  latLong: varchar('lat_long'),
  address: varchar('address'),
  storename: varchar('storename'),
  lat: varchar('lat'),
  lon: varchar('lon'),
  timezone: varchar('timezone'),
  utcOffset: interval('utc_offset'),
  timezoneGroup: varchar('timezone_group'),
  offsetValue: varchar('offset_value'),
  servicePhone: varchar('service_phone'),
  tkId: varchar('tk_id'),
  region: text('region'),
  signupGeniusId: varchar('signup_genius_id'),
  theCrmLocationId: integer('the_crm_location_id'),
  isActiveLocation: boolean('is_active_location').notNull().default(true),
})

export type LocationDetail = typeof locationDetail.$inferSelect
