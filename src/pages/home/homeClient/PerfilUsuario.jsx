import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../../context/AuthContext'
import "./css/PerfilUsuario.css"; // opcional, para el estilo

export default function PerfilUsuario() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="perfilusuario-container">
      <h2 className="perfilusuario-title">👤 Perfil del Usuario</h2>

      <div className="perfilusuario-info">
        <p><strong>Nombre:</strong> Usuario de prueba</p>
        <p><strong>Email:</strong> usuario@ejemplo.com</p>
      </div>

      <button className="logout-btn-cliente" onClick={handleLogout}>
        🔒 Cerrar sesión
      </button>
    </div>
  );
}
