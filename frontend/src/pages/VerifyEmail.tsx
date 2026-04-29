import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '@/services/api';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type VerificationStatus = 'loading' | 'success' | 'error';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const code = searchParams.get('code');

      if (!code) {
        setStatus('error');
        setMessage('Verification code is missing');
        return;
      }

      try {
        await api.get(`/verify?code=${code}`);
        setStatus('success');
        setMessage('Your email has been confirmed successfully!');
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.error || 'Invalid or expired verification link');
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center space-y-6 p-8 rounded-2xl bg-card border shadow-lg"
      >
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin" />
            <h1 className="text-2xl font-bold text-foreground">Verifying your email...</h1>
            <p className="text-muted-foreground">Please wait a moment</p>
          </>
        )}

        {status === 'success' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
            </motion.div>
            <h1 className="text-2xl font-bold text-foreground">Email Confirmed!</h1>
            <p className="text-muted-foreground">{message}</p>
            <Button asChild className="w-full">
              <Link to="/login">Continue to Login</Link>
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <XCircle className="w-16 h-16 mx-auto text-destructive" />
            </motion.div>
            <h1 className="text-2xl font-bold text-foreground">Verification Failed</h1>
            <p className="text-muted-foreground">{message}</p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/login">Go to Login</Link>
            </Button>
          </>
        )}
      </motion.div>
    </div>
  );
}