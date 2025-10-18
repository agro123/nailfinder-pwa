import api from './api'

// Ejemplo de servicio con métodos para consumir endpoints
export const exampleService = {
  // GET /items
  async getItems(params = {}) {
    const response = await api.get('/items', { params })
    return response.data
  },

  // GET /items/:id
  async getItem(id) {
    const response = await api.get(`/items/${id}`)
    return response.data
  },

  // POST /items
  async createItem(payload) {
    const response = await api.post('/items', payload)
    return response.data
  }
}

export default exampleService
