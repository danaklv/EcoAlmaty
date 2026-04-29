import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface RecyclePoint {
  id: number;
  lat: number;
  lon: number;
  name: string;
  type: string;
  address?: string;
}

function LocationButton() {
  const map = useMap();
  return (
    <button
      onClick={() => map.locate({ setView: true, maxZoom: 15 })}
      className="absolute bottom-8 right-4 z-[1000] bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors"
      title="My location"
    >
      📍
    </button>
  );
}

export default function Map() {
  const [points, setPoints] = useState<RecyclePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

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
            node["shop"="charity"](43.1,76.7,43.4,77.1);
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
            name: el.tags?.name || el.tags?.operator || 'Recycling point',
            type: el.tags?.recycling_type || el.tags?.amenity || 'recycling',
            address: el.tags?.['addr:street']
              ? `${el.tags['addr:street']} ${el.tags['addr:housenumber'] || ''}`
              : undefined,
          }));

        setPoints(mapped);
      } catch (e) {
        setError('Failed to load map data');
      } finally {
        setLoading(false);
      }
    };

    fetchRecyclePoints();
  }, []);

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'centre', label: 'Centres' },
    { value: 'container', label: 'Containers' },
    { value: 'recycling', label: 'Recycling' },
    { value: 'waste_disposal', label: 'Waste Disposal' },
    { value: 'charity', label: 'Charity' },
  ];

  const filtered = filter === 'all' ? points : points.filter(p => p.type === filter);

  return (
    <Layout>
      <div className="space-y-4">
        <div className="bg-gradient-forest rounded-2xl p-6 text-primary-foreground">
          <h1 className="text-2xl font-bold mb-1">🗺️ Eco Map of Almaty</h1>
          <p className="text-primary-foreground/80 text-sm">
            Real recycling and waste collection points from OpenStreetMap
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
            {loading ? 'Loading...' : `${filtered.length} points found`}
          </span>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        {!loading && points.length === 0 && !error && (
          <div className="bg-yellow-50 text-yellow-700 px-4 py-3 rounded-lg text-sm">
            No recycling points found in OpenStreetMap for Almaty yet. Data is community-contributed.
          </div>
        )}

        <div className="relative rounded-2xl overflow-hidden shadow-lg" style={{ height: '60vh' }}>
          <MapContainer
            center={[43.2389, 76.8897]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filtered.map(point => (
              <Marker key={point.id} position={[point.lat, point.lon]}>
                <Popup>
                  <div className="min-w-[160px]">
                    <p className="font-semibold text-sm">{point.name}</p>
                    {point.address && (
                      <p className="text-xs text-gray-500 mt-1">{point.address}</p>
                    )}
                    <span className="inline-block mt-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full capitalize">
                      {point.type}
                    </span>
                  </div>
                </Popup>
              </Marker>
            ))}
            <LocationButton />
          </MapContainer>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl p-3 shadow-sm border text-center">
            <p className="text-2xl font-bold text-green-600">{points.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Total points</p>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm border text-center">
            <p className="text-2xl font-bold text-blue-600">{points.filter(p => p.type === 'centre').length}</p>
            <p className="text-xs text-muted-foreground mt-1">Eco centres</p>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm border text-center">
            <p className="text-2xl font-bold text-purple-600">{points.filter(p => p.type === 'recycling').length}</p>
            <p className="text-xs text-muted-foreground mt-1">Recycling</p>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm border text-center">
            <p className="text-2xl font-bold text-orange-600">{points.filter(p => p.type === 'container').length}</p>
            <p className="text-xs text-muted-foreground mt-1">Containers</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}