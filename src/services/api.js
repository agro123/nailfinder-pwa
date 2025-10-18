import axios from 'axios'
import { API } from '../constants'

// Crear una instancia de axios con baseURL configurada
const api = axios.create({
  baseURL: API.public, // por defecto apunta a la API pública; en servicios privados puedes usar API.private
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  },
  timeout: 10000
})

// Interceptor para adjuntar token desde localStorage si existe
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('auth_token')
      if (token) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${token}`
        // Si quieres apuntar a la API privada cuando hay token:
        // config.baseURL = API.private
      }
    } catch (e) {
      // localStorage no disponible o error; seguir sin token
      console.warn('Could not attach token to request', e)
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Interceptor de respuesta: manejo de errores globales
api.interceptors.response.use(
  (res) => res,
  (error) => {
    // Aquí puedes manejar errores 401 (logout), 403, 500, etc.
    if (error.response) {
      // ejemplo: si token expira
      if (error.response.status === 401) {
        // opcional: limpiar auth y redirigir al login
        try {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('auth_user')
        } catch (e) {}
        // Nota: no importes navegación aquí; deja que los components manejen la redirección
      }
    }
    return Promise.reject(error)
  }
)

export default api
