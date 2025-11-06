import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./css/DetalleNegocio.css";

export default function DetalleNegocio() {
    const { id } = useParams();
    const { state } = useLocation();
    const navigate = useNavigate();

    const negocio = state?.negocio;

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
                className="detalle-logo"
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
            <p>
                📞 <strong>Teléfono:</strong> {negocio.company_phone || "No disponible"}
            </p>
            <p>
                📧 <strong>Email:</strong> {negocio.user_email || "No registrado"}
            </p>
            <p>
                🏠 <strong>Tipo de negocio:</strong> {negocio.business_type}
            </p>
            <p>{negocio.status ? "🟢 Abierto" : "🔴 Cerrado"}</p>
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

        {/* 📍 Ubicación */}
        <div className="detalle-ubicacion">
            <h3>Ubicación</h3>
            {negocio.latitude && negocio.longitude ? (
            <p>
                📍 <strong>Latitud:</strong> {negocio.latitude} |{" "}
                <strong>Longitud:</strong> {negocio.longitude}
            </p>
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
                <img
                    src={img.uri}
                    alt={img.name || `banner-${i}`}
                    className="galeria-img"
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


    </div>
    );
}
