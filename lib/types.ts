// Core data interfaces for the Trade-In Tool

export interface TradeData {
  // Customer Info (Optional)
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  
  // Section 1: Unit & Base Data
  stockNumber: string;
  location: string;
  year: number | null;
  make: string;
  model: string;
  vin: string;
  rvType: RVType;
  mileage: number | null;
  originalListPrice: number | null;

  // Section 2: Condition & Prep Costs
  conditionScore: number;
  majorIssues: string;
  unitAddOns: string;
  additionalPrepCost: number;

  // Section 3: Market Data
  avgListingPrice: number;
  
  // Section 4: Valuation Levers
  tradeInPercent: number; // 0.70 to 1.30
  targetMarginPercent: number; // 0 to 0.40
  retailSource: 'bish' | 'custom'; // For replacement cost (legacy, will be removed)
  customRetailPrice: number; // For replacement cost (legacy, will be removed)
  retailPriceSource: 'jdpower' | 'custom'; // For retail price calculation
  customRetailValue: number; // Custom retail price value
  
  // Footer
  valuationNotes: string;
}

export type RVType = 'TT' | 'FW' | 'POP' | 'TC' | 'CAG' | 'CAD' | 'CCG' | 'CCD';

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

export interface ComparableUnit {
  price: number; // Original asking price or comparable price
  dealership: string;
  url: string;
  location: string;
  listedPrice?: number; // Bish's listed price (if applicable)
  soldPrice?: number; // Bish's sold price (if sold)
  soldDate?: string; // Date sold (if sold)
}

export interface CalculatedValues {
  // JD Power Values
  jdPowerTradeIn: number;
  jdPowerRetailValue: number;
  
  // Prep Costs Breakdown
  pdiCost: number;
  reconCost: number;
  soldPrepCost: number;
  totalPrepCosts: number;
  
  // Bish's Values
  bishTIVBase: number;
  totalUnitCosts: number;
  
  // Market Data
  avgCompPrice: number;
  calculatedRetailPrice: number;
  replacementCost: number;
  activeRetailPrice: number;
  
  // Final Outputs
  finalTradeOffer: number;
  calculatedMarginAmount: number;
  calculatedMarginPercent: number;

  // Active prep cost tier
  activePrepTier: PrepCostTier | null;
}
