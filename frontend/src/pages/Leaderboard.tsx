import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, Award } from 'lucide-react';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface LeaderboardUser {
  id: string;
  username: string;
  avatar?: string;
  rating: number;
  level: number;
  league: string;
  rank: number;
}

export default function Leaderboard() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await api.get('/leaderboard');
        setUsers(response.data.items || []);
      } catch (error) {
        toast.error(t('leaderboard.failedLoad'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [t]);

  const getLeagueBadgeColor = (league: string) => {
    const colors: Record<string, string> = {
      Bronze: 'bg-gradient-to-r from-amber-600 to-amber-800',
      Silver: 'bg-gradient-to-r from-gray-400 to-gray-600',
      Gold: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
      Platinum: 'bg-gradient-to-r from-cyan-400 to-cyan-600',
      Diamond: 'bg-gradient-to-r from-blue-400 to-purple-600',
    };
    return colors[league] || 'bg-gradient-forest';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Award className="h-6 w-6 text-amber-600" />;
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('leaderboard.title')} 🏆</h1>
          <p className="text-muted-foreground">
            {t('leaderboard.subtitle')}
          </p>
        </div>

        {/* Top 3 Podium */}
        {users.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {/* 2nd Place */}
            <Card className="p-6 flex flex-col items-center justify-end">
              <div className="relative mb-4">
                <Avatar className="h-20 w-20 border-4 border-gray-400">
                  <AvatarImage src={users[1]?.avatar} />
                  <AvatarFallback className="bg-gradient-forest text-primary-foreground">
                    {users[1]?.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -top-2 -right-2">
                  <Medal className="h-8 w-8 text-gray-400" />
                </div>
              </div>
              <h3 className="font-bold text-center">{users[1]?.username}</h3>
              <p className="text-2xl font-bold text-primary">{users[1]?.rating}</p>
            </Card>

            {/* 1st Place */}
            <Card className="p-6 flex flex-col items-center justify-end bg-gradient-to-b from-yellow-50 to-white">
              <div className="relative mb-4">
                <Avatar className="h-24 w-24 border-4 border-yellow-500">
                  <AvatarImage src={users[0]?.avatar} />
                  <AvatarFallback className="bg-gradient-forest text-primary-foreground">
                    {users[0]?.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -top-3 -right-3">
                  <Trophy className="h-10 w-10 text-yellow-500" />
                </div>
              </div>
              <h3 className="font-bold text-center text-lg">{users[0]?.username}</h3>
              <p className="text-3xl font-bold text-primary">{users[0]?.rating}</p>
            </Card>

            {/* 3rd Place */}
            <Card className="p-6 flex flex-col items-center justify-end">
              <div className="relative mb-4">
                <Avatar className="h-20 w-20 border-4 border-amber-600">
                  <AvatarImage src={users[2]?.avatar} />
                  <AvatarFallback className="bg-gradient-forest text-primary-foreground">
                    {users[2]?.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -top-2 -right-2">
                  <Award className="h-8 w-8 text-amber-600" />
                </div>
              </div>
              <h3 className="font-bold text-center">{users[2]?.username}</h3>
              <p className="text-2xl font-bold text-primary">{users[2]?.rating}</p>
            </Card>
          </div>
        )}

        {/* Full Leaderboard */}
        <div className="space-y-2">
          {users.map((user, index) => (
            <Card key={user.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12">
                  {getRankIcon(index + 1)}
                </div>
                
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-gradient-forest text-primary-foreground">
                    {user.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <h3 className="font-semibold">{user.username}</h3>
                  <p className="text-sm text-muted-foreground">{t('leaderboard.level', { level: user.level })}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${getLeagueBadgeColor(user.league)}`}>
                    {user.league}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{user.rating}</div>
                    <div className="text-xs text-muted-foreground">{t('leaderboard.points')}</div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {users.length === 0 && (
          <Card className="p-8 text-center text-muted-foreground">
            {t('leaderboard.empty')}
          </Card>
        )}
      </div>
    </Layout>
  );
}
