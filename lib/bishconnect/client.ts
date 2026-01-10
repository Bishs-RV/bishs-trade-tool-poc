'use server'

import { getBishConnectToken } from './auth'

interface TradeValueResponse {
  values: {
    trade_in: number
  }
}

interface GetTradeValueParams {
  modelTrimId: number
  condition: number // 1-10 scale
  mileage?: number
  options?: string // pipe-delimited option codes
}

/**
 * Get trade-in value from BishConnect API
 */
export async function getTradeValue({
  modelTrimId,
  condition,
  mileage,
  options,
}: GetTradeValueParams): Promise<number> {
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
  return data.values.trade_in
}
