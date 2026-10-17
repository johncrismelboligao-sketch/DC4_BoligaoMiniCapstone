import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { SoccerBallLogo } from '../components/SoccerBallLogo'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(form)
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true })
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not connect. Check that the KickOff API is running.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-screen">
      <aside className="auth-aside">
        <div className="brand-lockup"><div className="brand-mark"><SoccerBallLogo /></div><div><span className="brand-name">KICKOFF</span><span className="brand-caption">Training operations</span></div></div>
        <div className="auth-pitch"><div className="eyebrow">The next session starts here</div><h2>Better days<br />start <span>on the pitch.</span></h2><p>One home for training plans, player registrations and every small step that builds a stronger team.</p></div>
        <div className="auth-meta">MANILA · COMMUNITY FOOTBALL</div>
      </aside>
      <main className="auth-main"><section className="auth-panel">
        <div className="eyebrow">Welcome back</div><h1>Sign in to KickOff</h1><p>Pick up where your team left off.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="form-error" role="alert">{error}</div>}
          <div className="field"><label htmlFor="email">Email address</label><input id="email" type="email" autoComplete="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="Enter your email address" /></div>
          <div className="field"><label htmlFor="password">Password</label><input id="password" type="password" autoComplete="current-password" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Enter your password" /></div>
          <button className="primary-button auth-submit" disabled={busy}>{busy ? 'Signing in...' : 'Sign in'}<ArrowRight size={16} /></button>
        </form>
        <div className="auth-switch">New to the club? <Link to="/register">Create a player account</Link></div>
          <div className="demo-note"><strong>Demo access</strong><br />Admin: admin@gmail.com<br />Password: password</div>
      </section></main>
    </div>
  )
}
