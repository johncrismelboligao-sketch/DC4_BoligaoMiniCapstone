import { useAuth } from '../context/useAuth'

export function ClubPage() {
  const { user } = useAuth()
  return <div className="page-heading"><div><div className="eyebrow">Club workspace</div><h1>{user?.role === 'admin' ? 'Club management' : 'Drill library'}</h1><p className="page-subtitle">Training resources for KickOff teams.</p></div></div>
}