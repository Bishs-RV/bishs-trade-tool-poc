import { create } from 'zustand';
import { TradeData, CalculatedValues, RVType } from '@/lib/types';
import type { TradeEvaluation } from '@/lib/db/schema';
import {
  calculateValuation,
  calculateTradeInPercentFromMargin,
  DriverId,
  TradeValues,
} from '@/lib/calculations';
import {
  TARGET_MARGIN_PERCENT,
  RV_TYPE_OPTIONS,
  DEFAULT_LOCATION,
  DEFAULT_RV_TYPE,
  DEFAULT_CONDITION_SCORE,
  DEFAULT_TRADE_IN_PERCENT,
  DEFAULT_ADDITIONAL_PREP_COST,
} from '@/lib/constants';

const isValidRvType = (type: string | null): type is RVType =>
  type !== null && RV_TYPE_OPTIONS.some((opt) => opt.value === type);

const initialData: TradeData = {
  customerFirstName: '',
  customerLastName: '',
  customerPhone: '',
  customerEmail: '',
  stockNumber: '',
  location: DEFAULT_LOCATION,
  year: null,
  make: '',
  model: '',
  vin: '',
  rvType: DEFAULT_RV_TYPE,
  mileage: null,
  originalListPrice: null,
  jdPowerManufacturerId: null,
  jdPowerModelTrimId: null,
  manufacturerName: '',
  conditionScore: DEFAULT_CONDITION_SCORE,
  majorIssues: '',
  unitAddOns: '',
  additionalPrepCost: DEFAULT_ADDITIONAL_PREP_COST,
  avgListingPrice: 0,
  tradeInPercent: DEFAULT_TRADE_IN_PERCENT,
  targetMarginPercent: TARGET_MARGIN_PERCENT,
  retailPriceSource: 'jdpower',
  customRetailValue: 0,
  valuationNotes: '',
};

const initialCalculated: CalculatedValues = {
  jdPowerTradeIn: 0,
  jdPowerRetailValue: 0,
  bishAdjustedTradeIn: 0,
  pdiCost: 0,
  reconCost: 0,
  soldPrepCost: 0,
  totalPrepCosts: 0,
  bishTIVBase: 0,
  totalUnitCosts: 0,
  avgCompPrice: 0,
  calculatedRetailPrice: 0,
  replacementCost: 0,
  activeRetailPrice: 0,
  finalTradeOffer: 0,
  calculatedMarginAmount: 0,
  calculatedMarginPercent: 0,
};

interface TradeState {
  // Form data
  data: TradeData;
  // Calculated/derived values
  calculated: CalculatedValues;
  // API response from trade value lookup
  tradeValues: TradeValues | undefined;
  // UI state
  isLookupComplete: boolean;
  isLoading: boolean;
  isSubmitting: boolean;
  // Flag to suppress cascading resets when loading a prior evaluation
  isLoadingPriorEval: boolean;
  // Metadata from loaded evaluation (undefined for new evaluations)
  evaluationCreatedBy: string | undefined;
  evaluationCreatedDate: Date | undefined;
  // Tracks saved evaluation ID (prevents double-save on print)
  evaluationId: number | null;
}

interface TradeActions {
  // Update a single field with optional recalculation
  updateField: <K extends keyof TradeData>(
    field: K,
    value: TradeData[K],
    driverId?: DriverId
  ) => void;
  // Batch update multiple fields
  updateFields: (updates: Partial<TradeData>, driverId?: DriverId) => void;
  // Run recalculation with specified driver
  recalculate: (driverId: DriverId, updates?: Partial<TradeData>, newTradeValues?: TradeValues) => void;
  // Reset condition, notes, margin to defaults for new valuation
  resetForNewValuation: () => void;
  // Clear JD Power lookup fields when RV type changes
  resetLookupFields: () => void;
  // Set trade values from API lookup
  setTradeValues: (values: TradeValues | undefined) => void;
  // Set lookup complete state
  setIsLookupComplete: (value: boolean) => void;
  // Set loading state
  setIsLoading: (value: boolean) => void;
  // Set submitting state
  setIsSubmitting: (value: boolean) => void;
  // Set evaluation ID after save
  setEvaluationId: (id: number | null) => void;
  // Load saved evaluation
  loadEvaluation: (evaluation: TradeEvaluation) => void;
  // Full reset to initial state
  reset: () => void;
}

type TradeStore = TradeState & TradeActions;

export const useTradeStore = create<TradeStore>((set, get) => ({
  // Initial state
  data: { ...initialData },
  calculated: { ...initialCalculated },
  tradeValues: undefined,
  isLookupComplete: false,
  isLoading: false,
  isSubmitting: false,
  isLoadingPriorEval: false,
  evaluationCreatedBy: undefined,
  evaluationCreatedDate: undefined,
  evaluationId: null,

  // Actions
  updateField: (field, value, driverId = 'trade-in-percent-slider') => {
    const { isLookupComplete } = get();
    const updates = { [field]: value } as Partial<TradeData>;

    // Check if vehicle fields changed - if so, invalidate lookup
    const vehicleFieldsChanged =
      field === 'year' ||
      field === 'rvType' ||
      field === 'jdPowerManufacturerId' ||
      field === 'jdPowerModelTrimId' ||
      field === 'make' ||
      field === 'model';

    // Check if mileage changed after lookup is complete
    const mileageChanged = field === 'mileage' && isLookupComplete;

    if (vehicleFieldsChanged && isLookupComplete) {
      set({
        isLookupComplete: false,
        tradeValues: undefined,
      });
    }

    if (mileageChanged) {
      set({ isLookupComplete: false });
    }

    // Recalculate
    const effectiveDriverId = field === 'conditionScore' ? 'condition-score' :
      field === 'additionalPrepCost' ? 'additional-prep-cost' :
      field === 'targetMarginPercent' ? 'margin-percent-slider' :
      field === 'tradeInPercent' ? 'trade-in-percent-slider' :
      driverId;

    get().recalculate(effectiveDriverId, updates);
  },

  updateFields: (updates, driverId = 'trade-in-percent-slider') => {
    const { isLookupComplete } = get();

    // Check if vehicle fields changed
    const vehicleFieldsChanged =
      'year' in updates ||
      'rvType' in updates ||
      'jdPowerManufacturerId' in updates ||
      'jdPowerModelTrimId' in updates ||
      'make' in updates ||
      'model' in updates;

    // Check if mileage changed after lookup is complete
    const mileageChanged = 'mileage' in updates && isLookupComplete;

    if (vehicleFieldsChanged && isLookupComplete) {
      set({
        isLookupComplete: false,
        tradeValues: undefined,
      });
    }

    if (mileageChanged) {
      set({ isLookupComplete: false });
    }

    get().recalculate(driverId, updates);
  },

  recalculate: (driverId, updates, newTradeValues) => {
    const { data, isLookupComplete, tradeValues } = get();
    const newData = updates ? { ...data, ...updates } : data;
    const currentTradeValues = newTradeValues ?? tradeValues;

    // Check if we have real values to calculate with
    const hasRealValues = isLookupComplete || driverId === 'lookup-complete';

    // For margin-driven calculations: margin is the input, trade-in % is calculated
    // 'lookup-complete' should also use margin as driver so trade-in % matches the 30% default
    if (driverId === 'margin-percent-slider' || driverId === 'initial-load' || driverId === 'lookup-complete') {
      const newCalc = calculateValuation(newData, driverId, isLookupComplete, currentTradeValues);

      // Only recalculate tradeInPercent when we have real values
      // Otherwise preserve the default (100%) to avoid setting it to 0
      if (hasRealValues) {
        const newTradeInPercent = calculateTradeInPercentFromMargin(
          newCalc.bishTIVBase,
          newCalc.finalTradeOffer
        );
        set({
          data: { ...newData, tradeInPercent: newTradeInPercent },
          calculated: newCalc,
          tradeValues: newTradeValues ?? tradeValues,
        });
      } else {
        // Before lookup: just update calculated values, preserve slider defaults
        set({
          data: newData,
          calculated: newCalc,
          tradeValues: newTradeValues ?? tradeValues,
        });
      }
    } else if (driverId === 'trade-in-percent-slider') {
      // Trade-in % slider drives: recalculate margin to match
      const newCalc = calculateValuation(newData, driverId, isLookupComplete, currentTradeValues);

      if (hasRealValues) {
        set({
          data: { ...newData, targetMarginPercent: newCalc.calculatedMarginPercent },
          calculated: newCalc,
          tradeValues: newTradeValues ?? tradeValues,
        });
      } else {
        set({
          data: newData,
          calculated: newCalc,
          tradeValues: newTradeValues ?? tradeValues,
        });
      }
    } else {
      // All other drivers (condition, prep cost, retail, rv-type):
      // Use margin-driven formula, then update trade-in % to match
      const newCalc = calculateValuation(newData, driverId, isLookupComplete, currentTradeValues);

      if (hasRealValues) {
        const newTradeInPercent = calculateTradeInPercentFromMargin(
          newCalc.bishTIVBase,
          newCalc.finalTradeOffer
        );
        set({
          data: { ...newData, tradeInPercent: newTradeInPercent },
          calculated: newCalc,
          tradeValues: newTradeValues ?? tradeValues,
        });
      } else {
        set({
          data: newData,
          calculated: newCalc,
          tradeValues: newTradeValues ?? tradeValues,
        });
      }
    }
  },

  resetForNewValuation: () => {
    const { data, tradeValues } = get();

    // Reset condition-related fields and valuation levers to defaults
    // These fields should NOT persist between valuations
    const resetData: Partial<TradeData> = {
      conditionScore: DEFAULT_CONDITION_SCORE,
      majorIssues: '',
      unitAddOns: '',
      additionalPrepCost: DEFAULT_ADDITIONAL_PREP_COST,
      valuationNotes: '',
      targetMarginPercent: TARGET_MARGIN_PERCENT,
      tradeInPercent: DEFAULT_TRADE_IN_PERCENT,
      retailPriceSource: 'jdpower',
      customRetailValue: 0,
    };

    const newData = { ...data, ...resetData };
    const newCalc = calculateValuation(newData, 'initial-load', true, tradeValues);
    const newTradeInPercent = calculateTradeInPercentFromMargin(
      newCalc.bishTIVBase,
      newCalc.finalTradeOffer
    );

    set({
      data: { ...newData, tradeInPercent: newTradeInPercent },
      calculated: newCalc,
      evaluationCreatedBy: undefined,
      evaluationCreatedDate: undefined,
      evaluationId: null,
    });
  },

  resetLookupFields: () => {
    set((state) => ({
      data: {
        ...state.data,
        jdPowerManufacturerId: null,
        jdPowerModelTrimId: null,
        manufacturerName: '',
        customManufacturer: undefined,
        year: null,
        make: '',
        customMake: undefined,
        model: '',
        customModel: undefined,
        mileage: null,
      },
      isLookupComplete: false,
      tradeValues: undefined,
    }));
  },

  setTradeValues: (values) => {
    set({ tradeValues: values });
  },

  setIsLookupComplete: (value) => {
    set({ isLookupComplete: value });
  },

  setIsLoading: (value) => {
    set({ isLoading: value });
  },

  setIsSubmitting: (value) => {
    set({ isSubmitting: value });
  },

  setEvaluationId: (id) => {
    set({ evaluationId: id });
  },

  loadEvaluation: (evaluation) => {
    const parseNum = (val: string | null | undefined) => val ? parseFloat(val) : 0;

    // Load all form data from saved evaluation
    const loadedData: TradeData = {
      customerFirstName: evaluation.customerFirstName || '',
      customerLastName: evaluation.customerLastName || '',
      customerPhone: evaluation.customerPhone || '',
      customerEmail: evaluation.customerEmail || '',
      stockNumber: evaluation.stockNumber || '',
      location: evaluation.location || DEFAULT_LOCATION,
      year: evaluation.year,
      make: evaluation.make || '',
      model: evaluation.model || '',
      vin: evaluation.vin || '',
      rvType: isValidRvType(evaluation.rvType) ? evaluation.rvType : DEFAULT_RV_TYPE,
      mileage: evaluation.mileage,
      originalListPrice: null,
      jdPowerManufacturerId: evaluation.jdPowerManufacturerId,
      jdPowerModelTrimId: evaluation.jdPowerModelTrimId,
      manufacturerName: '',
      conditionScore: evaluation.conditionScore || DEFAULT_CONDITION_SCORE,
      majorIssues: evaluation.majorIssues || '',
      unitAddOns: evaluation.unitAddOns || '',
      additionalPrepCost: parseNum(evaluation.additionalPrepCost),
      avgListingPrice: parseNum(evaluation.avgListingPrice),
      tradeInPercent: evaluation.tradeInPercent ? parseFloat(evaluation.tradeInPercent) : DEFAULT_TRADE_IN_PERCENT,
      targetMarginPercent: evaluation.targetMarginPercent ? parseFloat(evaluation.targetMarginPercent) : TARGET_MARGIN_PERCENT,
      retailPriceSource: (evaluation.retailPriceSource as 'jdpower' | 'custom') || 'jdpower',
      customRetailValue: parseNum(evaluation.customRetailValue),
      valuationNotes: evaluation.valuationNotes || '',
    };

    // Load all calculated values directly from saved evaluation - don't recalculate
    const loadedCalc: CalculatedValues = {
      jdPowerTradeIn: parseNum(evaluation.jdPowerTradeIn),
      jdPowerRetailValue: parseNum(evaluation.jdPowerRetailValue),
      bishAdjustedTradeIn: parseNum(evaluation.bishTivBase), // Use bishTivBase as adjusted value
      pdiCost: parseNum(evaluation.pdiCost),
      reconCost: parseNum(evaluation.reconCost),
      soldPrepCost: parseNum(evaluation.soldPrepCost),
      totalPrepCosts: parseNum(evaluation.totalPrepCosts),
      bishTIVBase: parseNum(evaluation.bishTivBase),
      totalUnitCosts: parseNum(evaluation.totalUnitCosts),
      avgCompPrice: parseNum(evaluation.avgCompPrice),
      calculatedRetailPrice: parseNum(evaluation.calculatedRetailPrice),
      replacementCost: parseNum(evaluation.replacementCost),
      activeRetailPrice: parseNum(evaluation.activeRetailPrice),
      finalTradeOffer: parseNum(evaluation.finalTradeOffer),
      calculatedMarginAmount: parseNum(evaluation.calculatedMarginAmount),
      calculatedMarginPercent: parseNum(evaluation.calculatedMarginPercent),
    };

    // Reconstruct tradeValues from saved evaluation so sliders can recalculate
    const conditionKey = (evaluation.conditionScore || DEFAULT_CONDITION_SCORE).toString();
    const loadedTradeValues: TradeValues = {
      jdPowerTradeIn: parseNum(evaluation.jdPowerTradeIn),
      bishAdjustedTradeIn: parseNum(evaluation.bishTivBase),
      usedRetail: parseNum(evaluation.jdPowerRetailValue),
      valuationResults: {
        [conditionKey]: {
          original_trade_value: parseNum(evaluation.jdPowerTradeIn),
          adjusted_value: parseNum(evaluation.bishTivBase),
          min_value: 0,
          max_value: 0,
          total_depreciation_percentage: 0,
          mileage_adjustment_percentage: 0,
          condition_adjustment_percentage: 0,
        },
      },
    };

    // Set flag to suppress cascading resets in JDPowerCascadingLookup
    set({
      isLoadingPriorEval: true,
      data: loadedData,
      calculated: loadedCalc,
      isLookupComplete: true, // Mark as complete so UI shows full state
      tradeValues: loadedTradeValues,
      evaluationCreatedBy: evaluation.createdBy,
      evaluationCreatedDate: evaluation.createdDate,
      evaluationId: evaluation.tradeEvaluationId,
    });

    // Clear the flag after effects have run
    setTimeout(() => {
      set({ isLoadingPriorEval: false });
    }, 100);
  },

  reset: () => {
    const newCalc = calculateValuation(initialData, 'initial-load', false, undefined);
    const newTradeInPercent = calculateTradeInPercentFromMargin(
      newCalc.bishTIVBase,
      newCalc.finalTradeOffer
    );

    set({
      data: { ...initialData, tradeInPercent: newTradeInPercent },
      calculated: newCalc,
      tradeValues: undefined,
      isLookupComplete: false,
      isLoading: false,
      isSubmitting: false,
      isLoadingPriorEval: false,
      evaluationCreatedBy: undefined,
      evaluationCreatedDate: undefined,
      evaluationId: null,
    });
  },
}));

// Selectors
export const useTradeData = () => useTradeStore((state) => state.data);
export const useCalculated = () => useTradeStore((state) => state.calculated);
export const useIsLookupComplete = () => useTradeStore((state) => state.isLookupComplete);
export const useIsLoading = () => useTradeStore((state) => state.isLoading);
export const useIsSubmitting = () => useTradeStore((state) => state.isSubmitting);
export const useTradeValues = () => useTradeStore((state) => state.tradeValues);
export const useIsLoadingPriorEval = () => useTradeStore((state) => state.isLoadingPriorEval);
export const useEvaluationCreatedBy = () => useTradeStore((state) => state.evaluationCreatedBy);
export const useEvaluationCreatedDate = () => useTradeStore((state) => state.evaluationCreatedDate);

// Derived selectors
export const useDepreciation = () => {
  const tradeValues = useTradeStore((state) => state.tradeValues);
  const conditionScore = useTradeStore((state) => state.data.conditionScore);

  const result = tradeValues?.valuationResults?.[conditionScore.toString()];
  if (!result) return undefined;

  return {
    monthsToSell: result.months_to_sell,
    vehicleAge: result.vehicle_age,
    totalDepreciationPercent: result.total_depreciation_percentage,
    depreciationMonths: result.depreciation_months,
  };
};

export const useEvaluationId = () => useTradeStore((state) => state.evaluationId);
