import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./css/DetalleNegocio.css";
import ReactDOM from "react-dom";
import { ChevronLeft } from "lucide-react";

export default function DetalleNegocio() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [imagenAmpliada, setImagenAmpliada] = useState(null);
  const [imagenIndex, setImagenIndex] = useState(null);
  const [esGaleria, setEsGaleria] = useState(false);
  const [zoomActivo, setZoomActivo] = useState(false); //  nuevo estado para el zoom
  const [posicionZoom, setPosicionZoom] = useState({ x: 0, y: 0 }); //  posición del mouse
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50; // distancia mínima para considerar un swipe
  const [posicionImagen, setPosicionImagen] = useState({ x: 0, y: 0 });
  const [ultimoToque, setUltimoToque] = useState(null);



  const negocio = state?.negocio;

  useEffect(() => {
    if (imagenAmpliada) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [imagenAmpliada]);





      // --- CONTROL DE ZOOM Y MOVIMIENTO (PC y móvil) ---
      const handleZoomClick = (e) => {
        e.stopPropagation();
        setZoomActivo((prev) => !prev);
        setPosicionZoom({ x: 50, y: 50 }); // reinicia la posición al centro
        setPosicionImagen({ x: 0, y: 0 }); // reinicia desplazamiento
      };

      // 🖱️ PC: mover con el mouse cuando el zoom está activo
      const handleMouseMove = (e) => {
        if (!zoomActivo) return;
        const { left, top, width, height } = e.target.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setPosicionZoom({ x, y });
      };

      const handleMouseUp = () => {
        // Nada por ahora, pero evita errores
      };

      // 📱 GESTOS TÁCTILES (swipe + desplazamiento con zoom)
      const handleTouchStart = (e) => {
        if (zoomActivo && e.touches.length === 1) {
          // Guardar posición del dedo para mover la imagen
          const touch = e.touches[0];
          setUltimoToque({ x: touch.clientX, y: touch.clientY });
        } else {
          // Si no está en zoom, detectar inicio del swipe
          setTouchStart(e.touches[0].clientX);
        }
      };

      const handleTouchMove = (e) => {
        if (zoomActivo && e.touches.length === 1 && ultimoToque) {
          // Movimiento dentro del zoom (desplazar imagen)
          const touch = e.touches[0];
          const dx = touch.clientX - ultimoToque.x;
          const dy = touch.clientY - ultimoToque.y;
          setUltimoToque({ x: touch.clientX, y: touch.clientY });

          setPosicionImagen((prev) => ({
            x: prev.x + dx,
            y: prev.y + dy,
          }));
        } else {
          // Swipe normal para cambiar de imagen
          setTouchEnd(e.touches[0].clientX);
        }
      };

      const handleTouchEnd = () => {
        if (zoomActivo) {
          setUltimoToque(null);
          return;
        }

        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;

        if (Math.abs(distance) > minSwipeDistance) {
          if (distance > 0) {
            const newIndex = (imagenIndex + 1) % negocio.bannersgalery.length;
            setImagenIndex(newIndex);
            setImagenAmpliada(negocio.bannersgalery[newIndex].uri);
          } else {
            const newIndex =
              (imagenIndex - 1 + negocio.bannersgalery.length) %
              negocio.bannersgalery.length;
            setImagenIndex(newIndex);
            setImagenAmpliada(negocio.bannersgalery[newIndex].uri);
          }
        }

        setTouchStart(null);
        setTouchEnd(null);
      };








  // Si no hay datos (por ejemplo, si el usuario entra directo por URL)
  if (!negocio) {
    return (
      <div className="detalle-container">
        <h2>⚠️ No se encontró información del negocio</h2>
        <p>Es posible que hayas ingresado directamente al enlace.</p>
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={28} strokeWidth={2} />
        </button>
      </div>
    );
  }

  return (
    <div className="detalle-container">
      {/* Botón para volver */}
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={28} strokeWidth={2} />
        </button>
      {/* Logo del negocio */}
      <div className="detalle-header">
        {negocio.logo_uri ? (
          <img
            src={negocio.logo_uri}
            alt={negocio.company_name}
            className="detalle-logo clickable-logo"
            onClick={() => {
              setImagenAmpliada(negocio.logo_uri);
              setEsGaleria(false); //  no es galería
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.replaceWith(
                Object.assign(document.createElement("div"), {
                  className: "emoji-box big",
                  textContent: "🌸",
                })
              );
            }}
          />
        ) : (
          <div className="emoji-box big">🌸</div>
        )}

        <div className="detalle-info">
          <h2>{negocio.company_name}</h2>

          {/* ⭐ Valoración general */}
          <div className="detalle-rating">
            <span className="estrella">⭐</span>
            {negocio.rating ? (
              <>
                <span className="rating-valor">{negocio.rating}</span>
                <span className="rating-total">
                  ({negocio.reviews_count || 0} Reseñas)
                </span>
              </>
            ) : (
              <span className="sin-reseñas">Sin reseñas aún</span>
            )}
          </div>

          <p>
            📞 <strong>Teléfono:</strong>{" "}
            {negocio.company_phone || "No disponible"}
          </p>
          <p>
            📧 <strong>Email:</strong> {negocio.user_email || "No registrado"}
          </p>
          <p>
            🏠 <strong>Tipo de negocio:</strong> {negocio.business_type}
          </p>
          <p className={`estado ${negocio.status ? "abierto" : "cerrado"}`}>
            {negocio.status ? "Abierto" : "Cerrado"}
          </p>
        </div>
      </div>

      {/* Descripción */}
      <div className="detalle-descripcion">
        <h3>Descripción</h3>
        <p>
          {negocio.company_description
            ? negocio.company_description
            : "Este negocio aún no ha añadido una descripción."}
        </p>
      </div>

      {/* Categorías */}
      <div className="detalle-categorias">
        <h3>Categorías</h3>
        {negocio.categories?.length > 0 ? (
          <ul>
            {negocio.categories.map((cat, i) => (
              <li key={i}>💅 {cat.category_name}</li>
            ))}
          </ul>
        ) : (
          <p>Aún no se ha categorizado el negocio.</p>
        )}
      </div>

      {/* 🕒 Horarios */}
      <div className="detalle-horarios">
        <h3>Horarios</h3>
        {negocio.schedules?.length > 0 ? (
          <ul>
            {negocio.schedules.map((horario, i) => (
              <li key={i}>
                🕓 <strong>{horario.day}</strong>: {horario.open} -{" "}
                {horario.close}
              </li>
            ))}
          </ul>
        ) : (
          <p>El negocio aún no ha registrado sus horarios.</p>
        )}
      </div>

      {/* 📍 Ubicación */}
      <div className="detalle-ubicacion">
        <h3>Ubicación</h3>
        {negocio.latitude && negocio.longitude ? (
          <>
            <p>
              📍 <strong>Latitud:</strong> {negocio.latitude} |{" "}
              <strong>Longitud:</strong> {negocio.longitude}
            </p>
            <div className="map-container">
              <iframe
                title="Mapa del negocio"
                src={`https://www.google.com/maps?q=${negocio.latitude},${negocio.longitude}&z=15&output=embed`}
                allowFullScreen
                loading="lazy"
              ></iframe>
            </div>
          </>
        ) : (
          <p>Por el momento el negocio no ha compartido la ubicación.</p>
        )}
      </div>

      {/* Galería */}
      <div className="detalle-galeria">
        <h3>Galería</h3>
        {negocio.bannersgalery && negocio.bannersgalery.length > 0 ? (
          <div
            className={`galeria-imagenes ${
              negocio.bannersgalery.length > 2 ? "scrollable" : ""
            }`}
          >
            {negocio.bannersgalery.map((img, i) => (
              <div className="galeria-item" key={i}>
                {/* Al hacer clic se abre el modal */}
                <img
                  src={img.uri}
                  alt={img.name || `banner-${i}`}
                  className="galeria-img clickable-img"
                  onClick={() => {
                    setImagenAmpliada(img.uri);
                    setImagenIndex(i);
                    setEsGaleria(true); // sí es galería
                  }}
                />
                {img.descripcion && (
                  <p className="img-descripcion">{img.descripcion}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>Este negocio aún no ha compartido imágenes.</p>
        )}
      </div>



    {/* 🖼️ Modal de imagen ampliada */}
    {imagenAmpliada &&
      ReactDOM.createPortal(
        <div
          className="modal-imagen"
          onClick={() => {
            setImagenAmpliada(null);
            setZoomActivo(false);
          }}
        >
          {/* ❌ Botón de cerrar */}
          <button
            className="cerrar-btn"
            onClick={(e) => {
              e.stopPropagation(); // evita cerrar al hacer clic en el modal
              setImagenAmpliada(null);
              setZoomActivo(false);
            }}
          >
            ✕
          </button>

          {esGaleria && (
            <button
              className="nav-btn prev"
              onClick={(e) => {
                e.stopPropagation();
                const newIndex =
                  (imagenIndex - 1 + negocio.bannersgalery.length) %
                  negocio.bannersgalery.length;
                setImagenIndex(newIndex);
                setImagenAmpliada(negocio.bannersgalery[newIndex].uri);
              }}
            >
              ‹
            </button>
          )}

          
            <img
              src={imagenAmpliada}
              alt="Vista ampliada"
              className={`imagen-ampliada ${zoomActivo ? "zoom" : ""}`}
              onClick={handleZoomClick}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={
                zoomActivo
                  ? {
                      transform: `scale(2) translate(${posicionImagen.x / 5}px, ${posicionImagen.y / 5}px)`,
                      transformOrigin: `${posicionZoom.x}% ${posicionZoom.y}%`,
                      cursor: "zoom-out",
                      transition: "transform 0.15s ease",
                    }
                  : {
                      transform: "scale(1)",
                      cursor: "zoom-in",
                      transition: "transform 0.3s ease",
                    }
              }
            />




          {esGaleria && (
            <button
              className="nav-btn next"
              onClick={(e) => {
                e.stopPropagation();
                const newIndex =
                  (imagenIndex + 1) % negocio.bannersgalery.length;
                setImagenIndex(newIndex);
                setImagenAmpliada(negocio.bannersgalery[newIndex].uri);
              }}
            >
              ›
            </button>
          )}
        </div>,
        document.body
      )}


      {/* ⭐ Reseñas */}
      <div className="detalle-resenas">
        <h3>Reseñas</h3>
        {negocio.reviews?.length > 0 ? (
          <div className="resenas-lista">
            {negocio.reviews.map((review, i) => (
              <div key={i} className="resena-item">
                <p className="resena-autor">⭐ {review.user}</p>
                <p className="resena-texto">“{review.comment}”</p>
                <p className="resena-rating">Puntuación: {review.rating}/5</p>
              </div>
            ))}
          </div>
        ) : (
          <p>Este negocio aún no tiene reseñas.</p>
        )}
      </div>
    </div> 
  );
}

