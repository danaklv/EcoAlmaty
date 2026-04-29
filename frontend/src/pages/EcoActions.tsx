import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Leaf, Recycle, TreePine, Droplets, Zap, Bike } from 'lucide-react';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface EcoAction {
  id: number;
  title: string;
  description: string;
  points: number;
  icon: any;
  color: string;
}

const ecoActions: EcoAction[] = [
  {
    id: 1,
    title: 'Recycle Waste',
    description: 'Properly sort and recycle your household waste',
    points: 10,
    icon: Recycle,
    color: 'bg-gradient-forest',
  },
  {
    id: 2,
    title: 'Plant a Tree',
    description: 'Plant a tree in your community or garden',
    points: 50,
    icon: TreePine,
    color: 'bg-gradient-earth',
  },
  {
    id: 3,
    title: 'Save Water',
    description: 'Reduce water usage (shorter showers, fix leaks)',
    points: 15,
    icon: Droplets,
    color: 'bg-gradient-sky',
  },
  {
    id: 4,
    title: 'Use Renewable Energy',
    description: 'Switch to solar, wind, or other renewable sources',
    points: 30,
    icon: Zap,
    color: 'bg-gradient-sunrise',
  },
  {
    id: 5,
    title: 'Bike to Work',
    description: 'Use bicycle instead of car for your commute',
    points: 20,
    icon: Bike,
    color: 'bg-gradient-forest',
  },
  {
    id: 6,
    title: 'Reduce Plastic',
    description: 'Use reusable bags and containers',
    points: 15,
    icon: Leaf,
    color: 'bg-gradient-earth',
  },
];

export default function EcoActions() {
  const { updateUser, user } = useAuth();
  const [loadingAction, setLoadingAction] = useState<number | null>(null);

  const handleCompleteAction = async (actionId: number) => {
    setLoadingAction(actionId);
    try {
      const response = await api.post('/add-action', { action_id: actionId });
      const { new_rating, new_level, new_league } = response.data;
      
      updateUser({
        rating: new_rating,
        level: new_level,
        league: new_league,
      });

      const action = ecoActions.find(a => a.id === actionId);
      toast.success(`Great job! You earned ${action?.points} points! 🎉`);
      
      if (new_level > (user?.level || 0)) {
        toast.success(`Level up! You're now level ${new_level}! 🚀`);
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to complete action';
      toast.error(message);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Eco Actions</h1>
          <p className="text-muted-foreground">
            Complete these actions to earn points and level up!
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ecoActions.map((action) => (
            <Card key={action.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-full ${action.color}`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-success text-success-foreground text-sm font-semibold">
                    +{action.points}
                  </div>
                </div>
                <CardTitle className="mt-4">{action.title}</CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  onClick={() => handleCompleteAction(action.id)}
                  disabled={loadingAction === action.id}
                >
                  {loadingAction === action.id ? 'Completing...' : 'Complete Action'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Complete eco-friendly actions to earn points</p>
            <p>• Accumulate points to level up and climb leagues</p>
            <p>• Higher leagues unlock special rewards and recognition</p>
            <p>• Share your progress with friends and inspire others!</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
