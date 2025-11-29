import React, { useState, useEffect } from "react";
import Swal from 'sweetalert2';
import "./css/BusinessLocation.css";
import MapPicker from "../../components/Map/MapPicker";

export default function BusinessLocation({ onNext, onBack, setMessage, setType, message, type }) {
  const [mode, setMode] = useState("local");
  const [address, setAddress] = useState("");
  // Selected coordinates from the map picker (controlled mode)
  const [pickedLocation, setPickedLocation] = useState(null);
  // Map center (try to use geolocation if available). Default -> Cali, Colombia
  const [center, setCenter] = useState({ lat: 3.420556, lng: -76.522222 });
  // Radius (in kilometers) used when mode === 'domicilio'
  const [radius, setRadius] = useState(5); // default 5 km
  const [locationObtained, setLocationObtained] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [locationError, setLocationError] = useState(null);

  const handleNext = () => {
    if (!address.trim()) {
      Swal.fire({
        title: "Campo requerido",
        text: "⚠️ Ingresa la dirección del negocio.",
        icon: "warning",
        draggable: true,
        customClass: {
          confirmButton: 'boton-alert-agenda'
        }
      });
      return;
    }
    
    if (!pickedLocation) {
      Swal.fire({
        title: "Ubicación requerida",
        text: "⚠️ Por favor, selecciona una ubicación en el mapa.",
        icon: "warning",
        draggable: true,
        customClass: {
          confirmButton: 'boton-alert-agenda'
        }
      });
      return;
    }
    
    if (onNext) {
      const dataToSend = {
        companytype: mode === "local" ? "local" : "domicilio",
        address,
        latitude: pickedLocation.lat,
        longitude: pickedLocation.lng,
      };
      
      // Solo agregar radio si es domicilio
      if (mode === 'domicilio') {
        dataToSend.radio = radius; // Enviar en kilómetros
      }
      onNext(dataToSend);
    }
  };

  // Try to center map on user's location if available
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = { 
            lat: position.coords.latitude, 
            lng: position.coords.longitude 
          };
          setCenter(userLocation);
          // Establecer la ubicación del usuario como punto inicial
          setPickedLocation(userLocation);
          setLocationObtained(true);
          setLoadingLocation(false);
          console.log("📍 Ubicación del usuario obtenida:", userLocation);
        },
        (error) => {
          console.error("⚠️ Error al obtener ubicación:", error);
          const cali = { lat: 3.420556, lng: -76.522222 };
          setCenter(cali);
          setLocationObtained(false);
          setLoadingLocation(false);
          
          let errorMessage = "No se pudo obtener tu ubicación.";
          let errorDetail = "";
          
          if (error.code === error.PERMISSION_DENIED) {
            errorMessage = "Permiso de ubicación denegado";
            errorDetail = "Has denegado el permiso de ubicación. El mapa se centrará en Cali, Colombia. Puedes cambiar esto en la configuración de tu navegador.";
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMessage = "Ubicación no disponible";
            errorDetail = "La ubicación no está disponible en este momento. El mapa se centrará en Cali, Colombia.";
          } else if (error.code === error.TIMEOUT) {
            errorMessage = "Tiempo de espera agotado";
            errorDetail = "Se agotó el tiempo de espera para obtener tu ubicación. El mapa se centrará en Cali, Colombia.";
          }
          
          setLocationError(errorDetail);
          
          Swal.fire({
            title: errorMessage,
            text: errorDetail,
            icon: "info",
            draggable: true,
            customClass: {
              confirmButton: 'boton-alert-agenda'
            }
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      // Geolocation not supported - ensure map is centered on Cali
      const cali = { lat: 3.420556, lng: -76.522222 };
      setCenter(cali);
      setLocationObtained(false);
      setLoadingLocation(false);
      
      const errorMsg = "Tu navegador no soporta geolocalización. El mapa se centrará en Cali, Colombia.";
      setLocationError(errorMsg);
      
      Swal.fire({
        title: "Geolocalización no soportada",
        text: errorMsg,
        icon: "info",
        draggable: true,
        customClass: {
          confirmButton: 'boton-alert-agenda'
        }
      });
    }
  }, []);

  const handlePickChange = (context) => {
    // context = { lat, lng, event }
    if (!context) return;
    const { lat, lng } = context;
    setPickedLocation({ lat, lng });
  };

  // Función para solicitar permisos nuevamente
  const requestLocationPermission = () => {
    setLoadingLocation(true);
    setLocationError(null);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = { 
            lat: position.coords.latitude, 
            lng: position.coords.longitude 
          };
          setCenter(userLocation);
          setPickedLocation(userLocation);
          setLocationObtained(true);
          setLoadingLocation(false);
          setTimeout(() => {
            setCenter({...userLocation}); // Crear nuevo objeto para forzar actualización
          }, 100);
          
          Swal.fire({
            title: "¡Ubicación obtenida!",
            text: "Tu ubicación se ha obtenido correctamente.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
            draggable: true
          });
        },
        (error) => {
          console.error("Error al obtener ubicación:", error);
          setLoadingLocation(false);
          
          let errorMessage = "No se pudo obtener tu ubicación. Verifica los permisos del navegador.";
          
          if (error.code === error.PERMISSION_DENIED) {
            errorMessage = "Debes permitir el acceso a la ubicación en la configuración de tu navegador.";
          }
          
          setLocationError(errorMessage);
          
          Swal.fire({
            title: "Error",
            text: errorMessage,
            icon: "error",
            draggable: true,
            customClass: {
              confirmButton: 'boton-alert-agenda'
            }
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setLoadingLocation(false);
      Swal.fire({
        title: "Error",
        text: "Tu navegador no soporta geolocalización.",
        icon: "error",
        draggable: true,
        customClass: {
          confirmButton: 'boton-alert-agenda'
        }
      });
    }
  };

  return (
    <div className="business-container">
      <h2 className="business-title">Ubicación del negocio</h2>

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

      {/* Indicador de carga de ubicación */}
      {loadingLocation && (
        <div className="location-loading" style={{ 
          padding: '12px', 
          background: '#fff3cd', 
          borderRadius: '8px', 
          marginBottom: '16px',
          textAlign: 'center',
          color: '#856404'
        }}>
          📍 Obteniendo tu ubicación...
        </div>
      )}

      {/* Mensaje de error y botón para reintentar */}
      {locationError && !loadingLocation && (
        <div style={{ 
          padding: '12px', 
          background: '#f8d7da', 
          borderRadius: '8px', 
          marginBottom: '16px',
          color: '#721c24',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0 0 8px 0' }}>⚠️ {locationError}</p>
          <button 
            onClick={requestLocationPermission}
            style={{
              padding: '8px 16px',
              background: '#e25b7a',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🔄 Solicitar permisos nuevamente
          </button>
        </div>
      )}

      {/* Indicador de ubicación obtenida */}
      {locationObtained && !loadingLocation && (
        <div style={{ 
          padding: '12px', 
          background: '#d4edda', 
          borderRadius: '8px', 
          marginBottom: '16px',
          textAlign: 'center',
          color: '#155724'
        }}>
          ✅ Ubicación obtenida correctamente
        </div>
      )}

      {/* Guía de uso del mapa */}
      <div className="map-guide">
        <div className="guide-header">
          <span className="guide-icon">🗺️</span>
          <span className="guide-title">Instrucciones del mapa:</span>
        </div>
        <div className="guide-content">
          <p>1. <strong>Haz clic</strong> en el mapa para colocar tu ubicación</p>
          <p>2. <strong>Arrastra</strong> el marcador para ajustar la posición</p>
          <p>3. <strong>Usa el zoom</strong> para mayor precisión</p>
          <p>4. <strong>Verifica</strong> que la dirección sea correcta</p>
        </div>
      </div>

      <div className="input-group">
        <label className="input-label">Dirección de tu negocio</label>
        <div className="input-with-icon">
          <input
            type="text"
            placeholder="Ingresa la dirección completa de tu negocio"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="address-input"
          />
          <span className="icon-location">📍</span>
        </div>
        <div className="map-container">
          <MapPicker
            key={`${center.lat}-${center.lng}`}
            value={pickedLocation}
            onChange={handlePickChange}
            center={center}
            zoom={locationObtained ? 16 : 14}
            height="100%"
            width="100%"
            markerColor="#e25b7a"
            radius={mode === 'domicilio' ? radius * 1000 : null}
          />
        </div>
        {pickedLocation && (
          <div style={{ 
            marginTop: '8px', 
            fontSize: '12px', 
            color: '#666',
            textAlign: 'center'
          }}>
            Coordenadas: Lat: {pickedLocation.lat.toFixed(6)}, Lng: {pickedLocation.lng.toFixed(6)}
          </div>
        )}
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
              value={radius}
              onChange={(e) => setRadius(parseFloat(e.target.value))}
            />
            <div style={{ minWidth: 72 }}>{radius.toFixed(1)} km</div>
          </div>
          <small style={{ color: '#e25b7a' }}>Selecciona el radio de atención a domicilio</small>
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