import React, { useMemo } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import "./css/ProfesionalesCliente.css";

// 🔹 Asignaciones globales (persisten mientras la app esté en uso)
const asignaciones = {};

export default function ProfesionalesCliente() {
    const { idServicio } = useParams();
    const { state } = useLocation();
    const navigate = useNavigate();
    const servicio = state?.servicio;
    const negocio = state?.negocio; 

    // 🔹 Base de profesionales de manicura
    const profesionalesBase = [
        { id: 1, nombre: "Laura Gómez", especialidad: "Manicurista Profesional", experiencia: "7 años", rating: 4.9 },
        { id: 2, nombre: "Camila Torres", especialidad: "Especialista en Uñas Acrílicas", experiencia: "5 años", rating: 4.8 },
        { id: 3, nombre: "Diana López", especialidad: "Técnica en Nail Art", experiencia: "6 años", rating: 4.7 },
        { id: 4, nombre: "Valeria Martínez", especialidad: "Manicurista y Pedicurista", experiencia: "8 años", rating: 4.9 },
        { id: 5, nombre: "Andrea Castro", especialidad: "Diseñadora de Uñas en Gel", experiencia: "4 años", rating: 4.6 },
        { id: 6, nombre: "Paola Ruiz", especialidad: "Manicurista Especialista en Spa de Manos", experiencia: "9 años", rating: 5.0 },
    ];

    
    // 🔹 Generar o recuperar asignación para este servicio
    const profesionales = useMemo(() => {
        // Genera una clave única y estable para cada servicio
        const claveServicio =
            idServicio || servicio?.id || servicio?.title || `serv-${Math.random()}`;

        // Si ya se asignaron profesionales a este servicio, los reutiliza
        if (asignaciones[claveServicio]) {
            return asignaciones[claveServicio];
        }

        // Caso contrario, crea una asignación nueva
        const cantidad = Math.floor(Math.random() * 4) + 1; // entre 1 y 4 profesionales
        const copia = [...profesionalesBase];
        copia.sort(() => 0.5 - Math.random());
        const seleccion = copia.slice(0, cantidad);

        // Guarda la asignación globalmente
        asignaciones[claveServicio] = seleccion;
        return seleccion;
    }, [idServicio, servicio]);



    return (
        <div className="profesionales-container">
            <button className="back-btn" onClick={() => navigate(-1)}>
                <ChevronLeft size={28} strokeWidth={2} />
            </button>

            <h2>💅 Profesionales asociados</h2>
            {servicio && <h3>Servicio: {servicio.title}</h3>}

            <div className="profesionales-grid">
                {profesionales.map((pro) => (
                <div
                    key={pro.id}
                    className="profesional-card"
                    onClick={() => navigate(`/agenda/${pro.id}`, { state: { profesional: pro, servicio, negocio } })}
                    style={{ cursor: "pointer" }}
                >
                    <div className="emoji-box">💅</div>
                    <h4>{pro.nombre}</h4>
                    <p><strong>Especialidad:</strong> {pro.especialidad}</p>
                    <p><strong>Experiencia:</strong> {pro.experiencia}</p>
                    <p><strong>⭐ Rating:</strong> {pro.rating}</p>
                </div>
                ))}
            </div>
        </div>
    );
}
