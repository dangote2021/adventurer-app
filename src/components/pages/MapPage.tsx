'use client';

import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/lib/store';
import { MAP_SPOTS, GPX_ROUTES, NEARBY_PEOPLE } from '@/lib/mock-data';
import { getSpots, type Spot } from '@/lib/supabase/queries';
import { t } from '@/lib/i18n';
import { getSportEmoji } from '@/lib/sports-config';

const CHAMONIX_LAT = 45.87;
const CHAMONIX_LNG = 6.86;
const DEFAULT_ZOOM = 13;

export default function MapPage() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);
  const routeLinesRef = useRef<any[]>([]);

  const {
    selectedSports,
    setSubPage,
    showToast,
    language,
    userLat,
    userLng,
    geoPermission,
    setUserLocation,
    setGeoPermission,
  } = useStore();

  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [spots, setSpots] = useState<Spot[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [sportFilter, setSportFilter] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);

  // Fetch spots from Supabase on mount
  useEffect(() => {
    let cancelled = false;
    getSpots()
      .then((data) => {
        if (!cancelled) {
          setSpots(data.length > 0 ? data : MAP_SPOTS as unknown as Spot[]);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSpots(MAP_SPOTS as unknown as Spot[]);
        }
      });
    return () => { cancelled = true; };
  }, []);

  // Request geolocation on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoPermission('denied');
      return;
    }

    // Check if we already have permission (stored)
    if (geoPermission === 'granted' && userLat && userLng) {
      return;
    }

    if (geoPermission === 'denied') {
      return;
    }

    // Request current position with timeout
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation(latitude, longitude);
        setGeoPermission('granted');
      },
      (error) => {
        setGeoPermission('denied');
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
    );
  }, []);

  // Initialize map — runs ONCE on mount (no geoloc deps to avoid destroy/recreate loop)
  useEffect(() => {
    if (mapReady || !mapContainerRef.current) return;

    const initMap = async () => {
      try {
        const L = (await import('leaflet')).default;
        // Store L globally so other effects can use it without re-importing
        (window as any).L = L;

        const centerLat = userLat || CHAMONIX_LAT;
        const centerLng = userLng || CHAMONIX_LNG;

        if (!mapContainerRef.current) {
          throw new Error('Map container not available');
        }

        const map = L.map(mapContainerRef.current, {
          center: [centerLat, centerLng],
          zoom: DEFAULT_ZOOM,
          attributionControl: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        mapRef.current = map;
        setMapReady(true);
        setMapError(null);
      } catch (err) {
        console.error('Failed to initialize Leaflet map:', err);
        setMapError(t('map.loadError', language) || 'Impossible de charger la carte');
      }
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        setMapReady(false);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update user position marker when geolocation changes (separate from init)
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    const L = (window as any).L;
    if (!L) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    if (geoPermission === 'granted' && userLat && userLng) {
      const userIcon = L.divIcon({
        html: `
          <div class="flex items-center justify-center w-8 h-8 bg-blue-500 border-2 border-white rounded-full shadow-lg">
            <div class="w-3 h-3 bg-white rounded-full"></div>
          </div>
        `,
        iconSize: [32, 32],
        className: '',
      });
      userMarkerRef.current = L.marker([userLat, userLng], {
        icon: userIcon,
        zIndexOffset: 1000,
      }).addTo(mapRef.current);

      mapRef.current.setView([userLat, userLng], DEFAULT_ZOOM);
    }
  }, [userLat, userLng, geoPermission, mapReady]);

  // Update markers and routes based on filters
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Clear existing route lines
    routeLinesRef.current.forEach((line) => line.remove());
    routeLinesRef.current = [];

    const L = (window as any).L;

    // Filter spots by selected sports, search query and difficulty
    const filteredSpots = spots.filter((spot) => {
      const matchesSport = selectedSports.length === 0 || selectedSports.includes(spot.sport);
      const matchesSearch =
        searchQuery === '' ||
        spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (spot.description ? spot.description.toLowerCase().includes(searchQuery.toLowerCase()) : false);
      const matchesDifficulty = !difficultyFilter || (spot as any).difficulty === difficultyFilter;
      return matchesSport && matchesSearch && matchesDifficulty;
    });

    // Add spot markers
    filteredSpots.forEach((spot) => {
      const icon = L.divIcon({
        html: `
          <div class="flex items-center justify-center w-10 h-10 text-xl bg-white rounded-full shadow-lg border-2 border-indigo-500">
            ${spot.emoji}
          </div>
        `,
        iconSize: [40, 40],
        className: 'cursor-pointer',
      });

      const marker = L.marker([spot.lat, spot.lng], { icon })
        .bindPopup(`
          <div class="p-2 text-sm">
            <div class="font-semibold">${spot.name}</div>
            <div class="text-xs text-gray-600">${spot.type} • Rating: ${spot.rating}/5</div>
            <button class="mt-2 px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700">
              ${t('map.seeDetail', language) || 'See Detail'}
            </button>
          </div>
        `)
        .on('popupopen', () => {
          const popupButton = document.querySelector('.leaflet-popup-content button');
          if (popupButton) {
            popupButton.addEventListener('click', () => {
              setSelectedSpot(spot);
            });
          }
        })
        .addTo(mapRef.current);

      markersRef.current.push(marker);
    });

    // Add GPX routes if sports are selected
    if (selectedSports.length > 0) {
      GPX_ROUTES.filter((route) => selectedSports.includes(route.sport)).forEach((route) => {
        if (route.coordinates && route.coordinates.length > 0) {
          const routeLine = L.polyline(route.coordinates, {
            color: route.color || 'var(--accent)',
            weight: 3,
            opacity: 0.7,
            dashArray: '5, 5',
          })
            .bindPopup(`
              <div class="p-2 text-sm">
                <div class="font-semibold">${route.name}</div>
                <div class="text-xs text-gray-600">${route.distance}km • ${route.duration}</div>
                <div class="text-xs text-gray-600">Difficulty: ${route.difficulty}</div>
              </div>
            `)
            .addTo(mapRef.current);

          routeLinesRef.current.push(routeLine);
        }
      });
    }

    // Add nearby people markers if available
    NEARBY_PEOPLE.forEach((person) => {
      if (selectedSports.length === 0 || selectedSports.includes(person.sport)) {
        const isLive = person.isLive;
        const icon = L.divIcon({
          html: `
            <div class="relative">
              <div class="w-8 h-8 rounded-full overflow-hidden border-2 ${isLive ? 'border-red-500' : 'border-gray-500'} shadow-lg">
                <img src="${person.avatar}" alt="${person.name}" class="w-full h-full object-cover" />
              </div>
              ${isLive ? '<div class="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse border border-white"></div>' : ''}
            </div>
          `,
          iconSize: [32, 32],
          className: 'cursor-pointer',
        });

        const baseLat = userLat || CHAMONIX_LAT;
        const baseLng = userLng || CHAMONIX_LNG;
        const marker = L.marker(
          [
            baseLat + (Math.random() - 0.5) * 0.1,
            baseLng + (Math.random() - 0.5) * 0.1,
          ],
          { icon }
        )
          .bindPopup(`
            <div class="p-2 text-sm">
              <div class="font-semibold">${person.name}</div>
              <div class="text-xs text-gray-600">${person.sport}${isLive ? ' • 🔴 Live' : ''}</div>
              <button class="mt-2 px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700">
                ${t('map.whoGoes', language) || 'Who Goes'}
              </button>
            </div>
          `)
          .addTo(mapRef.current);

        markersRef.current.push(marker);
      }
    });
  }, [mapReady, selectedSports, searchQuery, spots, t]);

  const handleMyPosition = () => {
    if (!navigator.geolocation) {
      showToast(t('map.geoUnavailable', language) || 'Geolocation is unavailable');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation(latitude, longitude);
        setGeoPermission('granted');

        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], DEFAULT_ZOOM);
        }

        showToast(t('map.centeredOn', language) || 'Centered on your position');
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setGeoPermission('denied');
          showToast(t('map.geoPermission', language) || 'Geolocation permission denied');
        } else {
          showToast(t('map.geoUnavailable', language) || 'Unable to get your location');
        }
      }
    );
  };

  const handleCenterChamonix = () => {
    if (mapRef.current) {
      mapRef.current.setView([CHAMONIX_LAT, CHAMONIX_LNG], DEFAULT_ZOOM);
    }
    showToast(t('map.centerChamonix', language) || 'Centered on Chamonix');
  };

  return (
    <div className="flex flex-col h-full max-w-[430px] mx-auto pb-20" style={{ backgroundColor: 'var(--bg)' }}>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

      {/* Header with search */}
      <div className="p-4 border-b" style={{ backgroundColor: 'var(--card)' }}>
        <h1 className="text-2xl font-bold mb-4">
          {selectedSports.length > 0
            ? selectedSports.join(', ')
            : t('map.all', language) || 'All Spots'}
        </h1>

        {/* Search input */}
        <div className="relative mb-3">
          <input
            type="text"
            placeholder={t('map.search', language) || 'Search spots...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Difficulty filter chips */}
      <div className="px-4 py-2 border-b flex gap-2 overflow-x-auto" style={{ backgroundColor: 'var(--card)' }}>
        {[
          { key: null, label: language === 'fr' ? 'Tous niveaux' : 'All levels' },
          { key: 'Facile', label: language === 'fr' ? 'Facile' : 'Easy' },
          { key: 'Moyen', label: language === 'fr' ? 'Moyen' : 'Medium' },
          { key: 'Difficile', label: language === 'fr' ? 'Difficile' : 'Hard' },
        ].map((d) => (
          <button
            key={d.key ?? 'all'}
            onClick={() => setDifficultyFilter(d.key)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${difficultyFilter === d.key ? 'bg-[var(--accent)] text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Map container */}
      {mapError ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center" style={{ minHeight: '400px', backgroundColor: 'var(--card)' }}>
          <div className="text-4xl mb-3">🗺️</div>
          <p className="text-gray-300 mb-4">{mapError}</p>
          <button
            onClick={() => { setMapError(null); setMapReady(false); }}
            className="px-5 py-2 bg-[var(--accent)] text-white rounded-lg font-medium hover:opacity-90 transition"
          >
            {language === 'fr' ? 'Réessayer' : 'Retry'}
          </button>
        </div>
      ) : (
        <div
          ref={mapContainerRef}
          className="flex-1 bg-gray-900 relative"
          style={{ minHeight: '400px' }}
          role="region"
          aria-label="Interactive map"
        />
      )}

      {/* Action buttons */}
      <div className="p-4 border-t flex gap-2" style={{ backgroundColor: 'var(--card)' }}>
        <button
          onClick={handleMyPosition}
          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm"
          title={t('map.myPosition', language) || 'My Position'}
          aria-label={t('map.myPosition', language) || 'My Position'}
        >
          📍 {t('map.myPosition', language) || 'My Position'}
        </button>

        <button
          onClick={handleCenterChamonix}
          className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition font-medium text-sm"
          aria-label="Center on Chamonix"
        >
          ⛰️ Chamonix
        </button>
      </div>

      {/* Spot detail panel - only show if no spots match current filter */}
      {selectedSpot && (
        <div className="absolute bottom-20 left-2 right-2 z-[1000] rounded-2xl p-4 shadow-2xl border" style={{ backgroundColor: 'var(--card)' }}>
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl">{selectedSpot.emoji}</div>
            <div className="flex-1">
              <h3 className="font-bold text-sm">{selectedSpot.name}</h3>
              <p className="text-sm text-gray-400">
                {selectedSpot.type} • Rating: {selectedSpot.rating}/5
              </p>
              {selectedSpot.description && (
                <p className="text-sm text-gray-300 mt-1">{selectedSpot.description}</p>
              )}
            </div>
            <button
              onClick={() => setSelectedSpot(null)}
              className="text-gray-500 hover:text-white focus:outline-none rounded p-1"
              aria-label="Close detail"
            >
              ✕
            </button>
          </div>

          {/* People going */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-gray-400">{t('map.whoGoes', language) || 'Who Goes'}:</span>
            {NEARBY_PEOPLE.slice(0, 3).map((p) => (
              <button
                key={p.id}
                onClick={() => setSubPage({ type: 'user-profile', userId: p.id })}
                className="w-7 h-7 rounded-full flex items-center justify-center text-sm hover:ring-2 transition"
                title={p.name}
                aria-label={`Profile of ${p.name}`}
              >
                <img src={p.avatar} alt={p.name} className="w-full h-full rounded-full object-cover" />
              </button>
            ))}
          </div>

          <button
            className="w-full mt-3 py-2.5 bg-indigo-600 text-white rounded-xl font-medium text-sm hover:bg-indigo-700 transition focus:outline-none"
            onClick={() => setSubPage({ type: 'trail-detail', trailId: selectedSpot.id })}
            aria-label={`See details of ${selectedSpot.name}`}
          >
            {t('map.seeDetail', language) || 'See Detail'} →
          </button>
        </div>
      )}
    </div>
  );
}
