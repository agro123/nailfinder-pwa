import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './Footer.css'

export default function FooterNav() {
  const navigate = useNavigate()
  const location = useLocation()

  const go = (path) => navigate(path)

  return (
    <footer className="footer-nav">
      <button onClick={() => go('/citas')} className={location.pathname === '/citas' ? 'active' : ''}>📅<span>Citas</span></button>
      <button onClick={() => go('/clientes')} className={location.pathname === '/clientes' ? 'active' : ''}>👥<span>Clientes</span></button>
      <button onClick={() => go('/servicios')} className={location.pathname === '/servicios' ? 'active' : ''}>💅<span>Servicios</span></button>
      <button onClick={() => go('/')} className={location.pathname === '/' ? 'active' : ''}>⚙️<span>Ajustes</span></button>
    </footer>
  )
}
