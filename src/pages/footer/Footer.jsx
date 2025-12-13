import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useOffline } from '../../context/OfflineContext'
import './Footer.css'

export default function FooterNav({ tipo }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isOfflineMode } = useOffline()

  const go = (path) => navigate(path)

  // 🔹 Footer del NEGOCIO
  if (tipo === 'business') {
    // En modo offline, solo mostrar Citas
    if (isOfflineMode) {
      return (
        <footer className="footer-nav">
          <button onClick={() => go('/citas')} className={location.pathname === '/citas' ? 'active' : ''}>📅<span>Citas</span></button>
        </footer>
      )
    }
    
    // Modo normal - mostrar todos los botones
    return (
      <footer className="footer-nav">
        <button onClick={() => go('/citas')} className={location.pathname === '/citas' ? 'active' : ''}>📅<span>Citas</span></button>
        <button onClick={() => go('/clientes')} className={location.pathname === '/clientes' ? 'active' : ''}>👥<span>Clientes</span></button>
        <button onClick={() => go('/servicios')} className={location.pathname === '/servicios' ? 'active' : ''}>💅<span>Servicios</span></button>
        <button onClick={() => go('/settings')} className={location.pathname === '/settings' ? 'active' : ''}>⚙️<span>Ajustes</span></button>
      </footer>
    )
  }

  // 🔹 Footer del CLIENTE
  if (tipo === 'client') {
    return (
      <footer className="footercliente">
        <button
          className={`footercliente-btn ${location.pathname === '/' ? 'active' : ''}`}
          onClick={() => go('/')}
        >
          🏠<span>Inicio</span>
        </button>
        <button
          className={`footercliente-btn ${location.pathname === '/citasusuario' ? 'active' : ''}`}
          onClick={() => go('/citasusuario')}
        >
          📅<span>Citas</span>
        </button>
        <button
          className={`footercliente-btn ${location.pathname === '/perfilusuario' ? 'active' : ''}`}
          onClick={() => go('/perfilusuario')}
        >
          👤<span>Perfil</span>
        </button>
      </footer>
    )
  }

  return null
}
