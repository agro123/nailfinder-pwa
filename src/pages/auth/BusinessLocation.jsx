import React, { useState, useEffect } from "react";
import "./css/BusinessLocation.css";
import MapPicker from "../../components/Map/MapPicker";

export default function BusinessLocation({ onNext, onBack, setMessage, setType, message, type }) {
  const [mode, setMode] = useState("local");
  const [address, setAddress] = useState("");
  // Selected coordinates from the map picker (controlled mode)
  const [pickedLocation, setPickedLocation] = useState(null);
  // Map center (try to use geolocation if available). Default -> Cali, Colombia
  const [center, setCenter] = useState({ lat: 3.4516, lng: -76.5320 });
  // Radius (in meters) used when mode === 'domicilio'
  const [radius, setRadius] = useState(5000); // default 5 km

  const handleNext = () => {
    if (!address.trim()) {
      if (setType) setType("error");
      if (setMessage) setMessage("⚠️ Ingresa la dirección del negocio.");
      if (setMessage) setTimeout(() => setMessage(""), 2500); 
      return;
    }
    if (onNext) {
      // Enviar los datos de este paso
      onNext({
        companytype: mode === "local" ? "negocio" : "domicilio",
        address,
        // incluir la ubicación seleccionada (si existe)
        location: pickedLocation || null,
        // incluir el radio en metros si aplica
        radius: mode === 'domicilio' ? radius : null,
      });
    }
  };

  // Try to center map on user's location if available
  useEffect(() => {
    if (navigator && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {
          // If user denies or an error occurs, center on Cali, Colombia
          const cali = { lat: 3.4516, lng: -76.5320 };
          setCenter(cali);
          if (setMessage) {
            if (setType) setType("info");
            setMessage("No se pudo obtener tu ubicación. Centrado en Cali, Colombia.");
            setTimeout(() => setMessage(""), 3000);
          }
        }
      );
    } else {
      // Geolocation not supported - ensure map is centered on Cali
      setCenter({ lat: 3.4516, lng: -76.5320 });
      if (setMessage) {
        if (setType) setType("info");
        setMessage("Geolocalización no disponible. Centrado en Cali, Colombia.");
        setTimeout(() => setMessage(""), 3000);
      }
    }
  }, []);

  const handlePickChange = (context) => {
    // context = { lat, lng, event }
    if (!context) return;
    const { lat, lng } = context;
    setPickedLocation({ lat, lng });
    // Optionally update the address input to show coordinates (minimal UX)
    // Keep it non-destructive if the user already typed an address
  };

  return (
    <div className="business-container">
      <h2 className="business-title">Ubicación del negocio</h2>
      {message && (
        <div className={`notification ${type === "error" ? "error" : ""}`}>
            {message}
        </div>
    )}

      <p className="business-subtitle">
        Selecciona la manera en la que sueles trabajar
      </p>

      <div className="switch-group">
        <button
          className={`switch-btn ${mode === "local" ? "active" : ""}`}
          onClick={() => setMode("local")}
        >
          En un local
        </button>
        <button
          className={`switch-btn ${mode === "domicilio" ? "active" : ""}`}
          onClick={() => setMode("domicilio")}
        >
          A domicilio
        </button>
      </div>

      <div className="input-group">
        <label className="input-label">Dirección de tu negocio</label>
        <div className="input-with-icon">
          <input
            type="text"
            placeholder="Tu negocio"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="address-input"
          />
          <span className="icon-location">📍</span>
        </div>
        <div>
          <div style={{ height: 300, marginTop: 8 }}>
            <MapPicker
              value={pickedLocation}
              onChange={handlePickChange}
              center={center}
              zoom={14}
              height="100%"
              width="100%"
              markerColor="#e25b7a"
              radius={mode === 'domicilio' ? radius : null}
            />
          </div>
        </div>
      </div>

      {mode === 'domicilio' && (
        <div className="radius-group" style={{ marginTop: 12 }}>
          <label className="input-label">Radio de servicio (km)</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="range"
              min="0.1"
              max="50"
              step="0.1"
              value={radius / 1000}
              onChange={(e) => setRadius(Math.round(parseFloat(e.target.value) * 1000))}
            />
            <div style={{ minWidth: 72 }}>{(radius / 1000).toFixed(1)} km</div>
            <small style={{ color: '#e25b7a' }}>Selecciona el radio de atención a domicilio</small>
          </div>
        </div>
      )}

      <div className="button-group-vertical">
        <button className="next-button-location" onClick={handleNext}>
          Continuar
        </button>
        <button className="back-button-location" onClick={onBack}>
          Volver
        </button>
      </div>
    </div>
  );
}
