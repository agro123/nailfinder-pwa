import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./css/Login.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState(""); // "success" | "error"

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username.trim()) {
      setType("error");
      setMessage("Por favor, ingresa tu correo electrónico");
      return;
    }

    if (!password.trim()) {
      setType("error");
      setMessage("Por favor, ingresa tu contraseña");
      return;
    }

    try {
      // Petición al backend
      const response = await fetch("http://localhost:3000/api/public/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        const backendMsg = result.message?.toLowerCase() || "";
        if (
          backendMsg.includes("usuario no encontrado") ||
          backendMsg.includes("no existe")
        ) {
          setType("error");
          setMessage("El usuario ingresado no existe ❌");
        } else {
          setType("error");
          setMessage(result.message || "Credenciales incorrectas ❌");
        }
        return;
      }
      const { token, user } = result.data || {};
      const isCompany = user?.isCompany || false;
      console.log(isCompany);

      if (token && user) {
        // Guarda en contexto global
        login({ token, user });

        setType("success");
        setMessage("Inicio de sesión exitoso 🎉");
        if (isCompany) {
          navigate("/settings");
        } else {
          navigate("/"); // Redirige al home
        }
      } else {
        throw new Error("Respuesta del servidor inválida");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      setType("error");
      setMessage("No se pudo conectar con el servidor ❌");
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <img
          src="/isologo.png"
          alt=" Isologo NailFinder"
          className="login-logo"
        />
        <h2>Inicia Sesión</h2>
        {type === "error" &&
          !message.toLowerCase().includes("correo") &&
          !message.toLowerCase().includes("contraseña") &&
          !message.toLowerCase().includes("credenciales") &&
          !message.toLowerCase().includes("usuario") && (
            <span className="error">{message}</span>
          )}
        <input
          type="text"
          placeholder="Correo Electrónico"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase())}
        />
        {type === "error" && message.toLowerCase().includes("correo") && (
          <span className="error">{message}</span>
        )}

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {type === "error" &&
          (message.toLowerCase().includes("contraseña") ||
            message.toLowerCase().includes("credenciales") ||
            message.toLowerCase().includes("usuario no existe") ||
            message.toLowerCase().includes("usuario ingresado")) && (
            <span className="error">{message}</span>
          )}
        <div className="forgot-password">
          <Link to="/recover">¿Olvidaste tu contraseña?</Link>
        </div>
        <button type="submit">Entrar</button>
      </form>

      <div className="login-links user-register">
        <p>
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="business-link">
            Regístrate aquí
          </Link>
        </p>
      </div>

      {/* 🔽 Registro de negocio (parte inferior de la pantalla) */}
      <div className="business-register">
        <p className="footer-text">
          ¿Tienes un negocio?{" "}
          <Link to="/registerB" className="business-link">
            Regístralo aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
