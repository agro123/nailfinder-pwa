import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { registerSW } from './registerServiceWorker'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Provider } from 'react-redux'
import { store } from './redux/store'

const root = createRoot(document.getElementById('root'))
root.render(
	<Provider store={store}>
		<AuthProvider>
			<BrowserRouter>
				<App />
			</BrowserRouter>
		</AuthProvider>
	</Provider>
)

// Register service worker for PWA
registerSW()
