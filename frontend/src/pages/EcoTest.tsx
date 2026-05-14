import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { Leaf, ChevronRight, ChevronLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { EcoQuestion, EcoTestResult } from '@/types/eco';
import { useTranslation } from 'react-i18next';
import {Link} from "react-router-dom";

type TestState = 'loading' | 'questions' | 'submitting' | 'result' | 'error';

export default function EcoTest() {
  const { t } = useTranslation();
  const [state, setState] = useState<TestState>('loading');
  const [questions, setQuestions] = useState<EcoQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [result, setResult] = useState<EcoTestResult | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setState('loading');
      const response = await api.get('/eco/questions');
      setQuestions(response.data);
      setState('questions');
    } catch (err: any) {
      setError(err.response?.data?.error || t('ecoTest.loading'));
      setState('error');
    }
  };

  const handleAnswer = (questionId: number, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setState('submitting');
    try {
      const response = await api.post('/eco/submit', { answers });
      setResult(response.data);
      setState('result');
      toast.success(t('ecoTest.successToast') + ' 🌱');
    } catch (err: any) {
      toast.error(err.response?.data?.error || t('ecoTest.submit'));
      setState('questions');
    }
  };

  const handleRetake = () => {
    setAnswers({});
    setCurrentIndex(0);
    setResult(null);
    setState('questions');
  };

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const allAnswered = questions.every(q => answers[q.id] !== undefined);
  const currentAnswered = currentQuestion && answers[currentQuestion.id] !== undefined;

  if (state === 'loading') {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">{t('ecoTest.loading')}</p>
        </div>
      </Layout>
    );
  }

  if (state === 'error') {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-destructive font-medium">{error}</p>
          <Button onClick={fetchQuestions}>{t('ecoTest.tryAgain')}</Button>
        </div>
      </Layout>
    );
  }

  if (state === 'result' && result) {
    return (
      <Layout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto space-y-6"
        >
          <Card className="overflow-hidden">
            <div className="bg-gradient-forest p-6 text-primary-foreground text-center">
              <CheckCircle className="h-16 w-16 mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-2">{t('ecoTest.resultTitle')}</h1>
              <p className="text-primary-foreground/90">{t('ecoTest.resultSubtitle')}</p>
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="text-center">
                <div className="text-6xl font-bold text-primary mb-2">{Number(result.total_score).toFixed(2)}</div>
                <div className="text-xl font-semibold text-foreground">{result.category}</div>
                <p className="text-muted-foreground mt-2">{result.description}</p>
              </div>

              {result.tips && result.tips.length > 0 && (
                  <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-primary" />
                    {t('ecoTest.ecoTips')}
                  </h3>
                  <ul className="space-y-2">
                    {result.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-primary">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Link to="/eco-history">
                <Button variant="outline" className="w-full">
                  {t('ecoTest.viewHistory')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </Layout>
    );
  }

  if (state === 'submitting') {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">{t('ecoTest.analyzing')}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('ecoTest.title')}</h1>
          <p className="text-muted-foreground">
            {t('ecoTest.subtitle')}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t('ecoTest.question', { current: currentIndex + 1, total: questions.length })}</span>
            <span>{t('ecoTest.complete', { percent: Math.round(progress) })}</span>
          </div>
          <Progress value={Math.round(progress)} className="h-2" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
  {currentQuestion
    ? t(`ecoTest.questions.${currentQuestion.id}`, {
        defaultValue: currentQuestion.text,
      })
    : ''}
</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={answers[currentQuestion?.id]?.toString()}
                  onValueChange={(value) => handleAnswer(currentQuestion.id, parseInt(value))}
                  className="space-y-3"
                >
                  {currentQuestion?.options.map((option) => (
                    <div
                      key={option.value}
                      className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => handleAnswer(currentQuestion.id, option.value)}
                    >
                      <RadioGroupItem value={option.value.toString()} id={`option-${option.value}`} />
                   <Label htmlFor={`option-${option.value}`} className="flex-1 cursor-pointer">
  {t(`ecoTest.options.${option.value}`, {
    defaultValue: option.label,
  })}
</Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            {t('ecoTest.previous')}
          </Button>

          {currentIndex === questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={!allAnswered}
              className="flex items-center gap-2"
            >
              {t('ecoTest.submit')}
              <CheckCircle className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!currentAnswered}
              className="flex items-center gap-2"
            >
              {t('ecoTest.next')}
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Layout>
  );
}
