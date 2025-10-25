
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

  const handleRecover = async (e) => {
    e.preventDefault();

    if (!email) {
      setMessage("Por favor ingrese un correo electrónico válido.");
      setType("error");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/public/forgotPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        setType("success");
      } else {
        setMessage(data.message || "No se pudo enviar el correo.");
        setType("error");
      }
    } catch (error) {
      console.error(error);
      setMessage("Error al conectar con el servidor.");
      setType("error");
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
        <img
            src="/logo.png"   
            alt="Logo NailFinder"
            className="register-logo"
          />
        <h2>Recuperar contraseña</h2>
        <p>Podemos ayudarte a restablecer tu contraseña y la información de seguridad.</p>
        <input
          type="email"
          placeholder="Ingrese su correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="enviar-recover" type="submit">Enviar</button>
        <button className="volver-recover" onClick={cancelar}>
          Volver
        </button>
      </form>
    </div>
  );
}
