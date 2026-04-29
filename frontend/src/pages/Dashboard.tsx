import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, TrendingUp, Target, Leaf, Award, ClipboardList, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '@/services/api';
import type { EcoLatestResult } from '@/types/eco';

export default function Dashboard() {
  const { user } = useAuth();
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
      // No result or error - that's okay
      setEcoResult(null);
    } finally {
      setLoadingEco(false);
    }
  };

  const stats = [
    { label: 'Current Rating', value: user?.rating || 0, icon: Trophy, gradient: 'bg-gradient-forest' },
    { label: 'Level', value: user?.level || 1, icon: TrendingUp, gradient: 'bg-gradient-sky' },
    { label: 'League', value: user?.league || 'Bronze', icon: Award, gradient: 'bg-gradient-sunrise' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-forest rounded-2xl p-8 text-primary-foreground">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.username}! 🌱</h1>
          <p className="text-primary-foreground/90">
            Ready to make a positive impact today?
          </p>
        </div>

        {/* Stats Grid */}
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

        {/* Eco Footprint Result */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Your Eco Footprint
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
                    <Button variant="outline" size="sm">
                      Retake Test
                    </Button>
                  </Link>
                </div>
                {ecoResult.tips && ecoResult.tips.length > 0 && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs font-medium mb-2">Quick Tips:</p>
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
                  Take the eco footprint test to discover your environmental impact
                </p>
                <Link to="/eco-test">
                  <Button>Take the Test</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-gradient-forest">
                  <Leaf className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle>Eco Actions</CardTitle>
                  <p className="text-sm text-muted-foreground">Complete actions to earn points</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link to="/eco-actions">
                <Button className="w-full">View Actions</Button>
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
                  <CardTitle>Leaderboard</CardTitle>
                  <p className="text-sm text-muted-foreground">See how you rank globally</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link to="/leaderboard">
                <Button variant="secondary" className="w-full">View Rankings</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Your Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>No recent activity yet.</p>
              <p className="text-sm mt-2">Complete eco actions to see your progress here!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}