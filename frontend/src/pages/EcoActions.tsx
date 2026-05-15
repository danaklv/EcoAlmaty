import { useState, useEffect, useRef } from 'react';
import { Layout } from '@/components/layout/Layout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Leaf,
  Recycle,
  Droplets,
  Zap,
  Bike,
  TreePine,
  ShoppingBag,
  Utensils,
  Loader2,
  CheckCircle2,
  Info,
  UploadCloud,
  Camera,
  Clock3,
  AlertCircle,
  X,
} from 'lucide-react';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface EcoAction {
  id: number;
  name: string;
  points: number;
  category: string;
}

interface ActionSubmission {
  id: number;
  action_id: number;
  action_name?: string;
  photo_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  ai_comment?: string;
  ai_confidence?: number;
  points?: number;
  created_at: string;
  reviewed_at?: string;
}

const categoryConfig: Record<string, { icon: any; color: string; bg: string }> = {
  water: { icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-100' },
  energy: { icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-100' },
  transport: { icon: Bike, color: 'text-green-500', bg: 'bg-green-100' },
  food: { icon: Utensils, color: 'text-orange-500', bg: 'bg-orange-100' },
  waste: { icon: Recycle, color: 'text-emerald-500', bg: 'bg-emerald-100' },
  nature: { icon: TreePine, color: 'text-green-700', bg: 'bg-green-100' },
  shopping: { icon: ShoppingBag, color: 'text-purple-500', bg: 'bg-purple-100' },
  default: { icon: Leaf, color: 'text-green-500', bg: 'bg-green-100' },
};

function isToday(date: Date): boolean {
  if (isNaN(date.getTime())) return false;

  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function getStatusConfig(status: string | undefined, t: any) {
  switch (status) {
    case 'approved':
      return {
        label: t('ecoActions.statusApproved', { defaultValue: 'Approved' }),
        icon: CheckCircle2,
        className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        buttonText: t('ecoActions.approvedToday', { defaultValue: 'Approved today' }),
      };

    case 'pending':
      return {
        label: t('ecoActions.statusPending', { defaultValue: 'Manual review' }),
        icon: Clock3,
        className: 'bg-amber-100 text-amber-700 border-amber-200',
        buttonText: t('ecoActions.underReview', { defaultValue: 'Under review' }),
      };

    case 'rejected':
      return {
        label: t('ecoActions.statusRejected', { defaultValue: 'Not approved' }),
        icon: AlertCircle,
        className: 'bg-red-100 text-red-700 border-red-200',
        buttonText: t('ecoActions.tryAgain', { defaultValue: 'Try again' }),
      };

    default:
      return null;
  }
}

export default function EcoActions() {
  const { updateUser } = useAuth();
  const { t } = useTranslation();

  const [actions, setActions] = useState<EcoAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState<number | null>(null);
  const [completedToday, setCompletedToday] = useState<Set<number>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const [selectedAction, setSelectedAction] = useState<EcoAction | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<ActionSubmission[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchActions();
    fetchSubmissions();
  }, []);

  useEffect(() => {
    const hasPending = submissions.some((s) => {
      return s.status === 'pending' && isToday(new Date(s.created_at));
    });

    if (!hasPending) return;

    const interval = window.setInterval(() => {
      fetchSubmissions();
      refreshProfile();
    }, 6000);

    return () => window.clearInterval(interval);
  }, [submissions]);

  const fetchActions = async () => {
    try {
      const res = await api.get('/eco-actions');

      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.items)
          ? res.data.items
          : [];

      setActions(list);
    } catch {
      toast.error(t('ecoActions.failedLoad'));
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const res = await api.get('/my-submissions');

      const list: ActionSubmission[] = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.items)
          ? res.data.items
          : [];

      setSubmissions(list);

      const ids = new Set<number>(
        list
          .filter((s) => {
            const createdAt = new Date(s.created_at);
            return isToday(createdAt) && ['pending', 'approved'].includes(s.status);
          })
          .map((s) => Number(s.action_id))
          .filter((id) => !Number.isNaN(id) && id > 0)
      );

      setCompletedToday(ids);
    } catch {
      // during development this endpoint may be unavailable
    }
  };

  const refreshProfile = async () => {
    try {
      const res = await api.get('/profile');

      updateUser({
        rating: res.data.rating,
        level: res.data.level,
        league: res.data.league,
      });
    } catch {
      // profile refresh is optional
    }
  };

  const getSubmissionForToday = (actionId: number) => {
    return submissions.find((s) => {
      return Number(s.action_id) === actionId && isToday(new Date(s.created_at));
    });
  };

  const closeUploadModal = () => {
    setSelectedAction(null);
    setSelectedPhoto(null);

    if (selectedPhotoPreview) {
      URL.revokeObjectURL(selectedPhotoPreview);
    }

    setSelectedPhotoPreview(null);
  };

  const handleSelectPhoto = (file?: File | null) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(
        t('ecoActions.toasts.invalidImage', {
          defaultValue: 'Please upload an image file',
        })
      );
      return;
    }

    if (selectedPhotoPreview) {
      URL.revokeObjectURL(selectedPhotoPreview);
    }

    setSelectedPhoto(file);
    setSelectedPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmitPhoto = () => {
    if (!selectedAction) return;

    if (!selectedPhoto) {
      toast.error(
        t('ecoActions.toasts.selectPhoto', {
          defaultValue: 'Please select a photo',
        })
      );
      return;
    }

    const action = selectedAction;
    const photo = selectedPhoto;

    const optimisticSubmission: ActionSubmission = {
      id: Date.now(),
      action_id: action.id,
      action_name: action.name,
      status: 'pending',
      points: action.points,
      created_at: new Date().toISOString(),
      ai_comment: t('ecoActions.uploadModal.checking', {
        defaultValue: 'Photo is being checked',
      }),
    };

    setCompletedToday((prev) => new Set([...prev, action.id]));
    setSubmissions((prev) => [optimisticSubmission, ...prev]);
    setLoadingAction(action.id);
    closeUploadModal();

    toast.info(
      t('ecoActions.toasts.photoSubmitted', {
        defaultValue: 'Photo submitted. Moderation is in progress.',
      })
    );

    const formData = new FormData();
    formData.append('action_id', String(action.id));
    formData.append('photo', photo);

    api
      .post('/actions/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then(async (response) => {
        const aiResult = response.data?.ai_result;

        await fetchSubmissions();
        await refreshProfile();

        if (aiResult?.approved) {
          toast.success(
            t('ecoActions.toasts.approved', {
              defaultValue: 'Photo approved. Points have been added!',
            })
          );
        } else {
          toast.info(
            t('ecoActions.toasts.waiting', {
              defaultValue: 'Photo is waiting for moderation.',
            })
          );
        }
      })
      .catch((error: any) => {
        setCompletedToday((prev) => {
          const next = new Set(prev);
          next.delete(action.id);
          return next;
        });

        setSubmissions((prev) => {
          return prev.filter((s) => s.id !== optimisticSubmission.id);
        });

        toast.error(
          error.response?.data?.error ||
            t('ecoActions.toasts.failedSubmit', {
              defaultValue: 'Failed to submit photo',
            })
        );
      })
      .finally(() => {
        setLoadingAction(null);
      });
  };

  const categories = ['all', ...Array.from(new Set(actions.map((a) => a.category)))];

  const filtered =
    activeCategory === 'all'
      ? actions
      : actions.filter((a) => a.category === activeCategory);

  const doneCount = filtered.filter((a) => completedToday.has(a.id)).length;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-gradient-forest rounded-2xl p-6 text-primary-foreground">
          <h1 className="text-2xl font-bold mb-1">{t('ecoActions.title')}</h1>
          <p className="text-primary-foreground/80 text-sm">{t('ecoActions.subtitle')}</p>

          {!loading && filtered.length > 0 && (
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 bg-white/20 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="bg-white h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(doneCount / filtered.length) * 100}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>

              <span className="text-sm font-semibold shrink-0">
                {doneCount}/{filtered.length}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-primary text-white'
                  : 'bg-white border border-border text-muted-foreground hover:bg-muted'
              }`}
            >
              {cat === 'all'
                ? t('ecoActions.all')
                : t(`ecoActions.categories.${cat}`, { defaultValue: cat })}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((action) => {
              const config = categoryConfig[action.category] || categoryConfig.default;
              const Icon = config.icon;

              const submission = getSubmissionForToday(action.id);
              const statusConfig = getStatusConfig(submission?.status, t);
              const StatusIcon = statusConfig?.icon;

              const done = completedToday.has(action.id);
              const canSubmit = !done || submission?.status === 'rejected';

              return (
                <motion.div
                  key={action.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    className={`relative overflow-hidden h-full flex flex-col transition-all duration-500 ${
                      submission?.status === 'approved'
                        ? 'bg-emerald-50 border-emerald-200 shadow-sm'
                        : submission?.status === 'pending'
                          ? 'bg-amber-50/70 border-amber-200 shadow-sm'
                          : submission?.status === 'rejected'
                            ? 'bg-red-50/60 border-red-200 shadow-sm'
                            : 'hover:shadow-md'
                    }`}
                  >
                    <AnimatePresence>
                      {submission?.status === 'approved' && (
                        <motion.div
                          key="shimmer"
                          initial={{ x: '-100%' }}
                          animate={{ x: '200%' }}
                          transition={{ duration: 0.65, ease: 'easeInOut' }}
                          className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-emerald-100/60 to-transparent pointer-events-none z-10"
                        />
                      )}
                    </AnimatePresence>

                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-3">
                        <div
                          className={`p-3 rounded-full transition-colors duration-300 ${
                            submission?.status === 'approved'
                              ? 'bg-emerald-100'
                              : submission?.status === 'pending'
                                ? 'bg-amber-100'
                                : submission?.status === 'rejected'
                                  ? 'bg-red-100'
                                  : config.bg
                          }`}
                        >
                          <AnimatePresence mode="wait">
                            {submission?.status === 'approved' ? (
                              <motion.div
                                key="check"
                                initial={{ scale: 0, rotate: -90 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                              >
                                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                              </motion.div>
                            ) : submission?.status === 'pending' ? (
                              <motion.div
                                key="clock"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                              >
                                <Clock3 className="h-6 w-6 text-amber-500" />
                              </motion.div>
                            ) : submission?.status === 'rejected' ? (
                              <motion.div
                                key="alert"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                              >
                                <AlertCircle className="h-6 w-6 text-red-500" />
                              </motion.div>
                            ) : (
                              <motion.div key="icon">
                                <Icon className={`h-6 w-6 ${config.color}`} />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors duration-300 ${
                            submission?.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-600'
                              : submission?.status === 'pending'
                                ? 'bg-amber-100 text-amber-700'
                                : submission?.status === 'rejected'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-green-100 text-green-700'
                          }`}
                        >
                          +{action.points} pts
                        </span>
                      </div>

                      <CardTitle
                        className={`mt-3 text-base transition-colors duration-300 ${
                          submission?.status === 'approved'
                            ? 'text-emerald-700'
                            : submission?.status === 'pending'
                              ? 'text-amber-800'
                              : submission?.status === 'rejected'
                                ? 'text-red-800'
                                : ''
                        }`}
                      >
                        {t(`ecoActions.items.${action.id}`, {
                          defaultValue: action.name,
                        })}
                      </CardTitle>

                      <CardDescription className="text-xs capitalize">
                        {t(`ecoActions.categories.${action.category}`, {
                          defaultValue: action.category,
                        })}
                      </CardDescription>

                      {statusConfig && StatusIcon && (
                        <div
                          className={`mt-3 inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${statusConfig.className}`}
                        >
                          <StatusIcon className="h-3.5 w-3.5" />
                          {statusConfig.label}
                        </div>
                      )}

                      {submission?.ai_comment && (
                        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                          {submission.ai_comment}
                        </p>
                      )}
                    </CardHeader>

                    <CardContent className="mt-auto">
                      <Button
                        className={`w-full transition-all duration-300 ${
                          submission?.status === 'approved'
                            ? 'bg-emerald-500 hover:bg-emerald-500 text-white cursor-default'
                            : submission?.status === 'pending'
                              ? 'bg-amber-500 hover:bg-amber-500 text-white cursor-default'
                              : submission?.status === 'rejected'
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : ''
                        }`}
                        onClick={() => canSubmit && setSelectedAction(action)}
                        disabled={
                          loadingAction === action.id ||
                          submission?.status === 'pending' ||
                          submission?.status === 'approved'
                        }
                      >
                        <AnimatePresence mode="wait">
                          {loadingAction === action.id ? (
                            <motion.span
                              key="loading"
                              className="flex items-center gap-2"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              <Loader2 className="h-4 w-4 animate-spin" />
                              {t('ecoActions.sending', { defaultValue: 'Sending...' })}
                            </motion.span>
                          ) : statusConfig ? (
                            <motion.span
                              key="status"
                              className="flex items-center gap-2"
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                            >
                              {StatusIcon && <StatusIcon className="h-4 w-4" />}
                              {statusConfig.buttonText}
                            </motion.span>
                          ) : (
                            <motion.span
                              key="idle"
                              className="flex items-center gap-2"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              <Camera className="h-4 w-4" />
                              {t('ecoActions.submitProof', {
                                defaultValue: 'Submit proof',
                              })}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="flex items-start gap-3 bg-muted rounded-xl px-4 py-3 text-sm text-muted-foreground">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <p>
            {t('ecoActions.moderationNote', {
              defaultValue:
                'Points are added after photo moderation. You can continue using the app while your proof is being checked.',
            })}
          </p>
        </div>
      </div>

      <AnimatePresence>
        {selectedAction && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) closeUploadModal();
            }}
          >
            <motion.div
              className="w-full max-w-lg"
              initial={{ opacity: 0, y: 22, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="overflow-hidden border-0 shadow-2xl">
                <div className="bg-gradient-forest p-5 text-primary-foreground">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                        <Camera className="h-3.5 w-3.5" />
                        {t('ecoActions.uploadModal.badge', {
                          defaultValue: 'Eco action proof',
                        })}
                      </div>

                      <CardTitle className="text-xl">
                        {t('ecoActions.uploadModal.title', {
                          defaultValue: 'Submit proof photo',
                        })}
                      </CardTitle>

                      <CardDescription className="mt-1 text-primary-foreground/80">
                        {t('ecoActions.uploadModal.subtitle', {
                          defaultValue:
                            'Upload a clear photo and continue using the app. The result will appear on the card later.',
                        })}
                      </CardDescription>
                    </div>

                    <button
                      type="button"
                      onClick={closeUploadModal}
                      className="rounded-full bg-white/10 p-2 text-white/80 transition hover:bg-white/20 hover:text-white"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <CardContent className="space-y-5 p-5">
                  <div className="rounded-2xl border bg-muted/50 p-4">
                    <p className="font-semibold">
                      {t(`ecoActions.items.${selectedAction.id}`, {
                        defaultValue: selectedAction.name,
                      })}
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {t('ecoActions.uploadModal.pointsAfter', {
                        points: selectedAction.points,
                        defaultValue: `+${selectedAction.points} pts after moderation`,
                      })}
                    </p>
                  </div>

                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        fileInputRef.current?.click();
                      }
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleSelectPhoto(e.dataTransfer.files?.[0]);
                    }}
                    className={`group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed p-5 text-center transition ${
                      selectedPhotoPreview
                        ? 'border-primary/40 bg-primary/5'
                        : 'border-border bg-muted/30 hover:border-primary/50 hover:bg-primary/5'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleSelectPhoto(e.target.files?.[0])}
                    />

                    {selectedPhotoPreview ? (
                      <div className="space-y-4">
                        <div className="relative mx-auto h-48 overflow-hidden rounded-xl border bg-background">
                          <img
                            src={selectedPhotoPreview}
                            alt="Selected proof"
                            className="h-full w-full object-cover"
                          />

                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-left text-white">
                            <p className="truncate text-sm font-medium">
                              {selectedPhoto?.name}
                            </p>
                            <p className="text-xs text-white/75">
                              {t('ecoActions.uploadModal.replacePhoto', {
                                defaultValue: 'Click to replace photo',
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center py-5">
                        <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary transition group-hover:scale-105">
                          <UploadCloud className="h-8 w-8" />
                        </div>

                        <p className="font-semibold">
                          {t('ecoActions.uploadModal.uploadTitle', {
                            defaultValue: 'Upload or drag photo here',
                          })}
                        </p>

                        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                          {t('ecoActions.uploadModal.uploadHint', {
                            defaultValue:
                              'Choose a clear image that shows the completed eco action.',
                          })}
                        </p>

                        <div className="mt-4 rounded-full bg-white px-4 py-2 text-xs font-medium text-muted-foreground shadow-sm">
                          {t('ecoActions.uploadModal.fileHint', {
                            defaultValue: 'PNG, JPG, JPEG up to 5MB',
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
                    {t('ecoActions.uploadModal.notice', {
                      defaultValue:
                        'The photo will be sent for moderation. You do not need to wait — the card status will update automatically.',
                    })}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={closeUploadModal}
                    >
                      {t('ecoActions.uploadModal.cancel', {
                        defaultValue: 'Cancel',
                      })}
                    </Button>

                    <Button
                      className="w-full"
                      onClick={handleSubmitPhoto}
                      disabled={!selectedPhoto}
                    >
                      {t('ecoActions.uploadModal.submit', {
                        defaultValue: 'Submit proof',
                      })}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}