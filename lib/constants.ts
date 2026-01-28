import { RVType } from './types';

// Prep cost tiers based on JD Power Trade-In value
export interface PrepCostTier {
  ceiling: number;
  pdiType: string;
  invoiceRange: string;
  pdiLabor: number;
  pdiTime: number;
  getReady: number;
  orientation: number;
  recon: number;
  detail: number;
  giftCertificate: number;
  shopSupplies: number;
}

export const PREP_COST_TIERS: PrepCostTier[] = [
  { ceiling: 5000, pdiType: 'UPDI 1', invoiceRange: '0-5k', pdiLabor: 112.50, pdiTime: 1.5, getReady: 37.50, orientation: 75.00, recon: 112.50, detail: 100.00, giftCertificate: 25.00, shopSupplies: 50.00 },
  { ceiling: 10000, pdiType: 'UPDI 2', invoiceRange: '5-10k', pdiLabor: 142.50, pdiTime: 1.5, getReady: 47.50, orientation: 95.00, recon: 142.50, detail: 125.00, giftCertificate: 25.00, shopSupplies: 50.00 },
  { ceiling: 15000, pdiType: 'UPDI 3', invoiceRange: '10-15k', pdiLabor: 262.50, pdiTime: 2.5, getReady: 105.00, orientation: 105.00, recon: 157.50, detail: 150.00, giftCertificate: 25.00, shopSupplies: 50.00 },
  { ceiling: 20000, pdiType: 'UPDI 4', invoiceRange: '15-20k', pdiLabor: 312.50, pdiTime: 2.5, getReady: 125.00, orientation: 125.00, recon: 187.50, detail: 200.00, giftCertificate: 25.00, shopSupplies: 50.00 },
  { ceiling: 25000, pdiType: 'UPDI 5', invoiceRange: '20-25k', pdiLabor: 390.00, pdiTime: 3.0, getReady: 130.00, orientation: 130.00, recon: 195.00, detail: 200.00, giftCertificate: 25.00, shopSupplies: 50.00 },
  { ceiling: 30000, pdiType: 'UPDI 6', invoiceRange: '25-30k', pdiLabor: 472.50, pdiTime: 3.5, getReady: 135.00, orientation: 135.00, recon: 202.50, detail: 250.00, giftCertificate: 25.00, shopSupplies: 50.00 },
  { ceiling: 40000, pdiType: 'UPDI 7', invoiceRange: '30-40k', pdiLabor: 540.00, pdiTime: 4.0, getReady: 168.75, orientation: 135.00, recon: 202.50, detail: 250.00, giftCertificate: 25.00, shopSupplies: 50.00 },
  { ceiling: 60000, pdiType: 'UPDI 8', invoiceRange: '40-60k', pdiLabor: 700.00, pdiTime: 5.0, getReady: 175.00, orientation: 140.00, recon: 210.00, detail: 300.00, giftCertificate: 25.00, shopSupplies: 50.00 },
  { ceiling: 80000, pdiType: 'UPDI 9', invoiceRange: '60-80k', pdiLabor: 942.50, pdiTime: 6.5, getReady: 290.00, orientation: 145.00, recon: 217.50, detail: 300.00, giftCertificate: 25.00, shopSupplies: 50.00 },
  { ceiling: 100000, pdiType: 'UPDI 10', invoiceRange: '80-100k', pdiLabor: 1007.50, pdiTime: 6.5, getReady: 310.00, orientation: 155.00, recon: 232.50, detail: 500.00, giftCertificate: 25.00, shopSupplies: 50.00 },
  { ceiling: Infinity, pdiType: 'UPDI 11', invoiceRange: '100k+', pdiLabor: 1040.00, pdiTime: 6.5, getReady: 320.00, orientation: 160.00, recon: 240.00, detail: 500.00, giftCertificate: 25.00, shopSupplies: 50.00 },
];

// Helper function to get prep cost tier based on JD Power Trade-In value
// Finds the tier where value falls within the range (0-ceiling)
// Example: $20,700 falls within 20-25k range → use the $25,000 tier
export function getPrepCostTier(jdPowerTradeIn: number): PrepCostTier {
  return PREP_COST_TIERS.find(tier => jdPowerTradeIn <= tier.ceiling)
    ?? PREP_COST_TIERS[PREP_COST_TIERS.length - 1];
}

// Slider ranges
export const TRADE_IN_PERCENT_MIN = 0.70;
export const TRADE_IN_PERCENT_MAX = 1.30;
export const MARGIN_PERCENT_MIN = 0;
export const MARGIN_PERCENT_MAX = 0.40;
export const TARGET_MARGIN_PERCENT = 0.30;
export const DEFAULT_TRADE_IN_PERCENT = 1.0;

// Form defaults
export const DEFAULT_LOCATION = 'MID';
export const DEFAULT_RV_TYPE: RVType = 'TT';
export const DEFAULT_CONDITION_SCORE = 7;
export const DEFAULT_ADDITIONAL_PREP_COST = 1500;

// RV Type options
export const RV_TYPE_OPTIONS: Array<{ value: RVType; label: string }> = [
  { value: 'TT', label: 'Travel Trailer' },
  { value: 'FW', label: 'Fifth Wheel' },
  { value: 'POP', label: 'Pop-Up' },
  { value: 'TC', label: 'Truck Camper' },
  { value: 'CAG', label: 'Class A-G' },
  { value: 'CAD', label: 'Class A-D' },
  { value: 'CCG', label: 'Class C-G' },
  { value: 'CCD', label: 'Class C-D' },
  { value: 'DT', label: 'Destination Trailer' },
];

// Helper function to check if RV type is motorized
export const isMotorized = (rvType: RVType): boolean => {
  return rvType.startsWith('CA') || rvType.startsWith('CC');
};

// Generate year options for trade-in form (next year down to 15 years ago)
export function getTradeInYears(): number[] {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = currentYear + 1; y >= currentYear - 15; y--) {
    years.push(y);
  }
  return years;
}
