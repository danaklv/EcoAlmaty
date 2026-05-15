import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Leaf, ClipboardList, Loader2, Flame, Star, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '@/services/api';
import { useTranslation } from 'react-i18next';
import type { EcoLatestResult } from '@/types/eco';
import { format } from 'date-fns';

interface Streak {
  current_streak: number;
  longest_streak: number;
  last_action_date?: string;
}
interface Challenge {
  id: number;
  title: string;
  description: string;
  scope: 'daily' | 'weekly';
  target_value: number;
  progress: number;
  status: string;
  end_date: string;
}
interface UserAction {
  id: number;
  action_id: number;
  points: number;
  created_at: string;
}
interface DashboardProfile {
  id?: number;
  username?: string;
  email?: string;
  rating?: number;
  level?: number;
  league?: string;
}
interface DashboardResponse {
  profile?: DashboardProfile;
  leaderboard?: unknown[];
  actions?: UserAction[] | { items?: UserAction[] };
  eco_latest?: EcoLatestResult | null;
  streak?: Streak | null;
  challenges?: Challenge[] | { items?: Challenge[] };
}

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const leagues = [
  { emoji: '🌱', name: 'Green Seed', min: 0, max: 100 },
  { emoji: '🌿', name: 'Eco Enthusiast', min: 100, max: 250 },
  { emoji: '🍃', name: 'Nature Keeper', min: 250, max: 500 },
  { emoji: '🌳', name: 'Planet Guardian', min: 500, max: 1000 },
  { emoji: '🌍', name: 'Earth Legend', min: 1000, max: 9999 },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const [ecoResult, setEcoResult] = useState<EcoLatestResult | null>(null);
  const [loadingEco, setLoadingEco] = useState(true);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [recentActions, setRecentActions] = useState<UserAction[]>([]);
  const [dashboardProfile, setDashboardProfile] = useState<DashboardProfile | null>(null);

  const profileUser = dashboardProfile || user;
  const rating = profileUser?.rating || 0;
  const currentLeague = profileUser?.league || 'Green Seed';

  const canRetake = ecoResult
    ? new Date().getTime() - new Date(ecoResult.taken_at).getTime() > 30 * 24 * 60 * 60 * 1000
    : true;

  const applyDashboardData = (data: DashboardResponse) => {
    setDashboardProfile(data.profile || null);
    setEcoResult(data.eco_latest || null);
    setStreak(data.streak || null);
    const challengesData = Array.isArray(data.challenges)
      ? data.challenges
      : data.challenges?.items || [];
    setChallenges(challengesData);
    const actionsData = Array.isArray(data.actions)
      ? data.actions
      : data.actions?.items || [];
    setRecentActions(actionsData.slice(0, 5));
  };

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoadingEco(true);
        const cached = localStorage.getItem('dashboard');
        if (cached) {
          applyDashboardData(JSON.parse(cached));
          setLoadingEco(false);
        }
        const res = await api.get('/dashboard');
        localStorage.setItem('dashboard', JSON.stringify(res.data));
        applyDashboardData(res.data);
      } catch {
        if (!localStorage.getItem('dashboard')) {
          setEcoResult(null);
          setStreak(null);
          setChallenges([]);
          setRecentActions([]);
        }
      } finally {
        setLoadingEco(false);
      }
    };
    loadDashboard();
  }, []);

  function safeFormat(dateStr: string, fmt: string): string {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      return format(d, fmt);
    } catch { return ''; }
  }

  const activityByDay = WEEK_DAYS.map((_, i) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - i));
    const dayStr = format(day, 'yyyy-MM-dd');
    return recentActions
      .filter(a => { try { return format(new Date(a.created_at), 'yyyy-MM-dd') === dayStr; } catch { return false; } })
      .reduce((s, a) => s + a.points, 0);
  });
  const maxActivity = Math.max(...activityByDay, 1);

  return (
    <Layout>
      <div className="space-y-6">

        {/* Hero */}
        <div className="bg-gradient-forest rounded-2xl px-8 py-6 text-primary-foreground flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">{t('dashboard.welcome', { name: profileUser?.username })} 🌱</h1>
            <p className="text-primary-foreground/80 text-sm">{t('dashboard.subtitle')}</p>
          </div>
          <div className="hidden md:flex gap-6 text-center">
            <div>
              <div className="text-2xl font-bold">{rating}</div>
              <div className="text-xs text-primary-foreground/70">pts</div>
            </div>
            <div className="w-px bg-white/20" />
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1">
                <Flame className="h-5 w-5 text-orange-400" />
                <div className="text-2xl font-bold">{streak?.current_streak ?? 0}</div>
              </div>
              <div className="text-xs text-primary-foreground/70">day streak</div>
            </div>
            <div className="w-px bg-white/20" />
            <div>
              <div className="text-2xl font-bold">{profileUser?.level || 1}</div>
              <div className="text-xs text-primary-foreground/70">level</div>
            </div>
          </div>
        </div>

        {/* Challenges + Recent Activity */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="h-5 w-5 text-yellow-500" />
                {t('dashboard.challenges')}
              </CardTitle>
              <Link to="/challenges">
                <Button variant="ghost" size="sm">{t('dashboard.viewAll')}</Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {challenges.slice(0, 3).map(ch => (
                <div key={ch.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{ch.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      ch.scope === 'daily' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {ch.scope === 'daily' ? t('dashboard.daily') : t('dashboard.weekly')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${ch.status === 'completed' ? 'bg-green-500' : 'bg-primary'}`}
                        style={{ width: `${Math.min((ch.progress / ch.target_value) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{ch.progress}/{ch.target_value}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t('dashboard.recentActivity')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentActions.length === 0 ? (
                <div className="py-6 text-center">
                  <Leaf className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">{t('dashboard.noActivity')}</p>
                </div>
              ) : recentActions.slice(0, 4).map(action => (
                <div key={action.id} className="flex items-center gap-3 bg-muted/40 rounded-xl px-3 py-2.5">
                  <div className="p-1.5 rounded-full bg-primary/10 shrink-0">
                    <Leaf className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{t('dashboard.actionCompleted')}</p>
                    <p className="text-xs text-muted-foreground">{safeFormat(action.created_at, 'MMM d, HH:mm')}</p>
                  </div>
                  <span className="text-sm font-semibold text-green-600 shrink-0">+{action.points} pts</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* League progress */}
        <div>
          <h2 className="text-base font-semibold mb-3">League progress</h2>
          <div className="grid grid-cols-5 gap-3">
            {leagues.map(l => {
              const isActive = currentLeague.toLowerCase() === l.name.toLowerCase();
              const isPast = rating >= l.max;
              const progress = isActive
                ? Math.min(((rating - l.min) / (l.max - l.min)) * 100, 100)
                : isPast ? 100 : 0;
              return (
                <div
                  key={l.name}
                  className={`flex flex-col items-center px-3 py-4 rounded-xl border bg-background text-center transition-all ${
                    isActive ? 'border-green-500 border-2' : isPast ? 'border-border' : 'border-border opacity-50'
                  }`}
                >
                  <span className="text-2xl mb-2">{l.emoji}</span>
                  <span className="text-xs font-medium">{l.name}</span>
                  <span className={`text-xs mt-0.5 ${isActive ? 'text-green-600 font-medium' : 'text-muted-foreground'}`}>
                    {isActive ? `${rating}/${l.max}` : `${l.min}–${l.max === 9999 ? l.min + '+' : l.max}`}
                  </span>
                  <div className="w-full mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-green-600 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  {isActive && <span className="mt-2 text-xs text-green-600 font-medium">You're here</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Eco Footprint */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              <CardTitle className="text-base">{t('dashboard.ecoFootprint')}</CardTitle>
            </div>
            <Link to="/eco-history">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                View History →
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loadingEco ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : ecoResult ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-primary">{ecoResult.total_score}</div>
                    <div className="text-sm font-medium">{ecoResult.category}</div>
                    <p className="text-sm text-muted-foreground mt-1">{ecoResult.description}</p>
                  </div>
                  <div className="shrink-0 ml-4">
                    {canRetake ? (
                      <Link to="/eco-test">
                        <Button variant="outline" size="sm">{t('dashboard.retakeTest')}</Button>
                      </Link>
                    ) : (
                      <div className="text-xs text-muted-foreground max-w-[140px] text-right">
                        {t('dashboard.retakeDisabled')}
                      </div>
                    )}
                  </div>
                </div>
                {ecoResult.tips && ecoResult.tips.length > 0 && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs font-medium mb-2">{t('dashboard.quickTips')}</p>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      {ecoResult.tips.slice(0, 2).map((tip, i) => (
                        <li key={i}>• {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <Leaf className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground mb-4">{t('dashboard.takeTestPrompt')}</p>
                <Link to="/eco-test">
                  <Button>{t('dashboard.takeTest')}</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <CardTitle className="text-base">{t('dashboard.achievements')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{t('dashboard.achievementsDesc')}</p>
            <Link to="/achievements">
              <Button variant="outline" className="w-full">{t('dashboard.viewAchievements')}</Button>
            </Link>
          </CardContent>
        </Card>

      </div>
    </Layout>
  );
}