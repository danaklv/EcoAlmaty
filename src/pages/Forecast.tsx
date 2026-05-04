import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fetchForecast, fetchRawForecast, type ForecastResponse, type MetricStat, type RawDataPoint } from '@/services/forecast';
import { TrendingUp, TrendingDown, Minus, Wind, Users, Car, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const TREND_ICON = {
  up: <TrendingUp className="h-4 w-4 text-red-500" />,
  down: <TrendingDown className="h-4 w-4 text-green-500" />,
  flat: <Minus className="h-4 w-4 text-gray-400" />,
};

const METRIC_COLORS: Record<string, string> = {
  CO_mg_m3: '#ef4444',
  NO2_mg_m3: '#f97316',
  SO2_mg_m3: '#eab308',
  TSP_mg_m3: '#8b5cf6',
  population_total: '#3b82f6',
  transport_total: '#10b981',
};

const AIR_METRICS = ['CO_mg_m3', 'NO2_mg_m3', 'SO2_mg_m3', 'TSP_mg_m3'];

function MetricCard({ stat }: { stat: MetricStat }) {
  const sign = stat.change_pct !== null && stat.change_pct >= 0 ? '+' : '';
  const pct = stat.change_pct !== null ? `${sign}${stat.change_pct.toFixed(1)}%` : '—';
  const color = METRIC_COLORS[stat.metric] || '#6b7280';

  return (
    <Card className="overflow-hidden">
      <div className="h-1" style={{ backgroundColor: color }} />
      <CardContent className="pt-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {stat.metric === 'population_total' ? (
              <Users className="h-4 w-4 text-muted-foreground" />
            ) : stat.metric === 'transport_total' ? (
              <Car className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Wind className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-sm font-medium">{stat.name}</span>
          </div>
          <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{stat.accuracy_pct}%</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Start → End</p>
            <p className="text-sm">{stat.start_value.toLocaleString('ru-RU', { maximumFractionDigits: 3 })} {stat.unit}</p>
            <p className="text-sm font-semibold">{stat.end_value.toLocaleString('ru-RU', { maximumFractionDigits: 3 })} {stat.unit}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            {TREND_ICON[stat.trend]}
            <span className={`text-lg font-bold ${stat.change_pct !== null && stat.change_pct > 0 ? 'text-red-500' : 'text-green-600'}`}>
              {pct}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ForecastChart({ data, metric }: { data: RawDataPoint[]; metric: string }) {
  const points = data.filter(d => d.metric === metric);
  const color = METRIC_COLORS[metric] || '#6b7280';

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={points} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} width={65} />
        <Tooltip formatter={(v: number) => v.toFixed(4)} labelFormatter={l => `${l} year`} />
        <Legend />
        <Line type="monotone" dataKey="p10" stroke={color} strokeOpacity={0.4} dot={false} name="Optimistic" strokeDasharray="4 4" />
        <Line type="monotone" dataKey="p50" stroke={color} strokeWidth={2} dot={false} name="Baseline" />
        <Line type="monotone" dataKey="p90" stroke={color} strokeOpacity={0.4} dot={false} name="Pessimistic" strokeDasharray="4 4" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default function Forecast() {
  const [horizon, setHorizon] = useState(20);
  const [lang, setLang] = useState<'ru' | 'en'>('ru');
  const [data, setData] = useState<ForecastResponse | null>(null);
  const [rawData, setRawData] = useState<RawDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeMetric, setActiveMetric] = useState<string>('CO_mg_m3');

  const handleFetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const [forecast, raw] = await Promise.all([
        fetchForecast(horizon, lang),
        fetchRawForecast(horizon, AIR_METRICS),
      ]);
      setData(forecast);
      setRawData(raw.data);
      setActiveMetric('CO_mg_m3');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="bg-gradient-forest rounded-2xl p-8 text-primary-foreground">
          <h1 className="text-3xl font-bold mb-2"> AI Air Quality Forecast</h1>
          <p className="text-primary-foreground/80">Forecast powered by Amazon Chronos model. Data for Almaty starting from 2026.</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-muted-foreground">Forecast horizon (years)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range" min={5} max={100} value={horizon}
                    onChange={e => setHorizon(Number(e.target.value))}
                    className="w-40 accent-green-600"
                  />
                  <span className="text-xl font-bold w-10 text-center">{horizon}</span>
                </div>
                <p className="text-xs text-muted-foreground">2026 → {2026 + horizon}</p>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-muted-foreground">Language</label>
                <div className="flex gap-2">
                  {(['ru', 'en'] as const).map(l => (
                    <button key={l} onClick={() => setLang(l)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${lang === l ? 'bg-green-600 text-white' : 'bg-muted text-muted-foreground'}`}>
                      {l.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <Button onClick={handleFetch} disabled={loading} className="ml-auto" size="lg">
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Loading... (up to 30 sec)</> : 'Build Forecast'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6 flex items-center gap-3 text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-medium">Error</p>
                <p className="text-sm">{error}</p>
                <p className="text-xs mt-1 text-red-500">ML service may be unavailable. Please try again later.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {data && (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle>Forecast {data.start_year}–{data.end_year}</CardTitle>
                  <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-semibold">Accuracy: {data.overall_accuracy}%</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg leading-relaxed font-sans">
                  {data.summary}
                </pre>
              </CardContent>
            </Card>

            <div>
              <h2 className="text-lg font-semibold mb-3">Metrics</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.statistics.map(stat => <MetricCard key={stat.metric} stat={stat} />)}
              </div>
            </div>

            {rawData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Pollutant Forecast Chart</CardTitle>
                  <p className="text-sm text-muted-foreground">p10 — optimistic, p50 — baseline, p90 — pessimistic scenario</p>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {AIR_METRICS.map(m => {
                      const stat = data.statistics.find(s => s.metric === m);
                      return (
                        <button key={m} onClick={() => setActiveMetric(m)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${activeMetric === m ? 'text-white border-transparent' : 'bg-muted text-muted-foreground border-transparent'}`}
                          style={activeMetric === m ? { backgroundColor: METRIC_COLORS[m] } : {}}>
                          {stat?.name ?? m}
                        </button>
                      );
                    })}
                  </div>
                  <ForecastChart data={rawData} metric={activeMetric} />
                </CardContent>
              </Card>
            )}
          </>
        )}

        {!data && !loading && !error && (
          <div className="text-center py-16 text-muted-foreground">
            <div className="text-6xl mb-4">🌍</div>
            <p className="text-lg font-medium">Select a horizon and click "Build Forecast"</p>
            <p className="text-sm mt-1">The first request may take up to 30 seconds</p>
          </div>
        )}
      </div>
    </Layout>
  );
}