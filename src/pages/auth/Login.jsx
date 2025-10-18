import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const handleLogin = async (ev) => {
    ev.preventDefault()
    setLoading(true)

    // Simulación de llamada a API de autenticación
    setTimeout(() => {
      const fakeToken = 'token-de-ejemplo'
      const fakeUser = { name: 'Demo User', email: 'demo@example.com' }
      login({ token: fakeToken, user: fakeUser, expiresIn: 3600 })
      setLoading(false)
      navigate(from, { replace: true })
    }, 700)
  }

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>
            Email
            <input type="email" name="email" required />
          </label>
        </div>
        <div>
          <label>
            Password
            <input type="password" name="password" required />
          </label>
        </div>
        <button type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
      </form>
    </div>
  )
}
