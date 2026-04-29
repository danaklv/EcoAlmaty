import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Leaf, Recycle, Zap, Droplets, TreePine, Wind } from 'lucide-react';

const groups = [
  { id: 1, name: 'Zero Waste Almaty', description: 'Reducing household waste to zero through mindful consumption and recycling.', members: 142, icon: Recycle, color: 'bg-green-100 text-green-700' },
  { id: 2, name: 'Clean Air Initiative', description: 'Fighting air pollution in Almaty through awareness and eco-friendly transport.', members: 89, icon: Wind, color: 'bg-blue-100 text-blue-700' },
  { id: 3, name: 'Urban Tree Planters', description: 'Planting trees across the city to improve the urban green cover.', members: 203, icon: TreePine, color: 'bg-emerald-100 text-emerald-700' },
  { id: 4, name: 'Water Savers', description: 'Promoting water conservation habits in everyday life.', members: 67, icon: Droplets, color: 'bg-cyan-100 text-cyan-700' },
  { id: 5, name: 'Renewable Energy Club', description: 'Advocates for solar, wind, and other renewable energy sources in Kazakhstan.', members: 54, icon: Zap, color: 'bg-yellow-100 text-yellow-700' },
  { id: 6, name: 'Eco Lifestyle', description: 'Sharing tips and habits for a more sustainable everyday lifestyle.', members: 318, icon: Leaf, color: 'bg-lime-100 text-lime-700' },
];

export default function Groups() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-gradient-forest rounded-2xl p-6 text-primary-foreground">
          <h1 className="text-2xl font-bold mb-1">🌿 Eco Groups</h1>
          <p className="text-primary-foreground/80 text-sm">Join communities focused on sustainability</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map(group => (
            <Card key={group.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${group.color}`}>
                    <group.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">{group.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{group.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{group.members} members</span>
                  <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50">
                    Join
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}