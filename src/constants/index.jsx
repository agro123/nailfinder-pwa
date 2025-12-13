export const API_URL = import.meta.env.VITE_API_URL || 'https://nailfinder-api.onrender.com'

export const API = {
  public: API_URL + '/public',
  private: API_URL + '/private'
}