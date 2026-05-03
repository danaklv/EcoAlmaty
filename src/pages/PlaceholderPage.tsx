import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Construction } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface PlaceholderPageProps {
  titleKey: string;
  descriptionKey: string;
}

export default function PlaceholderPage({ titleKey, descriptionKey }: PlaceholderPageProps) {
  const { t } = useTranslation();
  return (
    <Layout>
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
              <Construction className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">{t(titleKey)}</h1>
          <p className="text-muted-foreground">{t(descriptionKey)}</p>
          <p className="text-sm text-muted-foreground mt-4">
            {t('placeholder.comingSoon')}
          </p>
        </CardContent>
      </Card>
    </Layout>
  );
}