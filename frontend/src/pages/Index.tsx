import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {Leaf, TreePine, BrainCircuit, Trophy, User, Brain} from 'lucide-react';
import WeatherWidget from '@/components/WeatherWidget';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Navbar } from '@/components/layout/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import {useEffect, useState} from "react";

const Index = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [weather, setWeather] = useState<{
  temperature: number;
  weather: 'sunny' | 'cloudy' | 'rainy' | 'snowy';
  }>({ temperature: 22, weather: 'sunny' });

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=Almaty&units=metric&appid=${import.meta.env.VITE_WEATHER_API_KEY}`
        );
        const data = await res.json();
        const temp = Math.round(data.main.temp);
        const id = data.weather[0].id;

        let condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' = 'sunny';
        if (id >= 600 && id < 700) condition = 'snowy';
        else if (id >= 500 && id < 600) condition = 'rainy';
        else if (id >= 700 || (id >= 300 && id < 500) || (id >= 801 && id <= 804)) condition = 'cloudy';

        setWeather({ temperature: temp, weather: condition });
      } catch {
        // fallback to defaults
      }
    };
    fetchWeather();
  }, []);
  return (
    <div className="min-h-screen">
      {user && <Navbar />}
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-forest">
        {/* Language Switcher in top left — only for guests */}
        {!user && (
          <div className="absolute top-6 left-6 z-10">
            <LanguageSwitcher className="bg-white/10 hover:bg-white/20 text-white" />
          </div>
        )}
        {/* Weather Widget in top right */}
        <div className="absolute top-6 right-6 z-10">
          <div className="scale-50 sm:scale-100 origin-top-right">
            <WeatherWidget temperature={weather.temperature} weather={weather.weather}/>
          </div>
        </div>

        <div className="container mx-auto px-4 py-24 sm:py-32">
          <div className="text-center text-white">
            <div className="flex justify-center mb-6">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm">
                <Leaf className="h-12 w-12" />
              </div>
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold mb-6">
              {t('home.heroTitle')}
            </h1>
            <p className="text-xl sm:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
              {t('home.heroSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link to="/dashboard">
                <Button size="lg" variant="secondary" className="text-lg px-8">
                  {t('home.goToDashboard')}
                </Button>
              </Link>
            ) : (
              <>
              <Link to="/register">
                <Button size="lg" variant="secondary" className="text-lg px-8">
                  {t('home.getStarted')}
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="text-lg px-8 bg-white/10 text-white border-white hover:bg-white/20">
                  {t('home.signIn')}
                </Button>
              </Link>
              </>
            )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">{t('home.howItWorks')}</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-gradient-forest">
                <TreePine className="h-8 w-8 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-semibold">{t('home.feature1Title')}</h3>
            <p className="text-muted-foreground">
              {t('home.feature1Desc')}
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-gradient-sky">
                <Trophy className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <h3 className="text-xl font-semibold">{t('home.feature2Title')}</h3>
            <p className="text-muted-foreground">
              {t('home.feature2Desc')}
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-gradient-sky">
                <Brain className="h-8 w-8 text-primary-foreground"/>
              </div>
            </div>
            <h3 className="text-xl font-semibold">{t('home.feature3Title')}</h3>
            <p className="text-muted-foreground">
              {t('home.feature3Desc')}
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!user && (
        <div className="bg-muted py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">{t('home.ctaTitle')}</h2>
            <p className="text-xl text-muted-foreground mb-8">
              {t('home.ctaSubtitle')}
            </p>
            <Link to="/register">
              <Button size="lg" className="text-lg px-8">
                {t('home.ctaButton')}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
