import axios from 'axios'

const TOKEN_KEY = 'kickoff_token'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
  headers: { Accept: 'application/json' },
})

export function storeToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    localStorage.removeItem(TOKEN_KEY)
    delete api.defaults.headers.common.Authorization
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

const savedToken = getToken()
if (savedToken) api.defaults.headers.common.Authorization = `Bearer ${savedToken}`

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.endsWith('/login')) {
      storeToken(null)
      window.dispatchEvent(new Event('kickoff:unauthorized'))
    }
    return Promise.reject(error)
  },
)