import { useEffect, useState } from 'react'
import { api } from '../services/api'

export function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    api.get('/dashboard')
      .catch(() => { if (active) setError('Dashboard data could not be loaded.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  return <div className="page-heading"><div><div className="eyebrow">Club operations</div><h1>Dashboard</h1><p className="page-subtitle">{loading ? 'Loading your training overview...' : error || 'Your team activity at a glance.'}</p></div></div>
}