import React, { useEffect, useState } from 'react'

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
        <h1>Agendoo PWA</h1>
        <p>Tu aplicación progresiva con Vite + React</p>
      </header>

      <main>
        <p>Bienvenido a la plantilla PWA. Abre las herramientas de desarrollador y ve a Application &gt; Manifest para comprobar el manifest.</p>

        {deferredPrompt && !installed && (
          <button onClick={onInstallClick}>Instalar aplicación</button>
        )}

        {installed && <div className="installed">Aplicación instalada ✅</div>}
      </main>
    </div>
  )
}
