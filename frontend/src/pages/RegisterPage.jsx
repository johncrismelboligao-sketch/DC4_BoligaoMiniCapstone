import { useState } from 'react'
import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clearDraft, draftStorageKey, readDraft, writeDraft } from '../services/drafts'
import { useAuth } from '../context/useAuth'
import { SoccerBallLogo } from '../components/SoccerBallLogo'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [draftLoaded, setDraftLoaded] = useState(false)
  const registrationDraftKey = draftStorageKey('registration', 'guest')

  useEffect(() => {
    const saved = readDraft(registrationDraftKey)
    if (saved) setForm((current) => ({ ...current, name: saved.name || '', email: saved.email || '' }))
    setDraftLoaded(true)
  }, [])

  useEffect(() => {
    if (!draftLoaded) return
    writeDraft(registrationDraftKey, { name: form.name, email: form.email })
  }, [draftLoaded, form.name, form.email])

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
      clearDraft(registrationDraftKey)
      navigate('/dashboard', { replace: true })
    } catch (requestError) {
      setErrors(requestError.response?.data?.errors || { form: requestError.response?.data?.message || 'Could not connect to the API.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="login-screen register-screen">
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
            <Link className="login-tab" to="/login">Sign in</Link>
            <span className="login-tab is-active" aria-current="page">Create account</span>
          </nav>
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {errors.form && <div className="form-error" role="alert">{errors.form}</div>}
            <FormField label="Full name" name="name" value={form.name} error={errors.name?.[0] || errors.name} onChange={(value) => setForm({ ...form, name: value })} autoComplete="name" />
            <FormField label="Email address" name="email" type="email" value={form.email} error={errors.email?.[0] || errors.email} onChange={(value) => setForm({ ...form, email: value })} autoComplete="email" />
            <FormField label="Password" name="password" type="password" value={form.password} error={errors.password?.[0] || errors.password} onChange={(value) => setForm({ ...form, password: value })} autoComplete="new-password" />
            <FormField label="Confirm password" name="password_confirmation" type="password" value={form.password_confirmation} error={errors.password_confirmation?.[0] || errors.password_confirmation} onChange={(value) => setForm({ ...form, password_confirmation: value })} autoComplete="new-password" />
            <button className="primary-button auth-submit" disabled={busy}>{busy ? 'Creating account...' : 'Create account'}</button>
          </form>
          <div className="login-demo register-prompt"><span>Already have an account?</span><Link className="demo-fill" to="/login">Sign in</Link></div>
        </div>
        <div className="login-meta">Manila · Community football</div>
      </section>
    </main>
  )
}

function FormField({ label, name, value, error, onChange, type = 'text', autoComplete }) {
  return <div className="field"><label htmlFor={name}>{label}</label><input id={name} name={name} type={type} autoComplete={autoComplete} required value={value} onChange={(event) => onChange(event.target.value)} />{error && <span className="field-error">{error}</span>}</div>
}
