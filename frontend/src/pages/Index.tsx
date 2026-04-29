import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Leaf, TreePine, Users, Trophy } from 'lucide-react';
import WeatherWidget from '@/components/WeatherWidget';

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-forest">
        {/* Weather Widget in top right */}
        <div className="absolute top-6 right-6 z-10">
          <WeatherWidget temperature={22} weather="sunny" />
        </div>
        
        <div className="container mx-auto px-4 py-24 sm:py-32">
          <div className="text-center text-white">
            <div className="flex justify-center mb-6">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm">
                <Leaf className="h-12 w-12" />
              </div>
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold mb-6">
              Welcome to EcoTrack
            </h1>
            <p className="text-xl sm:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
              Join thousands of eco warriors making a positive impact on our planet
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" variant="secondary" className="text-lg px-8">
                  Get Started
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="text-lg px-8 bg-white/10 text-white border-white hover:bg-white/20">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-gradient-forest">
                <TreePine className="h-8 w-8 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-semibold">Complete Eco Actions</h3>
            <p className="text-muted-foreground">
              Take sustainable actions like recycling, planting trees, and reducing waste
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-gradient-sky">
                <Trophy className="h-8 w-8 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-semibold">Earn Points & Level Up</h3>
            <p className="text-muted-foreground">
              Gain points for each action and climb through leagues as you progress
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-gradient-earth">
                <Users className="h-8 w-8 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-semibold">Join the Community</h3>
            <p className="text-muted-foreground">
              Connect with like-minded individuals and inspire others to go green
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-muted py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Start your eco journey today and be part of the change
          </p>
          <Link to="/register">
            <Button size="lg" className="text-lg px-8">
              Join EcoTrack Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
