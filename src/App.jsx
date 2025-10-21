import React, { useEffect, useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/home/Home'
import Other from './pages/home/Other'
import Login from './pages/auth/Login'
import ProtectedRoute from './routes/ProtectedRoute'
import PublicRoute from './routes/PublicRoute'
import Register from './pages/auth/Register'

export default function App() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    function handler(e) {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setInstalled(true))
    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const onInstallClick = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    if (choice.outcome === 'accepted') setInstalled(true)
  }

  return (
    <div className="app">
      <header>
        <h1>NailFinder PWA</h1>
        <p>Tu aplicación progresiva con Vite + React</p>
        <nav>
          <Link to="/">Home</Link> | <Link to="/other">Other (ejemplo redirect)</Link>
        </nav>
      </header>

      <main>
        {deferredPrompt && !installed && (
          <button onClick={onInstallClick}>Instalar aplicación</button>
        )}

        {installed && <div className="installed">Aplicación instalada ✅</div>}

        <Routes>
          {/* Public routes (login, register...) */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Protected routes: require auth */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/other" element={<Other />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<div>404 - Not found</div>} />
        </Routes>
      </main>
    </div>
  )
}
