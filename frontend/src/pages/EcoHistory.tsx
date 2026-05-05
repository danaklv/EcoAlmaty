import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';
import { Link } from 'react-router-dom';
import { Loader2, Leaf, ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

interface EcoHistoryItem {
  result_id: number;
  total_score: number;
  max_score: number;
  percent: number;
  category: string;
  description: string;
  strongest_category?: string;
  weakest_category?: string;
  created_at: string;
}

interface EcoProgressItem {
  taken_at: string;
  percent: number;
}

interface EcoProgressData {
  overall_points: EcoProgressItem[];
  overall_current: number;
  overall_direction: string;
  tests_count: number;
}

const categoryColors: Record<string, string> = {
  'Eco Leader': 'bg-emerald-100 text-emerald-700',
  'Eco Aware':  'bg-blue-100 text-blue-700',
  'Developing': 'bg-yellow-100 text-yellow-700',
  'Needs Work': 'bg-orange-100 text-orange-700',
  'Critical':   'bg-red-100 text-red-700',
};

function safeFormat(dateStr: string, fmt: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return format(d, fmt);
  } catch {
    return '';
  }
}

function getTrend(current: number, previous?: number) {
  if (previous === undefined) return null;
  if (current > previous) return <TrendingUp className="h-4 w-4 text-emerald-500" />;
  if (current < previous) return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}

export default function EcoHistory() {
  const { t } = useTranslation();
  const [history, setHistory] = useState<EcoHistoryItem[]>([]);
  const [progress, setProgress] = useState<EcoProgressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [limit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (newOffset = 0) => {
    setLoading(true);
    try {
      const [histRes, progRes] = await Promise.all([
        api.get(`/eco/history?limit=${limit}&offset=${newOffset}`),
        api.get('/eco/progress?days=30'),
      ]);
        console.log('history response:', histRes.data);
        console.log('progress response:', progRes.data);

      const histItems: EcoHistoryItem[] = Array.isArray(histRes.data)
        ? histRes.data
        : histRes.data?.items || [];

      setProgress(progRes.data?.overall_points || []);

      if (newOffset === 0) {
        setHistory(histItems);
      } else {
        setHistory(prev => [...prev, ...histItems]);
      }

      setHasMore(histItems.length === limit);
      setOffset(newOffset + limit);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const maxPercent = Math.max(...progress.map(p => p.percent), 1);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-gradient-forest rounded-2xl p-6 text-primary-foreground">
          <h1 className="text-2xl font-bold mb-1">{t('ecoHistory.title')}</h1>
          <p className="text-primary-foreground/80 text-sm">{t('ecoHistory.subtitle')}</p>
        </div>

        {/* Progress chart */}
        {progress.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-5 w-5 text-primary" />
                {t('ecoHistory.progress')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-1 h-24">
                {progress.map((p, i) => (
                  <div key={p.taken_at || i} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div
                      className="w-full bg-primary/20 rounded-t-sm transition-all duration-300 group-hover:bg-primary/40 cursor-default"
                      style={{ height: `${(p.percent / maxPercent) * 100}%` }}
                    />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                      {Math.round(p.percent)}%
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>{progress[0]?.taken_at ? safeFormat(progress[0].taken_at, 'MMM d') : ''}</span>
                <span>{progress[progress.length - 1]?.taken_at ? safeFormat(progress[progress.length - 1].taken_at, 'MMM d') : ''}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* History list */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('ecoHistory.results')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading && history.length === 0 ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-12">
                <Leaf className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground text-sm">{t('ecoHistory.noResults')}</p>
                <Link to="/eco-test">
                  <Button className="mt-4" size="sm">{t('ecoHistory.takeFirst')}</Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {history.map((item, i) => (
                  <Link
                    key={item.result_id}
                    to={`/eco-result?id=${item.result_id}`}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">{Math.round(item.percent)}%</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[item.category] || 'bg-muted text-muted-foreground'}`}>
                          {item.category}
                        </span>
                        {getTrend(item.percent, history[i + 1]?.percent)}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {safeFormat(item.created_at, 'MMM d, yyyy • HH:mm')}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </Link>
                ))}
              </div>
            )}

            {hasMore && !loading && (
              <div className="p-4 text-center border-t border-border">
                <Button variant="ghost" size="sm" onClick={() => fetchData(offset)}>
                  {t('ecoHistory.loadMore')}
                </Button>
              </div>
            )}
            {loading && history.length > 0 && (
              <div className="flex justify-center p-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </Layout>
  );
}