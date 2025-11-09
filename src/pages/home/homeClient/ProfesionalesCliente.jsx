import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import "./css/ProfesionalesCliente.css";

export default function ProfesionalesCliente() {
    const { idServicio } = useParams();
    const { state } = useLocation();
    const navigate = useNavigate();

    const servicio = state?.servicio;
    const negocio = state?.negocio;

    const [profesionales, setProfesionales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchWorkers = async () => {
            try {

                const serviceId = servicio.service_id;
                const companyId = negocio.company_id;

                // 🔹 Logs informativos
                console.log("📦 serviceId:", serviceId);
                console.log("🏢 companyId:", companyId);
                setLoading(true);
                setError(null);

                // 🔹 Aquí ajusta la URL base si tu backend está en otro puerto o ruta
                const response = await fetch(
                    `http://localhost:3000/api/public/getWorkersService?serviceId=${serviceId}&companyId=${companyId}`
                );

                const result = await response.json();

                if (!result.success) {
                    throw new Error(result.message || "Error al obtener trabajadores");
                }

                setProfesionales(result.data || []);
            } catch (err) {
                console.error("Error:", err);
                setError("No se pudieron cargar los trabajadores.");
            } finally {
                setLoading(false);
            }
        };

        fetchWorkers();
    }, [idServicio, servicio, negocio]);

    return (
        <div className="profesionales-container">
            <button className="back-btn" onClick={() => navigate(-1)}>
                <ChevronLeft size={28} strokeWidth={2} />
            </button>

            <h2>💅 Profesionales asociados</h2>
            {servicio && <h3>Servicio: {servicio.title}</h3>}

            {loading ? (
                <p>Cargando profesionales...</p>
            ) : error ? (
                <p className="error-text">{error}</p>
            ) : profesionales.length === 0 ? (
                <p>No hay profesionales asignados a este servicio.</p>
            ) : (
                <div className="profesionales-grid">
                    {profesionales.map((pro) => (
                        <div
                            key={pro.id}
                            className="profesional-card"
                            onClick={() =>
                                navigate(`/agenda/${pro.id}`, {
                                    state: { profesional: pro, servicio, negocio },
                                })
                            }
                            style={{ cursor: "pointer" }}
                        >
                            <div className="emoji-box">
                                {pro.photo ? (
                                    <img
                                        src={pro.photo}
                                        alt={pro.name}
                                        className="profesional-foto"
                                    />
                                ) : (
                                    "💅"
                                )}
                            </div>
                            <h4>{pro.name}</h4>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
