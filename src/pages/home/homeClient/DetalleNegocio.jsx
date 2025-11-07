import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./css/DetalleNegocio.css";
import ReactDOM from "react-dom";

export default function DetalleNegocio() {
    const { id } = useParams();
    const { state } = useLocation();
    const navigate = useNavigate();
    const [imagenAmpliada, setImagenAmpliada] = useState(null);

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

    // Si no hay datos (por ejemplo, si el usuario entra directo por URL)
    if (!negocio) {
        return (
        <div className="detalle-container">
            <h2>⚠️ No se encontró información del negocio</h2>
            <p>Es posible que hayas ingresado directamente al enlace.</p>
            <button className="back-btn" onClick={() => navigate(-1)}>
            ⬅ Volver
            </button>
        </div>
        );
    }

    return (
        <div className="detalle-container">
        {/* Botón para volver */}
        <button className="back-btn" onClick={() => navigate(-1)}>
            ⬅ Volver
        </button>

        {/* Logo del negocio */}
        <div className="detalle-header">
            {negocio.logo_uri ? (
            <img
                src={negocio.logo_uri}
                alt={negocio.company_name}
                className="detalle-logo clickable-logo"
                onClick={() => setImagenAmpliada(negocio.logo_uri)} // 👈 abre el modal
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

            <p>📞 <strong>Teléfono:</strong> {negocio.company_phone || "No disponible"}</p>
            <p>📧 <strong>Email:</strong> {negocio.user_email || "No registrado"}</p>
            <p>🏠 <strong>Tipo de negocio:</strong> {negocio.business_type}</p>
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
                onClick={() => setImagenAmpliada(img.uri)} // abre el modal
                onError={(e) => (e.target.style.display = "none")}
                />
                                {img.descripcion && <p className="img-descripcion">{img.descripcion}</p>}
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
            <div className="modal-imagen" onClick={() => setImagenAmpliada(null)}>
            <img
                src={imagenAmpliada}
                alt="Vista ampliada"
                className="imagen-ampliada"
                onClick={(e) => e.stopPropagation()}
            />
            </div>,
            document.body // 👈 el modal se monta directamente en el <body>
        )
        }






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
