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
        setType("error");
        setMessage(result.message || "Credenciales incorrectas ❌");
        setTimeout(() => setMessage(""), 2000);
        return;
      }

      // ✅ Login correcto
      const { token, user } = result.data || {};

      if (token && user) {
        // Guarda en contexto global
        login({ token, user });

        setType("success");
        setMessage("Inicio de sesión exitoso 🎉");
        setTimeout(() => {
          setMessage("");
          navigate("/"); // Redirige al home
        }, 1500);
      } else {
        throw new Error("Respuesta del servidor inválida");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      setType("error");
      setMessage("No se pudo conectar con el servidor ❌");
      setTimeout(() => setMessage(""), 2500);
    }
  };

  return (
    <div className="login-container">
      {message && (
        <div className={`notification ${type === "error" ? "error" : ""}`}>
          {message}
        </div>
      )}

      <form className="login-form" onSubmit={handleLogin}>
        <h2>Iniciar sesión</h2>
        <input
          type="text"
          placeholder="Correo o Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
        <p>
          ¿Olvidaste tu contraseña?{" "}
          <Link to="/recover">Recuperar contraseña</Link>
        </p>
      </div>
    </div>
  );
}
