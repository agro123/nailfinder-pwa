import React, { useState, useEffect, useMemo } from 'react';
import MapComponent, { MapPicker, MapStatic } from '../../components/Map';

/**
 * ExampleMap
 *
 * This page demonstrates the three map components and enhances them with
 * automatic user geolocation:
 * - On entry the page requests the user's location via the browser Geolocation API.
 * - If the user grants permission, the maps are centered on the user's location
 *   and markers are sorted/filtered so the nearest ones are shown first.
 * - If the user denies or the request times out, the components fall back to
 *   their default centers and marker lists.
 *
 * Behavior details:
 * - We compute distances (Haversine) from the user's location to all example
 *   markers. `nearbyPoints` contains markers within 5 km; if none are within
 *   5 km, we show the 5 closest markers instead.
 * - The MapPicker and MapComponent receive the user's location as `center` when available.
 * - The MapStatic shows the same marker set as the interactive map but in non-interactive mode.
 */
export default function ExampleMap() {
  const [pickedLocation, setPickedLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('pending'); // 'pending' | 'granted' | 'denied' | 'unavailable'

  // Example markers (static sample data)
  const points = [
    {
      lat: 3.375,
      lng: -76.53,
      label: 'Barber shop Capri 💈',
      iconColor: '#e25b7a',
    },
    {
      lat: 3.37,
      lng: -76.535,
      label: 'Spa el Altar de Relax 💆‍♀️',
      iconColor: '#e25b7a',
    },
    {
      lat: 3.36,
      lng: -76.52,
      label: 'Salon Beauty 💅',
      iconColor: '#e25b7a',
    },
  ];

  // Haversine distance in meters
  const haversine = (lat1, lon1, lat2, lon2) => {
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371000; // meters
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Compute sorted and nearby points based on userLocation
  const { sortedPoints, nearbyPoints } = useMemo(() => {
    if (!userLocation) return { sortedPoints: points, nearbyPoints: [] };
    const withDist = points.map((p) => ({
      ...p,
      distance: haversine(userLocation.lat, userLocation.lng, p.lat, p.lng),
    }));
    const sorted = withDist.slice().sort((a, b) => a.distance - b.distance);
    const nearby = sorted.filter((p) => p.distance <= 5000).map(({ distance, ...rest }) => rest);
    const fallbackNearby = sorted.slice(0, 5).map(({ distance, ...rest }) => rest);
    return { sortedPoints: sorted.map(({ distance, ...rest }) => rest), nearbyPoints: nearby.length ? nearby : fallbackNearby };
  }, [points, userLocation]);

  // Request user location on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus('unavailable');
      return;
    }

    const onSuccess = (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      setUserLocation({ lat, lng });
      setLocationStatus('granted');
    };

    const onError = (err) => {
      console.info('Geolocation error or permission denied:', err && err.message);
      setLocationStatus('denied');
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, { enableHighAccuracy: true, timeout: 10000 });
  }, []);

  const handlePickChange = (context) => {
    setPickedLocation({ lat: context.lat, lng: context.lng });
  };

  // control to show/hide user's location marker on the examples
  const [showUserLocation, setShowUserLocation] = useState(false);

  const toggleShowUserLocation = () => {
    setShowUserLocation((s) => !s);
  };

  // Determine centers: if we have userLocation center on it, otherwise use default center
  const center = userLocation || { lat: 3.37, lng: -76.53 };

  return (
    <div style={{ padding: 16 }}>
      <h2>Map examples</h2>

      <div style={{ marginBottom: 12 }}>
        {locationStatus === 'pending' && <div>Solicitando ubicación del usuario…</div>}
        {locationStatus === 'granted' && userLocation && (
          <div>Ubicación detectada: {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}</div>
        )}
        {(locationStatus === 'denied' || locationStatus === 'unavailable') && (
          <div>No se dispone de ubicación; se usan las ubicaciones por defecto.</div>
        )}
        <div style={{ marginTop: 8 }}>
          <button onClick={toggleShowUserLocation} disabled={!userLocation}>
            {showUserLocation ? 'Ocultar mi ubicación' : 'Mostrar mi ubicación'}
          </button>
          <button
            onClick={() => {
              if (userLocation) {
                // center maps by setting userLocation (already used as center variable)
                // small UX: also ensure the showUserLocation is true so marker becomes visible
                setShowUserLocation(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            style={{ marginLeft: 8 }}
            disabled={!userLocation}
          >
            Centrar en mi ubicación
          </button>
        </div>
      </div>

      <section style={{ marginBottom: 24 }}>
        <h3>Mapa de ejemplo (interactivo)</h3>
        <p>El mapa centra automáticamente en tu ubicación si la autorizas y ordena los marcadores por cercanía.</p>
        <div style={{ height: 300, marginTop: 8 }}>
          <MapComponent
            coordinates={userLocation ? nearbyPoints : points}
            zoom={14}
            center={center}
            height="100%"
            width="100%"
            userLocation={showUserLocation ? userLocation : null}
          />
        </div>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h3>Seleccionar ubicación (MapPicker)</h3>
        <p>Haz click en el mapa para colocar un marcador (solo uno). Se devuelve lat/lng en onChange.</p>
        <div style={{ height: 300, marginTop: 8 }}>
          <MapPicker
            value={pickedLocation}
            onChange={handlePickChange}
            center={center}
            zoom={14}
            height="100%"
            width="100%"
            markerColor="#e25b7a"
            userLocation={showUserLocation ? userLocation : null}
          />
        </div>
        <div style={{ marginTop: 8 }}>
          <strong>Ubicación seleccionada:</strong>{' '}
          {pickedLocation ? `${pickedLocation.lat.toFixed(6)}, ${pickedLocation.lng.toFixed(6)}` : 'Ninguna'}
        </div>
      </section>

      <section>
        <h3>Mapa estático (MapStatic)</h3>
        <p>Mapa no interactivo que muestra los marcadores cercanos a tu ubicación (o las por defecto si no autorizas).</p>
        <div style={{ height: 240, marginTop: 8 }}>
          <MapStatic
            coordinates={[...(userLocation ? nearbyPoints : points), ...(pickedLocation ? [pickedLocation] : [])]}
            center={center}
            zoom={14}
            height="100%"
            width="100%"
            markerColor="#e25b7a"
            userLocation={showUserLocation ? userLocation : null}
          />
        </div>
      </section>
    </div>
  );
}
