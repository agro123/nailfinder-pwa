import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { BarChart2, Home, Users, Share2, Clock, Bell } from 'lucide-react'
import './css/Settings.css'

export default function Settings() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const [authUser, setAuthUser] = useState(null)
  const [company, setCompany] = useState(null)
  const [notifCitas, setNotifCitas] = useState(true)
  const [notifReprogramadas, setNotifReprogramadas] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1️⃣ Cargar usuario
        let activeUser = user
        if (!activeUser) {
          const storedUser = localStorage.getItem('auth_user')
          if (storedUser) {
            activeUser = JSON.parse(storedUser)
          }
        }
        setAuthUser(activeUser)

        if (!activeUser) {
          console.warn('⚠️ No se encontró usuario autenticado.')
          setLoading(false)
          return
        }

        // 2️⃣ Obtener negocios desde el backend
        const resp = await fetch('http://localhost:3000/api/public/getCompanys', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })

        const data = await resp.json()
        if (!data?.data?.negocios) {
          console.warn('⚠️ No se recibieron negocios del backend.')
          setLoading(false)
          return
        }

        // 3️⃣ Buscar el negocio del usuario autenticado
        const foundCompany = data.data.negocios.find(
          (c) => c.user_id === activeUser.id
        )
        if (foundCompany) {
          setCompany(foundCompany)
          console.log('✅ Empresa encontrada:', foundCompany)
        } else {
          console.warn('⚠️ No se encontró empresa asociada a este usuario.')
        }
      } catch (error) {
        console.error('❌ Error obteniendo la empresa:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (loading) {
    return <div className="settings-container">Cargando configuración...</div>
  }

  return (
    <div className="settings-container">
      <header className="settings-header">
        <h2>Configuración</h2>
      </header>

      {/* Perfil */}
      <section className="profile-section">
        {/* Foto de perfil o logo */}
        <div className="profile-avatar">
          {company?.logo_uri ? (
            <img
              src={company.logo_uri}
              alt="Logo de la empresa"
              className="profile-logo"
            />
          ) : (
            <span>{authUser?.name?.charAt(0).toUpperCase() || 'U'}</span>
          )}
        </div>

        {/* Info del usuario */}
        <div className="profile-info">
          <h3>
            {authUser?.name} {authUser?.lastname || ''}
          </h3>
          {authUser?.isCompany ? (
            <p>Administrador de empresa</p>
          ) : (
            <p>Usuario registrado</p>
          )}
          <p className="profile-email">{authUser?.email}</p>
          {authUser?.phone && <p>📞 {authUser.phone}</p>}

        </div>

        <button className="edit-btn" onClick={() => navigate('/edit-profile')}>
          Editar negocio ✏️
        </button>
      </section>

      {/* Opciones principales */}
      <section className="settings-grid">
        <div
          className="grid-item"
          onClick={() => navigate('/gallery')}
          style={{ cursor: 'pointer' }}
        >
          <BarChart2 size={22} />
          <span>Galería</span>
        </div>

        <div className="grid-item">
          <Home size={22} />
          <span>Sedes</span>
        </div>

        <div 
          className="grid-item"
          onClick={() => navigate('/profesionales')}
          style={{ cursor: 'pointer' }}
        >
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
