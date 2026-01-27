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

  // JD Power IDs (for API lookups)
  jdPowerManufacturerId: number | null;
  jdPowerModelTrimId: number | null;

  // Manufacturer name (stored regardless of JD Power or custom selection)
  manufacturerName: string;

  // Custom input values (for fuzzy matching when JD Power doesn't have the unit)
  customManufacturer?: string;
  customMake?: string;
  customModel?: string;

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
  retailPriceSource: 'jdpower' | 'custom'; // For retail price calculation
  customRetailValue: number; // Custom retail price value
  
  // Footer
  valuationNotes: string;
}

export type RVType = 'TT' | 'FW' | 'POP' | 'TC' | 'CAG' | 'CAD' | 'CCG' | 'CCD' | 'DT';

export interface DepreciationInfo {
  monthsToSell?: number;
  vehicleAge?: number;
  totalDepreciationPercent?: number;
}

export interface CalculatedValues {
  // JD Power Values (raw from NADA)
  jdPowerTradeIn: number;
  jdPowerRetailValue: number;

  // Bish Adjusted Trade-In (after depreciation)
  bishAdjustedTradeIn: number;

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
}
