import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './Map.css';

/*
  Map components (Map.jsx)

  This file exports a general-purpose MapComponent and defines a CustomMarker used
  by it. The MapComponent renders a Leaflet map (react-leaflet) and a list of markers
  passed through the `coordinates` prop.

  Contract / props for MapComponent:
  - coordinates: Array of marker objects. Each marker object may contain:
      {
        lat: number,
        lng: number,
        label?: string,
        iconColor?: string,
        onClick?: (context) => void, // receives { ...marker, index, lat, lng, event }
        onFocus?: (event) => void,
        onBlur?: (event) => void,
        [key: string]: any
      }
  - zoom: number (initial zoom)
  - center: { lat, lng } (initial center)
  - height / width: strings for inline style or CSS values

  Behavior notes:
  - Each marker is rendered with a custom DIV icon. When a marker receives focus
    it is considered the `focusedIndex` and other markers are shown in grey.
  - Clicking a marker calls its `onClick` with a context object { ...marker, index, lat, lng, event }.
  - onFocus/onBlur are called with the Leaflet event when those marker events occur.

  Example usage:
    <MapComponent
      coordinates={points}
      zoom={13}
      center={{ lat: 3.37, lng: -76.53 }}
      height="300px"
    />

  Implementation note: the component uses `L.divIcon` to render HTML markers and
  forwards Leaflet events to the handlers provided on each coordinate item.
*/

// This is a fix for a known issue with react-leaflet where the default icon paths are not resolved correctly.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const CustomMarker = ({ lat, lng, label, iconColor = 'red', isFocused, onClick, onFocus, onBlur }) => {
  const markerHtml = `
    <div class="custom-marker-wrapper">
      <div 
        class="custom-marker" 
        style="background-color: ${isFocused ? iconColor : 'grey'};"
      >
      </div>
    </div>
  `;

  const customIcon = L.divIcon({
    html: markerHtml,
    className: 'custom-marker-icon-container',
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -42],
  });

  const eventHandlers = {
    // pass the Leaflet event to the handlers so callers can receive context
    click: (e) => {
      if (onClick) onClick(e);
      if (onFocus) onFocus(e);
    },
    blur: (e) => {
      if (onBlur) onBlur(e);
    },
  };

  return (
    <Marker position={[lat, lng]} icon={customIcon} eventHandlers={eventHandlers}>
      {label && <Popup>{label}</Popup>}
    </Marker>
  );
};

const MapComponent = ({
  coordinates = [],
  zoom = 13,
  center = { lat: 51.505, lng: -0.09 },
  height = '500px',
  width = '100%',
}) => {
  const [focusedIndex, setFocusedIndex] = useState(null);

  const handleFocus = (index) => {
    setFocusedIndex(index);
    if (coordinates[index]?.onFocus) {
      coordinates[index].onFocus();
    }
  };

  const handleBlur = (index) => {
    if (focusedIndex === index) {
      setFocusedIndex(null);
    }
    if (coordinates[index]?.onBlur) {
      coordinates[index].onBlur();
    }
  };

  return (
    <div style={{ height, width }}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {coordinates.map((coord, index) => (
          <CustomMarker
            key={index}
            lat={coord.lat}
            lng={coord.lng}
            label={coord.label}
            iconColor={coord.iconColor}
            isFocused={focusedIndex === index}
            onClick={(e) => {
              // build a context object with the marker data, index and the leaflet event
              const context = { ...(coord || {}), index, lat: coord.lat, lng: coord.lng, event: e };
              if (coord && coord.onClick) coord.onClick(context);
              handleFocus(index);
            }}
            onFocus={() => handleFocus(index)}
            onBlur={() => handleBlur(index)}
          />
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
