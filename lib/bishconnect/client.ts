'use server'

import { getBishConnectToken } from './auth'

interface ValuationResult {
  original_trade_value: number
  adjusted_value: number
  min_value: number
  max_value: number
  total_depreciation_percentage: number
  mileage_adjustment_percentage: number
  condition_adjustment_percentage: number
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

  console.log('[BishConnect] Fetching trade value from:', url.toString())

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
  console.log('[BishConnect] Full API response:', JSON.stringify(data, null, 2))

  // Get the condition-specific valuation result if available
  const conditionKey = condition.toString()
  const conditionResult = data.valuation_results?.[conditionKey] ?? data.valuation_result

  const result: TradeValueResult = {
    jdPowerTradeIn: data.values.base_trade_in,
    bishAdjustedTradeIn: conditionResult?.adjusted_value ?? data.values.trade_in,
    usedRetail: data.values.used_retail,
  }

  console.log('[BishConnect] Returning values:', result)

  return result
}
