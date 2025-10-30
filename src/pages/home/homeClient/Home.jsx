import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks'
import { increment, decrement, incrementByAmount } from '../../../redux/slices/counterSlice'
import './css/Home.css' // 👈 Importamos los estilos

export default function Home() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const count = useAppSelector((state) => state.counter.value)

  const goToOther = () => {
    navigate('/other')
  }

  return (
    <div className="home-container">
      {/* Contenido principal */}
      <main className="main-content">
        <h2 className="title">Home</h2>
        <p className="description">
          Esta es la página Home. Puedes navegar con Links o programáticamente.
        </p>

        <div className="links">
          <Link to="/other" className="link">Ir a Other con Link</Link>
        </div>

        <button className="btn purple" onClick={goToOther}>Ir a Other (programático)</button>
      </main>
    </div>
  )
}
