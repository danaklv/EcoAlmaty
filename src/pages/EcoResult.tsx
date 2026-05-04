import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';
import { useSearchParams, Link } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle, Leaf, TrendingUp, TrendingDown, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

interface EcoBreakdown {
  category: string;
  score: number;
  max_score: number;
  percent: number;
  level: string;
}

interface EcoRecommendation {
  question: string;
  category: string;
  answer: number;
  max_value: number;
  impact: number;
  tip: string;
}

interface EcoResult {
  id: number;
  total_score: number;
  max_score: number;
  percent: number;
  category: string;
  description: string;
  strongest_category?: string;
  weakest_category?: string;
  created_at: string;
  breakdown: EcoBreakdown[];
  recommendations: EcoRecommendation[];
}

const categoryColors: Record<string, string> = {
  'Eco Leader': 'bg-emerald-100 text-emerald-700',
  'Eco Aware':  'bg-blue-100 text-blue-700',
  'Developing': 'bg-yellow-100 text-yellow-700',
  'Needs Work': 'bg-orange-100 text-orange-700',
  'Critical':   'bg-red-100 text-red-700',
};

const levelColors: Record<string, string> = {
  'Excellent': 'bg-emerald-100 text-emerald-700',
  'Good':      'bg-blue-100 text-blue-700',
  'Average':   'bg-yellow-100 text-yellow-700',
  'Poor':      'bg-orange-100 text-orange-700',
  'Critical':  'bg-red-100 text-red-700',
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

export default function EcoResult() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  const [result, setResult] = useState<EcoResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setError('No result ID provided');
      setLoading(false);
      return;
    }
    fetchResult();
  }, [id]);

  const fetchResult = async () => {
    try {
      const res = await api.get(`/eco/result?id=${id}`);
      setResult(res.data);
    } catch {
      setError('Failed to load result');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error || !result) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-destructive font-medium">{error || 'Result not found'}</p>
          <Link to="/eco-history">
            <Button variant="outline">Back to History</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto space-y-6"
      >
        {/* Back button */}
        <Link to="/eco-history">
          <Button variant="ghost" size="sm" className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back to History
          </Button>
        </Link>

        {/* Header */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-forest p-6 text-primary-foreground text-center">
            <CheckCircle className="h-16 w-16 mx-auto mb-4" />
            <div className="text-5xl font-bold mb-2">{Math.round(result.percent)}%</div>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-2 ${categoryColors[result.category] || 'bg-white/20 text-white'}`}>
              {result.category}
            </div>
            <p className="text-primary-foreground/80 text-sm mt-2">
              {safeFormat(result.created_at, 'MMM d, yyyy • HH:mm')}
            </p>
          </div>
          <CardContent className="p-6">
            <p className="text-muted-foreground text-center">{result.description}</p>
            <div className="flex justify-center gap-6 mt-4 text-sm">
              {result.strongest_category && (
                <div className="flex items-center gap-1 text-emerald-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>Best: <strong>{result.strongest_category}</strong></span>
                </div>
              )}
              {result.weakest_category && (
                <div className="flex items-center gap-1 text-red-500">
                  <TrendingDown className="h-4 w-4" />
                  <span>Weak: <strong>{result.weakest_category}</strong></span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Breakdown */}
        {result.breakdown && result.breakdown.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Leaf className="h-5 w-5 text-primary" />
                Category Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.breakdown.map((b) => (
                <div key={b.category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium capitalize">{b.category}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${levelColors[b.level] || 'bg-muted text-muted-foreground'}`}>
                        {b.level}
                      </span>
                      <span className="text-sm text-muted-foreground">{Math.round(b.percent)}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${b.percent}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        {result.recommendations && result.recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.recommendations.map((rec, i) => (
                <div key={i} className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm text-muted-foreground">{rec.question}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary shrink-0 capitalize">
                      {rec.category}
                    </span>
                  </div>
                  <p className="text-sm font-medium flex items-start gap-2">
                    <Leaf className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    {rec.tip}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Link to="/eco-test" className="flex-1">
            <Button className="w-full">Retake Test</Button>
          </Link>
          <Link to="/eco-history" className="flex-1">
            <Button variant="outline" className="w-full">View History</Button>
          </Link>
        </div>

      </motion.div>
    </Layout>
  );
}