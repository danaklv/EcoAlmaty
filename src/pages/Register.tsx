import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Mail, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(15 * 60);
  const { register } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    if (!success) return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return;
    setIsLoading(true);
    try {
      await register(username, email, password);
      setSuccess(true);
    } catch (error) {
      // Error handled by AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const expired = secondsLeft === 0;

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-earth p-4 relative">
        <div className="absolute top-4 right-4 z-10">
          <LanguageSwitcher />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-md"
        >
          <Card className="overflow-hidden">
            <div className="h-1 w-full" style={{ background: 'var(--gradient-forest)' }} />
            <CardContent className="pt-8 pb-8 text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 14 }}
                className="flex justify-center"
              >
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center">
                    <Mail className="h-9 w-9 text-primary" />
                  </div>
                  {[0, 1].map((i) => (
                    <motion.div
                      key={i}
                      className="absolute inset-0 rounded-full border-2 border-primary/30"
                      animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
                      transition={{ duration: 1.8, delay: i * 0.9, repeat: Infinity }}
                    />
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
              >
                <h2 className="text-2xl font-bold">{t('auth.register.successTitle')}</h2>
                <p className="text-muted-foreground text-sm">{t('auth.register.successText')}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 border ${
                  expired ? 'bg-destructive/5 border-destructive/20' : 'bg-amber-50 border-amber-200'
                }`}
              >
                <Clock className={`h-5 w-5 shrink-0 ${expired ? 'text-destructive' : 'text-amber-500'}`} />
                <p className={`text-sm font-medium ${expired ? 'text-destructive' : 'text-amber-700'}`}>
                  {expired
                    ? t('auth.register.linkExpired')
                    : t('auth.register.successExpiry', { time: `${minutes}:${String(seconds).padStart(2, '0')}` })}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {expired ? (
                  <Button asChild className="w-full">
                    <Link to="/register">{t('auth.register.registerAgain')}</Link>
                  </Button>
                ) : (
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/login">{t('auth.register.alreadyConfirmed')}</Link>
                  </Button>
                )}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-earth p-4 relative">
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-forest mb-4">
            <Leaf className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">{t('auth.register.title')}</CardTitle>
          <CardDescription className="text-center">{t('auth.register.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">{t('auth.register.username')}</Label>
              <Input
                id="username"
                type="text"
                placeholder="eco_warrior"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.register.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.register.password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('auth.register.confirmPassword')}</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {password && confirmPassword && password !== confirmPassword && (
                <p className="text-sm text-destructive">{t('auth.register.passwordMismatch')}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || password !== confirmPassword}
            >
              {isLoading ? t('auth.register.loading') : t('auth.register.submit')}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            {t('auth.register.hasAccount')}{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              {t('auth.register.signIn')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}