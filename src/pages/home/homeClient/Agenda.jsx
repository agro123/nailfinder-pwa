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
    const [mensajeEstado, setMensajeEstado] = useState("");

    // 🔹 Generar disponibilidad con lógica de cierre y agenda llena
    const generarDisponibilidad = (fecha) => {
        const clave = `${idProfesional}-${fecha.toDateString()}`;

        // Si ya tenemos horas guardadas, las usamos,
        // PERO igual evaluamos el mensajeEstado.
        let seleccionadas = disponibilidadesGuardadas[clave];

        const hoy = new Date();
        const esHoy =
            fecha.getDate() === hoy.getDate() &&
            fecha.getMonth() === hoy.getMonth() &&
            fecha.getFullYear() === hoy.getFullYear();

        if (!seleccionadas) {
            const horas = [
                "8:00 a.m.", "9:00 a.m.", "10:00 a.m.", "11:00 a.m.",
                "1:00 p.m.", "2:00 p.m.", "3:00 p.m.", "4:00 p.m.", "5:00 p.m."
            ];

            const copia = [...horas];
            copia.sort(() => 0.5 - Math.random());
            const cantidad = Math.floor(Math.random() * (horas.length - 3)) + 3;

            seleccionadas = copia
                .slice(0, cantidad)
                .sort((a, b) => horas.indexOf(a) - horas.indexOf(b));

            disponibilidadesGuardadas[clave] = seleccionadas;
        }

        // ✅ Este bloque SIEMPRE se ejecuta al seleccionar la fecha
        if (esHoy) {
            const horaActual = hoy.getHours() + hoy.getMinutes() / 60;
            seleccionadas = seleccionadas.filter((horaStr) => {
                const match = horaStr.match(/(\d+):(\d+)\s?(a\.m\.|p\.m\.)/i);
                if (!match) return true;
                let h = parseInt(match[1]);
                const m = parseInt(match[2]);
                const ampm = match[3].toLowerCase();
                if (ampm === "p.m." && h !== 12) h += 12;
                if (ampm === "a.m." && h === 12) h = 0;
                const horaDecimal = h + m / 60;
                return horaDecimal > horaActual;
            });

            if (seleccionadas.length === 0 && horaActual >= 17.5) {
                setMensajeEstado("Ya no atendemos hoy. Agenda para mañana 💅");
            } else if (seleccionadas.length === 0) {
                setMensajeEstado("Ya tenemos agenda llena hoy. Intenta mañana 🕓");
            } else {
                setMensajeEstado("");
            }
        } else {
            setMensajeEstado("");
        }
            return seleccionadas;
        };


    const horasDisponibles = useMemo(
        () => generarDisponibilidad(fechaSeleccionada),
        [fechaSeleccionada, idProfesional]
    );

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // 🔹 Bloquea retroceso luego de confirmar
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
        setTimeout(() => {
            navigate(`/detalle/${negocio.company_id}`, {
                state: { negocio, desdeConfirmacion: true },
                replace: true,
            });
        }, 2000);
    };

    const handleVolver = () => {
        navigate(`/detalle/${negocio?.company_id}`, { state: { negocio }, replace: true });
    };

    return (
        <div className="agenda-container">
            <button className="back-btn" onClick={handleVolver}>
                <ChevronLeft size={28} strokeWidth={2} />
            </button>

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

                {mensajeEstado ? (
                    <div className="mensaje-estado-container">
                        <p className="mensaje-estado">{mensajeEstado}</p>
                    </div>
                ) : (
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
                )}
            </div>

            {horaSeleccionada && !mensajeEstado && (
                <button className="continuar-btn" onClick={handleContinuar}>
                    Continuar
                </button>
            )}

            {/* --- MODAL CONFIRMACIÓN --- */}
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

            {/* --- MODAL ÉXITO --- */}
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
