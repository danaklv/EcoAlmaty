import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/services/api';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

type ResetStatus = 'idle' | 'loading' | 'success' | 'error';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<ResetStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { t } = useTranslation();

  const token = searchParams.get('token');

  const resetPasswordSchema = z.object({
    new_password: z.string().min(8, t('resetPassword.minLength')),
    confirm_password: z.string(),
  }).refine((data) => data.new_password === data.confirm_password, {
    message: t('resetPassword.mismatch'),
    path: ['confirm_password'],
  });

  type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      new_password: '',
      confirm_password: '',
    },
  });

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) {
      setStatus('error');
      setErrorMessage(t('resetPassword.tokenMissing'));
      return;
    }

    setStatus('loading');
    try {
      await api.post('/reset-password', {
        token,
        new_password: data.new_password,
      });
      setStatus('success');
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(error.response?.data?.error || t('common.error'));
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-6 p-8 rounded-2xl bg-card border shadow-lg"
        >
          <XCircle className="w-16 h-16 mx-auto text-destructive" />
          <h1 className="text-2xl font-bold text-foreground">{t('resetPassword.invalidLink')}</h1>
          <p className="text-muted-foreground">{t('resetPassword.tokenMissing')}</p>
          <Button asChild variant="outline" className="w-full">
            <Link to="/forgot-password">{t('resetPassword.requestNewLink')}</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center space-y-6 p-8 rounded-2xl bg-card border shadow-lg"
      >
        {status === 'success' ? (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
            </motion.div>
            <h1 className="text-2xl font-bold text-foreground">{t('resetPassword.successTitle')}</h1>
            <p className="text-muted-foreground">{t('resetPassword.successText')}</p>
            <Button asChild className="w-full">
              <Link to="/login">{t('resetPassword.continueToLogin')}</Link>
            </Button>
          </>
        ) : status === 'error' ? (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <XCircle className="w-16 h-16 mx-auto text-destructive" />
            </motion.div>
            <h1 className="text-2xl font-bold text-foreground">{t('resetPassword.errorTitle')}</h1>
            <p className="text-muted-foreground">{errorMessage}</p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/forgot-password">{t('resetPassword.requestNewLink')}</Link>
            </Button>
          </>
        ) : (
          <>
            <Lock className="w-12 h-12 mx-auto text-primary" />
            <h1 className="text-2xl font-bold text-foreground">{t('resetPassword.setNewPassword')}</h1>
            <p className="text-muted-foreground">{t('resetPassword.enterNewPassword')}</p>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 text-left">
                <FormField
                  control={form.control}
                  name="new_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('resetPassword.newPassword')}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder={t('resetPassword.newPasswordPlaceholder')}
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirm_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('resetPassword.confirmPassword')}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder={t('resetPassword.confirmPasswordPlaceholder')}
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={status === 'loading'}>
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('resetPassword.loading')}
                    </>
                  ) : (
                    t('resetPassword.submit')
                  )}
                </Button>
              </form>
            </Form>
          </>
        )}
      </motion.div>
    </div>
  );
}