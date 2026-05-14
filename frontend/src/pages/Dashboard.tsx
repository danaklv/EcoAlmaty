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
  Flame, 
  Star, 
  Zap,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

// Вспомогательная функция для безопасного форматирования дат
function safeFormat(dateStr: string | undefined, fmt: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return format(d, fmt);
  } catch {
    return '';
  }
}

export default function Dashboard() {
  const { user, dashboardData } = useAuth();
  const { t } = useTranslation();

  // Достаем данные из глобального стейта (AuthContext)
  // Если данных еще нет (грузятся), используем значения по умолчанию
  const ecoResult = dashboardData?.eco_latest || null;
  const recentActions = dashboardData?.actions || [];
  const leaderboard = dashboardData?.leaderboard || [];
  const streak = dashboardData?.streak || null;
  const challenges = dashboardData?.challenges || [];

  // Логика проверки: можно ли пересдать тест (раз в 30 дней)
  const canRetake = ecoResult
    ? new Date().getTime() - new Date(ecoResult.taken_at).getTime() > 30 * 24 * 60 * 60 * 1000
    : true;

  return (
    <Layout>
      <div className="space-y-6 pb-8">
        {/* Приветствие */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t('dashboard.welcome')}, {user?.username || 'Eco Hero'}!
          </h1>
          <p className="text-muted-foreground">
            {t('dashboard.subtitle')}
          </p>
        </div>

        {/* Секция быстрой статистики (Grid) */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.totalPoints')}</CardTitle>
              <Star className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user?.rating || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {t('dashboard.level')} {user?.level || 1} • {user?.league || 'Bronze'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.currentStreak')}</CardTitle>
              <Flame className={`h-4 w-4 ${streak?.current_streak ? 'text-orange-500' : 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{streak?.current_streak || 0} {t('dashboard.days')}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {t('dashboard.bestStreak')}: {streak?.longest_streak || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.ecoStatus')}</CardTitle>
              <Leaf className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ecoResult ? `${ecoResult.percent}%` : '—'}</div>
              <p className="text-xs text-muted-foreground mt-1 capitalize">
                {ecoResult?.category || t('dashboard.noTestYet')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.activeChallenges')}</CardTitle>
              <Zap className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {challenges.filter(c => c.status === 'active').length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {challenges.filter(c => c.status === 'completed').length} {t('dashboard.completed')}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-7">
          {/* Левая колонка: Тест и Челленджи */}
          <div className="md:col-span-4 space-y-6">
            {/* Карточка Эко-теста */}
            <Card className="overflow-hidden border-primary/20 shadow-sm">
              <CardHeader className="bg-primary/5 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  {t('dashboard.ecoTest')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {ecoResult ? (
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="relative h-24 w-24 flex items-center justify-center">
                      <svg className="h-24 w-24 transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted" />
                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent"
                          strokeDasharray={251.2}
                          strokeDashoffset={251.2 - (251.2 * ecoResult.percent) / 100}
                          className="text-primary" />
                      </svg>
                      <span className="absolute text-xl font-bold">{ecoResult.percent}%</span>
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-2">
                      <h3 className="font-semibold text-lg">{ecoResult.category}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{ecoResult.description}</p>
                      <div className="flex flex-wrap gap-2 pt-2 justify-center md:justify-start">
                        <Link to="/eco-result">
                          <Button size="sm" variant="outline">{t('dashboard.viewDetails')}</Button>
                        </Link>
                        {canRetake && (
                          <Link to="/eco-test">
                            <Button size="sm">{t('dashboard.retakeTest')}</Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Award className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-20" />
                    <p className="text-muted-foreground mb-4">{t('dashboard.testPrompt')}</p>
                    <Link to="/eco-test">
                      <Button className="gap-2">
                        <TrendingUp className="h-4 w-4" />
                        {t('dashboard.startFirstTest')}
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Активные челленджи */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  {t('dashboard.myChallenges')}
                </CardTitle>
                <Link to="/challenges">
                  <Button variant="ghost" size="sm" className="text-xs">
                    {t('dashboard.viewAll')}
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                {challenges.filter(c => c.status === 'active').slice(0, 3).map(ch => (
                  <div key={ch.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{ch.title}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {safeFormat(ch.end_date, 'MMM d')}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-500" 
                        style={{ width: `${Math.min((ch.progress / ch.target_value) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
                {challenges.filter(c => c.status === 'active').length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    {t('dashboard.noActiveChallenges')}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Правая колонка: Активность и Лидеры */}
          <div className="md:col-span-3 space-y-6">
            {/* Недавняя активность */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  {t('dashboard.recentActivity')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentActions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">{t('dashboard.noActivity')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActions.slice(0, 5).map((action: any) => (
                      <div key={action.id} className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-primary/10">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{t('dashboard.actionCompleted')}</p>
                            <p className="text-xs text-muted-foreground">
                              {safeFormat(action.created_at, 'MMM d, HH:mm')}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-primary">+{action.points}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Мини лидерборд */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  {t('dashboard.topPlayers')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 pb-2">
                <div className="divide-y divide-border">
                  {leaderboard.slice(0, 5).map((player: any, index: number) => (
                    <div key={player.username} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold w-4 ${index === 0 ? 'text-yellow-500' : ''}`}>
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium">{player.username}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{player.rating} pts</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
