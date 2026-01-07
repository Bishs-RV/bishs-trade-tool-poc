import { RVType, ComparableUnit } from './types';

// PDI Cost mapping by RV Type - DEPRECATED, now using pricing tiers
export const RV_PDI_MAP: Record<RVType, number> = {
  'TT': 800,
  'POP': 800,
  'FW': 1200,
  'TC': 1200,
  'CCG': 1500,
  'CCD': 1500,
  'CAG': 2500,
  'CAD': 2500,
};

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
export function getPrepCostTier(jdPowerTradeIn: number): PrepCostTier {
  return PREP_COST_TIERS.find(tier => jdPowerTradeIn <= tier.ceiling) || PREP_COST_TIERS[PREP_COST_TIERS.length - 1];
}

// Fixed cost constants
export const RECON_FIXED_BASE = 2000;
export const SOLD_PREP_FIXED = 1000;
export const RECON_PENALTY_PER_POINT = 500;
export const MAX_CONDITION_SCORE = 9;

// Slider ranges
export const TRADE_IN_PERCENT_MIN = 0.70;
export const TRADE_IN_PERCENT_MAX = 1.30;
export const MARGIN_PERCENT_MIN = 0;
export const MARGIN_PERCENT_MAX = 0.40;
export const TARGET_MARGIN_PERCENT = 0.18;

// Location options
export const LOCATIONS = [
  'AIN', 'AUT', 'BMT', 'CAL', 'CIA', 'CMI', 'CORP', 'CWY', 'DIA', 'GMT',
  'IDF', 'JOR', 'KMT', 'KNE', 'LMI', 'LNE', 'LTX', 'MID', 'MSV', 'ONE',
  'SUT', 'TMI', 'TWF', 'ZMT'
];

// Mock comparable data
export const MOCK_COMP_DATA: ComparableUnit[] = [
  { price: 50000, dealership: "Bish's RV", url: "https://example.com/listing/mid-50000", location: "MID", listedPrice: 50000, soldPrice: 48500, soldDate: "2024-11-15" },
  { price: 48000, dealership: "Bish's RV", url: "https://example.com/listing/idf-48000", location: "IDF", listedPrice: 48000 },
  { price: 53000, dealership: "Bish's RV", url: "https://example.com/listing/twf-53000", location: "TWF", listedPrice: 53000, soldPrice: 51200, soldDate: "2024-11-20" },
  { price: 51500, dealership: "Bish's RV", url: "https://example.com/listing/bmt-51500", location: "BMT", listedPrice: 51500 },
  { price: 49900, dealership: "Bish's RV", url: "https://example.com/listing/zmt-49900", location: "ZMT", listedPrice: 49900, soldPrice: 49000, soldDate: "2024-11-18" },
  { price: 52500, dealership: "Bish's RV", url: "https://example.com/listing/jor-52500", location: "JOR", listedPrice: 52500 },
  { price: 47500, dealership: "Bish's RV", url: "https://example.com/listing/mid-47500", location: "MID", listedPrice: 47500, soldPrice: 46800, soldDate: "2024-11-12" },
  { price: 50500, dealership: "Bish's RV", url: "https://example.com/listing/idf-50500", location: "IDF", listedPrice: 50500 },
  { price: 54000, dealership: "Bish's RV", url: "https://example.com/listing/twf-54000", location: "TWF", listedPrice: 54000, soldPrice: 52800, soldDate: "2024-11-22" },
  { price: 49000, dealership: "Bish's RV", url: "https://example.com/listing/bmt-49000", location: "BMT", listedPrice: 49000 },
  { price: 51000, dealership: "Bish's RV", url: "https://example.com/listing/zmt-51000", location: "ZMT", listedPrice: 51000, soldPrice: 50200, soldDate: "2024-11-25" },
  { price: 53500, dealership: "Bish's RV", url: "https://example.com/listing/jor-53500", location: "JOR", listedPrice: 53500 },
  { price: 46500, dealership: "Bish's RV", url: "https://example.com/listing/mid-46500", location: "MID", listedPrice: 46500, soldPrice: 45900, soldDate: "2024-11-10" },
  { price: 50000, dealership: "Bish's RV", url: "https://example.com/listing/idf-50000", location: "IDF", listedPrice: 50000 },
  { price: 52000, dealership: "Bish's RV", url: "https://example.com/listing/twf-52000", location: "TWF", listedPrice: 52000, soldPrice: 51000, soldDate: "2024-11-28" },
];

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
];

// RV Make options
export const RV_MAKES = [
  'Airstream',
  'Coachmen',
  'Dutchmen',
  'Forest River',
  'Grand Design',
  'Heartland',
  'Jayco',
  'Keystone',
  'KZ',
  'Newmar',
  'Northwood',
  'Palomino',
  'Thor Motor Coach',
  'Tiffin',
  'Winnebago',
];

// RV Model/Floorplan options (organized by popular manufacturers)
export const RV_MODELS = [
  // Airstream
  'Classic',
  'Flying Cloud',
  'Bambi',
  'Basecamp',
  // Forest River
  'Rockwood Ultra Lite',
  'Wildwood',
  'Salem',
  'Georgetown',
  'Sunseeker',
  // Grand Design
  'Reflection',
  'Imagine',
  'Transcend',
  'Momentum',
  // Jayco
  'Jay Flight',
  'Eagle',
  'White Hawk',
  'Greyhawk',
  'Redhawk',
  // Keystone
  'Cougar',
  'Outback',
  'Passport',
  'Montana',
  'Sprinter',
  // Thor Motor Coach
  'Ace',
  'Challenger',
  'Quantum',
  'Four Winds',
  // Winnebago
  'Minnie Winnie',
  'Vista',
  'Voyage',
  'Micro Minnie',
  'Solis',
  // Other popular models
  'Avalanche',
  'Cherokee',
  'Durango',
  'Flagstaff',
  'Freelander',
  'Laredo',
  'Puma',
  'Raptor',
  'Vengeance',
];

// Helper function to check if RV type is motorized
export const isMotorized = (rvType: RVType): boolean => {
  return rvType.startsWith('CA') || rvType.startsWith('CC');
};
