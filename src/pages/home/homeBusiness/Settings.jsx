import React, { useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { BarChart2, Home, Users, Share2, Clock, Bell } from 'lucide-react'
import './css/Settings.css'

export default function Settings() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [notifCitas, setNotifCitas] = useState(true)
  const [notifReprogramadas, setNotifReprogramadas] = useState(true)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="settings-container">
      <header className="settings-header">
        <h2>Configuración</h2>
      </header>

      {/* Perfil */}
      <section className="profile-section">
        <div className="profile-avatar">J</div>
        <div className="profile-info">
          <h3>Juan MozTasa</h3>
          <p>Administrador de Barber shop</p>
        </div>
        <button className="edit-btn">Editar negocio ✏️</button>
      </section>

      {/* Opciones principales */}
      <section className="settings-grid">
        <div className="grid-item">
          <BarChart2 size={22} />
          <span>Reportes</span>
        </div>
        <div className="grid-item">
          <Home size={22} />
          <span>Sedes</span>
        </div>
        <div className="grid-item">
          <Users size={22} />
          <span>Equipo</span>
        </div>
        <div className="grid-item">
          <Share2 size={22} />
          <span>Compartir</span>
        </div>
      </section>

      {/* Historial */}
      <div className="history-btn">
        <Clock size={18} />
        <span>Historial de citas</span>
      </div>

      {/* Notificaciones */}
      <section className="notifications-section">
        <div className="notif-header">
          <h4>Notificaciones</h4>
          <Bell size={20} />
        </div>

        <div className="notif-item">
          <span>Nuevas citas</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={notifCitas}
              onChange={() => setNotifCitas(!notifCitas)}
            />
            <span className="slider" />
          </label>
        </div>

        <div className="notif-item">
          <span>Citas reprogramadas</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={notifReprogramadas}
              onChange={() => setNotifReprogramadas(!notifReprogramadas)}
            />
            <span className="slider" />
          </label>
        </div>
      </section>

      <button className="logout-btn" onClick={handleLogout}>
        Cerrar sesión
      </button>
    </div>
  )
}
