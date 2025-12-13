import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { registerSW } from './registerServiceWorker'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { OfflineProvider } from './context/OfflineContext'
import { Provider } from 'react-redux'
import { store } from './redux/store'

const root = createRoot(document.getElementById('root'))
root.render(
	<Provider store={store}>
		<AuthProvider>
			<OfflineProvider>
				<BrowserRouter>
					<App />
				</BrowserRouter>
			</OfflineProvider>
		</AuthProvider>
	</Provider>
)

// Register service worker for PWA
registerSW()
