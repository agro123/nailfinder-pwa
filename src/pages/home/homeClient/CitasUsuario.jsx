import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import "./css/CitasUsuario.css";

export default function CitasUsuario() {
  const { user } = useAuth();
  const [todasLasCitas, setTodasLasCitas] = useState([]);
  const [citasFiltradas, setCitasFiltradas] = useState([]);
  const [filtroActivo, setFiltroActivo] = useState("proximas");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [modalConfirmacion, setModalConfirmacion] = useState(false);
  const [citaACancelar, setCitaACancelar] = useState(null);
  

  const obtenerCompanies = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/public/getCompanys");
      const response = await res.json();

      console.log("💬 Respuesta getCompanys:", response);

      if (response.success && Array.isArray(response.data?.negocios)) {
        const mapa = {};

        response.data.negocios.forEach(company => {
          mapa[company.company_id] = {
            nombre: company.company_name,
            logo: company.logo_uri
          };
        });

        return mapa;
      } else {
        console.error("⚠ Estructura inesperada:", response.data);
        return {};
      }

    } catch (err) {
      console.error("Error obteniendo compañías:", err);
      return {};
    }
  };




  const obtenerCitas = async (mapaCompanies) => {
    try {
      const fechaHoy = new Date().toISOString().split("T")[0];

      const res = await fetch(
        `http://localhost:3000/api/private/clientAppointments?clientId=${user.id}&date=${fechaHoy}&limit=100&offset=0`
      );

      const response = await res.json();

      if (response.success && response.data) {
        const citasArray = [];

        Object.keys(response.data).forEach((fecha) => {
          const citasDia = response.data[fecha];

          if (Array.isArray(citasDia)) {
            citasDia.forEach((cita) => {
              let citaPasada = false;

              try {
                const fechaStr = String(cita.date).includes("T")
                  ? String(cita.date).split("T")[0]
                  : String(cita.date);

                const horaFin = String(cita.endat || "00:00:00");
                const fechaHoraISO = `${fechaStr}T${horaFin}`;

                citaPasada = new Date(fechaHoraISO) < new Date();
              } catch (err) {}

              let duracionTotal = 0;
              if (Array.isArray(cita.services)) {
                duracionTotal = cita.services.reduce((sum, s) => sum + (s.duration || 0), 0);
              }

              citasArray.push({
                id: cita.id,

                // 👇 AQUI: usamos companyid → nombre real
                negocio: mapaCompanies[cita.companyid]?.nombre || "Negocio no disponible",
                logo: mapaCompanies[cita.companyid]?.logo || null,
                servicio: cita.services?.map((s) => s.title).join(", ") || "Sin servicio",
                serviciosDetalle: cita.services || [],
                fecha: new Date(cita.date).toLocaleDateString("es-ES", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                }),
                hora: `${cita.startat?.slice(0, 5) || "00:00"} - ${cita.endat?.slice(0, 5) || "00:00"}`,
                estado:
                  cita.status === 1
                    ? "Pendiente"
                    : cita.status === 2
                    ? "Aprobada"
                    : cita.status === 98
                    ? "Cancelada"
                    : cita.status === 99
                    ? "Negada"
                    : "Desconocido",
                fechaOriginal: cita.date,
                citaPasada: citaPasada && cita.status === 2,
                empleado: cita.employee?.name || "No asignado",
                duracionTotal,
                totalCost: cita.totalcost || 0,
                datosCompletos: cita,
              });
            });
          }
        });

        setTodasLasCitas(citasArray);
        aplicarFiltro("proximas", citasArray);
      } else {
        setError(response.message || "Error al cargar las citas.");
      }
    } catch (err) {
      setError("Error de conexión al servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cargarDatos = async () => {
      if (!user?.id) return;

      setLoading(true);

      const mapaCompanies = await obtenerCompanies(); // primero empresas
      await obtenerCitas(mapaCompanies);             // luego citas usando el mapa
    };

    cargarDatos();
  }, [user?.id]);


  const aplicarFiltro = (tipoFiltro, citas = todasLasCitas) => {
    const ahora = new Date();
    
    if (tipoFiltro === "proximas") {
      const proximasCitas = citas.filter(cita => {
        try {
          const fechaStr = String(cita.fechaOriginal).includes('T') 
            ? String(cita.fechaOriginal).split('T')[0] 
            : String(cita.fechaOriginal);

          const fechaCita = new Date(fechaStr + 'T00:00:00');
          const hoy = new Date(ahora.toISOString().split('T')[0] + 'T00:00:00');

          return (
            fechaCita >= hoy &&
            !cita.citaPasada &&
            cita.estado !== "Cancelada"   // 👈 FILTRA LAS CANCELADAS
          );
        } catch {
          return false;
        }
      });

      setCitasFiltradas(proximasCitas);
    } else if (tipoFiltro === "historial") {
      const historialOrdenado = [...citas].sort((a, b) => {
        const fechaA = new Date(a.fechaOriginal);
        const fechaB = new Date(b.fechaOriginal);
        return fechaB - fechaA; // 👈 DESCENDENTE
    });

  setCitasFiltradas(historialOrdenado);
}
    
    setFiltroActivo(tipoFiltro);
  };

  const cambiarFiltro = (nuevoFiltro) => {
    aplicarFiltro(nuevoFiltro);
  };

  const abrirModal = (cita) => {
    setCitaSeleccionada(cita);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setCitaSeleccionada(null);
  };

  const abrirModalConfirmacion = (cita) => {
    setCitaACancelar(cita);
    setModalConfirmacion(true);
  };

  const cerrarModalConfirmacion = () => {
    setModalConfirmacion(false);
    setCitaACancelar(null);
  };

  const cancelarCita = async () => {
    if (!citaACancelar) return;

    setCancelando(true);
    
    try {
      const res = await fetch('http://localhost:3000/api/public/cancelAppointment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId: citaACancelar.id,
          clientId: user.id
        })
      });

      const response = await res.json();

      if (response.success) {
        // Recargar citas
        const fechaHoy = new Date().toISOString().split('T')[0];
        
        const resCitas = await fetch(
          `http://localhost:3000/api/private/clientAppointments?clientId=${user.id}&date=${fechaHoy}&limit=100&offset=0`
        );
        
        const responseCitas = await resCitas.json();

        if (responseCitas.success && responseCitas.data) {
          const citasArray = [];
          
          Object.keys(responseCitas.data).forEach(fecha => {
            const citasDia = responseCitas.data[fecha];
            
            if (Array.isArray(citasDia)) {
              citasDia.forEach(cita => {
                let citaPasada = false;
                
                try {
                  const fechaStr = String(cita.date).includes('T') 
                    ? String(cita.date).split('T')[0] 
                    : String(cita.date);
                  
                  const horaFin = String(cita.endat || '00:00:00');
                  
                  const fechaHoraISO = `${fechaStr}T${horaFin}`;
                  const fechaHoraFinalizacion = new Date(fechaHoraISO);
                  const ahora = new Date();
                  
                  citaPasada = fechaHoraFinalizacion < ahora;
                } catch (err) {
                  console.error('Error al calcular si la cita pasó:', err);
                }
                
                let duracionTotal = 0;
                if (cita.services && Array.isArray(cita.services)) {
                  duracionTotal = cita.services.reduce((total, service) => {
                    return total + (service.duration || 0);
                  }, 0);
                }
                
                citasArray.push({
                  id: cita.id,
                  negocio: mapaCompanies[cita.companyid]?.nombre || 'Negocio no disponible',
                  logo: mapaCompanies[cita.companyid]?.logo || null,
                  servicio: cita.services?.map(service => service.title).join(', ') || 'Sin servicio',
                  serviciosDetalle: cita.services || [],
                  fecha: new Date(cita.date).toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  }),
                  hora: `${cita.startat?.slice(0, 5) || '00:00'} - ${cita.endat?.slice(0, 5) || '00:00'}`,
                  estado: cita.status === 1 ? "Pendiente" 
                        : cita.status === 2 ? "Aprobada" 
                        : cita.status === 98 ? "Cancelada"
                        : cita.status === 99 ? "Negada"
                        : "Desconocido",
                  fechaOriginal: cita.date,
                  citaPasada: citaPasada && cita.status === 2,
                  empleado: cita.employee?.name || 'No asignado',
                  duracionTotal: duracionTotal,
                  totalCost: cita.totalcost || 0,
                  datosCompletos: cita
                });
              });
            }
          });

          setTodasLasCitas(citasArray);
          aplicarFiltro(filtroActivo, citasArray);
        }

        cerrarModalConfirmacion();
        alert('Cita cancelada exitosamente');
      } else {
        alert(response.message || 'Error al cancelar la cita');
      }
    } catch (err) {
      console.error('Error al cancelar la cita:', err);
      alert('Error de conexión al servidor');
    } finally {
      setCancelando(false);
    }
  };

  const formatearPrecio = (valor) => {
    if (!valor) return "0";
    return Number(valor).toLocaleString("es-CO");
  };


  return (
    <div className="citasusuario-container">
      <header className="citasusuario-header">
        <h2>Mis citas</h2>
        
        <div className="filtros-container">
          <button 
            className={`btn-filtro ${filtroActivo === "proximas" ? "activo" : ""}`}
            onClick={() => cambiarFiltro("proximas")}
          >
            📅 Próximas
          </button>
          <button 
            className={`btn-filtro ${filtroActivo === "historial" ? "activo" : ""}`}
            onClick={() => cambiarFiltro("historial")}
          >
            📋 Historial
          </button>
        </div>
      </header>

      {loading ? (
        <p className="loading-message">Cargando citas...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : citasFiltradas.length === 0 ? (
        <p className="no-citasusuario">
          {filtroActivo === "proximas" 
            ? "No tienes citas próximas agendadas." 
            : "No tienes citas en tu historial."}
        </p>
      ) : (
        <div className="citasusuario-list">
          {citasFiltradas.map((cita) => (
            <div 
              key={cita.id} 
              className="citasusuario-card"
            >
              <div 
                className="citasusuario-info"
                onClick={() => abrirModal(cita)}
              >
                <div className="cita-header">
                  {cita.logo && (
                    <img
                      src={cita.logo}
                      alt="Logo negocio"
                      className="cita-logo"
                    />
                  )}

                  <h3 className="cita-nombre">{cita.negocio}</h3>
                </div>
                <p className="servicio">{cita.servicio}</p>
                <p className="fecha">{cita.fecha}</p>
                <p className="hora">{cita.hora}</p>
                <div className="fila-estado-boton">
                  <p
                    className={`estado ${
                      cita.citaPasada
                        ? "pasada"
                        : cita.estado === "Aprobada"
                        ? "confirmada"
                        : cita.estado === "Pendiente"
                        ? "pendiente"
                        : "cancelada"
                    }`}
                  >
                    {cita.citaPasada ? "Finalizada" : cita.estado}
                  </p>

                  {!cita.citaPasada && 
                  (cita.estado === "Pendiente" || cita.estado === "Aprobada") && (
                      <button
                        className="btn-cancelar-cita"
                        onClick={(e) => {
                          e.stopPropagation();
                          abrirModalConfirmacion(cita);
                        }}
                      >
                        ❌ Cancelar cita
                      </button>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal con detalles completos */}
      {modalAbierto && citaSeleccionada && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-detalle" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={cerrarModal}>✕</button>
            
            <div className="cita-modal-header">
              {citaSeleccionada.logo && (
                <img
                  src={citaSeleccionada.logo}
                  alt="Logo negocio"
                  className="modal-logo"
                />
              )}

              <h2 className="cita-nombre">{citaSeleccionada.negocio}</h2>
            </div>
            
            <div className="modal-info-grid">
              <div className="modal-info-item">
                <span className="info-label">📅 Fecha:</span>
                <span className="info-value">{citaSeleccionada.fecha}</span>
              </div>
              
              <div className="modal-info-item">
                <span className="info-label">🕐 Horario:</span>
                <span className="info-value">{citaSeleccionada.hora}</span>
              </div>
              
              <div className="modal-info-item">
                <span className="info-label">👤 Profesional:</span>
                <span className="info-value">{citaSeleccionada.empleado}</span>
              </div>
              
              <div className="modal-info-item">
                <span className="info-label">⏱️ Duración:</span>
                <span className="info-value">{citaSeleccionada.duracionTotal} min</span>
              </div>
              
              <div className="modal-info-item full-width">
                <span className="info-label">💼 Servicios:</span>
                <div className="servicios-lista">
                  {citaSeleccionada.serviciosDetalle.map((servicio, index) => (
                    <div key={index} className="servicio-item">
                      <span className="servicio-nombre">{servicio.title}</span>
                      <span className="servicio-duracion">{servicio.duration} min</span>
                      <span className="servicio-precio">${formatearPrecio(servicio.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="modal-info-item">
                <span className="info-label">💰 Total:</span>
                <span className="info-value total">${formatearPrecio(citaSeleccionada.totalCost)}</span>
              </div>
              
              <div className="modal-info-item">
                <span className="info-label">📌 Estado:</span>
                <span 
                  className={`estado-badge ${
                    citaSeleccionada.citaPasada
                      ? "pasada"
                      : citaSeleccionada.estado === "Aprobada"
                      ? "confirmada"
                      : citaSeleccionada.estado === "Pendiente"
                      ? "pendiente"
                      : "cancelada"
                  }`}
                >
                  {citaSeleccionada.citaPasada ? "Finalizada" : citaSeleccionada.estado}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de cancelación */}
      {modalConfirmacion && citaACancelar && (
        <div className="modal-overlay" onClick={cerrarModalConfirmacion}>
          <div className="modal-confirmacion" onClick={(e) => e.stopPropagation()}>
            <h3>¿Confirmar cancelación?</h3>
            <p>¿Estás seguro de que deseas cancelar esta cita?</p>
            
            <div className="confirmacion-info">
              <p><strong>{citaACancelar.negocio}</strong></p>
              <p>{citaACancelar.fecha}</p>
              <p>{citaACancelar.hora}</p>
            </div>

            <div className="modal-actions">
              <button 
                className="btn-confirmar-no" 
                onClick={cerrarModalConfirmacion}
                disabled={cancelando}
              >
                No, mantener
              </button>
              <button 
                className="btn-confirmar-si" 
                onClick={cancelarCita}
                disabled={cancelando}
              >
                {cancelando ? 'Cancelando...' : 'Sí, cancelar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}