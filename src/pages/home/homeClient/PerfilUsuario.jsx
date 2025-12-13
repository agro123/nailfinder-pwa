import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import MapComponent from "../../../components/Map/Map";
import "./css/PerfilUsuario.css";
import { API_URL } from '../../../constants';

export default function PerfilUsuario() {
  const { user, logout } = useAuth(); 
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  // Console log para ver datos del usuario
  console.log('👤 Usuario actual:', user);
  console.log('🆔 ID del usuario:', user?.id);

  // Forzar colores de los marcadores después de que el mapa cargue
  useEffect(() => {
    const forceMarkerColors = () => {
      const markers = document.querySelectorAll('.custom-marker');
      
      markers.forEach((marker, index) => {
        const shouldBeGreen = currentLocation && index === 0;
        const color = shouldBeGreen ? '#6c200a' : '#fc4b08';
        
        // Forzar el color sobrescribiendo el estilo inline
        marker.style.setProperty('background-color', color, 'important');
      });
    };

    // Ejecutar varias veces para asegurar que se aplique
    const timers = [
      setTimeout(forceMarkerColors, 300),
      setTimeout(forceMarkerColors, 600),
      setTimeout(forceMarkerColors, 1000),
      setTimeout(forceMarkerColors, 1500)
    ];

    // Observar cambios en el DOM para reapliar colores cuando cambie algo
    const observer = new MutationObserver(() => {
      forceMarkerColors();
    });

    // Observar el contenedor del mapa
    const mapContainer = document.querySelector('.leaflet-container');
    if (mapContainer) {
      observer.observe(mapContainer, {
        attributes: true,
        subtree: true,
        attributeFilter: ['style']
      });
    }

    return () => {
      timers.forEach(timer => clearTimeout(timer));
      observer.disconnect();
    };
  }, [companies, currentLocation]);

  // Obtener ubicación actual
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLoadingLocation(false);
        },
        (error) => {
          console.error("Error obteniendo ubicación:", error);
          setLocationError("No se pudo obtener tu ubicación. Verifica los permisos del navegador.");
          setLoadingLocation(false);
          // Ubicación por defecto (Cali, Valle del Cauca)
          setCurrentLocation({
            lat: 3.44,
            lng: -76.519722
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setLocationError("Tu navegador no soporta geolocalización.");
      setLoadingLocation(false);
      setCurrentLocation({
        lat: 3.44,
        lng: -76.519722
      });
    }
  }, []);

  // Obtener todas las compañías con coordenadas
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        // Endpoint para obtener todas las compañías
        const response = await fetch(API_URL + '/api/public/getCompanys', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Error al obtener compañías');
        }

        const result = await response.json();
        
        console.log('🔍 Respuesta completa de la API:', result);
        console.log('📦 Array de negocios:', result.data?.negocios);
        
        if (result.success && result.data?.negocios) {
          const negocios = result.data.negocios;
          
          // Filtrar compañías que tengan coordenadas válidas
          const companiesWithCoords = negocios.filter(company => 
            company.latitude && 
            company.longitude && 
            !isNaN(parseFloat(company.latitude)) && 
            !isNaN(parseFloat(company.longitude))
          );
          
          console.log('✅ Negocios con coordenadas:', companiesWithCoords);
          setCompanies(companiesWithCoords);
        }
        
        setLoadingCompanies(false);
      } catch (error) {
        console.error("Error cargando compañías:", error);
        setLoadingCompanies(false);
        setCompanies([]);
      }
    };

    fetchCompanies();
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  // Preparar coordenadas para el mapa
  const coordinates = [];

  // Agregar ubicación actual del usuario
  if (currentLocation) {
    coordinates.push({
      lat: currentLocation.lat,
      lng: currentLocation.lng,
      label: "📍 Tu ubicación actual",
      iconColor: "#6c200a", // Verde SOLO para tu ubicación
      isUserLocation: true
    });
  }

  // Agregar todas las compañías con coordenadas
  companies.forEach((company, idx) => {
    const businessName = company.company_name || company.name || 'Negocio';
    const businessLogo = company.logo_uri || '🌸';
    
    // Crear el label simple con emoji/logo y nombre
    const displayLogo = businessLogo.startsWith('http') ? '🏪' : businessLogo;
    const popupContent = `${displayLogo} ${businessName}`;
    
    coordinates.push({
      lat: parseFloat(company.latitude),
      lng: parseFloat(company.longitude),
      label: popupContent,
      iconColor: "#fc4b08", // ROJO para TODOS los negocios
      companyData: company
    });
  });

  console.log('📦 Total de negocios con coordenadas:', companies.length);

  return (
    <div className="perfilusuario-container">
      <h2 className="perfilusuario-title">👤 Perfil del Usuario</h2>

      <div className="perfilusuario-info">
        <p>
          <strong>Nombre:</strong> {user?.name || "No disponible"}
        </p>
        <p>
          <strong>Email:</strong> {user?.email || "No disponible"}
        </p>
      </div>

      <div className="perfilusuario-map-section">
        <h3 className="perfilusuario-map-title">🗺️ Mapa de Negocios</h3>

        {(loadingLocation || loadingCompanies) && (
          <div className="location-loading">
            {loadingLocation && "Obteniendo tu ubicación..."}
            {loadingCompanies && " Cargando negocios..."}
          </div>
        )}

        {locationError && (
          <div className="location-error">
            ⚠️ {locationError}
          </div>
        )}

        {currentLocation && !loadingCompanies && (
          <>
            <div className="map-legend">
              <div className="legend-item">
                <span className="legend-dot user-location-dot"></span>
                <span>Tu ubicación actual</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot other-business-dot"></span>
                <span>Negocios registrados</span>
              </div>
            </div>
            <div className="perfilusuario-map-container">
              <MapComponent
                coordinates={coordinates}
                zoom={13}
                center={currentLocation}
                height="400px"
                width="100%"
              />
              <div className="location-coords">
                <small>
                  Tu posición: Lat: {currentLocation.lat.toFixed(6)}, Lng: {currentLocation.lng.toFixed(6)}
                </small>
              </div>
            </div>
          </>
        )}
      </div>

      <button className="logout-btn-cliente" onClick={handleLogout}>
        🔒 Cerrar sesión
      </button>
    </div>
  );
}