// src/pages/auth/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { findUserByEmail } from "../../services/localDB";
import "./Login.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(""); // 👈 para mostrar el mensaje
  const [type, setType] = useState(""); // success | error

  const handleLogin = (e) => {
    e.preventDefault();
    const user = findUserByEmail(email);

    if (user && user.password === password) {
      login({ token: "fake-token", user });
      setType("success");
      setMessage("Inicio de sesión exitoso 🎉");
      setTimeout(() => {
        setMessage("");
        navigate("/"); // Redirige al home
      }, 1500);
    } else {
      setType("error");
      setMessage("Correo o contraseña incorrectos ❌");
      setTimeout(() => setMessage(""), 2000);
    }
  };

  return (
    <div className="login-container">
      {/* Notificación flotante */}
      {message && (
        <div className={`notification ${type === "error" ? "error" : ""}`}>
          {message}
        </div>
      )}

      <form className="login-form" onSubmit={handleLogin}>
        <h2>Iniciar sesión</h2>
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Entrar</button>
      </form>

      <div className="login-links">
        <p>
          ¿No tienes cuenta?{" "}
          <Link to="/register">Regístrate aquí</Link>
        </p>
        <p>
          ¿Tienes un negocio?{" "}
          <Link to="/registerB">Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
}
