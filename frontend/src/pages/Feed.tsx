import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExternalLink, Calendar, Newspaper } from 'lucide-react';
import { api } from '@/services/api';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface NewsItem {
  id: number;
  title: string;
  link: string;
  published_at: string;
  source: string;
  description: string;
}

const cleanHtml = (html: string): string => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  let text = doc.body.textContent || '';
  // Remove URLs
  text = text.replace(/https?:\/\/[^\s]+/g, '').trim();
  return text.length > 150 ? text.substring(0, 150) + '...' : text;
};

export default function Feed() {
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
    toast.error('Failed to load news feed');
  }

  const sources = news ? Array.from(new Set(news.map(item => item.source))) : [];
  const filteredNews = sourceFilter === 'all' 
    ? news 
    : news?.filter(item => item.source === sourceFilter);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Eco News Feed</h1>
            <p className="text-muted-foreground mt-1">Stay updated with the latest environmental news</p>
          </div>
          
          {sources.length > 0 && (
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-full sm:w-[250px]">
                <SelectValue placeholder="Filter by source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredNews && filteredNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map((item) => (
              <Card key={item.id} className="flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="line-clamp-2 text-lg">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="flex flex-col gap-1">
                    <span className="flex items-center gap-1 text-xs">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(item.published_at), 'MMM dd, yyyy')}
                    </span>
                    <span className="flex items-center gap-1 text-xs">
                      <Newspaper className="h-3 w-3" />
                      {item.source}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <p className="text-sm text-muted-foreground mb-4 break-words line-clamp-4">
                    {cleanHtml(item.description)}
                  </p>
                  <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(item.link, '_blank')}
                  >
                    Read More <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <div className="flex justify-center mb-4">
                <Newspaper className="h-16 w-16 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No news available</h3>
              <p className="text-muted-foreground">
                {sourceFilter !== 'all' 
                  ? 'No articles found for this source. Try selecting a different source.'
                  : 'Check back later for the latest environmental news.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
