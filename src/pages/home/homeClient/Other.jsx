import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'

export default function Other() {
  const navigate = useNavigate()
  const { token, logout } = useAuth()

  useEffect(() => {
    // Ejemplo: si cierta condición no se cumple redirigimos al home
    const authorized = false
    if (!authorized) {
      // redirección después de 1s para que se note
      const t = setTimeout(() => navigate('/'), 1000)
      return () => clearTimeout(t)
    }
  }, [navigate])

  return (
    <div>
      <h2>Other</h2>
      <p>Esta página redirige al home si la condición no se cumple (ejemplo).</p>

      <div style={{ marginTop: 12 }}>
        <strong>Token actual:</strong>
        <pre style={{ whiteSpace: 'pre-wrap', maxWidth: 600 }}>{token || '— no token —'}</pre>
        <button onClick={() => logout()}>Cerrar sesión (logout)</button>
      </div>
    </div>
  )
}
