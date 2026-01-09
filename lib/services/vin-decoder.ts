const NHTSA_API_URL = "https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin";

export interface VinDecodeResult {
  year: number | null;
  make: string | null;
  model: string | null;
  manufacturer: string | null;
  bodyClass: string | null;
  vehicleType: string | null;
  rawResults: NHTSAVariable[];
}

interface NHTSAVariable {
  Variable: string;
  Value: string | null;
  ValueId: string | null;
  VariableId: number;
}

interface NHTSAResponse {
  Count: number;
  Message: string;
  SearchCriteria: string;
  Results: NHTSAVariable[];
}

function getVariableValue(
  results: NHTSAVariable[],
  variableName: string
): string | null {
  const variable = results.find((r) => r.Variable === variableName);
  return variable?.Value || null;
}

export async function decodeVin(vin: string): Promise<VinDecodeResult> {
  const url = `${NHTSA_API_URL}/${vin}?format=json`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`NHTSA API error: ${response.status} ${response.statusText}`);
  }

  const data: NHTSAResponse = await response.json();

  const yearStr = getVariableValue(data.Results, "Model Year");

  return {
    year: yearStr ? parseInt(yearStr, 10) : null,
    make: getVariableValue(data.Results, "Make"),
    model: getVariableValue(data.Results, "Model"),
    manufacturer: getVariableValue(data.Results, "Manufacturer Name"),
    bodyClass: getVariableValue(data.Results, "Body Class"),
    vehicleType: getVariableValue(data.Results, "Vehicle Type"),
    rawResults: data.Results,
  };
}
