import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import './Map.css';

/**
 * MapPicker
 *
 * Small, form-friendly map component that lets the user pick a single location by
 * clicking on the map. It supports both controlled and uncontrolled modes.
 *
 * Props:
 * - value: { lat, lng } | undefined -> when provided the component behaves as controlled
 * - defaultValue: { lat, lng } -> initial value when uncontrolled
 * - onChange: (context) => void where context = { lat, lng, event }
 * - zoom, center, height, width: presentation props
 * - markerColor: hex or CSS color for the placed marker (defaults to '#e25b7a')
 *
 * Controlled vs Uncontrolled behavior:
 * - Controlled: pass `value` and update it from the parent in response to `onChange`.
 * - Uncontrolled: omit `value` and optionally pass `defaultValue`; MapPicker will
 *   manage its own internal state and still call `onChange` when the user clicks.
 *
 * Example:
 *  const [pos, setPos] = useState(null);
 *  <MapPicker value={pos} onChange={({lat,lng}) => setPos({lat,lng})} />
 */

// Reuse the same marker HTML/CSS approach as the main map component.
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
 * MapPicker
 * Props:
 * - value: { lat, lng } | null (controlled)
 * - defaultValue: { lat, lng } (initial uncontrolled value)
 * - onChange: (context) => void where context = { lat, lng, event }
 * - zoom, center, height, width
 */
const MapPicker = ({
  value,
  defaultValue = null,
  onChange,
  zoom = 13,
  center = { lat: 51.505, lng: -0.09 },
  height = '400px',
  width = '100%',
  markerColor = '#e25b7a',
}) => {
  // internal selected position (uncontrolled) unless `value` is provided
  const [selected, setSelected] = useState(defaultValue);

  // If component is controlled, reflect `value` into internal state
  useEffect(() => {
    if (value !== undefined) {
      setSelected(value);
    }
  }, [value]);

  // click handler used by the map hook
  const handleMapClick = useCallback(
    (e) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      const context = { lat, lng, event: e };

      // if uncontrolled, update internal state
      if (value === undefined) {
        setSelected({ lat, lng });
      }

      if (typeof onChange === 'function') {
        onChange(context);
      }
    },
    [onChange, value]
  );

  function ClickHandler() {
    useMapEvents({
      click: handleMapClick,
    });
    return null;
  }

  const icon = createDivIcon(markerColor);

  return (
    <div style={{ height, width }}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ClickHandler />
        {selected && (
          <Marker position={[selected.lat, selected.lng]} icon={icon}>
            <Popup>
              {`Lat: ${selected.lat.toFixed(6)}, Lng: ${selected.lng.toFixed(6)}`}
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default MapPicker;
