import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, Leaf, ArrowRight, RefreshCw, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

type VerificationStatus = 'loading' | 'success' | 'error';

function FloatingLeaf({ delay, x, size }: { delay: number; x: string; size: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: x, top: '-30px' }}
      animate={{
        y: ['0vh', '110vh'],
        rotate: [0, 360],
        x: [0, 25, -15, 10, 0],
      }}
      transition={{
        duration: 10 + delay,
        delay,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      <Leaf style={{ width: size, height: size }} className="text-primary/15" />
    </motion.div>
  );
}

function LoadingDots() {
  return (
    <div className="flex items-center justify-center gap-1.5 mt-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-primary"
          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, delay: i * 0.25, repeat: Infinity }}
        />
      ))}
    </div>
  );
}

const LEAVES = [
  { id: 0, delay: 0,   x: '5%',  size: 20 },
  { id: 1, delay: 1.5, x: '15%', size: 14 },
  { id: 2, delay: 3,   x: '28%', size: 24 },
  { id: 3, delay: 0.8, x: '42%', size: 16 },
  { id: 4, delay: 2.2, x: '58%', size: 20 },
  { id: 5, delay: 4,   x: '70%', size: 14 },
  { id: 6, delay: 1,   x: '83%', size: 22 },
  { id: 7, delay: 2.8, x: '93%', size: 16 },
];

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [message, setMessage] = useState('');
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const verifyEmail = async () => {
      const code = searchParams.get('code');

      if (!code) {
        setStatus('error');
        setMessage(t('auth.verify.errorNote'));
        return;
      }

      try {
        const response = await api.get(`/verify?code=${code}`);
        const { access_token, refresh_token } = response.data;
        if (access_token) {
          await loginWithToken(access_token, refresh_token);
        }
        setStatus('success');
        setMessage('');
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.error || t('auth.verify.errorNote'));
      }
    };

    verifyEmail();
  }, [searchParams, t]);

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-earth overflow-hidden p-4">
      <div className="absolute top-4 right-4 z-20">
        <LanguageSwitcher />
      </div>
      {LEAVES.map((leaf) => (
        <FloatingLeaf key={leaf.id} {...leaf} />
      ))}

      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/5 translate-x-1/2 -translate-y-1/2 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-primary/5 -translate-x-1/2 translate-y-1/2 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative max-w-md w-full"
      >
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="flex items-center justify-center w-14 h-14 rounded-full shadow-lg"
            style={{ background: 'var(--gradient-forest)' }}
          >
            <Leaf className="h-7 w-7 text-white" />
          </motion.div>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-1 w-full" style={{ background: 'var(--gradient-forest)' }} />

          <div className="p-8 text-center">
            <AnimatePresence mode="wait">

              {/* LOADING */}
              {status === 'loading' && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-6"
                >
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center">
                        <Loader2 className="w-9 h-9 text-primary animate-spin" />
                      </div>
                      {[0, 1].map((i) => (
                        <motion.div
                          key={i}
                          className="absolute inset-0 rounded-full border-2 border-primary/25"
                          animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
                          transition={{ duration: 1.8, delay: i * 0.9, repeat: Infinity }}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">{t('auth.verify.verifying')}</h1>
                    <LoadingDots />
                  </div>
                  <p className="text-muted-foreground text-sm">{t('auth.verify.wait')}</p>
                </motion.div>
              )}

              {/* SUCCESS */}
              {status === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <div className="flex justify-center">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.1 }}
                      className="relative"
                    >
                      <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                      </div>
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="absolute inset-0 rounded-full border-2 border-emerald-400"
                          animate={{ scale: [1, 1.9], opacity: [0.7, 0] }}
                          transition={{ duration: 1.6, delay: i * 0.45, repeat: Infinity }}
                        />
                      ))}
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <h1 className="text-2xl font-bold text-foreground mb-1">
                      {t('auth.verify.successTitle')}
                    </h1>
                    <p className="text-muted-foreground text-sm">{t('auth.verify.successSubtitle')}</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-3 bg-accent rounded-xl p-4 text-left"
                  >
                    <div className="shrink-0 w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <Leaf className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-sm text-accent-foreground font-medium">
                      {t('auth.verify.successNote')}
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 }}
                    className="flex flex-col gap-3"
                  >
                    <Button className="w-full group" onClick={() => navigate('/dashboard')}>
                      {t('auth.verify.goToAccount')}
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/login">{t('auth.verify.signInInstead')}</Link>
                    </Button>
                  </motion.div>
                </motion.div>
              )}

              {/* ERROR */}
              {status === 'error' && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <div className="flex justify-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.1 }}
                    >
                      <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
                        <XCircle className="w-10 h-10 text-destructive" />
                      </div>
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <h1 className="text-2xl font-bold text-foreground mb-1">{t('auth.verify.errorTitle')}</h1>
                    <p className="text-muted-foreground text-sm">{message}</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-start gap-3 bg-destructive/5 border border-destructive/15 rounded-xl p-4 text-left"
                  >
                    <div className="shrink-0 w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center mt-0.5">
                      <Mail className="w-4 h-4 text-destructive" />
                    </div>
                    <p className="text-sm text-muted-foreground">{t('auth.verify.errorNote')}</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 }}
                    className="flex flex-col gap-3"
                  >
                    <Button asChild className="w-full">
                      <Link to="/register">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        {t('auth.verify.registerAgain')}
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/login">{t('auth.verify.goToLogin')}</Link>
                    </Button>
                  </motion.div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-5">
          {t('auth.verify.support')}{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            {t('auth.verify.contactSupport')}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}