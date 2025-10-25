// src/pages/auth/ResetPassword.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./css/RecoverPassword.css";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirm) {
      setMessage("Por favor complete ambos campos.");
      setType("error");
      return;
    }

    if (password !== confirm) {
      setMessage("Las contraseñas no coinciden.");
      setType("error");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/public/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();
      console.log("Server response:", data);

      if (!token) {
        setMessage("Token de recuperación inválido o expirado.");
        setType("error");
        return;
      }

      if (data.success) {
        setMessage("Contraseña actualizada correctamente. Redirigiendo al inicio de sesión...");
        setType("success");
        setTimeout(() => navigate("/login"), 2500);
      } else {
        setMessage(data.message || "No se pudo actualizar la contraseña.");
        setType("error");
      }
    } catch (error) {
      console.error(error);
      setMessage("Error al conectar con el servidor.");
      setType("error");
    }
  };

  return (
    <div className="recover-container">
      {message && (
        <div className={`notification ${type === "error" ? "error" : "success"}`}>
          {message}
        </div>
      )}

      <form className="recover-form" onSubmit={handleSubmit}>
        <img src="/logo.png" alt="Logo NailFinder" className="recover-logo" />
        <h2>Restablecer contraseña</h2>
        <p>Ingrese su nueva contraseña.</p>

        <input
          type="password"
          placeholder="Nueva contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirmar nueva contraseña"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        <button className="enviar-recover" type="submit">
          Actualizar
        </button>
      </form>
    </div>
  );
}
