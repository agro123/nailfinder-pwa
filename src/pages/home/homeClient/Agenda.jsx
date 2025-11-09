import React, { useState, useMemo, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./css/Agenda.css";
import { ChevronLeft } from "lucide-react";

const disponibilidadesGuardadas = {};

export default function Agenda() {
    const { idProfesional } = useParams();
    const { state } = useLocation();
    const navigate = useNavigate();

    const profesional = state?.profesional;
    const servicio = state?.servicio;
    const negocio = state?.negocio;

    const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
    const [horaSeleccionada, setHoraSeleccionada] = useState(null);
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
    const [mostrarExito, setMostrarExito] = useState(false);

    const generarDisponibilidad = (fecha) => {
        const clave = `${idProfesional}-${fecha.toDateString()}`;
        if (disponibilidadesGuardadas[clave]) {
            return disponibilidadesGuardadas[clave];
        }

        const horas = [
            "8:00 a.m.", "9:00 a.m.", "10:00 a.m.", "11:00 a.m.",
            "1:00 p.m.", "2:00 p.m.", "3:00 p.m.", "4:00 p.m.", "5:00 p.m."
        ];

        const copia = [...horas];
        copia.sort(() => 0.5 - Math.random());
        const cantidad = Math.floor(Math.random() * (horas.length - 3)) + 3;
        const seleccionadas = copia.slice(0, cantidad).sort((a, b) => horas.indexOf(a) - horas.indexOf(b));

        disponibilidadesGuardadas[clave] = seleccionadas;
        return seleccionadas;
    };

    const horasDisponibles = useMemo(
        () => generarDisponibilidad(fechaSeleccionada),
        [fechaSeleccionada, idProfesional]
    );

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // 🔹 Evita retroceso una vez confirmado
    useEffect(() => {
        const handlePopState = (event) => {
        event.preventDefault();
        navigate(`/detalle/${negocio?.company_id}`, { state: { negocio }, replace: true });
        };
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [navigate, negocio]);

    const handleContinuar = () => setMostrarConfirmacion(true);

    const handleConfirmar = () => {
        setMostrarConfirmacion(false);
        setMostrarExito(true);
        // Espera 2 segundos y redirige
        setTimeout(() => {
            navigate(`/detalle/${negocio.company_id}`, {
                state: { negocio, desdeConfirmacion: true },
                replace: true,
            });
        }, 2000);
    };

    // 🔹 Evita que el botón "Volver" te saque atrás
    const handleVolver = () => {
        navigate(`/detalle/${negocio?.company_id}`, { state: { negocio }, replace: true });
    };

    return (
        <div className="agenda-container">
            <button className="back-btn" onClick={handleVolver}><ChevronLeft size={28} strokeWidth={2} /></button>

            <h2>📅 Agenda de {profesional?.nombre}</h2>

            <div className="calendar-section">
                <Calendar
                onChange={setFechaSeleccionada}
                value={fechaSeleccionada}
                minDate={new Date()}
                />
            </div>

            <div className="horarios-section">
                <h3>Selecciona una hora para {fechaSeleccionada.toLocaleDateString()}</h3>
                <div className="horarios-grid">
                {horasDisponibles.map((hora, i) => (
                    <button
                    key={i}
                    className={`hora-btn ${hora === horaSeleccionada ? "seleccionada" : ""}`}
                    onClick={() => setHoraSeleccionada(hora)}
                    >
                    {hora}
                    </button>
                ))}
                </div>
            </div>

            {horaSeleccionada && (
                <button className="continuar-btn" onClick={handleContinuar}>
                Continuar
                </button>
            )}

            {/* --- MODAL DE CONFIRMACIÓN --- */}
            {mostrarConfirmacion && (
            <div className="modal-overlay">
                <div className="modal-content confirmacion-cita">
                    <div className="empresa-info">
                        {negocio?.logo_uri ? (
                            <img src={negocio.logo_uri} alt={negocio.company_name} className="empresa-logo" />
                        ) : (
                            <div className="emoji-box small">🏢</div>
                        )}
                        <div>
                            <h3>{negocio?.company_name || "Negocio sin nombre"}</h3>
                            {negocio?.rating ? (
                            <p className="reseña">⭐ {negocio.rating} / 5 ({negocio.reviews_count || 0} reseñas)</p>
                            ) : (
                            <p className="reseña">Sin reseñas aún</p>
                            )}
                        </div>
                    </div>

                    <div className="detalle-cita">
                    <p><strong>👩 Profesional:</strong> {profesional?.nombre}</p>
                    <p><strong>📅 Fecha:</strong> {fechaSeleccionada.toLocaleDateString()}</p>
                    <p><strong>⏰ Hora:</strong> {horaSeleccionada}</p>
                    <p><strong>🕓 Duración:</strong> {servicio?.duration ? `${servicio.duration} min` : "60 min"}</p>
                    <p><strong>📍 Dirección:</strong> {negocio?.company_address || "Dirección no disponible"}</p>
                    </div>

                    <div className="detalle-servicio">
                        <h4>🧾 Detalle</h4>
                        <div className="servicio-item">
                            <span>{servicio?.title || "Servicio seleccionado"}</span>
                            <span>{servicio?.price ? `$${servicio.price}` : "No especificado"}</span>
                        </div>
                        <hr />
                        <div className="total">
                            <span>Total</span>
                            <span>{servicio?.price ? `$${servicio.price}` : "No especificado"}</span>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button className="cancelar-btn" onClick={() => setMostrarConfirmacion(false)}>Cancelar</button>
                        <button className="confirmar-btn" onClick={handleConfirmar}>Confirmar Cita</button>
                    </div>
                </div>
            </div>
            )}

            {/* --- MODAL DE ÉXITO --- */}
            {mostrarExito && (
                <div className="modal-overlay">
                    <div className="modal-content exito-cita">
                        <div className="check-icon">✅</div>
                        <h3>¡Cita confirmada!</h3>
                        <p>Tu cita ha sido registrada exitosamente</p>
                    </div>
                </div>
            )}
        </div>
    );
}
