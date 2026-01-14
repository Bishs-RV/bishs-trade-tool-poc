// JD Power API Response Types

// Makes endpoint response
export interface MakeReturnTO {
  MakeID: number
  MakeDisplayName: string
}

export interface CategoryReturnTO {
  CategoryID: number
  CategoryDisplayName: string
  CategoryName: string
}

export interface MakeCategory {
  VersionID: number
  VersionName: string
  makeReturnTO: MakeReturnTO
  categoryReturnTO: CategoryReturnTO
}

export interface GetMakesResult {
  MakeCategoryList: MakeCategory[]
}

export interface GetMakesResponse {
  GetMakesResult: GetMakesResult
}

// ModelTrims endpoint response
export interface ModelTrim {
  CategoryID: number
  CategoryName: string
  FuelType: string | null
  LengthInches: number
  ModelSeries: string // This is displayed as "Make" in UI
  ModelTrimID: number // Key for BishConnect valuation
  ModelTrimName: string // This is displayed as "Model" in UI
  ModelTrimNotes: string[]
}

export interface GetModelTrimsResult {
  ModelTrims: ModelTrim[]
}

export interface GetModelTrimsResponse {
  GetModelTrimsResult: GetModelTrimsResult
}

// Options endpoint response
export interface ModelTrimOption {
  OptionGroup: string
  OptionGroupID: number
  OptionDisplayName: string
  OptionCode: string
}

export interface GetOptionsResult {
  Options: ModelTrimOption[]
}

export interface GetOptionsResponse {
  GetOptionsResult: GetOptionsResult
}

// Years endpoint response
export interface YearInfo {
  Year: number
  YearType: string
}

export interface GetYearsResult {
  Make: MakeReturnTO
  VersionTO: {
    VersionID: number
    VersionName: string
  }
  Years: YearInfo[]
}

export interface GetYearsResponse {
  GetYearsResult: GetYearsResult
}

// Simplified types for frontend use
export interface Manufacturer {
  id: number
  name: string
}

export interface Make {
  modelSeries: string
}

export interface Model {
  id: number
  name: string
  modelSeries: string
  fuelType: string | null
  lengthInches: number
}
