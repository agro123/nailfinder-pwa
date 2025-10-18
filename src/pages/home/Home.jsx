import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { increment, decrement, incrementByAmount } from '../../redux/slices/counterSlice'

export default function Home() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const count = useAppSelector((state) => state.counter.value)

  const goToOther = () => {
    // Ejemplo de navegación programática
    navigate('/other')
  }

  return (
    <div>
      <h2>Home</h2>
      <p>Esta es la página Home. Puedes navegar con Links o programáticamente.</p>

      <section style={{ marginTop: 16 }}>
        <h3>Counter (Redux Toolkit example)</h3>
        <div>Valor: <strong>{count}</strong></div>
        <button onClick={() => dispatch(decrement())}>-</button>
        <button onClick={() => dispatch(increment())}>+</button>
        <button onClick={() => dispatch(incrementByAmount(5))}>+5</button>
      </section>

      <p>
        <Link to="/other">Ir a Other con Link</Link>
      </p>

      <button onClick={goToOther}>Ir a Other (programático)</button>
    </div>
  )
}
