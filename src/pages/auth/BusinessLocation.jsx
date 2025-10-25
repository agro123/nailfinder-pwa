import React, { useState } from "react";
import "./css/BusinessLocation.css";

export default function BusinessLocation({ onNext, onBack }) {
  const [mode, setMode] = useState("local");
  const [address, setAddress] = useState("");

  const handleNext = () => {
    if (!address.trim()) {
      if (setType) setType("error");
      if (setMessage) setMessage("⚠️ Ingresa la dirección del negocio.");
      setTimeout(() => setMessage(""), 2500);
      return;
    }
    if (onNext) {
      // Enviar los datos de este paso
      onNext({
        companytype: mode === "local" ? "negocio" : "domicilio",
        address,
      });
    }
  };

  return (
    <div className="business-container">
      <h2 className="business-title">Ubicación del negocio</h2>
      <p className="business-subtitle">
        Selecciona la manera en la que sueles trabajar
      </p>

      <div className="switch-group">
        <button
          className={`switch-btn ${mode === "local" ? "active" : ""}`}
          onClick={() => setMode("local")}
        >
          En un local
        </button>
        <button
          className={`switch-btn ${mode === "domicilio" ? "active" : ""}`}
          onClick={() => setMode("domicilio")}
        >
          A domicilio
        </button>
      </div>

      <div className="input-group">
        <label className="input-label">Dirección de tu negocio</label>
        <div className="input-with-icon">
          <input
            type="text"
            placeholder="Tu negocio"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="address-input"
          />
          <span className="icon-location">📍</span>
        </div>
      </div>

      <div className="button-group-vertical">
        <button className="next-button-location" onClick={handleNext}>
          Continuar
        </button>
        <button className="back-button-location" onClick={onBack}>
          Volver
        </button>
      </div>
    </div>
  );
}
