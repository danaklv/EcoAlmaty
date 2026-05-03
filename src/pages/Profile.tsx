import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, TrendingUp, Award, Edit, Calendar, Mail, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Profile() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const getLeagueBadgeColor = (league: string) => {
    const colors: Record<string, string> = {
      Bronze:   'bg-gradient-to-r from-amber-600 to-amber-800',
      Silver:   'bg-gradient-to-r from-gray-400 to-gray-600',
      Gold:     'bg-gradient-to-r from-yellow-400 to-yellow-600',
      Platinum: 'bg-gradient-to-r from-cyan-400 to-cyan-600',
      Diamond:  'bg-gradient-to-r from-blue-400 to-purple-600',
    };
    return colors[league || 'Bronze'] || 'bg-gradient-forest';
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <Card className="overflow-hidden">
          <div className="h-32 bg-gradient-forest" />
          <CardContent className="pt-0">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-16 sm:-mt-12">
              <Avatar className="h-32 w-32 border-4 border-card">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-gradient-forest text-primary-foreground text-3xl">
                  {user?.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left mt-2">
                <h1 className="text-2xl font-bold">{user?.username}</h1>
                <p className="text-muted-foreground">{user?.email}</p>
                {user?.bio && <p className="mt-2 text-sm">{user.bio}</p>}
              </div>
              <Link to="/profile/edit">
                <Button variant="outline" className="gap-2">
                  <Edit className="h-4 w-4" />
                  {t('profile.editProfile')}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('profile.rating')}</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{user?.rating || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">{t('profile.totalPoints')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('profile.level')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{user?.level || 1}</div>
              <p className="text-xs text-muted-foreground mt-1">{t('profile.keepGrowing')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('profile.league')}</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`inline-block px-3 py-1 rounded-full text-white font-semibold ${getLeagueBadgeColor(user?.league || 'Bronze')}`}>
                {user?.league || 'Bronze'}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('profile.profileInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <UserIcon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{t('profile.fullName')}</p>
                <p className="font-medium">
                  {user?.first_name && user?.last_name
                    ? `${user.first_name} ${user.last_name}`
                    : t('profile.notSet')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{t('profile.email')}</p>
                <p className="font-medium">{user?.email}</p>
              </div>
            </div>
            {user?.birth_date && (
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('profile.birthDate')}</p>
                  <p className="font-medium">{new Date(user.birth_date).toLocaleDateString()}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('profile.recentActivity')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>{t('profile.noActivity')}</p>
              <p className="text-sm mt-2">{t('profile.noActivityHint')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}