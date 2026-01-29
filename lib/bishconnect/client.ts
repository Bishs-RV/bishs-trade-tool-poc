'use server'

import { getBishConnectToken } from './auth'

export interface DepreciationMonth {
  month: string
  amount: number
}

export interface ValuationResult {
  original_trade_value: number
  adjusted_value: number
  min_value: number
  max_value: number
  total_depreciation_percentage: number
  mileage_adjustment_percentage: number
  condition_adjustment_percentage: number
  months_to_sell?: number
  vehicle_age?: number
  depreciation_months?: DepreciationMonth[]
}

interface TradeValueResponse {
  values: {
    trade_in: number
    base_trade_in: number
    used_retail: number
  }
  valuation_result: ValuationResult
  valuation_results: Record<string, ValuationResult>
}

export interface TradeValueResult {
  jdPowerTradeIn: number      // Raw JD Power value (base_trade_in)
  bishAdjustedTradeIn: number // Our adjusted value after depreciation
  usedRetail: number          // JD Power retail value
  valuationResults?: Record<string, ValuationResult> // All condition-based valuations
}

interface GetTradeValueParams {
  modelTrimId: number
  condition: number // 1-10 scale
  mileage?: number
  options?: string // pipe-delimited option codes
}

/**
 * Get trade-in values from BishConnect API
 * Returns both the raw JD Power value and our adjusted value
 */
export async function getTradeValue({
  modelTrimId,
  condition,
  mileage,
  options,
}: GetTradeValueParams): Promise<TradeValueResult> {
  if (condition < 1 || condition > 10) {
    throw new Error('Condition must be between 1 and 10')
  }

  const apiUrl = process.env.BISHCONNECT_API_URL

  if (!apiUrl) {
    throw new Error('BISHCONNECT_API_URL must be set')
  }

  const token = await getBishConnectToken()

  const url = new URL(`${apiUrl}/trade-value/${modelTrimId}`)
  url.searchParams.set('condition', condition.toString())
  if (mileage !== undefined) {
    url.searchParams.set('mileage', mileage.toString())
  }
  if (options) {
    url.searchParams.set('options', options)
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`BishConnect API error: ${response.status} ${response.statusText} - ${errorBody}`)
  }

  const data = (await response.json()) as TradeValueResponse

  // Get the condition-specific valuation result if available
  const conditionKey = condition.toString()
  const conditionResult = data.valuation_results?.[conditionKey] ?? data.valuation_result

  const result: TradeValueResult = {
    jdPowerTradeIn: data.values.base_trade_in,
    bishAdjustedTradeIn: conditionResult?.adjusted_value ?? data.values.trade_in,
    usedRetail: data.values.used_retail,
    valuationResults: data.valuation_results,
  }

  return result
}

// Fuzzy match params for custom input
interface FuzzyTradeValueParams {
  year: number
  manufacturer: string
  model: string
  make?: string
  mileage?: number
  condition?: number // 1-10 scale, defaults to 5
  unitClass?: string // TT, FW, A, C
}

interface FuzzyTradeValueResponse {
  values?: {
    trade_in: number
    base_trade_in: number
    used_retail: number
  }
  valuation_result?: ValuationResult
  valuation_results?: Record<string, ValuationResult>
  unit_info?: {
    year: number
    manufacturer: string
    model: string
    make?: string
  }
  matched?: boolean
  error?: string
}

/**
 * Get trade-in values from BishConnect using fuzzy matching
 * Use this when JD Power lookup fails and user enters custom values
 */
export async function getFuzzyTradeValue({
  year,
  manufacturer,
  model,
  make,
  mileage,
  condition = 5,
  unitClass,
}: FuzzyTradeValueParams): Promise<TradeValueResult & { matched: boolean }> {
  const apiUrl = process.env.BISHCONNECT_API_URL

  if (!apiUrl) {
    throw new Error('BISHCONNECT_API_URL must be set')
  }

  const token = await getBishConnectToken()

  const url = new URL(`${apiUrl}/trade-value/`)
  url.searchParams.set('year', year.toString())
  url.searchParams.set('manufacturer', manufacturer)
  url.searchParams.set('model', model)
  if (make) {
    url.searchParams.set('make', make)
  }
  if (mileage !== undefined) {
    url.searchParams.set('mileage', mileage.toString())
  }
  url.searchParams.set('condition', condition.toString())
  if (unitClass) {
    url.searchParams.set('unit_class', unitClass)
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  })

  // Handle 404 as "no match found" instead of throwing
  if (response.status === 404) {
    return {
      jdPowerTradeIn: 0,
      bishAdjustedTradeIn: 0,
      usedRetail: 0,
      matched: false,
    }
  }

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`BishConnect fuzzy match error: ${response.status} ${response.statusText} - ${errorBody}`)
  }

  const data = (await response.json()) as FuzzyTradeValueResponse

  // If no match found, return zero values with matched=false
  if (!data.values || !data.matched) {
    return {
      jdPowerTradeIn: 0,
      bishAdjustedTradeIn: 0,
      usedRetail: 0,
      matched: false,
    }
  }

  // Get the condition-specific valuation result if available
  const conditionKey = condition.toString()
  const conditionResult = data.valuation_results?.[conditionKey] ?? data.valuation_result

  return {
    jdPowerTradeIn: data.values.base_trade_in,
    bishAdjustedTradeIn: conditionResult?.adjusted_value ?? data.values.trade_in,
    usedRetail: data.values.used_retail,
    valuationResults: data.valuation_results,
    matched: true,
  }
}
