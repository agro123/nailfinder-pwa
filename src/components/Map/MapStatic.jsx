import React from 'react';
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet';
import L from 'leaflet';
import './Map.css';

/**
 * MapStatic
 *
 * Renders a non-interactive (image-like) map with the given markers. This is
 * useful for display-only contexts (for example, in cards or summary views)
 * where no user interaction is needed.
 *
 * Props:
 * - coordinates: Array<{ lat, lng, label?, iconColor? }>
 * - zoom, center, height, width
 * - markerColor: fallback color for markers (default '#e25b7a')
 *
 * Notes:
 * - The map is configured with most interactive controls disabled and pointer-events
 *   set to 'none' so it behaves like a static image. If you need keyboard or
 *   accessibility support for the static map, consider rendering an alternative
 *   textual summary alongside it.
 */
const createDivIcon = (color = '#e25b7a') => {
  const markerHtml = `
    <div class="custom-marker-wrapper">
      <div 
        class="custom-marker" 
        style="background-color: ${color};"
      ></div>
    </div>
  `;

  return L.divIcon({
    html: markerHtml,
    className: 'custom-marker-icon-container',
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -42],
  });
};

/**
 * MapStatic
 * Renders a non-interactive map (image-like) with the given markers.
 * Props:
 * - coordinates: array of {lat, lng, label?, iconColor?}
 * - zoom, center, height, width, markerColor
 */
const MapStatic = ({
  coordinates = [],
  zoom = 13,
  center = { lat: 51.505, lng: -0.09 },
  height = '300px',
  width = '100%',
  markerColor = '#e25b7a',
  userLocation = null,
  userLocationOptions = {},
}) => {
  const icon = createDivIcon(markerColor);

  return (
    <div style={{ height, width }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', pointerEvents: 'none' }}
        dragging={false}
        touchZoom={false}
        doubleClickZoom={false}
        scrollWheelZoom={false}
        zoomControl={false}
        attributionControl={false}
        keyboard={false}
        boxZoom={false}
        tap={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {userLocation && (
          <Circle
            center={[userLocation.lat, userLocation.lng]}
            radius={userLocationOptions.radius || 14}
            pathOptions={{
              color: userLocationOptions.color || '#aed0ffff',
              fillColor: userLocationOptions.fillColor || userLocationOptions.color || '#3388ff',
              fillOpacity: userLocationOptions.fillOpacity != null ? userLocationOptions.fillOpacity : 0.9,
            }}
          />
        )}
        {coordinates.map((c, i) => (
          <Marker
            key={i}
            position={[c.lat, c.lng]}
            icon={createDivIcon(c.iconColor || markerColor)}
            interactive={false}
          />
        ))}
      </MapContainer>
    </div>
  );
};

export default MapStatic;
