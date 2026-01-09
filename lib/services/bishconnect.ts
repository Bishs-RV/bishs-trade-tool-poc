const BISHCONNECT_API_URL =
  process.env.BISHCONNECT_API_URL ||
  "https://tda8qlrrmi.execute-api.us-west-2.amazonaws.com/test";

export interface TradeValueParams {
  year: number;
  manufacturer: string;
  make?: string;
  model: string;
  mileage?: number;
  condition?: number; // 1-10
}

export interface TradeValueResponse {
  unit: {
    manufacturer: string;
    model: string;
    year: number;
  };
  values: {
    trade_in: number;
    used_retail: number;
  };
  specs: {
    coach_design: string;
    floor_plan: string;
    fuel_type: string;
  };
  valuation_result?: {
    original_trade_value: number;
    adjusted_value: number;
    depreciation_percentage: number;
  };
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60000) {
    return cachedToken.token;
  }

  const clientId = process.env.BISHCONNECT_CLIENT_ID;
  const clientSecret = process.env.BISHCONNECT_CLIENT_SECRET;
  const authUrl = process.env.BISHCONNECT_AUTH_URL;

  if (!clientId || !clientSecret || !authUrl) {
    throw new Error(
      "BishConnect OAuth credentials not configured. Set BISHCONNECT_CLIENT_ID, BISHCONNECT_CLIENT_SECRET, and BISHCONNECT_AUTH_URL environment variables."
    );
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );

  const response = await fetch(authUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(
      `BishConnect auth failed: ${response.status} ${response.statusText}`
    );
  }

  const data: TokenResponse = await response.json();

  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return cachedToken.token;
}

export async function fetchTradeValue(
  params: TradeValueParams
): Promise<TradeValueResponse> {
  const token = await getAccessToken();

  const queryParams = new URLSearchParams({
    year: params.year.toString(),
    manufacturer: params.manufacturer,
    model: params.model,
  });

  if (params.make) {
    queryParams.set("make", params.make);
  }
  if (params.mileage !== undefined) {
    queryParams.set("mileage", params.mileage.toString());
  }
  if (params.condition !== undefined) {
    queryParams.set("condition", params.condition.toString());
  }

  const url = `${BISHCONNECT_API_URL}/trade-value/?${queryParams.toString()}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `BishConnect trade-value API error: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  return response.json();
}
