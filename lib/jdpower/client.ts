'use server'

import type {
  GetMakesResponse,
  GetModelTrimsResponse,
  GetOptionsResponse,
  MakeCategory,
  ModelTrim,
  ModelTrimOption,
} from './types'

const JDPOWER_BASE_URL = 'https://demo.jdpowerwebservices.com/UsedRVsService.svc'

function getJDPowerAuth(): string {
  const username = process.env.JDPOWER_USERNAME
  const password = process.env.JDPOWER_PASSWORD

  if (!username || !password) {
    throw new Error('JDPOWER_USERNAME and JDPOWER_PASSWORD must be set')
  }

  return 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64')
}

async function fetchJDPowerData<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Authorization: getJDPowerAuth(),
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`JD Power API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data as T
}

/**
 * Fetch manufacturers (makes) for a given year and RV category
 * @param year - The model year
 * @param rvCategoryId - The RV category ID (1-6)
 */
export async function fetchMakes(
  year: number,
  rvCategoryId: number
): Promise<MakeCategory[]> {
  const url = `${JDPOWER_BASE_URL}/Makes/${year}/${year}/${rvCategoryId}`
  const data = await fetchJDPowerData<GetMakesResponse>(url)
  return data.GetMakesResult.MakeCategoryList
}

/**
 * Fetch model trims for a given manufacturer, year, and RV category
 * @param makeId - The manufacturer ID from Makes endpoint
 * @param year - The model year
 * @param rvCategoryId - The RV category ID (1-6)
 */
export async function fetchModelTrims(
  makeId: number,
  year: number,
  rvCategoryId: number
): Promise<ModelTrim[]> {
  const url = `${JDPOWER_BASE_URL}/ModelTrims/${makeId}/${year}/${rvCategoryId}`
  const data = await fetchJDPowerData<GetModelTrimsResponse>(url)
  return data.GetModelTrimsResult.ModelTrims
}

/**
 * Fetch options for a given model trim
 * @param modelTrimId - The model trim ID from ModelTrims endpoint
 */
export async function fetchModelTrimOptions(
  modelTrimId: number
): Promise<ModelTrimOption[]> {
  const url = `${JDPOWER_BASE_URL}/Options/${modelTrimId}`
  const data = await fetchJDPowerData<GetOptionsResponse>(url)
  return data.GetOptionsResult.Options
}
