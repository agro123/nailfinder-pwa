import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { registerSW } from './registerServiceWorker'

const root = createRoot(document.getElementById('root'))
root.render(<App />)

// Register service worker for PWA
registerSW()
