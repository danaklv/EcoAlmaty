import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Leaf, Menu, User, Trophy, Activity, Users, MapPin, Heart, Info, TrendingUp, Star, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import appleLogo from '@/assets/apple-logo.png';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const navLinks = [
    { path: '/dashboard',   label: t('nav.dashboard'),   icon: Activity },
    { path: '/eco-actions', label: t('nav.ecoActions'),  icon: Leaf },
    { path: '/leaderboard', label: t('nav.leaderboard'), icon: Trophy },
    { path: '/feed',        label: t('nav.feed'),        icon: Activity },
    { path: '/forecast', label: 'AI Forecast', icon: TrendingUp },
    { path: '/map',         label: t('nav.map'),         icon: MapPin },
    { path: '/eco-history', label: t('nav.ecoHistory'), icon: TrendingUp },
    { path: '/friends',     label: t('nav.friends'),     icon: Heart },
    { path: '/achievements', label: t('nav.achievements'), icon: Star },
    { path: '/challenges', label: t('nav.challenges'), icon: Zap },
    { path: '/about',       label: t('nav.about'),       icon: Info },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center px-4">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center space-x-2 mr-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm border-2 border-primary/20">
            <img src={appleLogo} alt="EcoTrack" className="w-8 h-8 object-contain" />
          </div>
          <span className="text-xl font-bold text-primary">EcoTrack</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1 flex-1">
          {navLinks.slice(0, 5).map((link) => (
            <Link key={link.path} to={link.path}>
              <Button
                variant={isActive(link.path) ? 'default' : 'ghost'}
                size="sm"
                className="gap-2"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Button>
            </Link>
          ))}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Menu className="h-4 w-4" />
                {t('nav.more')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {navLinks.slice(5).map((link) => (
                <DropdownMenuItem key={link.path} asChild>
                  <Link to={link.path} className="flex items-center gap-2">
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Menu */}
        <div className="flex md:hidden flex-1 justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {navLinks.map((link) => (
                <DropdownMenuItem key={link.path} asChild>
                  <Link to={link.path} className="flex items-center gap-2">
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right side: rating + language + user */}
        <div className="flex items-center gap-2 ml-auto md:ml-4">
          {user && (
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-forest text-primary-foreground">
                <Trophy className="h-4 w-4" />
                <span className="font-semibold">{user.rating || 0}</span>
              </div>
              <span className="flex items-center gap-1 text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                {t('nav.level', { level: user.level || 1 })}
              </span>
            </div>
          )}

          <LanguageSwitcher />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarImage src={user?.avatar} alt={user?.username} />
                  <AvatarFallback className="bg-gradient-forest text-primary-foreground">
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.username}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  {t('nav.profile')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/profile/edit" className="cursor-pointer">
                  {t('nav.editProfile')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                {t('nav.logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};