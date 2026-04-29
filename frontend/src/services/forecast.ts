const BASE_URL = "https://shimmy-unequal-rubbing.ngrok-free.dev";
const headers = {
  "Content-Type": "application/json",
  "ngrok-Skip-Browser-Warning": "true",
};

export interface MetricStat {
  metric: string; name: string;
  start_value: number; end_value: number;
  change_pct: number | null;
  trend: "up" | "down" | "flat";
  unit: string; accuracy_pct: number;
}
export interface ForecastResponse {
  status: string; horizon: number;
  start_year: number; end_year: number;
  lang: string; overall_accuracy: number;
  summary: string; statistics: MetricStat[];
}
export interface RawDataPoint {
  year: number; metric: string;
  p10: number; p50: number; p90: number;
}
export interface RawForecastResponse {
  status: string; horizon: number; start_year: number;
  metrics_returned: number; total_points: number;
  data: RawDataPoint[];
}

export async function fetchForecast(horizon: number, lang: "ru" | "en"): Promise<ForecastResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/bot/forecast`, {
    method: "POST", headers,
    body: JSON.stringify({ horizon, lang }),
  });
  if (!res.ok) { const err = await res.json().catch(() => ({ detail: "Ошибка" })); throw new Error(err.detail); }
  return res.json();
}
export async function fetchRawForecast(horizon: number, metrics: string[]): Promise<RawForecastResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/forecast/`, {
    method: "POST", headers,
    body: JSON.stringify({ horizon, metrics }),
  });
  if (!res.ok) throw new Error("Raw forecast failed");
  return res.json();
}