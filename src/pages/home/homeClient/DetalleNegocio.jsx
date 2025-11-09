import React, { useEffect, useState } from "react";
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
    const [zoomActivo, setZoomActivo] = useState(false);
    const [posicionZoom, setPosicionZoom] = useState({ x: 0, y: 0 });
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const [posicionImagen, setPosicionImagen] = useState({ x: 0, y: 0 });
    const [ultimoToque, setUltimoToque] = useState(null);

    const negocio = state?.negocio;
    const [servicios, setServicios] = useState([]);
    const [loadingServicios, setLoadingServicios] = useState(true);

    // 🔒 Bloqueo de retroceso si viene desde una confirmación de cita
    useEffect(() => {
    if (state?.desdeConfirmacion) {
        // Empuja una entrada artificial al historial
        window.history.pushState(null, "", window.location.href);

        const handlePopState = () => {
        // Forzar redirección al Home y limpiar historial
        navigate("/", { replace: true });
        };

        window.addEventListener("popstate", handlePopState);

        // Limpieza
        return () => {
        window.removeEventListener("popstate", handlePopState);
        };
    }
    }, [state?.desdeConfirmacion, navigate]);



    useEffect(() => {
        const idCompany = negocio?.company_id;
        console.log("🧠 ID de empresa detectado:", idCompany);

        if (idCompany) {
        const fetchServicios = async () => {
            try {
            console.log("🚀 Solicitando servicios para empresa:", idCompany);
            const response = await fetch(
                `http://localhost:3000/api/public/verServicios?idCompany=${idCompany}`
            );
            const text = await response.text();
            console.log("📄 Respuesta completa:", text);

            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error("❌ Respuesta no es JSON válido.");
                setServicios([]);
                return;
            }

            if (data.success && data.data?.servicios) {
                console.log("💅 Servicios recibidos:", data.data.servicios);
                setServicios(data.data.servicios);
            } else {
                console.warn("⚠️ No se encontraron servicios.");
                setServicios([]);
            }
            } catch (error) {
            console.error("🚨 Error cargando servicios:", error);
            } finally {
            setLoadingServicios(false);
            }
        };
        fetchServicios();
        } else {
        console.warn("⚠️ No hay company_id, no se hará fetch.");
        }
    }, [negocio]);

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

    if (!negocio) {
        return (
        <div className="detalle-container">
            <h2>⚠️ No se encontró información del negocio</h2>
            <p>Es posible que hayas ingresado directamente al enlace.</p>
            <button
                className="back-btn"
                onClick={() =>
                    state?.desdeConfirmacion
                    ? navigate("/", { replace: true }) // Si viene de confirmación → Home
                    : navigate(-1) // Si viene normal → atrás
                }
            >
                <ChevronLeft size={28} strokeWidth={2} />
            </button>

        </div>
        );
    }

    // --- CONTROL DE ZOOM Y MOVIMIENTO ---
    const handleZoomClick = (e) => {
        e.stopPropagation();
        setZoomActivo((prev) => !prev);
        setPosicionZoom({ x: 50, y: 50 });
        setPosicionImagen({ x: 0, y: 0 });
    };

    const handleMouseMove = (e) => {
        if (!zoomActivo) return;
        const { left, top, width, height } = e.target.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setPosicionZoom({ x, y });
    };

    const handleTouchStart = (e) => {
        if (zoomActivo && e.touches.length === 1) {
        const touch = e.touches[0];
        setUltimoToque({ x: touch.clientX, y: touch.clientY });
        } else {
        setTouchStart(e.touches[0].clientX);
        }
    };

    const handleTouchMove = (e) => {
        if (zoomActivo && e.touches.length === 1 && ultimoToque) {
        const touch = e.touches[0];
        const dx = touch.clientX - ultimoToque.x;
        const dy = touch.clientY - ultimoToque.y;
        setUltimoToque({ x: touch.clientX, y: touch.clientY });
        setPosicionImagen((prev) => ({
            x: prev.x + dx,
            y: prev.y + dy,
        }));
        } else {
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

        if (Math.abs(distance) > 50) {
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

    return (
        <div className="detalle-container">
        {/* 🔙 Botón para volver */}
        <button className="back-btn" onClick={() => navigate(-1)}>
            <ChevronLeft size={28} strokeWidth={2} />
        </button>

        {/* 🏢 Encabezado del negocio */}
        <div className="detalle-header">
            {negocio.logo_uri ? (
            <img
                src={negocio.logo_uri}
                alt={negocio.company_name}
                className="detalle-logo clickable-logo"
                onClick={() => {
                setImagenAmpliada(negocio.logo_uri);
                setEsGaleria(false);
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

            <p>📞 <strong>Teléfono:</strong> {negocio.company_phone || "No disponible"}</p>
            <p>📧 <strong>Email:</strong> {negocio.user_email || "No registrado"}</p>
            <p>🏠 <strong>Tipo de negocio:</strong> {negocio.business_type}</p>
            <p className={`estado ${negocio.status ? "abierto" : "cerrado"}`}>
                {negocio.status ? "Abierto" : "Cerrado"}
            </p>
            </div>
        </div>

        {/* 📝 Descripción */}
        <div className="detalle-descripcion">
            <h3>Descripción</h3>
            <p>
            {negocio.company_description
                ? negocio.company_description
                : "Este negocio aún no ha añadido una descripción."}
            </p>
        </div>

        {/* 🏷️ Categorías */}
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

        {/* 💅 Servicios */}
        <div className="detalle-servicios">
            <h3>Servicios</h3>
            {loadingServicios ? (
            <p>Cargando servicios...</p>
            ) : servicios.length > 0 ? (
            <div className="servicios-grid">
                {servicios.map((serv, i) => (
                    console.log("🧩 Servicio:", serv),
                <div
                    key={i}
                    className="servicio-card"
                    onClick={() => navigate(`/profesionales/${serv.service_id}`, { state: { servicio: serv, negocio } })}
                    style={{ cursor: "pointer" }}
                >
                    <div className="servicio-header">
                    {serv.images?.length > 0 ? (
                        <img
                        src={serv.images[0].uri}
                        alt={serv.title}
                        className="servicio-img"
                        onError={(e) => (e.target.style.display = "none")}
                        />
                    ) : (
                        <div className="emoji-box">💅</div>
                    )}
                    </div>
                    <div className="servicio-body">
                    <h4>{serv.title}</h4>
                    <p>{serv.description || "Sin descripción."}</p>
                    <p>
                        <strong>Precio:</strong>{" "}
                        {serv.price ? `$${serv.price}` : "No especificado"}
                    </p>
                    <p>
                        <strong>⏱ Duración:</strong>{" "}
                        {serv.duration ? `${serv.duration} min` : "N/A"}
                    </p>
                    </div>
                </div>
                ))}
            </div>
            ) : (
            <p>Este negocio aún no tiene servicios registrados.</p>
            )}
        </div>

        {/* 🕒 Horarios */}
        <div className="detalle-horarios">
            <h3>Horarios</h3>
            {negocio.schedules?.length > 0 ? (
            <ul>
                {negocio.schedules.map((horario, i) => (
                <li key={i}>
                    🕓 <strong>{horario.day}</strong>: {horario.open} - {horario.close}
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

        {/* 🖼️ Galería */}
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
                    <img
                    src={img.uri}
                    alt={img.name || `banner-${i}`}
                    className="galeria-img clickable-img"
                    onClick={() => {
                        setImagenAmpliada(img.uri);
                        setImagenIndex(i);
                        setEsGaleria(true);
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
                <button
                className="cerrar-btn"
                onClick={(e) => {
                    e.stopPropagation();
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