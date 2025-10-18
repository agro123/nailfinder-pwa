export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const API = {
  public: API_URL + '/public',
  private: API_URL + '/private'
}