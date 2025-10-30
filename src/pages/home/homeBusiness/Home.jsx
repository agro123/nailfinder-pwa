import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks'
import { increment, decrement, incrementByAmount } from '../../../redux/slices/counterSlice'
import { useAuth } from '../../../context/AuthContext'  // 👈 usamos el contexto de autenticación
import './css/Home.css'

export default function Home() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const count = useAppSelector((state) => state.counter.value)
  const { logout, token } = useAuth() // 👈 obtenemos logout del contexto

  const goToOther = () => {
    navigate('/other')
  }

  const handleLogout = () => {
    logout()
    navigate('/') // redirige al login o home público
  }

  return (
    <div className="home-container">
      {/* --- Botón de cerrar sesión --- */}
      <header className="home-header">
        <span className="user-token">{token ? 'Sesión activa' : 'Sin sesión'}</span>
        <button className="logout-btn" onClick={handleLogout}>Cerrar sesión</button>
      </header>

      {/* --- Contenido principal --- */}
      <main className="main-content">
        <h2 className="title">Home</h2>
        <p className="description">
          Bienvenido al panel principal. Puedes navegar con Links o programáticamente.
        </p>

        <div className="links">
          <Link to="/other" className="link">Ir a Other con Link</Link>
        </div>

        <button className="btn purple" onClick={goToOther}>Ir a Other (programático)</button>
      </main>
    </div>
  )
}
