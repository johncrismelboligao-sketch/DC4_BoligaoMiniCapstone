import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
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
  const [showPassword, setShowPassword] = useState(false)

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
    <main className="login-screen">
      <div className="pitch-lines" aria-hidden="true">
        <span className="pitch-box pitch-box-left" />
        <span className="pitch-box pitch-box-right" />
        <span className="pitch-spot pitch-spot-left" />
        <span className="pitch-spot pitch-spot-right" />
      </div>
      <section className="login-content">
        <div className="login-brand"><div className="brand-mark"><SoccerBallLogo /></div><div><span className="brand-name">KICKOFF</span><span className="brand-caption">Training operations</span></div></div>
        <h1 className="login-headline"><span className="headline-line">Better days</span><span className="headline-line">start</span><span className="headline-ribbon">On the pitch.</span></h1>
        <div className="login-stats" aria-label="Club statistics">
          <div><strong>24</strong><span>Sessions</span></div>
          <div><strong>180</strong><span>Players</span></div>
          <div><strong>12</strong><span>Teams</span></div>
        </div>
        <div className="login-card">
          <nav className="login-tabs" aria-label="Account access">
            <span className="login-tab is-active" aria-current="page">Sign in</span>
            <Link className="login-tab" to="/register">Create account</Link>
          </nav>
          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="form-error" role="alert">{error}</div>}
            <div className="field"><label htmlFor="email">Email address</label><input id="email" type="email" autoComplete="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="Enter your email address" /></div>
            <div className="field"><label htmlFor="password">Password</label><div className="password-control"><input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Enter your password" /><button className="password-visibility" type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <Eye size={17} /> : <EyeOff size={17} />}</button></div></div>
            <button className="primary-button auth-submit" disabled={busy}>{busy ? 'Signing in...' : 'Sign in'}</button>
          </form>

        </div>
        <div className="login-meta">Manila · Community football</div>
      </section>
    </main>
  )
}
