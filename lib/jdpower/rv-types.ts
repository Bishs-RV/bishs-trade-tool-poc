import type { RVType } from '@/lib/types'

// JD Power RV Category IDs
export const JD_POWER_CATEGORIES = {
  TOW_VEHICLES: 1,
  TRUCK_CAMPERS: 2,
  MOTORHOMES: 3,
  TRAVEL_TRAILERS_FIFTH_WHEELS: 4,
  PARK_MODELS: 5,
  CAMPING_TRAILERS: 6,
} as const

export type JDPowerCategoryId = (typeof JD_POWER_CATEGORIES)[keyof typeof JD_POWER_CATEGORIES]

// Map POC RV type codes to JD Power Category IDs
export const RV_TYPE_TO_CATEGORY: Record<RVType, JDPowerCategoryId> = {
  TT: JD_POWER_CATEGORIES.TRAVEL_TRAILERS_FIFTH_WHEELS, // Travel Trailer
  FW: JD_POWER_CATEGORIES.TRAVEL_TRAILERS_FIFTH_WHEELS, // Fifth Wheel
  POP: JD_POWER_CATEGORIES.CAMPING_TRAILERS, // Pop-up/Camping Trailer
  TC: JD_POWER_CATEGORIES.TRUCK_CAMPERS, // Truck Camper
  CAG: JD_POWER_CATEGORIES.MOTORHOMES, // Class A Gas
  CAD: JD_POWER_CATEGORIES.MOTORHOMES, // Class A Diesel
  CCG: JD_POWER_CATEGORIES.MOTORHOMES, // Class C Gas
  CCD: JD_POWER_CATEGORIES.MOTORHOMES, // Class C Diesel
  DT: JD_POWER_CATEGORIES.PARK_MODELS, // Destination Trailer -> Park Models (category 5)
}

// Display names for JD Power categories
export const CATEGORY_DISPLAY_NAMES: Record<JDPowerCategoryId, string> = {
  [JD_POWER_CATEGORIES.TOW_VEHICLES]: 'Tow Vehicles',
  [JD_POWER_CATEGORIES.TRUCK_CAMPERS]: 'Truck Campers',
  [JD_POWER_CATEGORIES.MOTORHOMES]: 'Motorhomes',
  [JD_POWER_CATEGORIES.TRAVEL_TRAILERS_FIFTH_WHEELS]: 'Travel Trailers/5th Wheels',
  [JD_POWER_CATEGORIES.PARK_MODELS]: 'Park Models',
  [JD_POWER_CATEGORIES.CAMPING_TRAILERS]: 'Camping Trailers',
}

/**
 * Convert POC RV type code to JD Power Category ID
 */
export function getCategoryId(rvType: RVType): JDPowerCategoryId {
  return RV_TYPE_TO_CATEGORY[rvType]
}

/**
 * Check if an RV type is motorized (requires mileage)
 */
export function isMotorized(rvType: RVType): boolean {
  return RV_TYPE_TO_CATEGORY[rvType] === JD_POWER_CATEGORIES.MOTORHOMES
}
