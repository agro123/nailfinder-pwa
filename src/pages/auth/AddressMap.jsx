// src/pages/auth/AddressMap.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function AddressMap({ address }) {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Vuelve atrás
  };

  const handleConfirm = () => {
    alert("Dirección confirmada correctamente ✅");
    navigate("/login"); // 👈 Redirige al login después de confirmar
  };

  return (
    <div style={{ margin: "2rem" }}>
      <h2>Confirma tu dirección</h2>
      <p>📍 {address}</p>

      <div
        style={{
          height: "200px",
          width: "100%",
          background: "#eee",
          border: "1px solid #ccc",
          borderRadius: "10px",
          marginBottom: "1rem",
        }}
      >
        <p style={{ textAlign: "center", paddingTop: "80px" }}>
          [ Aquí iría el mapa interactivo ]
        </p>
      </div>

      <button onClick={handleBack}>Atrás</button>
      <button onClick={handleConfirm} style={{ marginLeft: "10px" }}>
        Confirmar dirección
      </button>
    </div>
  );
}

