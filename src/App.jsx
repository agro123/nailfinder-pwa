import React, { useEffect, useState } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import FooterNav from './pages/footer/Footer'
import { useAuth } from './context/AuthContext'
/* Business */
import SettingsBusines from './pages/home/homeBusiness/Settings'
import CitasBusiness from './pages/home/homeBusiness/Citas'
import ClienteBusiness from './pages/home/homeBusiness/Clientes'
import ServiciosBusiness from './pages/home/homeBusiness/Servicios'
import AddService from './pages/home/homeBusiness/AddService'
import EditService from './pages/home/homeBusiness/EditService'
import AddCategoria from './pages/home/homeBusiness/AddCategoria'
/*Client*/
import Home from './pages/home/homeClient/Home'
import HomeOther from './pages/home/homeClient/Other'
import CitasUsuario from './pages/home/homeClient/CitasUsuario'
import PerfilUsuario from './pages/home/homeClient/PerfilUsuario'
/* Auth */
import Login from './pages/auth/Login'
import ProtectedRoute from './routes/ProtectedRoute'
import PublicRoute from './routes/PublicRoute'
import Register from './pages/auth/Register'
import RegisterB from './pages/auth/RegisterBusiness'
import Recover from './pages/auth/RecoverPassword'
import ResetPassword from './pages/auth/ResetPassword'
import ExampleMap from './pages/example/ExampleMap'



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

  const hideFooterRoutes = ['/login', '/register', '/registerB', '/recover', '/reset-password', '/', '/other']
  const businessRoutes = ['/settings', '/citas', '/clientes', '/servicios']
  const clientRoutes = ['/', '/citasusuario', '/perfilusuario']

  //const shouldShowFooter = token && businessRoutes.some(r => location.pathname.startsWith(r))

  const shouldShowFooterBusiness = token && businessRoutes.includes(location.pathname)
  const shouldShowFooterClient = token && clientRoutes.includes(location.pathname)


  return (
    <div className="app">
      <main>
        {deferredPrompt && !installed && (
          <button onClick={onInstallClick}>Instalar aplicación</button>
        )}

        {installed && <div className="installed">Aplicación instalada ✅</div>}

        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          {/* Public routes (login, register...) */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/registerB" element={<RegisterB />} />
            <Route path="/recover" element={<Recover />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/exampleMap" element={<ExampleMap />} />
          </Route>

          {/* Protected routes: require auth */}
          <Route element={<ProtectedRoute />}>
            {/* Business */}
            <Route path="/settings" element={<SettingsBusines />} />
            <Route path="/citas" element={<CitasBusiness />} />
            <Route path="/clientes" element={<ClienteBusiness />} />
            <Route path="/servicios" element={<ServiciosBusiness />} />
            <Route path="/add_service" element={<AddService />} />
            <Route path="/edit_service" element={<EditService />} />
            <Route path="/add_categoria" element={<AddCategoria />} />
            {/* Client */}
            <Route path="/" element={<Home />} />
            <Route path="/other" element={<HomeOther />} />
            <Route path="/perfilusuario" element={<PerfilUsuario />} />
            <Route path="/citasusuario" element={<CitasUsuario />} /> 
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<div>404 - Not found</div>} />
        </Routes>
      </main>
      {/* Footers */}
      {/* {shouldShowFooter && <FooterNav />} */}
      {shouldShowFooterBusiness && <FooterNav tipo="business" />}
      {shouldShowFooterClient && <FooterNav tipo="client" />}

    </div>
  )
}
