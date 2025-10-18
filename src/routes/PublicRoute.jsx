import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function PublicRoute({ redirectTo = '/' }) {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to={redirectTo} replace />
  return <Outlet />
}
