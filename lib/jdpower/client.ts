'use server'

import type {
  GetMakesResponse,
  GetModelTrimsResponse,
  GetOptionsResponse,
  GetYearsResponse,
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
 * Fetch manufacturers (makes) for a year range and RV category
 * @param fromYear - Starting year (defaults to 15 years ago)
 * @param toYear - Ending year (defaults to next year)
 * @param rvCategoryId - The RV category ID (1-6), 0 for all
 */
export async function fetchMakes(
  fromYear?: number,
  toYear?: number,
  rvCategoryId?: number
): Promise<MakeCategory[]> {
  const currentYear = new Date().getFullYear()
  const from = fromYear ?? currentYear - 14
  const to = toYear ?? currentYear + 1
  const categoryId = rvCategoryId ?? 0

  const url = `${JDPOWER_BASE_URL}/Makes/${from}/${to}/${categoryId}`
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

/**
 * Fetch available years for a given manufacturer
 * @param makeId - The manufacturer ID from Makes endpoint
 * @returns Array of year numbers sorted descending (newest first)
 */
export async function fetchYears(makeId: number): Promise<number[]> {
  const url = `${JDPOWER_BASE_URL}/Years/${makeId}`
  const data = await fetchJDPowerData<GetYearsResponse>(url)
  return data.GetYearsResult.Years.map(y => y.Year).sort((a, b) => b - a)
}
