import React, { useState, useEffect } from "react";
import axios from "axios";
import "./css/Home.css";
import { useNavigate } from "react-router-dom";
import MapComponent from "../../../components/Map/Map";

export default function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [servicios, setServicios] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [todasEmpresas, setTodasEmpresas] = useState([]);
  const [showModalFiltros, setShowModalFiltros] = useState(false);

  // Estados para filtros
  const [filtroValoracion, setFiltroValoracion] = useState([]);
  const [filtroDistancia, setFiltroDistancia] = useState(null);
  const [sliderValue, setSliderValue] = useState(0);
  const [ubicacionUsuario, setUbicacionUsuario] = useState(null);
  const [obteniendoUbicacion, setObteniendoUbicacion] = useState(false);

  // Obtener ubicación del usuario
  const obtenerUbicacionUsuario = () => {
    setObteniendoUbicacion(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUbicacionUsuario({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setObteniendoUbicacion(false);
        },
        (error) => {
          console.error("Error al obtener ubicación:", error);
          alert("No se pudo obtener tu ubicación. Por favor, permite el acceso.");
          setObteniendoUbicacion(false);
        }
      );
    } else {
      alert("Tu navegador no soporta geolocalización");
      setObteniendoUbicacion(false);
    }
  };

  // Calcular distancia entre dos puntos (fórmula de Haversine)
  const calcularDistancia = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distancia en km
  };

 // Verificar si una valoración está en el rango seleccionado
  const cumpleFiltroValoracion = (valoracion) => {
    if (filtroValoracion.length === 0) return true;
    
    return filtroValoracion.some((estrella) => {
      const num = parseInt(estrella);
      if (num === 5) {
        // Solo 5.0 exacto
        return valoracion === 5;
      } else {
        // Para 1, 2, 3, 4: incluye desde ese número hasta antes del siguiente
        return valoracion >= num && valoracion < num + 1;
      }
    });
  };

  // Verificar si está dentro del radio de distancia
  const cumpleFiltroDistancia = (empresa) => {
    if (!filtroDistancia || !ubicacionUsuario) return true;
    if (!empresa.latitude || !empresa.longitude) return false;

    const distancia = calcularDistancia(
      ubicacionUsuario.lat,
      ubicacionUsuario.lng,
      parseFloat(empresa.latitude),
      parseFloat(empresa.longitude)
    );

    return distancia <= filtroDistancia;
  };

  // Aplicar todos los filtros
  const aplicarFiltros = (listaEmpresas) => {
    return listaEmpresas.filter((empresa) => {
      // Filtro de búsqueda por nombre
      const cumpleBusqueda = empresa.company_name
        ?.toLowerCase()
        .includes(search.toLowerCase());

      // Filtro de valoración
      const valoracion = parseFloat(empresa.promedio_calificacion) || 0;
      const cumpleValoracion = cumpleFiltroValoracion(valoracion);

      // Filtro de distancia
      const cumpleDistancia = cumpleFiltroDistancia(empresa);

      return cumpleBusqueda && cumpleValoracion && cumpleDistancia;
    });
  };

  // Toggle filtro de valoración
  const toggleFiltroValoracion = (rango) => {
    setFiltroValoracion((prev) => {
      if (prev.includes(rango)) {
        return prev.filter((r) => r !== rango);
      } else {
        return [...prev, rango];
      }
    });
  };

  // Limpiar todos los filtros
  const limpiarFiltros = () => {
    setFiltroValoracion([]);
    setFiltroDistancia(null);
    setUbicacionUsuario(null);
    setCategoriaSeleccionada(0); // <- Agregar esta línea
    fetchEmpresas(0);
  };

  // Remover filtro individual
  const removerFiltroIndividual = (tipoFiltro, valor) => {
    switch (tipoFiltro) {
      case 'valoracion':
        setFiltroValoracion(prev => prev.filter(v => v !== valor));
        break;
      case 'distancia':
        setFiltroDistancia(null);
        setSliderValue(0);
        setUbicacionUsuario(null);
        break;
      case 'categoria':
        setCategoriaSeleccionada(0);
        fetchEmpresas(0);
        break;
      case 'ubicacion':
        setUbicacionUsuario(null);
        setFiltroDistancia(null);
        setSliderValue(0);
        break;
      default:
        break;
    }
  };

  // Obtener nombre de categoría por ID
  const getNombreCategoria = (id) => {
    const cat = servicios.find(s => s.id === id);
    return cat ? (cat.nombre || cat.name || cat.categoria) : '';
  };

  const fetchEmpresas = async (nuevaCategoria) => {
    try {
      setCategoriaSeleccionada(nuevaCategoria);
      const res = await axios.get(
        `http://localhost:3000/api/public/getCompanys?id_category=${encodeURIComponent(
          nuevaCategoria
        )}`
      );
      console.log("Respuesta de empresas:", res.data);
      if (res.data.success) {
        const negocios = res.data.data.negocios || [];
        setTodasEmpresas(negocios);
        setEmpresas(negocios);
      } else {
        setError("No se pudieron cargar los negocios.");
      }
    } catch (err) {
      console.error("Error al obtener empresas:", err);
      setError("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/api/public/showCategorias"
        );
        if (res.data.success) {
          const categorias = res.data.data.categorias || [];
          const categoriaGeneral = {
            id: 0,
            name: "Todas las categorías",
            description: "",
          };
          const categoriasFinales = [categoriaGeneral, ...categorias];
          setServicios(categoriasFinales);
        }
      } catch (err) {
        console.error("Error al obtener categorías:", err);
      }
    };

    fetchEmpresas(0);
    fetchCategorias();
  }, []);

  // Aplicar filtros cuando cambien
  const empresasFiltradas = aplicarFiltros(empresas);

  // Filtro por tipo de negocio
  const recomendados = empresasFiltradas.filter(
    (e) => parseFloat(e.promedio_calificacion) >= 4 && 
          parseFloat(e.promedio_calificacion) <= 5
  );

  const locales = empresasFiltradas.filter(
    (e) => e.business_type?.toLowerCase() === "local"
  );
  const domicilios = empresasFiltradas.filter(
    (e) => e.business_type?.toLowerCase() === "domicilio"
  );

  // Forzar colores de los marcadores después de que el mapa cargue
  useEffect(() => {
    const forceMarkerColors = () => {
      const markers = document.querySelectorAll('.custom-marker');
      
      markers.forEach((marker, index) => {
        // Primer marcador es la ubicación del usuario (verde)
        const shouldBeGreen = ubicacionUsuario && index === 0;
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

    // Observar cambios en el DOM para reaplicar colores cuando cambie algo
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
  }, [empresasFiltradas, ubicacionUsuario, filtroDistancia]);

  const handleNavigate = (item) => {
    navigate(`/detalle/${item.company_id}`, { state: { negocio: item } });
  };

  // Preparar coordenadas para el mapa
  const generarCoordenadasMapa = () => {
    const coords = [];

    if (ubicacionUsuario) {
      coords.push({
        lat: ubicacionUsuario.lat,
        lng: ubicacionUsuario.lng,
        label: "Tu ubicación",
        iconColor: "#6c200a",
      });
    }

    if (filtroDistancia && ubicacionUsuario) {
      empresasFiltradas.forEach((empresa) => {
        if (empresa.latitude && empresa.longitude) {
          const distancia = calcularDistancia(
            ubicacionUsuario.lat,
            ubicacionUsuario.lng,
            parseFloat(empresa.latitude),
            parseFloat(empresa.longitude)
          );

          // Solo mostrar negocios dentro del radio
          if (distancia <= filtroDistancia) {
            coords.push({
              lat: parseFloat(empresa.latitude),
              lng: parseFloat(empresa.longitude),
              label: empresa.company_name,
              iconColor: "#fc4b08",
            });
          }
        }
      });
    }

    return coords;
  };

  // Render de tarjeta con valoración
  const renderCard = (item) => {
    const valoracion = parseFloat(item.promedio_calificacion) || 0;
    let distancia = null;
    
    if (ubicacionUsuario && item.latitude && item.longitude) {
      distancia = calcularDistancia(
        ubicacionUsuario.lat,
        ubicacionUsuario.lng,
        parseFloat(item.latitude),
        parseFloat(item.longitude)
      );
    }

    return (
      <div
        key={item.company_id}
        className="recommended-card"
        onClick={() => handleNavigate(item)}
      >
        {item.logo_uri && item.logo_uri.trim() !== "" ? (
          <img
            src={item.logo_uri}
            alt={item.company_name}
            className="company-logo"
            onError={(e) => {
              e.target.onerror = null;
              e.target.replaceWith(
                Object.assign(document.createElement("div"), {
                  className: "emoji-box small",
                  textContent: "🌸",
                })
              );
            }}
          />
        ) : (
          <div className="emoji-box small">🌸</div>
        )}

        <h4>{item.company_name}</h4>

        {/* Valoración */}
        {valoracion > 0 && (
          <div className="valoracion-container">
            <span className="star">⭐</span>
            <span className="valoracion-numero">{valoracion.toFixed(1)}</span>
          </div>
        )}

        <div className="status-container">
          <span
            className={`company-status-dot ${
              item.status ? "active" : "inactive"
            }`}
          ></span>
          <span>{item.status ? "Abierto" : "Cerrado"}</span>
        </div>
      </div>
    );
  };

  const coordenadasMapa = generarCoordenadasMapa();


  useEffect(() => {
    const slider = document.querySelector(".distance-slider");
    if (slider) {
      const percent = (sliderValue / 20) * 100;
      slider.style.setProperty("--value-percent", `${percent}%`);
    }
  }, [sliderValue]);

  const handleSliderChange = (e) => {
    const value = Number(e.target.value);
    setSliderValue(value);
    
    // Si value es 0, no filtrar. Si es mayor a 0, aplicar filtro
    if (value > 0) {
      setFiltroDistancia(value);
    } else {
      setFiltroDistancia(null);
    }

    const percent = value === 0 ? 0 : ((value - 1) / (20 - 1)) * 100;
    document.documentElement.style.setProperty(
      "--value-percent",
      `${percent}%`
    );
};

  return (
    <div className="home-container">
      <header className="header">
        <div className="logo">NailFinder</div>
        <div className="search-header">
          <button
            className="filtros-btn"
            onClick={() => setShowModalFiltros(true)}
          >
            ⚙️ Filtros
            {(filtroValoracion.length > 0 || 
              filtroDistancia || 
              categoriaSeleccionada !== 0) && (
              <span className="filtros-activos-badge">
                {filtroValoracion.length + 
                (filtroDistancia ? 1 : 0) + 
                (categoriaSeleccionada !== 0 ? 1 : 0)}
              </span>
            )}
          </button>
          <input
            type="text"
            placeholder="Buscar negocios"
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      {/* Modal de Filtros */}
      {showModalFiltros && (
        <div
          className="modal-overlay"
          onClick={() => setShowModalFiltros(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Filtros</h3>
              <button
                className="modal-close"
                onClick={() => setShowModalFiltros(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              {/* Filtro de Valoración */}
              <div className="filtro-seccion">
                <h4 className="filtro-titulo">⭐ Valoración</h4>
                <div className="filtro-opciones-horizontal">
                  {["1", "2", "3", "4", "5"].map((estrella) => (
                    <button
                      key={estrella}
                      className={`modal-filter-btn ${
                        filtroValoracion.includes(estrella) ? "active" : ""
                      }`}
                      onClick={() => toggleFiltroValoracion(estrella)}
                    >
                      ⭐ {estrella}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtro de Distancia */}
              <div className="filtro-seccion">
                <h4 className="filtro-titulo">📍 Distancia</h4>
                
                {!ubicacionUsuario ? (
                  <button
                    className="ubicacion-btn"
                    onClick={obtenerUbicacionUsuario}
                    disabled={obteniendoUbicacion}
                  >
                    {obteniendoUbicacion
                      ? "Obteniendo ubicación..."
                      : "📍 Activar ubicación"}
                  </button>
                ) : (
                  <>
                    <p className="ubicacion-activa">✅ Ubicación activada</p>
                    <div className="slider-container">
                    <input
                      type="range"
                      min="0"
                      max="20"
                      step="1"
                      value={sliderValue}
                      className="distance-slider"
                      onChange={(e) => handleSliderChange(e)}
                    />

                    {/* Etiqueta dinámica debajo del circulito */}
                    <div className="slider-value">
                      {sliderValue === 0 ? "Arrastra y selecciona distancia" : `Hasta ${sliderValue} km`}
                    </div>
                  </div>

                  </>
                )}
              </div>

              {/* Mapa Visual */}
              {ubicacionUsuario && (
                <div className="filtro-seccion">
                  <h4 className="filtro-titulo">🗺️ Visualizar en Mapa</h4>
                  <div className="perfilusuario-map-container">
                    <MapComponent
                      coordinates={coordenadasMapa}
                      zoom={13}
                      center={ubicacionUsuario}
                      height="250px"
                      userLocation={ubicacionUsuario}
                      userLocationOptions={{
                        radius: filtroDistancia ? filtroDistancia * 1000 : 0,
                        color: "#aed0ffff",
                        fillColor: "#3388ff",
                        fillOpacity: 0.2,
                      }}
                    />
                  </div>

                  {/* Leyenda del mapa */}
                  <div className="map-legend">
                    <div className="legend-item">
                      <span className="legend-dot-home user-location-dot-home"></span>
                      Tu ubicación
                    </div>
                    <div className="legend-item">
                      <span className="legend-dot-home other-business-dot-home"></span>
                      Negocios en el radio
                    </div>
                    {filtroDistancia && (
                      <div className="legend-item">
                        <span className="legend-dot-home radio-business-home"></span>
                        Radio: {filtroDistancia} km
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Filtro de Categorías */}
              <div className="filtro-seccion">
                <h4 className="filtro-titulo">🏷️ Categorías</h4>
                <div className="filtro-opciones">
                  {servicios.length > 0 ? (
                    servicios.map((cat, index) => (
                      <button
                        key={index}
                        className={`modal-filter-btn ${
                          categoriaSeleccionada === cat.id ? "active" : ""
                        }`}
                        onClick={() => fetchEmpresas(cat.id)}
                      >
                        {cat.nombre || cat.name || cat.categoria}
                      </button>
                    ))
                  ) : (
                    <p className="loading-text">Cargando categorías...</p>
                  )}
                </div>
              </div>
              
              {/* Botón para limpiar filtros */}
              {(filtroValoracion.length > 0 ||
                filtroDistancia ||
                ubicacionUsuario ||
                categoriaSeleccionada !== 0) && (
                <button className="limpiar-filtros-btn" onClick={limpiarFiltros}>
                  🗑️ Limpiar todos los filtros
                </button>
              )}
            </div>
          </div>
        </div>
      )}

       {/* Chips de Filtros Activos */}
      {(filtroValoracion.length > 0 || 
        filtroDistancia || 
        categoriaSeleccionada !== 0) && (
        <div className="filtros-aplicados">
          <h4 className="filtros-aplicados-titulo">Filtros aplicados</h4>
          <div className="filtros-chips-container">
            {/* Chip de Categoría */}
            {categoriaSeleccionada !== 0 && (
              <div className="filtro-chip">
                <span className="filtro-chip-texto">
                  🏷️ {getNombreCategoria(categoriaSeleccionada)}
                </span>
                <button
                  className="filtro-chip-close"
                  onClick={() => removerFiltroIndividual('categoria', categoriaSeleccionada)}
                >
                  ✕
                </button>
              </div>
            )}

            {/* Chips de Valoración */}
            {filtroValoracion.map((val) => (
              <div key={val} className="filtro-chip">
                <span className="filtro-chip-texto">⭐ {val} estrellas</span>
                <button
                  className="filtro-chip-close"
                  onClick={() => removerFiltroIndividual('valoracion', val)}
                >
                  ✕
                </button>
              </div>
            ))}

            {/* Chip de Distancia */}
            {filtroDistancia && (
              <div className="filtro-chip">
                <span className="filtro-chip-texto">
                  📍 Hasta {filtroDistancia} km
                </span>
                <button
                  className="filtro-chip-close"
                  onClick={() => removerFiltroIndividual('distancia')}
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {loading && <p className="loading-text">Cargando negocios...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && (
        <>
          {empresasFiltradas.length === 0 ? (
            <div className="sin-resultados">
              <p className="sin-resultados-emoji">📍</p>
              <p className="sin-resultados-texto">
                No se encontraron negocios con los filtros seleccionados
              </p>
              <button
                className="limpiar-filtros-btn"
                onClick={limpiarFiltros}
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <>
              {recomendados.length > 0 && (
                <section className="section">
                  <h3 className="section-title">⭐ Recomendados</h3>
                  <div className="recommended-list scrollable">
                    {recomendados.map((item) => renderCard(item))}
                  </div>
                </section>
              )}

              {locales.length > 0 && (
                <section className="section">
                  <h3 className="section-title">🏠 Locales</h3>
                  <div className="recommended-list">
                    {locales.map((item) => renderCard(item))}
                  </div>
                </section>
              )}

              {domicilios.length > 0 && (
                <section className="section">
                  <h3 className="section-title">🚗 Domicilios</h3>
                  <div className="recommended-list">
                    {domicilios.map((item) => renderCard(item))}
                  </div>
                </section>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}