import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "./css/PerfilUsuario.css";

export default function PerfilUsuario() {
  const { user, logout } = useAuth(); 
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="perfilusuario-container">
      <h2 className="perfilusuario-title">👤 Perfil del Usuario</h2>

      <div className="perfilusuario-info">
        <p>
          <strong>Nombre:</strong> {user?.name || "No disponible"}
        </p>
        <p>
          <strong>Email:</strong> {user?.email || "No disponible"}
        </p>
      </div>

      <button className="logout-btn-cliente" onClick={handleLogout}>
        🔒 Cerrar sesión
      </button>
    </div>
  );
}
