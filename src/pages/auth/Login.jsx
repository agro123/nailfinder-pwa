// src/pages/auth/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { findUserByEmail } from "../../services/localDB";

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
    <div style={{ position: "relative" }}>
      {/* Notificación flotante */}
      {message && (
        <div
          style={{
            position: "absolute",
            top: "-40px",
            left: 0,
            right: 0,
            margin: "auto",
            backgroundColor: type === "success" ? "#4caf50" : "#f44336",
            color: "#fff",
            padding: "10px",
            borderRadius: "6px",
            width: "fit-content",
            textAlign: "center",
            animation: "fadeInOut 2s ease",
          }}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleLogin}>
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

      <p style={{ marginTop: "1rem" }}>
        ¿No tienes cuenta?{" "}
        <Link to="/register" style={{ textDecoration: "none", fontWeight: "bold" }}>
          Regístrate aquí
        </Link>
      </p>
      
      <p style={{ marginTop: "1rem" }}>
        ¿Tienes en negocio?{" "}
        <Link to="/registerB" style={{ textDecoration: "none", fontWeight: "bold" }}>
          Regístrate aquí
        </Link>
      </p>
    </div>
  );
}
