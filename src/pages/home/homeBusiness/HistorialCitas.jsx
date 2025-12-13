import React, { useEffect, useState } from "react";
import "./css/HistorialCitas.css";
import { useAuth } from "../../../context/AuthContext";
import { ChevronLeft } from "lucide-react";
import { API_URL } from "../../../constants";

const HistorialCitas = () => {
  const { user } = useAuth();

  const [citas, setCitas] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);   // ← FIX

  const [modalCita, setModalCita] = useState(null);
  const [deleteCita, setDeleteCita] = useState(null);

  // ============================
  // ALERTAS
  // ============================
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    type: "",
  });

  const showAlert = (message, type = "info") => {
    console.log(`🔔 ALERTA: ${type.toUpperCase()} - ${message}`);
    setAlert({ show: true, message, type });

    setTimeout(() => {
      setAlert({ show: false, message: "", type: "" });
    }, 5000);
  };

  // ============================
  // FUNCIÓN PARA OBTENER ÚLTIMOS 10 DÍAS
  // ============================
  const getLast10Days = () => {
    const hoy = new Date();
    const fechas = [];

    for (let i = 0; i < 10; i++) {
      const d = new Date(hoy);
      d.setDate(hoy.getDate() - i);
      fechas.push(d.toISOString().split("T")[0]);
    }

    return fechas;
  };

  // ============================
  // CARGAR CITAS DE LOS ÚLTIMOS 10 DÍAS
  // ============================
  useEffect(() => {

    const loadCitas = async () => {
      console.log("🟦 User recibido en historial:", user);

      if (!user) {
        console.warn("⚠️ Usuario no cargado todavía");
        return;
      }

      const isCompany = !!user.company;
      const companyId = user.company?.id || null;
      const branchId = user.mainBranch?.id || null;
      const clientId = user.id;

      console.log("🟧 Tipo usuario:", isCompany ? "EMPRESA" : "CLIENTE");
      console.log("🟧 companyId:", companyId);
      console.log("🟧 branchId:", branchId);
      console.log("🟧 clientId:", clientId);

      setLoading(true);

      try {
        const fechas = getLast10Days();
        console.log("📅 Consultando fechas:", fechas);

        let citasTotales = [];

        for (const fecha of fechas) {
          let url = "";

          if (isCompany) {
            if (!companyId || !branchId) {
              console.error("❌ Falta companyId o branchId");
              continue;
            }

            url = `${API_URL}/api/private/companyAppointments?companyId=${companyId}&date=${fecha}&branchId=${branchId}`;

          } else {
            url = `${API_URL}/api/private/clientAppointments?clientId=${clientId}&date=${fecha}`;
          }

          console.log("📡 Fetch URL:", url);

          const res = await fetch(url);
          const raw = await res.text();

          // Evita crash si backend devuelve HTML o error
          if (!raw.startsWith("{")) {
            console.error("❌ Respuesta NO es JSON válido:", raw);
            continue;
          }

          const data = JSON.parse(raw);

          if (!data.success) {
            console.warn(`⚠️ No hay citas en ${fecha}`);
            continue;
          }

          console.log(`📌 Citas en ${fecha}:`, data.data);

          // Convertir objeto de fechas → lista simple
          const citasArray = Object.entries(data.data).flatMap(
            ([fecha, citas]) =>
              citas.map((c) => ({
                id: c.id,
                fecha,
                hora: c.startat?.slice(0, 5) || "00:00",
                cliente:
                  isCompany
                    ? c.client?.name || `Cliente ${c.clientid}`
                    : user.name,
                profesional:
                  isCompany
                    ? c.employee?.name || `Empleado ${c.employeeid}`
                    : c.employee?.name,
                servicio: Array.isArray(c.services)
                  ? c.services.map((s) => s.title).join(", ")
                  : "Sin servicio",

                estado:
                  c.status === 1
                    ? "pendiente"
                    : c.status === 2
                    ? "confirmada"
                    : c.status === 98
                    ? "cancelada"
                    : c.status === 99
                    ? "negada"
                    : "otro",
              }))
          );

          citasTotales = [...citasTotales, ...citasArray];
        }

        console.log("📌 Total de citas encontradas:", citasTotales.length);

        setCitas(citasTotales);
        setFiltered(citasTotales);

        showAlert("Citas cargadas correctamente", "success");

      } catch (err) {
        console.error("❌ Error cargando citas:", err);
        showAlert("Error cargando citas", "error");
      } finally {
        setLoading(false);
      }
    };

    loadCitas();
  }, [user]);

  // ============================
  // BUSCADOR
  // ============================
  useEffect(() => {
    const s = search.toLowerCase();

    setFiltered(
      citas.filter(
        (c) =>
          c.cliente?.toLowerCase().includes(s) ||
          c.profesional?.toLowerCase().includes(s) ||
          c.servicio?.toLowerCase().includes(s)
      )
    );
  }, [search, citas]);

  // ============================
  // ELIMINAR CITA
  // ============================
  const confirmarEliminar = async () => {
    if (!deleteCita) return;

    try {
      const res = await fetch(`/api/citas/${deleteCita.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        showAlert("Cita eliminada", "success");

        setCitas((prev) => prev.filter((c) => c.id !== deleteCita.id));
        setFiltered((prev) => prev.filter((c) => c.id !== deleteCita.id));

        setDeleteCita(null);
      } else {
        showAlert("No se pudo eliminar la cita", "error");
      }
    } catch (error) {
      console.error(error);
      showAlert("Error eliminando cita", "error");
    }
  };

  return (
    <div className="history-container">
        
      {/* 👇 NUEVO: Envolver botón y título en un contenedor */}
    <div className="history-header">
      <button className="back-button" onClick={() => window.history.back()}>
        <ChevronLeft size={30} />
      </button>
      
      <h2>Historial de Citas (Últimos 10 días)</h2>
    </div>

    {alert.show && (
      <div className={`alert alert-${alert.type}`}>{alert.message}</div>
    )}

      {/* BUSCADOR */}
      <div className="history-search-bar">
        <input
          type="text"
          placeholder="Buscar cita, cliente o servicio..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* LOADING */}
      {loading && <p>Cargando citas...</p>}

      {/* LISTADO */}
      <div className="history-lista">
        {!loading && filtered.length === 0 ? (
          <p className="history-no-results">No hay resultados</p>
        ) : (
          filtered.map((cita) => (
            <div key={cita.id} className="history-item">
              <div className="history-info">
                <p className="history-nombre">
                  {cita.cliente} — {cita.profesional}
                </p>
                <p className="history-detalles">
                  {cita.servicio} | {cita.fecha} {cita.hora}
                </p>
                <p className="history-estado">{cita.estado}</p>
              </div>

              <div className="history-acciones">
                <button 
                  className="history-btn-delete"
                  onClick={() => setModalCita(cita)}>Ver</button
                >
                <button
                  className="history-btn-delete"
                  onClick={() => setDeleteCita(cita)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL VER */}
      {modalCita && (
        <div className="history-overlay" onClick={() => setModalCita(null)}>
          <div className="history-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Detalles de la Cita</h3>

            <p><strong>Cliente:</strong> {modalCita.cliente}</p>
            <p><strong>Profesional:</strong> {modalCita.profesional}</p>
            <p><strong>Servicio:</strong> {modalCita.servicio}</p>
            <p><strong>Fecha:</strong> {modalCita.fecha}</p>
            <p><strong>Hora:</strong> {modalCita.hora}</p>
            <p><strong>Estado:</strong> {modalCita.estado}</p>

            <button onClick={() => setModalCita(null)}>Cerrar</button>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {deleteCita && (
        <div className="history-overlay" onClick={() => setDeleteCita(null)}>
          <div className="history-modal" onClick={(e) => e.stopPropagation()}>
            <h3>¿Eliminar cita?</h3>

            <p>
              Cliente: <strong>{deleteCita.cliente}</strong>
            </p>
            <p>
              Servicio: <strong>{deleteCita.servicio}</strong>
            </p>

            <button onClick={() => setDeleteCita(null)}>Cancelar</button>
            <button onClick={confirmarEliminar}>Eliminar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistorialCitas;
