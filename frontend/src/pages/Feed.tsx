import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExternalLink, Calendar, Newspaper, Image as ImageIcon } from 'lucide-react';
import { api } from '@/services/api';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

// 1. Добавили опциональное поле image_url для фото
interface NewsItem {
  id: number;
  title: string;
  link: string;
  published_at: string;
  source: string;
  description: string;
  image_url?: string; 
}

const cleanHtml = (html: string): string => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  let text = doc.body.textContent || '';
  // Убираем URL
  text = text.replace(/https?:\/\/[^\s]+/g, '').trim();
  return text.length > 150 ? text.substring(0, 150) + '...' : text;
};

export default function Feed() {
  const { t } = useTranslation();
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  type NewsResponse = {
    items: NewsItem[];
    limit: number;
    offset: number;
    total: number;
  };

  const { data: news, isLoading, error } = useQuery({
    queryKey: ['news'],
    queryFn: async () => {
      const response = await api.get<NewsResponse>('/news?limit=10&offset=0');

      return response.data.items.sort((a, b) =>
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
      );
    },
  });

  if (error) {
    toast.error(t('feed.failedLoad'));
  }

  const sources = news ? Array.from(new Set(news.map(item => item.source))) : [];
  const filteredNews = sourceFilter === 'all' 
    ? news 
    : news?.filter(item => item.source === sourceFilter);

  return (
    <Layout>
      <div className="space-y-6 max-w-4xl mx-auto"> {/* Ограничили ширину ленты для удобного чтения */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('feed.title')}</h1>
            <p className="text-muted-foreground mt-1">{t('feed.subtitle')}</p>
          </div>

          {sources.length > 0 && (
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-full sm:w-[250px]">
                <SelectValue placeholder={t('feed.filterBySource')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('feed.allSources')}</SelectItem>
                {sources.map(source => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {isLoading ? (
          // 2. Изменили Skeleton под новый горизонтальный дизайн
          <div className="flex flex-col gap-6">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="flex flex-col sm:flex-row">
                <Skeleton className="h-48 sm:w-1/3 sm:h-auto rounded-none sm:rounded-l-lg" />
                <div className="flex-1 p-6">
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-1/4 mb-4" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredNews && filteredNews.length > 0 ? (
          // 3. Заменили grid на flex-col для отображения списком
          <div className="flex flex-col gap-6">
            {filteredNews.map((item) => (
              // 4. Сделали карточку горизонтальной на больших экранах (sm:flex-row)
              <Card key={item.id} className="flex flex-col sm:flex-row hover:shadow-md transition-shadow overflow-hidden">
                
                {/* Блок с картинкой */}
                <div className="sm:w-1/3 bg-muted shrink-0 relative min-h-[200px] sm:min-h-full flex items-center justify-center border-b sm:border-b-0 sm:border-r border-border">
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.title} 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-muted-foreground">
                      <ImageIcon className="h-10 w-10 mb-2 opacity-50" />
                      <span className="text-xs">Нет фото</span>
                    </div>
                  )}
                </div>

                {/* Блок с контентом */}
                <div className="flex-1 flex flex-col">
                  <CardHeader className="pb-3">
                    <CardTitle className="line-clamp-2 text-xl hover:text-primary transition-colors">
                      <a href={item.link} target="_blank" rel="noreferrer">
                        {item.title}
                      </a>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1.5 text-xs font-medium">
                        <Newspaper className="h-3.5 w-3.5" />
                        {item.source}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(new Date(item.published_at), 'dd MMM yyyy, HH:mm')}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <p className="text-sm text-foreground/80 mb-4 line-clamp-3 leading-relaxed">
                      {cleanHtml(item.description)}
                    </p>
                    <div className="flex justify-end mt-auto pt-4 border-t border-border/50">
                      <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-primary/10 hover:text-primary"
                          onClick={() => window.open(item.link, '_blank')}
                      >
                        {t('feed.readMore')} <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-16">
            <CardContent>
              <div className="flex justify-center mb-4">
                <Newspaper className="h-16 w-16 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('feed.noNews')}</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                {sourceFilter !== 'all'
                  ? t('feed.noNewsSource')
                  : t('feed.noNewsDefault')}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}