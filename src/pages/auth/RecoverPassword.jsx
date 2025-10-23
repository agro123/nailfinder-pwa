// src/pages/auth/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { findUserByEmail } from "../../services/localDB";
import "./css/RecoverPassword.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(""); // 👈 para mostrar el mensaje
  const [type, setType] = useState(""); // success | error

  const handleRecover = (e) => {
    e.preventDefault();

    if (!email) {
        setMessage("Por favor ingrese un correo electrónico válido.");
        setType("error");
        return;
    }

    const user = findUserByEmail(email);

    if (!user) {
        setMessage("No se encontró ninguna cuenta con ese correo.");
        setType("error");
    } else {
        // Aquí podrías simular el envío de correo
        setMessage("Se ha enviado un correo con instrucciones para restablecer la contraseña.");
        setType("success");

        // Simular "envío" con timeout
        setTimeout(() => {
        console.log(`Correo de recuperación enviado a: ${email}`);
        }, 1000);
    }
  };

  const cancelar = () => {
    navigate("/login");
  };

  return (
    <div className="recover-container">
      {/* Notificación flotante */}
      {message && (
        <div className={`notification ${type === "error" ? "error" : ""}`}>
          {message}
        </div>
      )}

      <form className="recover-form" onSubmit={handleRecover}>
        <h2>Recuperar contraseña</h2>
        <p>Podemos ayudarte a restablecer tu contraseña y la información de seguridad.</p>
        <input
          type="email"
          placeholder="Ingrese su correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit">Enviar</button>
        <button onClick={cancelar}>Volver</button>
      </form>
    </div>
  );
}
