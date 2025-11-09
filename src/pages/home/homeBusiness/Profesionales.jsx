import React, { useState, useEffect } from "react";
import { Trash2, Edit2, UserPlus } from "lucide-react";
import "./css/Profesionales.css";

export default function Profesionales() {
  const [professionals, setProfessionals] = useState([]);
  const [newProfessional, setNewProfessional] = useState({ name: "", specialty: "", photo: null });
  const [editing, setEditing] = useState(null);
  const [company, setCompany] = useState(null);

  const API_BASE = "http://localhost:3000/api/public";

  useEffect(() => {
    const authUser = JSON.parse(localStorage.getItem("auth_user"));
    if (!authUser) return;
    fetch(`${API_BASE}/getCompanys`)
      .then((res) => res.json())
      .then((data) => {
        const companyFound = data?.data?.negocios?.find((c) => c.user_id === authUser.id);
        if (companyFound) {
          setCompany(companyFound);
          fetch(`${API_BASE}/getProfessionals?company_id=${companyFound.company_id}`)
            .then((r) => r.json())
            .then((d) => setProfessionals(d.data || []));
        }
      });
  }, []);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => setNewProfessional({ ...newProfessional, photo: reader.result });
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!company) return alert("No hay negocio cargado.");
    const url = editing ? `${API_BASE}/editProfessional` : `${API_BASE}/addProfessional`;

    const body = editing
      ? { ...newProfessional, id: editing }
      : { ...newProfessional, company_id: company.company_id };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (data.success) {
      if (editing) {
        setProfessionals((prev) =>
          prev.map((p) => (p.id === editing ? data.data : p))
        );
      } else {
        setProfessionals([data.data, ...professionals]);
      }
      setNewProfessional({ name: "", specialty: "", photo: null });
      setEditing(null);
    } else alert("Error guardando profesional");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este profesional?")) return;
    const res = await fetch(`${API_BASE}/deleteProfessional`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (data.success) setProfessionals((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="prof-container">
      <h2>Equipo de Profesionales</h2>

      <div className="prof-form">
        <input
          type="text"
          placeholder="Nombre"
          value={newProfessional.name}
          onChange={(e) => setNewProfessional({ ...newProfessional, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Especialidad"
          value={newProfessional.specialty}
          onChange={(e) => setNewProfessional({ ...newProfessional, specialty: e.target.value })}
        />
        <input type="file" accept="image/*" onChange={handlePhoto} />
        {newProfessional.photo && <img src={newProfessional.photo} alt="preview" className="prof-preview" />}
        <button onClick={handleSubmit}>
          {editing ? "Actualizar" : "Registrar"} <UserPlus size={18} />
        </button>
      </div>

      <div className="prof-list">
        {professionals.length === 0 ? (
          <p>No hay profesionales registrados.</p>
        ) : (
          professionals.map((p) => (
            <div className="prof-card" key={p.id}>
              <img src={p.photo} alt={p.name} className="prof-img" />
              <h4>{p.name}</h4>
              <p>{p.specialty}</p>
              <div className="prof-actions">
                <button onClick={() => { setEditing(p.id); setNewProfessional(p); }}><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(p.id)}><Trash2 size={16} /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
