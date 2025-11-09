import React, { useState } from "react";
import { Plus, Edit2, Trash2, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./css/Profesionales.css";

export default function Profesionales() {
  const navigate = useNavigate();
  const [view, setView] = useState("list"); // "list" | "form"
  const [editing, setEditing] = useState(null);
  const [showSheet, setShowSheet] = useState(false);

  const [professionals, setProfessionals] = useState([
    {
      id: 1,
      name: "Juan Moreno",
      specialty: "Corte masculino",
      photo: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      id: 2,
      name: "Nicole Ramírez",
      specialty: "Coloración y peinados",
      photo: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      id: 3,
      name: "Bryan Soto",
      specialty: "Barbería y cuidado facial",
      photo: "https://randomuser.me/api/portraits/men/68.jpg",
    },
  ]);

  const [newProfessional, setNewProfessional] = useState({
    id: null,
    name: "",
    specialty: "",
    photo: "",
  });

  // 🔹 Abrir formulario de creación
  const handleAddClick = () => {
    setNewProfessional({ id: null, name: "", specialty: "", photo: "" });
    setView("form");
  };

  // 🔹 Guardar o actualizar
  const handleSubmit = () => {
    if (!newProfessional.name.trim() || !newProfessional.specialty.trim()) {
      alert("Completa todos los campos");
      return;
    }

    if (editing) {
      setProfessionals((prev) =>
        prev.map((p) => (p.id === editing ? newProfessional : p))
      );
      setEditing(null);
    } else {
      setProfessionals((prev) => [
        { ...newProfessional, id: Date.now() },
        ...prev,
      ]);
    }

    setNewProfessional({ id: null, name: "", specialty: "", photo: "" });
    setView("list");
  };

  // 🔹 Subir foto
  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      setNewProfessional({ ...newProfessional, photo: reader.result });
    reader.readAsDataURL(file);
  };

  // 🔹 Editar desde el sheet
  const handleEdit = () => {
    setView("form");
    setShowSheet(false);
  };

  // 🔹 Eliminar desde el sheet
  const handleDelete = () => {
    if (window.confirm("¿Eliminar este profesional?")) {
      setProfessionals((prev) => prev.filter((p) => p.id !== editing));
      setShowSheet(false);
      setEditing(null);
    }
  };

  return (
    <div className="prof-container">
      {/* === Vista: Lista de profesionales === */}
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

          <button className="add-btn" onClick={handleAddClick}>
            Añadir profesional <Plus size={18} style={{ marginLeft: 6 }} />
          </button>
          <button className="add-btn" onClick={() => navigate('/settings')}>
            Volver
          </button>
        </>
      )}

      {/* === Vista: Formulario === */}
      {view === "form" && (
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "12px",
              gap: "8px",
            }}
          >
            <button
              onClick={() => {
                setView("list");
                setEditing(null);
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                color: "#333",
              }}
            >
              <ChevronLeft size={20} /> Volver
            </button>
          </div>

          <h2>{editing ? "Editar profesional" : "Añadir colaborador"}</h2>

          <div className="prof-form">
            <input
              type="text"
              placeholder="Nombre"
              value={newProfessional.name}
              onChange={(e) =>
                setNewProfessional({
                  ...newProfessional,
                  name: e.target.value,
                })
              }
            />
            <input
              type="text"
              placeholder="Especialidad"
              value={newProfessional.specialty}
              onChange={(e) =>
                setNewProfessional({
                  ...newProfessional,
                  specialty: e.target.value,
                })
              }
            />

            <input type="file" accept="image/*" onChange={handlePhoto} />
            {newProfessional.photo && (
              <img
                src={newProfessional.photo}
                alt="preview"
                className="prof-preview"
              />
            )}

            <button onClick={handleSubmit}>
              {editing ? "Actualizar" : "Registrar"}
            </button>
          </div>
        </div>
      )}

      {/* === Bottom Sheet === */}
      {showSheet && (
        <>
          <div className="overlay" onClick={() => setShowSheet(false)}></div>
          <div className="bottom-sheet">
            <button className="edit" onClick={handleEdit}>
              <Edit2 size={16} style={{ marginRight: 6 }} /> Editar colaborador
            </button>
            <button className="delete" onClick={handleDelete}>
              <Trash2 size={16} style={{ marginRight: 6 }} /> Eliminar colaborador
            </button>
          </div>
        </>
      )}
    </div>
  );
}
