import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/services/api';
import { Loader2, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface Achievement {
  id: number;
  code: string;
  title: string;
  description: string;
  icon?: string;
  category: string;
  metric: string;
  target_value: number;
  unlocked: boolean;
  unlocked_at?: string;
}

const categoryColors: Record<string, string> = {
  actions:  'bg-emerald-100 text-emerald-700',
  streak:   'bg-orange-100 text-orange-700',
  tests:    'bg-blue-100 text-blue-700',
  results:  'bg-purple-100 text-purple-700',
};

export default function Achievements() {
  const { t } = useTranslation();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const res = await api.get('/gamification/achievements');
      const data = Array.isArray(res.data) ? res.data : res.data?.items || [];
      setAchievements(data);
    } catch {
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...Array.from(new Set(achievements.map(a => a.category)))];
  const filtered = activeCategory === 'all' ? achievements : achievements.filter(a => a.category === activeCategory);
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-gradient-forest rounded-2xl p-6 text-primary-foreground">
          <h1 className="text-2xl font-bold mb-1">{t('achievements.title')}</h1>
          <p className="text-primary-foreground/80 text-sm">{t('achievements.subtitle')}</p>
          {!loading && (
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 bg-white/20 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="bg-white h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${achievements.length > 0 ? (unlockedCount / achievements.length) * 100 : 0}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
              <span className="text-sm font-semibold shrink-0">{unlockedCount}/{achievements.length}</span>
            </div>
          )}
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-primary text-white'
                  : 'bg-white border border-border text-muted-foreground hover:bg-muted'
              }`}
            >
              {cat === 'all' ? t('achievements.all') : t(`achievements.categories.${cat}`, { defaultValue: cat })}
            </button>
          ))}
        </div>

        {/* Achievements grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Card className={`relative overflow-hidden h-full transition-all duration-300 ${
                  a.unlocked
                    ? 'border-primary/30 bg-primary/5'
                    : 'opacity-60 grayscale'
                }`}>
                  <CardContent className="p-4 flex items-start gap-4">
                    {/* Icon */}
                    <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                      a.unlocked ? 'bg-primary/10' : 'bg-muted'
                    }`}>
                      {a.unlocked ? (a.icon || '🏆') : <Lock className="h-5 w-5 text-muted-foreground" />}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{a.title}</span>
                        {a.unlocked && (
                          <span className="text-xs text-emerald-600 font-medium">✓</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{a.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[a.category] || 'bg-muted text-muted-foreground'}`}>
                          {t(`achievements.categories.${a.category}`, { defaultValue: a.category })}
                        </span>
                        {a.unlocked && a.unlocked_at && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(a.unlocked_at).toLocaleDateString()}
                          </span>
                        )}
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