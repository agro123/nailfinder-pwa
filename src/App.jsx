import React, { useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import FooterNav from './pages/footer/Footer'
import { useAuth } from './context/AuthContext'
/* Business */
import HomeBusines from './pages/home/homeBusiness/Home'
import CitasBusiness from './pages/home/homeBusiness/Citas'
import ClienteBusiness from './pages/home/homeBusiness/Clientes'
import ServiciosBusiness from './pages/home/homeBusiness/Servicios'
import Other from './pages/home/homeBusiness/Other'
/* Auth */
import Login from './pages/auth/Login'
import ProtectedRoute from './routes/ProtectedRoute'
import PublicRoute from './routes/PublicRoute'
import Register from './pages/auth/Register'
import RegisterB from './pages/auth/RegisterBusiness'
import Recover from './pages/auth/RecoverPassword'
import ResetPassword from './pages/auth/ResetPassword'


export default function App() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [installed, setInstalled] = useState(false)
  const { token } = useAuth() // 👈 Obtenemos el token del contexto
  const location = useLocation() // 👈 Para saber en qué ruta estamos

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

  const hideFooterRoutes = ['/login', '/register', '/registerB', '/recover', '/reset-password']
  const shouldShowFooter = token && !hideFooterRoutes.some(r => location.pathname.startsWith(r))

  return (
    <div className="app">
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
            <Route path="/registerB" element={<RegisterB />} />
            <Route path="/recover" element={<Recover />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
          </Route>

          {/* Protected routes: require auth */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomeBusines />} />
            <Route path="/citas" element={<CitasBusiness />} />
            <Route path="/clientes" element={<ClienteBusiness />} />
            <Route path="/servicios" element={<ServiciosBusiness />} />
            <Route path="/other" element={<Other />} />
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<div>404 - Not found</div>} />
        </Routes>
      </main>
      {shouldShowFooter && <FooterNav />}
    </div>
  )
}
