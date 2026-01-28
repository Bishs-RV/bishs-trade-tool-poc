import { pgSchema, text, varchar } from 'drizzle-orm/pg-core'

const ukgSchema = pgSchema('ukg')

/**
 * vw_bishs_employee_master - UKG employee view
 * Schema: ukg
 * This view already exists in the database - used for looking up employee store/location.
 */
export const vwBishsEmployeeMaster = ukgSchema.view('vw_bishs_employee_master', {
  employeeId: varchar('employee_id'),
  emailAddress: text('email_address'),
  firstName: text('first_name'),
  lastName: text('last_name'),
  store: text('store'),
  storeCode: varchar('store_code'),
  cmf: varchar('cmf'),
  department: text('department'),
  status: varchar('status'),
}).existing()

export type UkgEmployee = {
  employeeId: string | null
  emailAddress: string | null
  firstName: string | null
  lastName: string | null
  store: string | null
  storeCode: string | null
  cmf: string | null
  department: string | null
  status: string | null
}
