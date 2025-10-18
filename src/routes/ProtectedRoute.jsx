import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ redirectTo = '/login' }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (isAuthenticated) return <Outlet />

  return <Navigate to={redirectTo} replace state={{ from: location }} />
}
