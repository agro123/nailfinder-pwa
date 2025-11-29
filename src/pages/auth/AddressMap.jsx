// src/pages/auth/AddressMap.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./css/AddressMap.css";
import { alertPrompt } from "../../utils/uiStore";

export default function AddressMap({ address, onConfirm }) {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Vuelve atrás
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(address); // pasa la dirección confirmada
    } else {
      alertPrompt({
        title: "Dirección confirmada",
        message: `📍 ${address}`,
        type: "success",
      });
    }
  };

  return (
    <div className="address-map-container">
      <div className="address-map-box">
        <h2>Confirma tu dirección</h2>
        <p>📍 {address}</p>

        <div className="map-placeholder">
          [ Aquí iría el mapa interactivo ]
        </div>

        <div className="address-map-buttons">
          <button className="back-btn" onClick={handleBack}>
            Atrás
          </button>
          <button className="confirm-btn" onClick={handleConfirm}>
            Confirmar dirección
          </button>
        </div>
      </div>
    </div>
  );
}

