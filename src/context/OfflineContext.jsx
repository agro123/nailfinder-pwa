import React, { createContext, useContext, useState, useEffect } from 'react'

const OfflineContext = createContext()

export function useOffline() {
  const context = useContext(OfflineContext)
  if (!context) {
    throw new Error('useOffline debe usarse dentro de un OfflineProvider')
  }
  return context
}

export function OfflineProvider({ children }) {
  const [isOfflineMode, setIsOfflineMode] = useState(false)

  // Guardar en localStorage para persistir el estado
  useEffect(() => {
    const savedMode = localStorage.getItem('offlineMode')
    if (savedMode === 'true') {
      setIsOfflineMode(true)
    }
  }, [])

  const toggleOfflineMode = () => {
    const newMode = !isOfflineMode
    setIsOfflineMode(newMode)
    localStorage.setItem('offlineMode', newMode.toString())
  }

  const enableOfflineMode = () => {
    setIsOfflineMode(true)
    localStorage.setItem('offlineMode', 'true')
  }

  const disableOfflineMode = () => {
    setIsOfflineMode(false)
    localStorage.setItem('offlineMode', 'false')
  }

  return (
    <OfflineContext.Provider
      value={{
        isOfflineMode,
        toggleOfflineMode,
        enableOfflineMode,
        disableOfflineMode
      }}
    >
      {children}
    </OfflineContext.Provider>
  )
}
