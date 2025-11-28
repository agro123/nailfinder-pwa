import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./css/DetalleNegocio.css";
import ReactDOM from "react-dom";
import { ChevronLeft } from "lucide-react";
import MapComponent from "../../../components/Map/Map";

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
    const [categorias, setCategorias] = useState([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas');
    const [loadingCategorias, setLoadingCategorias] = useState(true);

    const [horarios, setHorarios] = useState([]);
    const [loadingHorarios, setLoadingHorarios] = useState(true);
 

    // Normalizar para evitar problemas con tildes
    const normalize = (str) => {
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
    };

    const order = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];


    const serviciosFiltrados = categoriaSeleccionada === 'Todas'
  ? servicios
  : servicios.filter(s => s.category_name === categoriaSeleccionada);


      // Forzar color rojizo del marcador en el mapa
    useEffect(() => {
        const forceMarkerColors = () => {
            const markers = document.querySelectorAll('.custom-marker');
            
            markers.forEach((marker) => {
                const color = '#fc4b08'; // Rojizo para el negocio
                
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
    }, [negocio]);
    
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

                // EXTRAER CATEGORÍAS
                const cats = [...new Set(data.data.servicios.map(s => s.category_name || 'Sin categoría'))];
                setCategorias(['Todas', ...cats]);

                // ✅ Indicar que ya cargaron las categorías
                setLoadingCategorias(false);
            } else {
                console.warn("⚠️ No se encontraron servicios.");
                setServicios([]);
                setCategorias(['Todas']); // Por si acaso
                setLoadingCategorias(false);
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

      // 🔹 HORARIOS 🔹
    const fetchHorarios = async (id_company) => {
        try {
        console.log("📡 Intentando cargar horarios para companyId:", id_company);

        // ✅ Ahora se usa GET con query param
        const resp = await fetch(`http://localhost:3000/api/public/getCompanyHorarios?id_company=${encodeURIComponent(id_company)}`);

        if (!resp.ok) throw new Error(`HTTP error ${resp.status}`);

        const data = await resp.json();
        console.log("📥 Respuesta del backend (GET):", data);

        if (data.success && data.data.horarios?.length > 0) {
            console.log("✅ Horarios obtenidos:", data.data.horarios);
            setHorarios(data.data.horarios);
        } else {
            console.warn("⚠️ No se encontraron horarios o respuesta vacía");
            setHorarios([]);
        }
        } catch (error) {
        console.error("❌ Error cargando horarios:", error);
        setHorarios([]);
        }
    };

    useEffect(() => {
        if (!negocio?.company_id) return;

        setLoadingHorarios(true);
        fetchHorarios(negocio.company_id).finally(() => setLoadingHorarios(false));
    }, [negocio]);

    const agrupados = horarios.reduce((acc, h) => {
        const day = normalize(h.weekday);
        if (!acc[day]) acc[day] = [];
        acc[day].push(`${h.starthour.slice(0,5)} - ${h.endhour.slice(0,5)}`);
        return acc;
    }, {});

    const horariosFinal = Object.keys(agrupados)
    .sort((a, b) => order.indexOf(a) - order.indexOf(b))
    .map((day) => {
            const sortedRanges = agrupados[day].sort((a, b) => {
            const startA = a.split(" - ")[0];
            const startB = b.split(" - ")[0];
            return startA.localeCompare(startB);
        });

        return {
            day,
            ranges: sortedRanges
        };
    });

    const formatoPrecio = (precio) => {
        if (precio === null || precio === undefined || precio === "") return "No especificado";

        const numero = typeof precio === 'string' ? parseFloat(precio) : precio;
        if (Number.isNaN(numero)) return "No especificado";

        return `$${numero.toLocaleString('es-CO', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        })}`;
    };

    const round1 = n => Math.round(n * 10) / 10;

    return (
        <div className="detalle-container">
        {/* 🔙 Botón para volver */}
        <button
        className="back-btn"
            onClick={() => {
                if (state?.desdeAgenda || state?.desdeConfirmacion) {
                // Si viene desde Agenda o desde una confirmación de cita
                navigate("/", { replace: true });
                } else {
                navigate(-1);
                }
            }}
        >
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
                    className: "default-image-container  detalle-logo",
                    textContent: "🌸",
                    })
                );
                }}
            />
            ) : (
                <div className="default-image-container  detalle-logo">🌸</div>
            )}

            <div className="detalle-info">
            <h2>{negocio.company_name}</h2>
            <div className="detalle-rating">
                <span className="estrella">⭐</span>
                {negocio.promedio_calificacion ? (
                <>
                    <span className="rating-valor">{round1(negocio.promedio_calificacion)}</span>
                    <span className="rating-total">
                    ({negocio.calificaciones?.length || 0} Reseñas)
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
            {loadingCategorias ? (
                <p>Cargando categorías...</p>
            ) : categorias.length > 0 ? (
                <div className="categorias-filtros">
                {categorias.map((cat) => (
                    <button
                    key={cat}
                    className={`categoria-btn ${categoriaSeleccionada === cat ? 'activa' : ''}`}
                    onClick={() => setCategoriaSeleccionada(cat)}
                    >
                    {cat}
                    </button>
                ))}
                </div>
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
                {serviciosFiltrados.map((serv, i) => {
                // Si quieres ver los datos en consola
                console.log("🧩 Servicio:", serv);

                return (
                    <div
                        key={i}
                        className="servicio-card"
                        onClick={() =>
                            navigate(`/profesionales/${serv.service_id}`, { state: { servicio: serv, negocio } })
                        }
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
                                <div className="emoji-box servicio-img">💅</div>
                            )}
                        </div>
                        <div className="servicio-body">
                            <h4>{serv.title}</h4>
                            <p>{serv.description || "Sin descripción."}</p>
                            <p>
                                <strong>Precio:</strong> {formatoPrecio(serv.price)}
                            </p>
                            <p>
                                <strong>⏱ Duración:</strong> {serv.duration ? `${serv.duration} min` : "N/A"}
                            </p>
                        </div>
                    </div>
                );
            })}

            </div>
            ) : (
            <p>Este negocio aún no tiene servicios registrados.</p>
            )}
        </div>

        {/* 🕒 Horarios */}
        <div className="detalle-horarios">
            <h3>Horarios</h3>

            {loadingHorarios ? (
                <p>Cargando horarios...</p>
            ) : horarios.length > 0 ? (
                <ul>
                    {horariosFinal.map((item, i) => (
                        <li key={i}>
                        🕓 <strong>
                                {item.day
                                .replace("miercoles", "miércoles")
                                .replace("sabado", "sábado")}
                            </strong>: {item.ranges.join(" / ")}
                        </li>
                    ))}
                </ul>

            ) : (
                <p>El negocio aún no ha registrado sus horarios.</p>
            )}
        </div>


        {/* 🌍 Ubicación */}
        <div className="detalle-ubicacion">
            <h3>Ubicación</h3>
            {negocio.latitude && negocio.longitude ? (
            <>
                <p>
                📍 <strong>Latitud:</strong> {negocio.latitude} |{" "}
                <strong>Longitud:</strong> {negocio.longitude}
                </p>
                <div className="detalle-map-container">
                <MapComponent
                    coordinates={[
                    {
                        lat: parseFloat(negocio.latitude),
                        lng: parseFloat(negocio.longitude),
                        label: `${negocio.logo_uri?.startsWith('http') ? '🪴' : '🌸'} ${negocio.company_name}`,
                        iconColor: "#fc4b08",
                        companyData: negocio
                    }
                    ]}
                    zoom={15}
                    center={{
                    lat: parseFloat(negocio.latitude),
                    lng: parseFloat(negocio.longitude)
                    }}
                    height="400px"
                    width="100%"
                />
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
            {negocio.calificaciones?.length > 0 ? (
            <div className={`resenas-lista ${negocio.calificaciones.length > 2 ? 'scrollable' : ''}`}>
                {negocio.calificaciones.map((review, i) => (
                <div key={i} className="resena-item">
                    <p className="resena-rating">⭐ Calificación: {review.calificacion}/5</p>
                    <p className="resena-cliente">👤 Nombre de cliente: {review.clientName}</p>
                    <p className="resena-texto">"​{review.descripcion || 'Sin comentario'}"​</p>
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