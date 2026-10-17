import { useState } from 'react'
import { Activity, ArrowRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = {}
    if (form.name.trim().length < 2) nextErrors.name = 'Enter your full name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Enter a valid email address.'
    if (form.password.length < 8) nextErrors.password = 'Use at least 8 characters.'
    if (form.password !== form.password_confirmation) nextErrors.password_confirmation = 'Passwords do not match.'
    if (Object.keys(nextErrors).length) return setErrors(nextErrors)

    setErrors({})
    setBusy(true)
    try {
      await register(form)
      navigate('/dashboard', { replace: true })
    } catch (requestError) {
      setErrors(requestError.response?.data?.errors || { form: requestError.response?.data?.message || 'Could not connect to the API.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-screen">
      <aside className="auth-aside">
        <div className="brand-lockup"><div className="brand-mark"><Activity size={21} strokeWidth={2.8} /></div><div><span className="brand-name">KICKOFF</span><span className="brand-caption">Training operations</span></div></div>
        <div className="auth-pitch"><div className="eyebrow">A place to grow</div><h2>Show up.<br /><span>Get better.</span></h2><p>Join your age group, keep track of upcoming sessions, and build your game one practice at a time.</p></div>
        <div className="auth-meta">MANILA · COMMUNITY FOOTBALL</div>
      </aside>
      <main className="auth-main"><section className="auth-panel">
        <div className="eyebrow">Player registration</div><h1>Create your account</h1><p>Your coach or club admin can assign your age group after signup.</p>
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {errors.form && <div className="form-error" role="alert">{errors.form}</div>}
          <FormField label="Full name" name="name" value={form.name} error={errors.name?.[0] || errors.name} onChange={(value) => setForm({ ...form, name: value })} autoComplete="name" />
          <FormField label="Email address" name="email" type="email" value={form.email} error={errors.email?.[0] || errors.email} onChange={(value) => setForm({ ...form, email: value })} autoComplete="email" />
          <FormField label="Password" name="password" type="password" value={form.password} error={errors.password?.[0] || errors.password} onChange={(value) => setForm({ ...form, password: value })} autoComplete="new-password" />
          <FormField label="Confirm password" name="password_confirmation" type="password" value={form.password_confirmation} error={errors.password_confirmation?.[0] || errors.password_confirmation} onChange={(value) => setForm({ ...form, password_confirmation: value })} autoComplete="new-password" />
          <button className="primary-button auth-submit" disabled={busy}>{busy ? 'Creating account...' : 'Create player account'}<ArrowRight size={16} /></button>
        </form>
        <div className="auth-switch">Already registered? <Link to="/login">Sign in</Link></div>
      </section></main>
    </div>
  )
}

function FormField({ label, name, value, error, onChange, type = 'text', autoComplete }) {
  return <div className="field"><label htmlFor={name}>{label}</label><input id={name} name={name} type={type} autoComplete={autoComplete} required value={value} onChange={(event) => onChange(event.target.value)} />{error && <span className="field-error">{error}</span>}</div>
}