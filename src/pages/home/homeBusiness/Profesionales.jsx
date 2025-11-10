import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./css/Profesionales.css";

export default function Profesionales() {
  const navigate = useNavigate();

  const [view, setView] = useState("list");
  const [editing, setEditing] = useState(null);
  const [showSheet, setShowSheet] = useState(false);
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [servicios, setServicios] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [companyId, setCompanyId] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [cargando, setCargando] = useState(true);

  const [newProfessional, setNewProfessional] = useState({
    name: "",
    email: "",
    phone: "",
    dialingcode: "57",
    services: [],
    sede_id: 5,
    imgProfile: null,
  });

  const authUser = JSON.parse(localStorage.getItem("auth_user"));
  const userId = authUser?.id;
  const company_id = authUser?.company?.company_id;

  // === CARGAR EMPRESA Y SERVICIOS ===
  useEffect(() => {
    const fetchData = async () => {
      try {
        const negociosResp = await fetch("http://localhost:3000/api/public/getCompanys");
        const negociosData = await negociosResp.json();
        const company = negociosData?.data?.negocios?.find((c) => c.user_id === userId);
        const companyIdFound = company?.company_id || company?.id;
        setCompanyId(companyIdFound);

        // Cargar servicios
        const serviciosResp = await fetch(
          `http://localhost:3000/api/public/verServicios?idCompany=${companyIdFound}`
        );
        const serviciosData = await serviciosResp.json();
        if (serviciosData.success && serviciosData.data?.servicios) {
          setServicios(serviciosData.data.servicios);
          const cats = [
            "Todas",
            ...new Set(serviciosData.data.servicios.map((s) => s.category_name || "Sin categoría")),
          ];
          setCategorias(cats);
        }
      } catch (err) {
        console.error("Error al conectar con backend:", err);
        setMensaje("Error de conexión con el servidor");
      } finally {
        setCargando(false);
      }
    };
    fetchData();
  }, []);

  // === CARGAR PROFESIONALES ===
  useEffect(() => {
    if (!companyId) return;
    fetchProfessionals();
  }, [companyId]);

  const fetchProfessionals = async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/public/listProfessionals?id_company=${companyId}`
      );
      const data = await res.json();

      const profs = Array.isArray(data.data?.profesionales) ? data.data.profesionales : [];
      setProfessionals(
        profs.map((p) => ({
          id: p.professional_id || p.id || p.user_id,
          name: p.user_name || "Sin nombre",
          email: p.user_email || "",
          phone: p.user_phone || "",
          specialty: p.branch_description || "Sin especialidad",
          photo: p.user_img || "/default-avatar.png",
        }))
      );
    } catch (err) {
      console.error("Error al cargar profesionales:", err);
      setMensaje("Error cargando profesionales");
    } finally {
      setLoading(false);
    }
  };

  // === CREAR PROFESIONAL ===
  const handleCreateProfessional = async () => {
    if (!newProfessional.name || !newProfessional.email) {
      setMensaje("Completa todos los campos obligatorios");
      return;
    }

    try {
      const body = { ...newProfessional, company_id: companyId };
      const res = await fetch("http://localhost:3000/api/private/signup-professional", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        setMensaje("✅ Profesional creado correctamente");
        setView("list");
        setEditing(null);
        setNewProfessional({
          name: "",
          email: "",
          phone: "",
          dialingcode: "57",
          services: [],
          sede_id: 5,
          imgProfile: null,
        });
        fetchProfessionals();
      } else {
        setMensaje(data.message || "Error al crear profesional");
      }
    } catch (err) {
      console.error("Error al crear profesional:", err);
      setMensaje("Error de red al crear profesional");
    }
  };

  // === ACTUALIZAR PROFESIONAL ===
  const handleUpdateProfessional = async () => {
    if (!editing?.id) {
      setMensaje("No se encontró el ID del profesional a editar");
      return;
    }

    try {
      const body = {
        userId: editing.id,
        name: newProfessional.name,
        email: newProfessional.email,
        phone: newProfessional.phone,
        dialingcode: newProfessional.dialingcode,
      };
      console.log("🟨 Enviando al backend:", JSON.stringify(body, null, 2));
      const res = await fetch("http://localhost:3000/api/private/editInformationProfessional", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      console.log("Respuesta", data)
      if (data.success) {
        setMensaje("✅ Profesional actualizado correctamente");
        setEditing(null);
        setView("list");
        fetchProfessionals();
      } else {
        setMensaje(`❌ Error: ${data.message || "No se pudo actualizar"}`);
      }
    } catch (error) {
      console.error("Error actualizando profesional:", error);
      setMensaje("Error de red al actualizar profesional");
    }
  };

  // === ELIMINAR PROFESIONAL ===
  const handleDeleteProfessional = async (id) => {
    const prof = professionals.find((p) => p.id === id);
    if (!prof) {
      setMensaje("No se encontró el profesional");
      return;
    }

    if (!window.confirm(`¿Seguro que deseas eliminar a ${prof.name}?`)) return;

    try {
      const res = await fetch("http://localhost:3000/api/private/deleteProfessional", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ professionalId: prof.id, userId }),
      });

      const data = await res.json();

      if (data.success) {
        setMensaje("✅ Profesional eliminado correctamente");
        fetchProfessionals();
        setShowSheet(false);
        setEditing(null);
      } else {
        setMensaje(`❌ Error: ${data.message || "No se pudo eliminar"}`);
      }
    } catch (err) {
      console.error("Error eliminando profesional:", err);
      setMensaje("Error de red al eliminar profesional");
    }
  };

  // === Subir imagen (solo preview) ===
  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result.split(",")[1];
      setNewProfessional({
        ...newProfessional,
        imgProfile: {
          nombre: file.name,
          type: file.type,
          size: file.size,
          data: base64Data,
        },
      });
    };
    reader.readAsDataURL(file);
  };

  // === UI ===
  if (loading || cargando) return <p>Cargando...</p>;

  return (
    <div className="prof-container">
      {mensaje && <div className="mensaje">{mensaje}</div>}

      {view === "list" && (
        <>
          <h2>Equipo</h2>
          <div className="prof-list">
            {professionals.map((p) => (
              <div
                key={p.id}
                className="prof-card"
                onClick={() => {
                  setEditing(p);
                  setNewProfessional({
                    name: p.name,
                    email: p.email,
                    phone: p.phone,
                    dialingcode: "57",
                  });
                  setShowSheet(true);
                }}
              >
                <img src={p.photo} alt={p.name} />
                <div>
                  <h4>{p.name}</h4>
                  <p>{p.specialty}</p>
                </div>
              </div>
            ))}
          </div>

          <button className="add-btn" onClick={() => setView("form")}>
            Añadir profesional <Plus size={18} />
          </button>

          <button className="add-btn" onClick={() => navigate("/settings")}>
            Volver
          </button>
        </>
      )}

      {/* === FORMULARIO === */}
      {view === "form" && (
        <div className="prof-form">
          <button onClick={() => setView("list")}>
            <ChevronLeft /> Volver
          </button>
          <h2>{editing ? "Editar profesional" : "Añadir colaborador"}</h2>

          <input
            type="text"
            placeholder="Nombre"
            value={newProfessional.name}
            onChange={(e) => setNewProfessional({ ...newProfessional, name: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email"
            value={newProfessional.email}
            onChange={(e) => setNewProfessional({ ...newProfessional, email: e.target.value })}
          />
          <input
            type="text"
            placeholder="Teléfono"
            value={newProfessional.phone}
            onChange={(e) => setNewProfessional({ ...newProfessional, phone: e.target.value })}
          />
          <input
            type="text"
            placeholder="Código país"
            value={newProfessional.dialingcode}
            onChange={(e) => setNewProfessional({ ...newProfessional, dialingcode: e.target.value })}
          />

          <input type="file" accept="image/*" onChange={handlePhoto} />
          {newProfessional.imgProfile && (
            <img
              src={`data:${newProfessional.imgProfile.type};base64,${newProfessional.imgProfile.data}`}
              alt="preview"
              className="prof-preview"
            />
          )}

          <button
            onClick={editing ? handleUpdateProfessional : handleCreateProfessional}
          >
            {editing ? "Actualizar profesional" : "Registrar"}
          </button>
        </div>
      )}

      {/* === SHEET === */}
      {showSheet && editing && (
        <>
          <div className="overlay" onClick={() => setShowSheet(false)}></div>
          <div className="bottom-sheet">
            <button
              className="edit"
              onClick={() => {
                setView("form");
                setShowSheet(false);
              }}
            >
              <Edit2 size={16} /> Editar colaborador
            </button>
            <button className="delete" onClick={() => handleDeleteProfessional(editing.id)}>
              <Trash2 size={16} /> Eliminar colaborador
            </button>
          </div>
        </>
      )}
    </div>
  );
}
