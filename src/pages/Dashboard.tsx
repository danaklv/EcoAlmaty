import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, TrendingUp, Target, Leaf, Award, ClipboardList, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '@/services/api';
import { useTranslation } from 'react-i18next';
import type { EcoLatestResult } from '@/types/eco';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [ecoResult, setEcoResult] = useState<EcoLatestResult | null>(null);
  const [loadingEco, setLoadingEco] = useState(true);

  useEffect(() => {
    fetchLatestEcoResult();
  }, []);

  const fetchLatestEcoResult = async () => {
    try {
      const response = await api.get('/eco/latest');
      setEcoResult(response.data);
    } catch {
      setEcoResult(null);
    } finally {
      setLoadingEco(false);
    }
  };

  const stats = [
    { label: t('dashboard.currentRating'), value: user?.rating || 0,          icon: Trophy,    gradient: 'bg-gradient-forest' },
    { label: t('dashboard.level'),         value: user?.level || 1,            icon: TrendingUp, gradient: 'bg-gradient-sky' },
    { label: t('dashboard.league'),        value: user?.league || 'Bronze',    icon: Award,     gradient: 'bg-gradient-sunrise' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-gradient-forest rounded-2xl p-8 text-primary-foreground">
          <h1 className="text-3xl font-bold mb-2">{t('dashboard.welcome', { name: user?.username })} 🌱</h1>
          <p className="text-primary-foreground/90">{t('dashboard.subtitle')}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
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
                    <div className="text-2xl font-bold text-primary">{ecoResult.total_score}</div>
                    <div className="text-sm font-medium">{ecoResult.category}</div>
                    <p className="text-sm text-muted-foreground mt-1">{ecoResult.description}</p>
                  </div>
                  <Link to="/eco-test">
                    <Button variant="outline" size="sm">{t('dashboard.retakeTest')}</Button>
                  </Link>
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

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-gradient-forest">
                  <Leaf className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle>{t('dashboard.ecoActionsCard')}</CardTitle>
                  <p className="text-sm text-muted-foreground">{t('dashboard.ecoActionsDesc')}</p>
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
                  <p className="text-sm text-muted-foreground">{t('dashboard.leaderboardDesc')}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link to="/leaderboard">
                <Button variant="secondary" className="w-full">{t('dashboard.viewRankings')}</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {t('dashboard.recentActivity')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>{t('dashboard.noActivity')}</p>
              <p className="text-sm mt-2">{t('dashboard.noActivityHint')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}