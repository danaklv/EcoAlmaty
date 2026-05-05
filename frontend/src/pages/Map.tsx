import { useEffect, useState, useRef } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useTranslation } from 'react-i18next';

const YANDEX_API_KEY = import.meta.env.VITE_YANDEX_MAP_KEY;

interface RecyclePoint {
  id: number;
  lat: number;
  lon: number;
  name: string;
  type: string;
  address?: string;
}

export default function Map() {
  const { t } = useTranslation();
  const mapRef = useRef<any>(null);
  const ymapsRef = useRef<any>(null);
  const [points, setPoints] = useState<RecyclePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [mapReady, setMapReady] = useState(false);

  // Загрузка Яндекс.Карт API
  useEffect(() => {
    if (document.getElementById('ymaps-script')) {
      setMapReady(true);
      return;
    }
    const script = document.createElement('script');
    script.id = 'ymaps-script';
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${YANDEX_API_KEY}&lang=ru_RU`;
    script.async = true;
    script.onload = () => setMapReady(true);
    document.head.appendChild(script);
  }, []);

  // Загрузка точек переработки
  useEffect(() => {
    const fetchRecyclePoints = async () => {
      try {
        const query = `
          [out:json][timeout:25];
          (
            node["amenity"="recycling"](43.1,76.7,43.4,77.1);
            node["amenity"="waste_disposal"](43.1,76.7,43.4,77.1);
            node["recycling_type"="centre"](43.1,76.7,43.4,77.1);
            node["recycling_type"="container"](43.1,76.7,43.4,77.1);
            way["amenity"="recycling"](43.1,76.7,43.4,77.1);
          );
          out center body;
        `;
        const res = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          body: query,
        });
        const data = await res.json();

        const mapped: RecyclePoint[] = data.elements
          .filter((el: any) => el.lat || el.center)
          .map((el: any) => ({
            id: el.id,
            lat: el.lat ?? el.center?.lat,
            lon: el.lon ?? el.center?.lon,
            name: el.tags?.name || el.tags?.operator || t('map.popupDefault'),
            type: el.tags?.recycling_type || el.tags?.amenity || 'recycling',
            address: el.tags?.['addr:street']
              ? `${el.tags['addr:street']} ${el.tags['addr:housenumber'] || ''}`
              : undefined,
          }));

        setPoints(mapped);
      } catch (e) {
        setError(t('map.failedLoad'));
      } finally {
        setLoading(false);
      }
    };

    fetchRecyclePoints();
  }, []);

  // Инициализация карты
  useEffect(() => {
    if (!mapReady || !points.length) return;

    const filtered = filter === 'all' ? points : points.filter(p => p.type === filter);

    (window as any).ymaps.ready(() => {
      const ymaps = (window as any).ymaps;
      ymapsRef.current = ymaps;

      if (mapRef.current?._map) {
        mapRef.current._map.destroy();
      }

      const map = new ymaps.Map('yandex-map', {
        center: [43.2389, 76.8897],
        zoom: 13,
        controls: ['zoomControl', 'geolocationControl'],
      });

      mapRef.current = { _map: map };

      filtered.forEach(point => {
        const placemark = new ymaps.Placemark(
          [point.lat, point.lon],
          {
            balloonContentHeader: point.name,
            balloonContentBody: `
              ${point.address ? `<p style="color:#666;font-size:12px">${point.address}</p>` : ''}
              <span style="background:#dcfce7;color:#166534;padding:2px 8px;border-radius:12px;font-size:11px">${point.type}</span>
            `,
          },
          {
            preset: 'islands#greenDotIcon',
          }
        );
        map.geoObjects.add(placemark);
      });

      // Кнопка геолокации уже есть в controls
    });
  }, [mapReady, points, filter]);

  const filterOptions = [
    { value: 'all', label: t('map.filters.all') },
    { value: 'centre', label: t('map.filters.centre') },
    { value: 'container', label: t('map.filters.container') },
    { value: 'recycling', label: t('map.filters.recycling') },
    { value: 'waste_disposal', label: t('map.filters.waste_disposal') },
  ];

  const filtered = filter === 'all' ? points : points.filter(p => p.type === filter);

  return (
    <Layout>
      <div className="space-y-4">
        <div className="bg-gradient-forest rounded-2xl p-6 text-primary-foreground">
          <h1 className="text-2xl font-bold mb-1">{t('map.title')}</h1>
          <p className="text-primary-foreground/80 text-sm">
            {t('map.subtitle')}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {filterOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === opt.value
                  ? 'bg-green-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
          <span className="px-3 py-1.5 text-sm text-muted-foreground">
            {loading ? t('map.loading') : t('map.pointsFound', { count: filtered.length })}
          </span>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        {!loading && points.length === 0 && !error && (
          <div className="bg-yellow-50 text-yellow-700 px-4 py-3 rounded-lg text-sm">
            {t('map.emptyNote')}
          </div>
        )}

        <div
          id="yandex-map"
          className="rounded-2xl overflow-hidden shadow-lg"
          style={{ height: '60vh', width: '100%' }}
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl p-3 shadow-sm border text-center">
            <p className="text-2xl font-bold text-green-600">{points.length}</p>
            <p className="text-xs text-muted-foreground mt-1">{t('map.stats.total')}</p>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm border text-center">
            <p className="text-2xl font-bold text-blue-600">{points.filter(p => p.type === 'centre').length}</p>
            <p className="text-xs text-muted-foreground mt-1">{t('map.stats.centres')}</p>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm border text-center">
            <p className="text-2xl font-bold text-purple-600">{points.filter(p => p.type === 'recycling').length}</p>
            <p className="text-xs text-muted-foreground mt-1">{t('map.stats.recycling')}</p>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm border text-center">
            <p className="text-2xl font-bold text-orange-600">{points.filter(p => p.type === 'container').length}</p>
            <p className="text-xs text-muted-foreground mt-1">{t('map.stats.containers')}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}