// import { useState, useEffect } from 'react';
// import { Layout } from '@/components/layout/Layout';
// import { useAuth } from '@/contexts/AuthContext';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Trophy, TrendingUp, Target, Leaf, Award, ClipboardList, Loader2, Flame, Star, Zap  } from 'lucide-react';
// import { Link } from 'react-router-dom';
// import { api } from '@/services/api';
// import { useTranslation } from 'react-i18next';
// import type { EcoLatestResult } from '@/types/eco';
// import { format } from 'date-fns';

// interface Streak {
//   current_streak: number;
//   longest_streak: number;
//   last_action_date?: string;
// }
// interface Challenge {
//   id: number;
//   title: string;
//   description: string;
//   scope: 'daily' | 'weekly';
//   target_value: number;
//   progress: number;
//   status: string;
//   end_date: string;
// }
// interface UserAction {
//   id: number;
//   action_id: number;
//   points: number;
//   created_at: string;
// }

// export default function Dashboard() {
//   const { user } = useAuth();
//   const { t } = useTranslation();
//   const [ecoResult, setEcoResult] = useState<EcoLatestResult | null>(null);
//   const [loadingEco, setLoadingEco] = useState(true);
//   const [streak, setStreak] = useState<Streak | null>(null);
//   const canRetake = ecoResult
//   ? new Date().getTime() - new Date(ecoResult.taken_at).getTime() > 30 * 24 * 60 * 60 * 1000
//   : true;
//   const [challenges, setChallenges] = useState<Challenge[]>([]);
//   const [recentActions, setRecentActions] = useState<UserAction[]>([]);

//   useEffect(() => {
//     fetchLatestEcoResult();
//     fetchStreak();
//     fetchChallenges();
//     fetchRecentActions();
//   }, []);

//   const fetchChallenges = async () => {
//     try {
//       const res = await api.get('/challenges/current');
//       const data = Array.isArray(res.data) ? res.data : res.data?.items || [];
//       setChallenges(data);
//     } catch {
//       setChallenges([]);
//     }
//   };

//   const fetchRecentActions = async () => {
//     try {
//       const res = await api.get('/user-actions');
//       const data = Array.isArray(res.data) ? res.data : res.data?.items || [];
//       setRecentActions(data.slice(0, 5));
//     } catch {
//       setRecentActions([]);
//     }
//   };
//   const fetchLatestEcoResult = async () => {
//     try {
//       const response = await api.get('/eco/latest');
//       setEcoResult(response.data);
//     } catch {
//       setEcoResult(null);
//     } finally {
//       setLoadingEco(false);
//     }
//   };

//   const fetchStreak = async () => {
//     try {
//       const res = await api.get('/gamification/streak');
//       setStreak(res.data);
//     } catch {
//       setStreak(null);
//     }
//   };
//   function safeFormat(dateStr: string, fmt: string): string {
//     try {
//       const d = new Date(dateStr);
//       if (isNaN(d.getTime())) return '';
//       return format(d, fmt);
//     } catch { return ''; }
//   }

//   const stats = [
//     { label: t('dashboard.currentRating'), value: user?.rating || 0,       icon: Trophy,    gradient: 'bg-gradient-forest' },
//     { label: t('dashboard.level'),         value: user?.level || 1,         icon: TrendingUp, gradient: 'bg-gradient-sky' },
//     { label: t('dashboard.league'),        value: user?.league || 'Bronze', icon: Award,     gradient: 'bg-gradient-sunrise' },
//   ];

//   return (
//     <Layout>
//       <div className="space-y-6">

//         {/* Hero */}
//         <div className="bg-gradient-forest rounded-2xl p-8 text-primary-foreground">
//           <h1 className="text-3xl font-bold mb-2">{t('dashboard.welcome', { name: user?.username })} 🌱</h1>
//           <p className="text-primary-foreground/90">{t('dashboard.subtitle')}</p>
//         </div>

//         {/* Stats */}
//         <div className="grid gap-4 md:grid-cols-3">
//           {stats.map((stat) => (
//             <Card key={stat.label}>
//               <CardHeader className="flex flex-row items-center justify-between pb-2">
//                 <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
//                 <div className={`p-2 rounded-full ${stat.gradient}`}>
//                   <stat.icon className="h-4 w-4 text-white" />
//                 </div>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-3xl font-bold">{stat.value}</div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>

//         {/* Streak + Achievements */}
//         <div className="grid gap-4 md:grid-cols-2">

//           {/* Streak */}
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between pb-2">
//               <CardTitle className="flex items-center gap-2">
//                 <Flame className="h-5 w-5 text-orange-500" />
//                 {t('dashboard.streak')}
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               {streak ? (
//                 <div className="space-y-3">
//                   <div className="flex items-end gap-2">
//                     <span className="text-5xl font-bold text-orange-500">{streak.current_streak}</span>
//                     <span className="text-muted-foreground mb-1">{t('dashboard.streakDays')}</span>
//                   </div>
//                   <p className="text-xs text-muted-foreground">
//                     {t('dashboard.longestStreak')}: <strong>{streak.longest_streak}</strong>
//                   </p>
//                 </div>
//               ) : (
//                 <div className="py-4 text-center text-muted-foreground text-sm">
//                   <Flame className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
//                   {t('dashboard.noStreak')}
//                 </div>
//               )}
//             </CardContent>
//           </Card>

//           {/* Achievements */}
//           <Card className="hover:shadow-lg transition-shadow">
//             <CardHeader className="flex flex-row items-center justify-between pb-2">
//               <CardTitle className="flex items-center gap-2">
//                 <Star className="h-5 w-5 text-yellow-500" />
//                 {t('dashboard.achievements')}
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <p className="text-sm text-muted-foreground mb-4">{t('dashboard.achievementsDesc')}</p>
//               <Link to="/achievements">
//                 <Button variant="outline" className="w-full">{t('dashboard.viewAchievements')}</Button>
//               </Link>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Eco Footprint */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <ClipboardList className="h-5 w-5" />
//               {t('dashboard.ecoFootprint')}
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             {loadingEco ? (
//               <div className="flex items-center justify-center py-8">
//                 <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
//               </div>
//             ) : ecoResult ? (
//               <div className="space-y-4">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <div className="text-2xl font-bold text-primary">{ecoResult.total_score}</div>
//                     <div className="text-sm font-medium">{ecoResult.category}</div>
//                     <p className="text-sm text-muted-foreground mt-1">{ecoResult.description}</p>
//                   </div>
//                   <div className="text-right shrink-0 ml-4">
//                     {canRetake ? (
//                         <Link to="/eco-test">
//                           <Button variant="outline" size="sm">{t('dashboard.retakeTest')}</Button>
//                         </Link>
//                     ) : (
//                         <div className="text-xs text-muted-foreground max-w-[140px] text-right">
//                           {t('dashboard.retakeDisabled')}
//                         </div>
//                     )}
//                   </div>
//                 </div>
//                 {ecoResult.tips && ecoResult.tips.length > 0 && (
//                     <div className="bg-muted/50 rounded-lg p-3">
//                       <p className="text-xs font-medium mb-2">{t('dashboard.quickTips')}</p>
//                       <ul className="space-y-1 text-xs text-muted-foreground">
//                         {ecoResult.tips.slice(0, 2).map((tip, i) => (
//                         <li key={i}>• {tip}</li>
//                       ))}
//                     </ul>
//                   </div>
//                 )}
//               </div>
//             ) : (
//               <div className="text-center py-6">
//                 <Leaf className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
//                 <p className="text-muted-foreground mb-4">{t('dashboard.takeTestPrompt')}</p>
//                 <Link to="/eco-test">
//                   <Button>{t('dashboard.takeTest')}</Button>
//                 </Link>
//               </div>
//             )}
//           </CardContent>
//         </Card>

//         {/* Quick links */}
//         <div className="grid gap-4 md:grid-cols-2">
//           <Card className="hover:shadow-lg transition-shadow">
//             <CardHeader>
//               <div className="flex items-center gap-3">
//                 <div className="p-3 rounded-full bg-gradient-forest">
//                   <Leaf className="h-6 w-6 text-primary-foreground" />
//                 </div>
//                 <div>
//                   <CardTitle>{t('dashboard.ecoActionsCard')}</CardTitle>
//                   <p className="text-sm text-muted-foreground">{t('dashboard.ecoActionsDesc')}</p>
//                 </div>
//               </div>
//             </CardHeader>
//             <CardContent>
//               <Link to="/eco-actions">
//                 <Button className="w-full">{t('dashboard.viewActions')}</Button>
//               </Link>
//             </CardContent>
//           </Card>

//           <Card className="hover:shadow-lg transition-shadow">
//             <CardHeader>
//               <div className="flex items-center gap-3">
//                 <div className="p-3 rounded-full bg-gradient-sky">
//                   <Trophy className="h-6 w-6 text-primary-foreground" />
//                 </div>
//                 <div>
//                   <CardTitle>{t('dashboard.leaderboardCard')}</CardTitle>
//                   <p className="text-sm text-muted-foreground">{t('dashboard.leaderboardDesc')}</p>
//                 </div>
//               </div>
//             </CardHeader>
//             <CardContent>
//               <Link to="/leaderboard">
//                 <Button variant="secondary" className="w-full">{t('dashboard.viewRankings')}</Button>
//               </Link>
//             </CardContent>
//           </Card>
//         </div>

//         {challenges.length > 0 && (
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between">
//               <CardTitle className="flex items-center gap-2">
//                 <Zap className="h-5 w-5 text-yellow-500" />
//                 {t('dashboard.challenges')}
//               </CardTitle>
//               <Link to="/challenges">
//                 <Button variant="ghost" size="sm">{t('dashboard.viewAll')}</Button>
//               </Link>
//             </CardHeader>
//             <CardContent className="space-y-3">
//               {challenges.slice(0, 3).map(ch => (
//                 <div key={ch.id} className="space-y-1">
//                   <div className="flex items-center justify-between text-sm">
//                     <span className="font-medium">{ch.title}</span>
//                     <span className={`text-xs px-2 py-0.5 rounded-full ${
//                       ch.scope === 'daily' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
//                     }`}>
//                       {ch.scope === 'daily' ? t('dashboard.daily') : t('dashboard.weekly')}
//                     </span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
//                       <div
//                         className={`h-full rounded-full transition-all ${
//                           ch.status === 'completed' ? 'bg-emerald-500' : 'bg-primary'
//                         }`}
//                         style={{ width: `${Math.min((ch.progress / ch.target_value) * 100, 100)}%` }}
//                       />
//                     </div>
//                     <span className="text-xs text-muted-foreground shrink-0">
//                       {ch.progress}/{ch.target_value}
//                     </span>
//                   </div>
//                 </div>
//               ))}
//             </CardContent>
//           </Card>
//         )}

//         {/* Recent Activity */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Target className="h-5 w-5" />
//               {t('dashboard.recentActivity')}
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             {recentActions.length === 0 ? (
//               <div className="text-center py-8 text-muted-foreground">
//                 <p>{t('dashboard.noActivity')}</p>
//                 <p className="text-sm mt-2">{t('dashboard.noActivityHint')}</p>
//               </div>
//             ) : (
//               <div className="divide-y divide-border">
//                 {recentActions.map(action => (
//                   <div key={action.id} className="flex items-center justify-between py-3">
//                     <div className="flex items-center gap-3">
//                       <div className="p-2 rounded-full bg-primary/10">
//                         <Leaf className="h-4 w-4 text-primary" />
//                       </div>
//                       <div>
//                         <p className="text-sm font-medium">{t('dashboard.actionCompleted')}</p>
//                         <p className="text-xs text-muted-foreground">
//                           {safeFormat(action.created_at, 'MMM d, HH:mm')}
//                         </p>
//                       </div>
//                     </div>
//                     <span className="text-sm font-semibold text-primary">+{action.points} pts</span>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </CardContent>
//         </Card>

//       </div>
//     </Layout>
//   );
// }



import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Trophy,
  TrendingUp,
  Target,
  Leaf,
  Award,
  ClipboardList,
  Loader2,
  Flame,
  Star,
  Zap,
} from 'lucide-react';
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

  const canRetake = ecoResult
    ? new Date().getTime() - new Date(ecoResult.taken_at).getTime() > 30 * 24 * 60 * 60 * 1000
    : true;

  useEffect(() => {
    loadDashboard();
  }, []);

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

  const loadDashboard = async () => {
    try {
      setLoadingEco(true);

      const cached = localStorage.getItem('dashboard');

      if (cached) {
        const cachedData: DashboardResponse = JSON.parse(cached);
        applyDashboardData(cachedData);
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

  function safeFormat(dateStr: string, fmt: string): string {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      return format(d, fmt);
    } catch {
      return '';
    }
  }

  const stats = [
    {
      label: t('dashboard.currentRating'),
      value: profileUser?.rating || 0,
      icon: Trophy,
      gradient: 'bg-gradient-forest',
    },
    {
      label: t('dashboard.level'),
      value: profileUser?.level || 1,
      icon: TrendingUp,
      gradient: 'bg-gradient-sky',
    },
    {
      label: t('dashboard.league'),
      value: profileUser?.league || 'Bronze',
      icon: Award,
      gradient: 'bg-gradient-sunrise',
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Hero */}
        <div className="bg-gradient-forest rounded-2xl p-8 text-primary-foreground">
          <h1 className="text-3xl font-bold mb-2">
            {t('dashboard.welcome', { name: profileUser?.username })} 🌱
          </h1>
          <p className="text-primary-foreground/90">{t('dashboard.subtitle')}</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.gradient}`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Streak + Achievements */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Streak */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                {t('dashboard.streak')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {streak ? (
                <div className="space-y-3">
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-bold text-orange-500">
                      {streak.current_streak}
                    </span>
                    <span className="text-muted-foreground mb-1">
                      {t('dashboard.streakDays')}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('dashboard.longestStreak')}: <strong>{streak.longest_streak}</strong>
                  </p>
                </div>
              ) : (
                <div className="py-4 text-center text-muted-foreground text-sm">
                  <Flame className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                  {t('dashboard.noStreak')}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                {t('dashboard.achievements')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {t('dashboard.achievementsDesc')}
              </p>
              <Link to="/achievements">
                <Button variant="outline" className="w-full">
                  {t('dashboard.viewAchievements')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Eco Footprint */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              {t('dashboard.ecoFootprint')}
            </CardTitle>
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
                    <div className="text-2xl font-bold text-primary">
                      {ecoResult.total_score}
                    </div>
                    <div className="text-sm font-medium">{ecoResult.category}</div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {ecoResult.description}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    {canRetake ? (
                      <Link to="/eco-test">
                        <Button variant="outline" size="sm">
                          {t('dashboard.retakeTest')}
                        </Button>
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
                    <p className="text-xs font-medium mb-2">
                      {t('dashboard.quickTips')}
                    </p>
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
                <p className="text-muted-foreground mb-4">
                  {t('dashboard.takeTestPrompt')}
                </p>
                <Link to="/eco-test">
                  <Button>{t('dashboard.takeTest')}</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick links */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-gradient-forest">
                  <Leaf className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle>{t('dashboard.ecoActionsCard')}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {t('dashboard.ecoActionsDesc')}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link to="/eco-actions">
                <Button className="w-full">{t('dashboard.viewActions')}</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-gradient-sky">
                  <Trophy className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle>{t('dashboard.leaderboardCard')}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {t('dashboard.leaderboardDesc')}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link to="/leaderboard">
                <Button variant="secondary" className="w-full">
                  {t('dashboard.viewRankings')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Challenges */}
        {challenges.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                {t('dashboard.challenges')}
              </CardTitle>
              <Link to="/challenges">
                <Button variant="ghost" size="sm">
                  {t('dashboard.viewAll')}
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {challenges.slice(0, 3).map((ch) => (
                <div key={ch.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{ch.title}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        ch.scope === 'daily'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {ch.scope === 'daily'
                        ? t('dashboard.daily')
                        : t('dashboard.weekly')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          ch.status === 'completed'
                            ? 'bg-emerald-500'
                            : 'bg-primary'
                        }`}
                        style={{
                          width: `${Math.min(
                            (ch.progress / ch.target_value) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {ch.progress}/{ch.target_value}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {t('dashboard.recentActivity')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>{t('dashboard.noActivity')}</p>
                <p className="text-sm mt-2">{t('dashboard.noActivityHint')}</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recentActions.map((action) => (
                  <div
                    key={action.id}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Leaf className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {t('dashboard.actionCompleted')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {safeFormat(action.created_at, 'MMM d, HH:mm')}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-primary">
                      +{action.points} pts
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
