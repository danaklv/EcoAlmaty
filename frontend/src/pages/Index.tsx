import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Leaf, TreePine, BrainCircuit, Trophy, Brain, Newspaper, ArrowRight, TrendingDown } from 'lucide-react';
import WeatherWidget from '@/components/WeatherWidget';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Navbar } from '@/components/layout/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from "react";

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
      } catch { }
    };
    fetchWeather();
  }, []);

  return (
    <div className="min-h-screen">
      {user && <Navbar />}

      {/* Hero */}
      <div
          className="relative overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(15,110,86,0.85) 0%, rgba(29,158,117,0.75) 60%, rgba(8,80,65,0.90) 100%), url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
      >
        {!user && (
            <div className="absolute top-6 left-6 z-10">
              <LanguageSwitcher className="bg-white/10 hover:bg-white/20 text-white"/>
            </div>
        )}
        <div className="absolute top-6 right-6 z-10">
          <div className="scale-50 sm:scale-100 origin-top-right">
            <WeatherWidget temperature={weather.temperature} weather={weather.weather}/>
          </div>
        </div>

        <div className="container mx-auto px-4 py-24 sm:py-32">
          <div className="text-center text-white">
            <div className="flex justify-center mb-6">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm">
                <Leaf className="h-12 w-12"/>
              </div>
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold mb-6">{t('home.heroTitle')}</h1>
            <p className="text-xl sm:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">{t('home.heroSubtitle')}</p>

            {/* Stats row */}
            <div className="flex justify-center gap-8 mb-10">
              {[
                {val: '2.4k', label: 'Eco warriors'},
                {val: '18k', label: 'Actions done'},
                {val: '94%', label: 'AI accuracy'},
              ].map(s => (
                  <div key={s.label} className="text-center">
                    <div className="text-2xl font-bold text-white">{s.val}</div>
                    <div className="text-sm text-white/60">{s.label}</div>
                  </div>
              ))}
            </div>

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
                      <Button size="lg" variant="outline"
                              className="text-lg px-8 bg-white/10 text-white border-white hover:bg-white/20">
                        {t('home.signIn')}
                      </Button>
                    </Link>
                  </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation cards */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-3">{t('home.howItWorks')}</h2>
        <p className="text-center text-muted-foreground mb-12">Everything you need to live greener — in one place</p>
        <div className="grid md:grid-cols-3 gap-6">

          {/* Eco Actions */}
          <Link to="/eco-actions" className="group block">
            <div className="h-full rounded-2xl border border-border hover:border-green-400 transition-colors p-6 space-y-4">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-gradient-forest">
                  <TreePine className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-center">{t('home.feature1Title')}</h3>
              <p className="text-muted-foreground text-center text-sm">{t('home.feature1Desc')}</p>
              <div className="flex justify-center">
                <span className="text-sm text-green-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                  Start acting <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          </Link>

          {/* AI Forecast */}
          <Link to="/forecast" className="group block">
            <div className="h-full rounded-2xl border border-border hover:border-blue-400 transition-colors p-6 space-y-4">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-gradient-sky">
                  <Brain className="h-8 w-8 text-primary-foreground" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-center">{t('home.feature3Title')}</h3>
              <p className="text-muted-foreground text-center text-sm">{t('home.feature3Desc')}</p>
              {/* Mini chart preview */}
              <div className="bg-muted/50 rounded-xl p-3">
                <div className="flex items-end gap-1 h-10 justify-center">
                  {[70, 65, 58, 52, 46, 40].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm bg-blue-400/60"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-muted-foreground">2026</span>
                  <span className="text-xs text-green-600 flex items-center gap-0.5"><TrendingDown className="h-3 w-3" /> improving</span>
                  <span className="text-xs text-muted-foreground">2031</span>
                </div>
              </div>
              <div className="flex justify-center">
                <span className="text-sm text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                  See forecast <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          </Link>

          {/* News */}
          <Link to="/feed" className="group block">
            <div className="h-full rounded-2xl border border-border hover:border-amber-400 transition-colors p-6 space-y-4">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-gradient-sky">
                  <Newspaper className="h-8 w-8 text-primary-foreground" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-center">Eco News</h3>
              <p className="text-muted-foreground text-center text-sm">
                Latest environmental news from Almaty and Kazakhstan — filtered and curated for you.
              </p>
              <div className="space-y-2">
                {['Almaty expands recycling points', 'Air quality improves in 2026', '10,000 trees planted this spring'].map((title, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                    {title}
                  </div>
                ))}
              </div>
              <div className="flex justify-center">
                <span className="text-sm text-amber-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                  Read news <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          </Link>

        </div>
      </div>

      {/* Gamification strip */}
      <div className="bg-muted py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">Level up as you go green</h2>
              <p className="text-muted-foreground text-sm">Complete challenges, climb leagues, unlock achievements</p>
            </div>
            <div className="flex gap-3">
              {[
                { emoji: '🌱', name: 'Green Seed', pts: '0–100' },
                { emoji: '🌿', name: 'Eco Enthusiast', pts: '100–250' },
                { emoji: '🍃', name: 'Nature Keeper', pts: '250–500' },
                { emoji: '🌳', name: 'Planet Guardian', pts: '500–1000' },
                { emoji: '🌍', name: 'Earth Legend', pts: '1000+' },
              ].map(l => (
                <div key={l.name} className="flex flex-col items-center px-3 py-3 rounded-xl border border-border bg-background text-center">
                  <span className="text-2xl mb-1">{l.emoji}</span>
                  <span className="text-xs font-medium">{l.name}</span>
                  <span className="text-xs text-muted-foreground">{l.pts} pts</span>
                </div>
              ))}
            </div>
            {user ? (
              <Link to="/challenges">
                <Button variant="outline">View challenges <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </Link>
            ) : (
              <Link to="/register">
                <Button variant="outline">Join & start leveling <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* CTA */}
      {!user && (
        <div className="bg-background py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">{t('home.ctaTitle')}</h2>
            <p className="text-xl text-muted-foreground mb-8">{t('home.ctaSubtitle')}</p>
            <Link to="/register">
              <Button size="lg" className="text-lg px-8">{t('home.ctaButton')}</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;