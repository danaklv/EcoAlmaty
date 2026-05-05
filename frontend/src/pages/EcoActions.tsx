import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Leaf, Recycle, Droplets, Zap, Bike, TreePine, ShoppingBag, Utensils, Loader2, CheckCircle2, Info } from 'lucide-react';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface EcoAction {
  id: number;
  name: string;
  points: number;
  category: string;
}

const categoryConfig: Record<string, { icon: any; color: string; bg: string }> = {
  water:    { icon: Droplets,    color: 'text-blue-500',    bg: 'bg-blue-100' },
  energy:   { icon: Zap,         color: 'text-yellow-500',  bg: 'bg-yellow-100' },
  transport:{ icon: Bike,        color: 'text-green-500',   bg: 'bg-green-100' },
  food:     { icon: Utensils,    color: 'text-orange-500',  bg: 'bg-orange-100' },
  waste:    { icon: Recycle,     color: 'text-emerald-500', bg: 'bg-emerald-100' },
  nature:   { icon: TreePine,    color: 'text-green-700',   bg: 'bg-green-100' },
  shopping: { icon: ShoppingBag, color: 'text-purple-500',  bg: 'bg-purple-100' },
  default:  { icon: Leaf,        color: 'text-green-500',   bg: 'bg-green-100' },
};

function isToday(date: Date): boolean {
  if (isNaN(date.getTime())) return false;
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

export default function EcoActions() {
  const { updateUser, user } = useAuth();
  const { t } = useTranslation();
  const [actions, setActions] = useState<EcoAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState<number | null>(null);
  const [completedToday, setCompletedToday] = useState<Set<number>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    fetchActions();
    fetchCompletedToday();
  }, []);

  const fetchActions = async () => {
    try {
      const res = await api.get('/eco-actions');
      setActions(res.data || []);
    } catch {
      toast.error(t('ecoActions.failedLoad'));
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedToday = async () => {
    try {
      const res = await api.get('/user-actions');
      const list: any[] = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.items)
          ? res.data.items
          : [];
      const ids = new Set<number>(
        list
          .filter((a: any) => isToday(new Date(a.created_at)))
          .map((a: any) => Number(a.action_id))
          .filter((id: number) => !Number.isNaN(id) && id > 0)
      );
      setCompletedToday(ids);
    } catch {}
  };

  const handleCompleteAction = async (actionId: number, points: number) => {
    setLoadingAction(actionId);
    try {
      const response = await api.post('/add-action', { action_id: actionId });
      const { new_rating, new_level, new_league } = response.data;

      updateUser({ rating: new_rating, level: new_level, league: new_league });
      setCompletedToday(prev => new Set([...prev, actionId]));
      toast.success(t('ecoActions.pointsEarned', { points }));

      if (new_level > (user?.level || 0)) {
        toast.success(t('ecoActions.levelUp', { level: new_level }));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || t('ecoActions.failedComplete'));
    } finally {
      setLoadingAction(null);
    }
  };

  const categories = ['all', ...Array.from(new Set(actions.map(a => a.category)))];
  const filtered = activeCategory === 'all' ? actions : actions.filter(a => a.category === activeCategory);
  const doneCount = filtered.filter(a => completedToday.has(a.id)).length;

  return (
    <Layout>
      <div className="space-y-6">

        <div className="bg-gradient-forest rounded-2xl p-6 text-primary-foreground">
          <h1 className="text-2xl font-bold mb-1">{t('ecoActions.title')}</h1>
          <p className="text-primary-foreground/80 text-sm">{t('ecoActions.subtitle')}</p>
          {!loading && filtered.length > 0 && (
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 bg-white/20 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="bg-white h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(doneCount / filtered.length) * 100}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
              <span className="text-sm font-semibold shrink-0">{doneCount}/{filtered.length}</span>
            </div>
          )}
        </div>

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
              {cat === 'all' ? t('ecoActions.all') : t(`ecoActions.categories.${cat}`, { defaultValue: cat })}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map(action => {
              const config = categoryConfig[action.category] || categoryConfig.default;
              const Icon = config.icon;
              const done = completedToday.has(action.id);

              return (
                <motion.div
                  key={action.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className={`relative overflow-hidden h-full flex flex-col transition-colors duration-500 ${
                    done ? 'bg-emerald-50 border-emerald-200' : 'hover:shadow-md'
                  }`}>
                    <AnimatePresence>
                      {done && (
                        <motion.div
                          key="shimmer"
                          initial={{ x: '-100%' }}
                          animate={{ x: '200%' }}
                          transition={{ duration: 0.65, ease: 'easeInOut' }}
                          className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-emerald-100/60 to-transparent pointer-events-none z-10"
                        />
                      )}
                    </AnimatePresence>

                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className={`p-3 rounded-full transition-colors duration-300 ${done ? 'bg-emerald-100' : config.bg}`}>
                          <AnimatePresence mode="wait">
                            {done ? (
                              <motion.div key="check"
                                initial={{ scale: 0, rotate: -90 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 18 }}>
                                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                              </motion.div>
                            ) : (
                              <motion.div key="icon">
                                <Icon className={`h-6 w-6 ${config.color}`} />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors duration-300 ${
                          done ? 'bg-emerald-100 text-emerald-600' : 'bg-green-100 text-green-700'
                        }`}>
                          +{action.points} pts
                        </span>
                      </div>
                      <CardTitle className={`mt-3 text-base transition-colors duration-300 ${done ? 'text-emerald-700' : ''}`}>
                        {action.name}
                      </CardTitle>
                      <CardDescription className="text-xs capitalize">
                        {t(`ecoActions.categories.${action.category}`, { defaultValue: action.category })}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="mt-auto">
                      <Button
                        className={`w-full transition-all duration-300 ${
                          done ? 'bg-emerald-500 hover:bg-emerald-500 text-white cursor-default' : ''
                        }`}
                        onClick={() => !done && handleCompleteAction(action.id, action.points)}
                        disabled={loadingAction === action.id || done}
                      >
                        <AnimatePresence mode="wait">
                          {loadingAction === action.id ? (
                            <motion.span key="loading" className="flex items-center gap-2"
                              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              {t('ecoActions.completing')}
                            </motion.span>
                          ) : done ? (
                            <motion.span key="done" className="flex items-center gap-2"
                              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                              <CheckCircle2 className="h-4 w-4" />
                              {t('ecoActions.completedToday')}
                            </motion.span>
                          ) : (
                            <motion.span key="idle"
                              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                              {t('ecoActions.completeAction')}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="flex items-start gap-3 bg-muted rounded-xl px-4 py-3 text-sm text-muted-foreground">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <p>{t('ecoActions.resetNote')}</p>
        </div>
      </div>
    </Layout>
  );
}