import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./css/Profesionales.css";

export default function Profesionales() {
  const navigate = useNavigate();

  // Estados
  const [view, setView] = useState("list");
  const [editing, setEditing] = useState(null);
  const [showSheet, setShowSheet] = useState(false);
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para servicios y categorías
  const [servicios, setServicios] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [companyId, setCompanyId] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);

  const [newProfessional, setNewProfessional] = useState({
    company_id: "",
    name: "",
    email: "",
    phone: "",
    dialingcode: "57",
    services: [],
    sede_id: 5,
    imgProfile: null,
  });

  // 🔹 Cargar empresa y servicios del usuario
  useEffect(() => {
    const fetchData = async () => {
      try {
        const authUser = JSON.parse(localStorage.getItem("auth_user"));
        const userId = authUser?.id;

        // Obtener los negocios del usuario
        const negociosResp = await fetch("http://localhost:3000/api/public/getCompanys");
        const negociosData = await negociosResp.json();
        const company = negociosData?.data?.negocios?.find((c) => c.user_id === userId);
        const companyIdFound = company?.company_id || company?.id;
        setCompanyId(companyIdFound);

        // Obtener servicios de la empresa
        const serviciosResp = await fetch(
          `http://localhost:3000/api/public/verServicios?idCompany=${companyIdFound}`
        );
        const serviciosData = await serviciosResp.json();
        if (serviciosData.success && serviciosData.data?.servicios) {
          setServicios(serviciosData.data.servicios);
          const cats = [...new Set(serviciosData.data.servicios.map((s) => s.category_name || "Sin categoría"))];
          setCategorias(["Todas", ...cats]);
        } else {
          setError(serviciosData.message || "Error al obtener servicios");
        }
      } catch (err) {
        console.error("Error al conectar con el backend:", err);
        setError("Error de conexión con el servidor");
      } finally {
        setCargando(false);
      }
    };

    fetchData();
  }, []);

  // 🔹 Cargar profesionales desde API
  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        if (!companyId) return;
        const res = await fetch(
          `http://localhost:3000/api/public/listProfessionals?id_company=${companyId}`
        );
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json();
        const profs = Array.isArray(data.data?.profesionales) ? data.data.profesionales : [];
        const profsWithId = profs.map((p, idx) => ({
          id: idx,
          company_id: companyId,
          name: p.user_name || "Sin nombre",
          specialty: p.branch_description || "Sin especialidad",
          phone: p.user_phone || "",
          email: p.user_email || "",
          photo: p.user_img || "/default-avatar.png",
          services: p.services || [],
          branch_address: p.branch_address || "",
        }));
        setProfessionals(profsWithId);
      } catch (err) {
        console.error("Error al cargar profesionales:", err);
        setProfessionals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProfessionals();
  }, [companyId]);

  // 🔹 Guardar nuevo profesional en backend
  const handleSubmit = async () => {
    if (!newProfessional.name || !newProfessional.email) {
      alert("Completa todos los campos obligatorios");
      return;
    }

    try {
      const body = {
        ...newProfessional,
        company_id: companyId, // ✅ nombre exacto que espera el backend
      };

      const res = await fetch("http://localhost:3000/api/private/signup-professional", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Error HTTP:", res.status, text);
        alert("Error al crear profesional");
        return;
      }

      const data = await res.json();
      if (data.success) {
        alert("Profesional creado correctamente");
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
        // Recargar lista de profesionales
        const reload = await fetch(
          `http://localhost:3000/api/public/listProfessionals?id_company=${companyId}`
        );
        const reloadData = await reload.json();
        const profs = Array.isArray(reloadData.data?.profesionales) ? reloadData.data.profesionales : [];
        setProfessionals(profs.map((p, idx) => ({
          id: idx,
          name: p.user_name || "Sin nombre",
          specialty: p.branch_description || "Sin especialidad",
          phone: p.user_phone || "",
          email: p.user_email || "",
          photo: p.user_img || "/default-avatar.png",
          services: p.services || [],
          branch_address: p.branch_address || "",
        })));
      } else {
        alert(data.message || "Error al crear profesional");
      }
    } catch (err) {
      console.error("Error de red:", err);
      alert("Error de red al crear profesional");
    }
  };

  // 🔹 Subir foto
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

  if (loading || cargando) return <p>Cargando...</p>;

  return (
    <div className="prof-container">
      {/* Lista de profesionales */}
      {view === "list" && (
        <>
          <h2>Equipo</h2>
          <div className="prof-list">
            {professionals.map((p) => (
              <div
                key={p.id}
                className="prof-card"
                onClick={() => {
                  setEditing(p.id);
                  setNewProfessional(p);
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
            Añadir profesional <Plus size={18} style={{ marginLeft: 6 }} />
          </button>
          <button className="add-btn" onClick={() => navigate("/settings")}>
            Volver
          </button>
        </>
      )}

      {/* Formulario */}
      {view === "form" && (
        <div className="prof-form">
          <button onClick={() => setView("list")}><ChevronLeft /> Volver</button>
          <h2>{editing !== null ? "Editar profesional" : "Añadir colaborador"}</h2>

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

          <select
            multiple
            value={newProfessional.services}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, (opt) => parseInt(opt.value));
              setNewProfessional({ ...newProfessional, services: selected });
            }}
          >
            {servicios.map((s) => (
              <option key={s.service_id} value={s.service_id}>
                {s.title}
              </option>
            ))}
          </select>

          <input type="file" accept="image/*" onChange={handlePhoto} />
          {newProfessional.imgProfile && (
            <img
              src={`data:${newProfessional.imgProfile.type};base64,${newProfessional.imgProfile.data}`}
              alt="preview"
              className="prof-preview"
            />
          )}

          <button onClick={handleSubmit}>
            {editing !== null ? "Actualizar" : "Registrar"}
          </button>
        </div>
      )}

      {/* Bottom Sheet */}
      {showSheet && (
        <>
          <div className="overlay" onClick={() => setShowSheet(false)}></div>
          <div className="bottom-sheet">
            <button className="edit" onClick={() => setView("form")}>
              <Edit2 size={16} /> Editar colaborador
            </button>
            <button
              className="delete"
              onClick={() => {
                if (window.confirm("¿Eliminar este profesional?")) {
                  setProfessionals(professionals.filter(p => p.id !== editing));
                  setShowSheet(false);
                  setEditing(null);
                }
              }}
            >
              <Trash2 size={16} /> Eliminar colaborador
            </button>
          </div>
        </>
      )}
    </div>
  );
}
