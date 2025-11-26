import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./css/Agenda.css";
import { ChevronLeft } from "lucide-react";

export default function Agenda() {
    const { idProfesional } = useParams();
    const { state } = useLocation();
    const navigate = useNavigate();

    const profesional = state?.profesional;
    const servicio = state?.servicio;
    const negocio = state?.negocio;

    const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
    const [disponibilidad, setDisponibilidad] = useState(null);
    const [horaSeleccionada, setHoraSeleccionada] = useState(null);
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
    const [mostrarExito, setMostrarExito] = useState(false);
    const [mensajeEstado, setMensajeEstado] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const authUser = JSON.parse(localStorage.getItem("auth_user"));
    const clientId = authUser?.id
    console.log("Usuario", clientId);

    // 🔹 Cargar disponibilidad desde el backend
    const obtenerDisponibilidad = async (fecha) => {
        try {
            setLoading(true);
            setMensajeEstado("");
            setError(null);
            setDisponibilidad(null);
            setHoraSeleccionada(null);

            const fechaISO = fecha.toISOString().split("T")[0]; // yyyy-mm-dd

            // Validaciones mínimas
            if (!servicio?.service_id || !profesional?.id || !negocio?.company_id) {
                setMensajeEstado("Faltan datos del servicio, trabajador o empresa.");
                return;
            }

            const url = `http://localhost:3000/api/public/getAvailableHours?date=${fechaISO}&serviceId=${servicio.service_id}&userId=${profesional.id}&companyId=${negocio.company_id}`;

            console.log("🗓️ Solicitando disponibilidad:", url);

            const response = await fetch(url);
            const result = await response.json();

            // Log para depuración: ver la estructura completa que regresa el backend
            console.log("📥 Respuesta getAvailableHours:", result);

            if (!result.success) {
                throw new Error(result.message || "Error al obtener disponibilidad");
            }

            const diaData = (result.data || []).find((d) => d.date === fechaISO);

            if (!diaData) {
                // No viene información para ese día
                setDisponibilidad({ morning: [], afternoon: [], night: [] });
                setMensajeEstado("No hay disponibilidad para esta fecha.");
                return;
            }

            const { morning = [], afternoon = [], night = [] } = diaData.periods || {};

            // Si todas las franjas están vacías -> mensaje
            const totalHoras = (morning.length + afternoon.length + night.length);
            if (totalHoras === 0) {
                setDisponibilidad({ morning: [], afternoon: [], night: [] });
                setMensajeEstado("No hay horas disponibles para esta fecha.");
                return;
            }

            // Si hay horas, guardarlas y limpiar mensaje
            setDisponibilidad({ morning, afternoon, night });
            setMensajeEstado("");
        } catch (err) {
            console.error("❌ Error obteniendo disponibilidad:", err);
            setError("No se pudo obtener la disponibilidad.");
            setMensajeEstado("No se pudo obtener la disponibilidad.");
            setDisponibilidad({ morning: [], afternoon: [], night: [] });
        } finally {
            setLoading(false);
        }
    };

    // 🔹 Llamar al cargar y al cambiar fecha / profesional / servicio / negocio
    useEffect(() => {
        obtenerDisponibilidad(fechaSeleccionada);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fechaSeleccionada, profesional, servicio, negocio]);

    // 🔹 Bloquear retroceso luego de confirmar
    useEffect(() => {
        const handlePopState = (event) => {
            event.preventDefault();
            navigate(`/detalle/${negocio?.company_id}`, { state: { negocio }, replace: true });
        };
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [navigate, negocio]);

    const handleContinuar = () => setMostrarConfirmacion(true);

    const calcularHoraFin = (horaInicio, duracionMinutos) => {
        const [h, m] = horaInicio.split(":").map(Number);
        const fecha = new Date();
        fecha.setHours(h);
        fecha.setMinutes(m + (duracionMinutos || 30)); // por defecto 30 minutos
        const finH = fecha.getHours().toString().padStart(2, "0");
        const finM = fecha.getMinutes().toString().padStart(2, "0");
        return `${finH}:${finM}`;
    };


    const handleConfirmarCita = async () => {
        if (!fechaSeleccionada || !horaSeleccionada) {
            alert("Selecciona una fecha y hora antes de confirmar.");
            return;
        }

        try {
            const body = {
                clientId: clientId, 
                employeeId: profesional.id, // id del trabajador seleccionado
                companyId: negocio.company_id, 
                date: fechaSeleccionada, // formato YYYY-MM-DD
                startAt: horaSeleccionada, // hora seleccionada, ej: "10:00"
                endAt: calcularHoraFin(horaSeleccionada, servicio.duration), // función auxiliar abajo 👇
                services: [servicio.service_id], // el id del servicio que se agenda
            };

            console.log("📤 Enviando cita:", body);

            const response = await fetch("http://localhost:3000/api/public/createAppointment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            const result = await response.json();

            if (result.success) {
                setMostrarConfirmacion(false);
                setMostrarExito(true);

                // 🔹 Espera 2 segundos mostrando el modal de éxito y luego vuelve al detalle del negocio
                setTimeout(() => {
                    navigate(`/detalle/${negocio.company_id}`, {
                        state: { negocio, desdeConfirmacion: true },
                        replace: true,
                    });
                }, 2000);
            } else {
                alert(`❌ Error: ${result.message || "No se pudo crear la cita."}`);
            }
        } catch (err) {
            console.error("Error al crear la cita:", err);
            alert("Ocurrió un error al intentar registrar la cita.");
        }
    };


    const handleVolver = () => {
        navigate(`/detalle/${negocio?.company_id}`, { 
            state: { negocio, desdeAgenda: true }, 
            replace: true 
        });
    };

    // 🟢 Vista previa del JSON antes de confirmar cita
    useEffect(() => {
        if (!fechaSeleccionada || !horaSeleccionada || !servicio?.service_id || !profesional?.id || !negocio?.company_id) {
            console.log("⚠️ Faltan datos para construir el JSON de cita");
            return;
        }

        const fechaISO = fechaSeleccionada.toISOString().split("T")[0];
        const citaPreview = {
            clientId: clientId, // ⚠️ Cambiar por el ID real del cliente autenticado
            employeeId: profesional.id,
            companyId: negocio.company_id,
            date: fechaISO,
            startAt: horaSeleccionada,
            endAt: (() => {
                const [h, m] = horaSeleccionada.split(":").map(Number);
                const f = new Date();
                f.setHours(h);
                f.setMinutes(m + (servicio.duration || 30));
                const finH = f.getHours().toString().padStart(2, "0");
                const finM = f.getMinutes().toString().padStart(2, "0");
                return `${finH}:${finM}`;
            })(),
            services: [servicio.service_id],
        };

        console.log("🟢 Vista previa del JSON que se enviará:", citaPreview);
    }, [fechaSeleccionada, horaSeleccionada, servicio, profesional, negocio]);

    const formatoPrecio = (precio) => {
        if (precio === null || precio === undefined || precio === "") return "No especificado";

        const numero = typeof precio === 'string' ? parseFloat(precio) : precio;
        if (Number.isNaN(numero)) return "No especificado";

        return `$${numero.toLocaleString('es-CO', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        })}`;
    };


    return (
        <div className="agenda-container">
            <button className="back-btn" onClick={handleVolver}>
                <ChevronLeft size={28} strokeWidth={2} />
            </button>

            <h2>📅 Agenda de {profesional?.nombre || profesional?.name}</h2>

            <div className="calendar-section">
                <Calendar
                    onChange={setFechaSeleccionada}
                    value={fechaSeleccionada}
                    minDate={new Date()}
                />
            </div>

            <div className="horarios-section">
                <h3>Selecciona una hora para {fechaSeleccionada.toLocaleDateString()}</h3>

                {loading ? (
                    <p>Cargando disponibilidad...</p>
                ) : error ? (
                    <p className="mensaje-estado">{mensajeEstado || error}</p>
                ) : mensajeEstado ? (
                    <div className="mensaje-estado-container">
                        <p className="mensaje-estado">{mensajeEstado}</p>
                    </div>
                ) : disponibilidad ? (
                    <>
                        {["morning", "afternoon", "night"].map((periodo) => (
                            disponibilidad[periodo]?.length > 0 && (
                                <div key={periodo}>
                                    <h4 className="titulo-periodo">
                                        {periodo === "morning"
                                            ? "☀️ Mañana"
                                            : periodo === "afternoon"
                                            ? "🌇 Tarde"
                                            : "🌙 Noche"}
                                    </h4>
                                    <div className="horarios-grid">
                                        {disponibilidad[periodo].map((hora, i) => (
                                            <button
                                                key={i}
                                                className={`hora-btn ${
                                                    hora === horaSeleccionada ? "seleccionada" : ""
                                                }`}
                                                onClick={() => setHoraSeleccionada(hora)}
                                            >
                                                {hora}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )
                        ))}
                    </>
                ) : (
                    <p>No hay horarios disponibles.</p>
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
                                {negocio?.promedio_calificacion ? (
                                    <p className="reseña-valoracion">⭐ {negocio.promedio_calificacion} ({negocio.calificaciones?.length || 0} Reseñas)</p>
                                    
                                ) : (
                                    <p className="reseña-total">Sin reseñas aún</p>
                                )}
                            </div>
                        </div>

                        <div className="detalle-cita">
                            <p><strong>👩 Profesional:</strong> {profesional?.nombre || profesional?.name}</p>
                            <p><strong>📅 Fecha:</strong> {fechaSeleccionada.toLocaleDateString()}</p>
                            <p><strong>⏰ Hora:</strong> {horaSeleccionada}</p>
                            <p><strong>🕓 Duración:</strong> {servicio?.duration ? `${servicio.duration} min` : "60 min"}</p>
                            <p><strong>📍 Dirección:</strong> {negocio?.company_address || "Dirección no disponible"}</p>
                        </div>

                        <div className="detalle-servicio">
                            <h4>🧾 Detalle</h4>
                            <div className="servicio-item">
                                <span>{servicio?.title || "Servicio seleccionado"}</span>
                                <span>{formatoPrecio(servicio?.price)}</span>
                            </div>
                            <hr />
                            <div className="total">
                                <span>Total</span>
                                <span>{formatoPrecio(servicio?.price)}</span>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="cancelar-btn" onClick={() => setMostrarConfirmacion(false)}>Cancelar</button>
                            <button className="confirmar-btn" onClick={handleConfirmarCita}>Confirmar Cita</button>
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
