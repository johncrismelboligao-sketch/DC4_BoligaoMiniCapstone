import { useEffect, useState } from 'react'
import { CalendarDays, Check, CheckCheck, MapPin, Users, X } from 'lucide-react'
import { ErrorBanner, EmptyState, LoadingState, PageHeading, Pagination, StatusBadge } from '../components/Ui'
import { useAuth } from '../context/useAuth'
import { api } from '../services/api'

export function RegistrationsPage() {
  const { user } = useAuth()
  const [rows, setRows] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [refresh, setRefresh] = useState(0)

  const canReview = user?.role === 'admin' || user?.role === 'coach'

  useEffect(() => {
    let active = true
    api.get('/registrations', { params: { status, page } })
      .then(({ data }) => {
        if (!active) return
        setRows(data.data || [])
        setMeta(data.meta || { current_page: 1, last_page: 1, total: 0 })
        setError('')
      })
      .catch(() => { if (active) setError('Registrations could not be loaded.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [status, page, refresh])

  async function updateRegistration(registration, update, message) {
    try {
      await api.patch(`/registrations/${registration.id}/${update.path}`, update.body)
      setNotice(message)
      setError('')
      setRefresh((value) => value + 1)
      window.setTimeout(() => setNotice(''), 3200)
    } catch (requestError) {
      const firstError = Object.values(requestError.response?.data?.errors || {})[0]?.[0]
      setError(firstError || requestError.response?.data?.message || 'Unable to update this registration.')
    }
  }

  async function cancelRegistration(registration) {
    const title = registration.training_session?.title || 'this session'
    if (!window.confirm(`Cancel your pending request for “${title}”?`)) return
    try {
      await api.delete(`/sessions/${registration.training_session.id}/register`)
      setNotice('Registration request cancelled.')
      setRefresh((value) => value + 1)
      window.setTimeout(() => setNotice(''), 3200)
    } catch (requestError) {
      const firstError = Object.values(requestError.response?.data?.errors || {})[0]?.[0]
      setError(firstError || requestError.response?.data?.message || 'Unable to cancel this registration.')
    }
  }

  function changeFilter(nextStatus) {
    setLoading(true)
    setPage(1)
    setStatus(nextStatus)
  }

  return <>
    <PageHeading eyebrow="Player activity" title="Registrations" subtitle={canReview ? 'Review player requests and record attendance.' : 'Track your session requests and coach decisions.'} action={<span className="queue-total"><Users size={14} />{meta.total} {canReview ? 'player requests' : 'registrations'}</span>} />
    {notice && <div className="success-banner" role="status"><Check size={15} />{notice}</div>}
    {error && <ErrorBanner onRetry={() => { setLoading(true); setRefresh((value) => value + 1) }}>{error}</ErrorBanner>}

    <div className="registration-toolbar"><div className="filter-tabs" role="group" aria-label="Filter registrations by status">
      {[['', 'All'], ['pending', 'Pending'], ['approved', 'Approved'], ['rejected', 'Rejected']].map(([value, label]) => <button className={status === value ? 'filter-tab active' : 'filter-tab'} key={value || 'all'} onClick={() => changeFilter(value)}>{label}</button>)}
    </div><span className="scope-note">{canReview ? `Showing ${user?.role === 'coach' ? 'your sessions' : 'all club teams'}` : 'Showing your requests'}</span></div>

    {loading ? <LoadingState label="Loading registrations..." /> : rows.length ? <div className="registration-list">
      {rows.map((registration) => <RegistrationRow key={registration.id} registration={registration} canReview={canReview} isPlayer={user?.role === 'player'} onApprove={() => updateRegistration(registration, { path: 'status', body: { status: 'approved' } }, 'Registration approved.')} onReject={() => updateRegistration(registration, { path: 'status', body: { status: 'rejected' } }, 'Registration declined.')} onAttendance={(attended) => updateRegistration(registration, { path: 'attendance', body: { attended } }, attended ? 'Attendance marked present.' : 'Attendance marked absent.')} onCancel={() => cancelRegistration(registration)} />)}
    </div> : <div className="surface-panel"><EmptyState title="No registrations here" detail="Requests will appear here when a player joins a session." /></div>}
    <Pagination currentPage={meta.current_page || page} lastPage={meta.last_page || 1} onPageChange={(nextPage) => { setPage(nextPage); setLoading(true) }} />
  </>
}

function RegistrationRow({ registration, canReview, isPlayer, onApprove, onReject, onAttendance, onCancel }) {
  const session = registration.training_session
  const player = registration.user
  return <article className="registration-row">
    <div className="registration-person"><span className="avatar registration-avatar">{player?.name?.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span><div><strong>{player?.name || 'Player'}</strong><span>{player?.team?.name || 'No team assigned'} · {player?.position || 'Position not set'}</span></div></div>
    <div className="registration-session"><strong>{session?.title || 'Training session'}</strong><span><CalendarDays size={13} />{session?.session_date} · {session?.start_time?.slice(0, 5)}</span><span><MapPin size={13} />{session?.venue?.name || 'Venue'}</span></div>
    <div className="registration-state"><StatusBadge status={registration.status} />{registration.status === 'approved' && <span className="attendance-state">{registration.attended === true ? 'Present' : registration.attended === false ? 'Absent' : 'Attendance open'}</span>}</div>
    <div className="registration-actions">
      {canReview && registration.status === 'pending' && <><button className="icon-action action-approve" title="Approve registration" aria-label="Approve registration" onClick={onApprove}><Check size={16} /></button><button className="icon-action action-reject" title="Reject registration" aria-label="Reject registration" onClick={onReject}><X size={16} /></button></>}
      {canReview && registration.status === 'approved' && <><button className={`attendance-button ${registration.attended === true ? 'selected' : ''}`} onClick={() => onAttendance(true)}><CheckCheck size={14} />Present</button><button className={`attendance-button ${registration.attended === false ? 'selected' : ''}`} onClick={() => onAttendance(false)}><X size={14} />Absent</button></>}
      {isPlayer && registration.status === 'pending' && <button className="text-button destructive-text" onClick={onCancel}>Cancel request</button>}
      {!canReview && !isPlayer && <span className="scope-note">Read only</span>}
    </div>
  </article>
}