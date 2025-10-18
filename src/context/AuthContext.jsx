import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

// AuthContext
const AuthContext = createContext(null)

// Keys used in localStorage
const STORAGE_KEYS = {
  token: 'auth_token',
  user: 'auth_user',
  expiresAt: 'auth_expires'
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.token)
    } catch (e) {
      return null
    }
  })

  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.user)
      return raw ? JSON.parse(raw) : null
    } catch (e) {
      return null
    }
  })

  // Optional: store expiration if provided
  useEffect(() => {
    try {
      const expires = localStorage.getItem(STORAGE_KEYS.expiresAt)
      if (expires && Date.now() > Number(expires)) {
        // token expired
        clearAuth()
      }
    } catch (e) {
      // ignore
    }
    // running once on mount
  }, [])

  const saveAuth = ({ token: newToken, user: newUser, expiresAt } = {}) => {
    try {
      if (newToken) {
        localStorage.setItem(STORAGE_KEYS.token, newToken)
        setToken(newToken)
      }

      if (newUser !== undefined) {
        if (newUser === null) {
          localStorage.removeItem(STORAGE_KEYS.user)
          setUser(null)
        } else {
          localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(newUser))
          setUser(newUser)
        }
      }

      if (expiresAt) {
        localStorage.setItem(STORAGE_KEYS.expiresAt, String(expiresAt))
      } else {
        localStorage.removeItem(STORAGE_KEYS.expiresAt)
      }
    } catch (e) {
      // localStorage might be unavailable in some environments
      console.warn('AuthProvider: could not save to localStorage', e)
    }
  }

  const clearAuth = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.token)
      localStorage.removeItem(STORAGE_KEYS.user)
      localStorage.removeItem(STORAGE_KEYS.expiresAt)
    } catch (e) {
      // ignore
    }
    setToken(null)
    setUser(null)
  }

  // Convenience methods
  const login = ({ token: newToken, user: newUser, expiresIn } = {}) => {
    const expiresAt = expiresIn ? Date.now() + expiresIn * 1000 : undefined
    saveAuth({ token: newToken, user: newUser, expiresAt })
  }

  const logout = () => clearAuth()

  const value = useMemo(
    () => ({ token, user, login, logout, isAuthenticated: Boolean(token) }),
    [token, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
