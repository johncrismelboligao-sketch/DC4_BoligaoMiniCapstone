import { useEffect, useState } from 'react'
import { ArrowLeft, CalendarDays, Check, Clock3, MapPin, Plus, Search, Users, X } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { ErrorBanner, EmptyState, LoadingState, PageHeading, Pagination, StatusBadge } from '../components/Ui'
import { useAuth } from '../context/useAuth'
import { api } from '../services/api'
import { fetchAllPages } from '../services/fetchAllPages'
import { formatTime } from '../utils/date'

const initialFilters = { search: '', status: '', team_id: '', venue_id: '', date: '' }

function localToday() {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
}

function validationMessage(errors, field) {
  return errors[field]?.[0] || ''
}

export function SessionsPage() {
  const { user } = useAuth()
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [filters, setFilters] = useState(initialFilters)
  const [appliedFilters, setAppliedFilters] = useState(initialFilters)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [selected, setSelected] = useState(null)
  const [detailFailed, setDetailFailed] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(null)
  const [formSessionId, setFormSessionId] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [refresh, setRefresh] = useState(0)
  const [options, setOptions] = useState({ teams: [], venues: [], drills: [], coaches: [] })

  const canManage = user?.role === 'admin' || user?.role === 'coach'
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    let active = true
    api.get('/sessions', { params: { ...appliedFilters, page } })
      .then(({ data }) => {
        if (!active) return
        setSessions(data.data || [])
        setMeta(data.meta || { current_page: 1, last_page: 1, total: 0 })
        setError('')
      })
      .catch(() => { if (active) setError('Training sessions could not be loaded.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [appliedFilters, page, refresh])

  useEffect(() => {
    if (!sessionId) return
    let active = true
    setDetailFailed(false)
    api.get(`/sessions/${sessionId}`)
      .then(({ data }) => { if (active) setSelected(data.data) })
      .catch(() => {
        if (!active) return
        setDetailFailed(true)
        setError('This session could not be found or is outside your team.')
      })
    return () => { active = false }
  }, [sessionId, refresh])

  useEffect(() => {
    let active = true
    Promise.all([
      fetchAllPages('/teams'),
      fetchAllPages('/venues'),
      canManage ? fetchAllPages('/drills') : Promise.resolve([]),
      isAdmin ? fetchAllPages('/users', { role: 'coach', is_active: 1 }) : Promise.resolve([]),
    ]).then(([teams, venues, drills, coaches]) => {
      if (active) setOptions({ teams, venues, drills, coaches })
    }).catch(() => {
      if (active) setError('Unable to load session options.')
    })

    return () => { active = false }
  }, [canManage, isAdmin])

  function applyFilters(event) {
    event.preventDefault()
    setLoading(true)
    setAppliedFilters({ ...filters })
    setPage(1)
  }

  function clearFilters() {
    setFilters(initialFilters)
    setLoading(true)
    setAppliedFilters(initialFilters)
    setPage(1)
  }

  function openCreate() {
    setFormSessionId(null)
    setForm({ title: '', description: '', session_date: localToday(), start_time: '09:00', end_time: '10:30', max_players: 18, coach_id: '', venue_id: '', team_id: '', drills: [] })
    setFormErrors({})
    setFormOpen(true)
  }

  function openEdit(session) {
    setFormSessionId(session.id)
    setForm({ title: session.title, description: session.description || '', session_date: session.session_date, start_time: session.start_time.slice(0, 5), end_time: session.end_time.slice(0, 5), max_players: session.max_players, coach_id: session.coach?.id || '', venue_id: session.venue?.id || '', team_id: session.team?.id || '', drills: session.drills?.map((drill) => drill.id) || [] })
    setFormErrors({})
    setFormOpen(true)
  }

  async function submitSession(event) {
    event.preventDefault()
    const errors = {}
    const title = form.title.trim()
    const maxPlayers = Number(form.max_players)

    if (!title) errors.title = ['Session title is required.']
    else if (title.length > 160) errors.title = ['Title must not exceed 160 characters.']

    if (!form.session_date) errors.session_date = ['Choose a session date.']
    else if (!formSessionId && form.session_date < localToday()) errors.session_date = ['Session date cannot be in the past.']

    if (!form.start_time) errors.start_time = ['Start time is required.']
    if (!form.end_time) errors.end_time = ['End time is required.']
    if (form.start_time && form.end_time && form.end_time <= form.start_time) errors.end_time = ['End time must be after start time.']

    if (!Number.isInteger(maxPlayers) || maxPlayers < 1 || maxPlayers > 100) {
      errors.max_players = ['Enter a whole number from 1 to 100.']
    }

    if (!form.venue_id) errors.venue_id = ['Choose a venue.']
    if (!form.team_id) errors.team_id = ['Choose a team.']
    if (isAdmin && !form.coach_id) errors.coach_id = ['Assign a coach.']
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setSaving(true)
    setFormErrors({})
    const payload = { ...form, max_players: Number(form.max_players), venue_id: Number(form.venue_id), team_id: Number(form.team_id), drills: form.drills.map(Number) }
    if (isAdmin) payload.coach_id = Number(form.coach_id)
    else delete payload.coach_id
    try {
      if (formSessionId) {
        const { data } = await api.patch(`/sessions/${formSessionId}`, payload)
        setSelected(data.data)
        setNotice('Training session updated.')
      } else {
        const { data } = await api.post('/sessions', payload)
        setSelected(data.data)
        setNotice('Training session created.')
      }
      setFormOpen(false)
      setLoading(true)
      setRefresh((value) => value + 1)
      window.setTimeout(() => setNotice(''), 3200)
    } catch (requestError) {
      setFormErrors(requestError.response?.data?.errors || { form: requestError.response?.data?.message || 'Unable to save this session.' })
    } finally {
      setSaving(false)
    }
  }

  async function deleteSession(session) {
    if (!window.confirm(`Delete “${session.title}”? This also removes its registrations.`)) return
    try {
      await api.delete(`/sessions/${session.id}`)
      setNotice('Training session deleted.')
      setSelected(null)
      navigate('/sessions', { replace: true })
      setRefresh((value) => value + 1)
      window.setTimeout(() => setNotice(''), 3200)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to delete this session.')
    }
  }

  async function registerForSession(session) {
    try {
      await api.post(`/sessions/${session.id}/register`)
      setNotice('Registration request sent to your coach.')
      setRefresh((value) => value + 1)
      window.setTimeout(() => setNotice(''), 3200)
    } catch (requestError) {
      const firstError = Object.values(requestError.response?.data?.errors || {})[0]?.[0]
      setError(firstError || requestError.response?.data?.message || 'Unable to register for this session.')
    }
  }

  async function changeSessionStatus(status) {
    try {
      const { data } = await api.patch(`/sessions/${selected.id}/status`, { status })
      setSelected(data.data)
      setNotice(`Session marked ${status}.`)
      setRefresh((value) => value + 1)
      window.setTimeout(() => setNotice(''), 3200)
    } catch (requestError) {
      const firstError = Object.values(requestError.response?.data?.errors || {})[0]?.[0]
      setError(firstError || requestError.response?.data?.message || 'Unable to change this session status.')
    }
  }

  const detail = Boolean(sessionId)
  const displayedSession = selected?.id === Number(sessionId) ? selected : null

  return <>
    <PageHeading eyebrow="Training" title={detail ? 'Session details' : 'Training sessions'} subtitle={detail ? 'Session plan, team details and registration status.' : 'Plan, find and manage your football training calendar.'} action={canManage && !detail ? <button className="primary-button" onClick={openCreate}><Plus size={16} />New session</button> : null} />
    {notice && <div className="success-banner" role="status"><Check size={15} />{notice}</div>}
    {error && <ErrorBanner onRetry={() => { setLoading(true); setRefresh((value) => value + 1) }}>{error}</ErrorBanner>}

    {detail ? <SessionDetail session={displayedSession} detailFailed={detailFailed} user={user} onBack={() => navigate('/sessions')} onEdit={() => openEdit(displayedSession)} onDelete={() => deleteSession(displayedSession)} onRegister={() => registerForSession(displayedSession)} onStatusChange={changeSessionStatus} canManage={canManage} isAdmin={isAdmin} /> : <>
      <form className="filter-bar" onSubmit={applyFilters}>
        <label className="search-field"><Search size={16} /><input aria-label="Search sessions" placeholder="Search by session title" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} /></label>
        <select aria-label="Filter by status" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}><option value="">All statuses</option><option value="scheduled">Scheduled</option><option value="ongoing">Ongoing</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select>
        <select aria-label="Filter by team" value={filters.team_id} onChange={(event) => setFilters({ ...filters, team_id: event.target.value })}><option value="">All teams</option>{options.teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}</select>
        <select aria-label="Filter by venue" value={filters.venue_id} onChange={(event) => setFilters({ ...filters, venue_id: event.target.value })}><option value="">All venues</option>{options.venues.map((venue) => <option key={venue.id} value={venue.id}>{venue.name}</option>)}</select>
        <input className="filter-date" type="date" aria-label="Filter by date" value={filters.date} onChange={(event) => setFilters({ ...filters, date: event.target.value })} />
        <button className="primary-button filter-submit" type="submit">Filter</button>
        <button className="filter-clear" type="button" onClick={clearFilters}>Clear</button>
      </form>

      <div className="list-summary"><span>{meta.total || 0} sessions</span>{(appliedFilters.search || appliedFilters.status || appliedFilters.team_id || appliedFilters.venue_id || appliedFilters.date) && <span>Filtered results</span>}</div>
      {loading ? <LoadingState label="Loading training sessions..." /> : sessions.length ? <div className="session-list">
        {sessions.map((session) => <SessionRow key={session.id} session={session} user={user} canManage={canManage} isAdmin={isAdmin} onOpen={() => navigate(`/sessions/${session.id}`)} onEdit={() => { navigate(`/sessions/${session.id}`); openEdit(session) }} onDelete={() => deleteSession(session)} onRegister={() => registerForSession(session)} />)}
      </div> : <div className="surface-panel"><EmptyState title="No sessions match" detail="Try another filter, or create the first practice in this view." /></div>}
      <Pagination currentPage={meta.current_page || page} lastPage={meta.last_page || 1} onPageChange={(nextPage) => { setPage(nextPage); setLoading(true) }} />
    </>}

    {formOpen && <SessionFormModal form={form} setForm={setForm} errors={formErrors} options={options} isAdmin={isAdmin} saving={saving} onClose={() => setFormOpen(false)} onSubmit={submitSession} isEditing={Boolean(formSessionId)} />}
  </>
}

function SessionRow({ session, user, canManage, isAdmin, onOpen, onEdit, onDelete, onRegister }) {
  return <article className="session-row">
    <button className="session-row-main" onClick={onOpen}>
      <div className="session-date-tile"><CalendarDays size={16} /><span>{new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric' }).format(new Date(`${session.session_date}T00:00:00`))}</span></div>
      <div className="session-row-copy"><div className="session-row-title"><strong>{session.title}</strong><StatusBadge status={session.status} /></div><span>{session.team?.name} <span className="row-separator">·</span> {session.venue?.name}</span><small><Clock3 size={13} />{formatTime(session.start_time)}–{formatTime(session.end_time)} <span className="row-separator">·</span> Coach {session.coach?.name || 'unassigned'}</small></div>
    </button>
    <div className="session-row-aside"><span><Users size={14} />{session.registrations_count || 0}/{session.max_players}</span>
      {user?.role === 'player' && session.status === 'scheduled' && <button className="secondary-button compact-button" onClick={onRegister}>Request a spot</button>}
      {canManage && <div className="row-actions"><button className="text-button" onClick={onEdit}>Edit</button>{isAdmin && <button className="text-button destructive-text" onClick={onDelete}>Delete</button>}</div>}
    </div>
  </article>
}

function SessionDetail({ session, detailFailed, user, onBack, onEdit, onDelete, onRegister, onStatusChange, canManage, isAdmin }) {
  if (!session) {
    return detailFailed
      ? <EmptyState title="Session unavailable" detail="The session may have been deleted, or you may not have permission to view it." />
      : <LoadingState label="Loading session details..." />
  }
  return <section className="session-detail surface-panel">
    <button className="back-link" onClick={onBack}><ArrowLeft size={15} />Back to sessions</button>
    <div className="detail-heading"><div><div className="eyebrow">{session.team?.name} · {session.session_date}</div><h2>{session.title}</h2><p>{session.description || 'Training session details and planned drills.'}</p></div><StatusBadge status={session.status} /></div>
    <div className="detail-facts"><div><MapPin size={16} /><span><strong>{session.venue?.name}</strong><small>{session.venue?.address}</small></span></div><div><CalendarDays size={16} /><span><strong>{session.session_date}</strong><small>{formatTime(session.start_time)}–{formatTime(session.end_time)}</small></span></div><div><Users size={16} /><span><strong>{session.registrations_count || 0} / {session.max_players} players</strong><small>Coach: {session.coach?.name}</small></span></div></div>
    <div className="detail-section"><div className="eyebrow">Session plan</div>{session.drills?.length ? <ol className="drill-plan">{session.drills.map((drill) => <li key={drill.id}><span className="drill-order">{drill.pivot?.sort_order || '•'}</span><span><strong>{drill.name}</strong><small>{drill.category} · {drill.pivot?.minutes || drill.default_minutes} min</small></span></li>)}</ol> : <p className="detail-empty">No drills attached to this session yet.</p>}</div>
    <div className="detail-actions"><button className="secondary-button" onClick={onBack}>Close details</button>{user?.role === 'player' && session.status === 'scheduled' && <button className="primary-button" onClick={onRegister}>Request a spot</button>}{canManage && session.status === 'scheduled' && <><button className="primary-button" onClick={() => onStatusChange('ongoing')}>Start session</button><button className="danger-button" onClick={() => onStatusChange('cancelled')}>Cancel session</button></>}{canManage && session.status === 'ongoing' && <button className="primary-button" onClick={() => onStatusChange('completed')}>Complete session</button>}{canManage && <button className="secondary-button" onClick={onEdit}>Edit session</button>}{isAdmin && <button className="danger-button" onClick={onDelete}>Delete session</button>}</div>
  </section>
}

function SessionFormModal({ form, setForm, errors, options, isAdmin, saving, onClose, onSubmit, isEditing }) {
  const fieldError = (name) => validationMessage(errors, name)
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section className="session-modal" role="dialog" aria-modal="true" aria-labelledby="session-form-title">
      <header className="modal-heading"><div><div className="eyebrow">Training planner</div><h2 id="session-form-title">{isEditing ? 'Edit session' : 'Create a session'}</h2></div><button className="icon-button" aria-label="Close" onClick={onClose}><X size={17} /></button></header>
      <form className="session-form" onSubmit={onSubmit} noValidate>
        {errors.form && <div className="form-error">{errors.form}</div>}
        <Field label="Session title" name="title" value={form.title} onChange={(value) => update('title', value)} error={fieldError('title')} placeholder="e.g. U12 Passing Patterns" />
        <div className="form-grid"><Field label="Date" name="session_date" type="date" value={form.session_date} onChange={(value) => update('session_date', value)} error={fieldError('session_date')} min={!isEditing ? localToday() : undefined} /><Field label="Maximum players" name="max_players" type="number" value={form.max_players} onChange={(value) => update('max_players', value)} error={fieldError('max_players')} min="1" max="100" /></div>
        <div className="form-grid"><Field label="Starts" name="start_time" type="time" value={form.start_time} onChange={(value) => update('start_time', value)} error={fieldError('start_time')} /><Field label="Ends" name="end_time" type="time" value={form.end_time} onChange={(value) => update('end_time', value)} error={fieldError('end_time')} /></div>
        <div className="form-grid"><SelectField label="Team" name="team_id" value={form.team_id} options={options.teams.map((team) => [team.id, team.name])} onChange={(value) => update('team_id', value)} error={fieldError('team_id')} /><SelectField label="Venue" name="venue_id" value={form.venue_id} options={options.venues.map((venue) => [venue.id, venue.name])} onChange={(value) => update('venue_id', value)} error={fieldError('venue_id')} /></div>
        {isAdmin && <SelectField label="Coach" name="coach_id" value={form.coach_id} options={options.coaches.map((coach) => [coach.id, coach.name])} onChange={(value) => update('coach_id', value)} error={fieldError('coach_id')} />}
        <div className="field"><label htmlFor="description">Session notes <span className="optional">Optional</span></label><textarea id="description" rows="2" value={form.description} onChange={(event) => update('description', event.target.value)} placeholder="What should players bring or focus on?" /></div>
        <div className="field"><label>Drill plan <span className="optional">Optional</span></label><div className="drill-picker">{options.drills.map((drill) => <label className="drill-option" key={drill.id}><input type="checkbox" checked={form.drills.includes(drill.id)} onChange={(event) => update('drills', event.target.checked ? [...form.drills, drill.id] : form.drills.filter((id) => id !== drill.id))} /><span>{drill.name}<small>{drill.category}</small></span></label>)}</div>{fieldError('drills') && <span className="field-error">{fieldError('drills')}</span>}</div>
        <footer className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button type="submit" className="primary-button" disabled={saving}>{saving ? 'Saving...' : isEditing ? 'Save changes' : 'Create session'}</button></footer>
      </form>
    </section>
  </div>
}

function Field({ label, name, value, onChange, error, ...props }) {
  return <div className="field"><label htmlFor={name}>{label}</label><input id={name} name={name} value={value} onChange={(event) => onChange(event.target.value)} {...props} />{error && <span className="field-error">{error}</span>}</div>
}

function SelectField({ label, name, value, options, onChange, error }) {
  return <div className="field"><label htmlFor={name}>{label}</label><select id={name} value={value} onChange={(event) => onChange(event.target.value)}><option value="">Choose {label.toLowerCase()}</option>{options.map(([id, title]) => <option key={id} value={id}>{title}</option>)}</select>{error && <span className="field-error">{error}</span>}</div>
}
