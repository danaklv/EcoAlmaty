import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/services/api';
import { Loader2, Zap, CheckCircle2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

interface Challenge {
  id: number;
  code: string;
  title: string;
  description: string;
  scope: 'daily' | 'weekly';
  kind: string;
  category?: string;
  target_value: number;
  progress: number;
  status: 'active' | 'completed' | 'expired';
  start_date: string;
  end_date: string;
  completed_at?: string;
}

function safeFormat(dateStr: string, fmt: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return format(d, fmt);
  } catch {
    return '';
  }
}

export default function Challenges() {
  const { t } = useTranslation();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeScope, setActiveScope] = useState<'all' | 'daily' | 'weekly'>('all');

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const res = await api.get('/challenges/current');
      const data = Array.isArray(res.data) ? res.data : res.data?.items || [];
      setChallenges(data);
    } catch {
      setChallenges([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = activeScope === 'all'
    ? challenges
    : challenges.filter(c => c.scope === activeScope);

  const completedCount = challenges.filter(c => c.status === 'completed').length;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-gradient-forest rounded-2xl p-6 text-primary-foreground">
          <h1 className="text-2xl font-bold mb-1">{t('challenges.title')}</h1>
          <p className="text-primary-foreground/80 text-sm">{t('challenges.subtitle')}</p>
          {!loading && challenges.length > 0 && (
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 bg-white/20 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="bg-white h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(completedCount / challenges.length) * 100}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
              <span className="text-sm font-semibold shrink-0">{completedCount}/{challenges.length}</span>
            </div>
          )}
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {(['all', 'daily', 'weekly'] as const).map(scope => (
            <button
              key={scope}
              onClick={() => setActiveScope(scope)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeScope === scope
                  ? 'bg-primary text-white'
                  : 'bg-white border border-border text-muted-foreground hover:bg-muted'
              }`}
            >
              {t(`challenges.${scope}`)}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Zap className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground text-sm">{t('challenges.empty')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filtered.map((ch, i) => (
              <motion.div
                key={ch.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Card className={`overflow-hidden ${
                  ch.status === 'completed' ? 'border-emerald-200 bg-emerald-50/50' : ''
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">{ch.title}</span>
                          {ch.status === 'completed' && (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{ch.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          ch.scope === 'daily'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {t(`challenges.${ch.scope}`)}
                        </span>
                        {ch.status === 'completed' && ch.completed_at ? (
                          <span className="text-xs text-emerald-600">
                            ✓ {safeFormat(ch.completed_at, 'MMM d')}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {safeFormat(ch.end_date, 'MMM d')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{t('challenges.progress')}</span>
                        <span>{ch.progress}/{ch.target_value}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${
                            ch.status === 'completed' ? 'bg-emerald-500' : 'bg-primary'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((ch.progress / ch.target_value) * 100, 100)}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}