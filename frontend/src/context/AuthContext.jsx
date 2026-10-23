import { useEffect, useState } from 'react'
import { AuthContext } from './auth-context'
import { api, getToken, storeToken } from '../services/api'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(() => Boolean(getToken()))

  useEffect(() => {
    let active = true
    const token = getToken()

    if (!token) {
      return () => { active = false }
    }

    api.get('/user')
      .then(({ data }) => { if (active) setUser(data.data) })
      .catch(() => { storeToken(null) })
      .finally(() => { if (active) setLoading(false) })

    const clearExpiredSession = () => {
      if (active) {
        setUser(null)
        window.location.assign('/login')
      }
    }
    window.addEventListener('kickoff:unauthorized', clearExpiredSession)

    return () => {
      active = false
      window.removeEventListener('kickoff:unauthorized', clearExpiredSession)
    }
  }, [])

  async function login(credentials) {
    const { data } = await api.post('/login', credentials)
    storeToken(data.token)
    setUser(data.user)
    return data.user
  }

  async function register(details) {
    const { data } = await api.post('/register', details)
    if (data.token) {
      storeToken(data.token)
      setUser(data.user)
    }
    return data
  }

  async function logout() {
    try {
      if (getToken()) await api.post('/logout')
    } finally {
      storeToken(null)
      setUser(null)
    }
  }

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
}
