import { useEffect, useState } from 'react'
import { Activity, ArrowUpRight, CalendarDays, CheckCircle2, Clock3, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeading, StatusBadge, LoadingState, ErrorBanner, EmptyState } from '../components/Ui'
import { useAuth } from '../context/useAuth'
import { api } from '../services/api'
import { formatTime } from '../utils/date'

export function OverviewPage() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refresh, setRefresh] = useState(0)
  const [todayLabel] = useState(() => new Intl.DateTimeFormat('en-PH', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date()))

  useEffect(() => {
    let active = true
    api.get('/dashboard')
      .then(({ data: response }) => { if (active) setData(response) })
      .catch(() => { if (active) setError('Dashboard data could not be loaded. Check the API connection and try again.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [refresh])

  const sessions = data?.upcoming_sessions?.data || data?.upcoming_sessions || []
  const attendance = data?.attendance_per_week || []
  const maxAttendance = Math.max(1, ...attendance.map((week) => week.registered || 0))
  const stats = [
    { label: 'Sessions this week', value: data?.sessions_this_week ?? 0, icon: CalendarDays, accent: 'moss', note: 'Across your active schedule' },
    { label: 'Pending registrations', value: data?.pending_registrations ?? 0, icon: Clock3, accent: 'amber', note: user?.role === 'player' ? 'Awaiting coach review' : 'Need a coach decision' },
    { label: 'Active players', value: data?.active_players ?? 0, icon: Users, accent: 'blue', note: 'Players in your club scope' },
    { label: 'Completion rate', value: `${data?.completion_rate ?? 0}%`, icon: CheckCircle2, accent: 'clay', note: 'Past sessions completed' },
  ]
  const retry = () => {
    setError('')
    setLoading(true)
    setRefresh((value) => value + 1)
  }

  return <>
    <PageHeading eyebrow="Club operations" title="Dashboard" subtitle={`Good to see you, ${user?.name?.split(' ')[0] || 'team'}. Here's the week ahead.`} action={<span className="date-stamp"><Activity size={14} />{todayLabel}</span>} />
    {error && <ErrorBanner onRetry={retry}>{error}</ErrorBanner>}
    {loading && !data ? <LoadingState label="Loading training overview..." /> : <>
      <section className="stat-grid" aria-label="Training summary">
        {stats.map(({ label, value, icon: Icon, accent, note }) => <article className="stat-card" key={label}>
          <div className={`stat-icon stat-${accent}`}><Icon size={18} strokeWidth={1.9} /></div><div className="stat-number">{value}</div><div className="stat-label">{label}</div><div className="stat-note">{note}</div>
        </article>)}
      </section>

      <section className="dashboard-grid">
        <article className="surface-panel schedule-panel">
          <div className="panel-heading"><div><div className="eyebrow">On the calendar</div><h2>Upcoming sessions</h2></div><Link className="quiet-link" to="/sessions">All sessions <ArrowUpRight size={15} /></Link></div>
          {sessions.length ? <div className="upcoming-list">{sessions.slice(0, 5).map((session) => <Link className="upcoming-row" to={`/sessions/${session.id}`} key={session.id}>
            <div className="date-block"><strong>{new Date(`${session.session_date}T00:00:00`).getDate()}</strong><span>{new Intl.DateTimeFormat('en-PH', { month: 'short' }).format(new Date(`${session.session_date}T00:00:00`))}</span></div>
            <div className="upcoming-main"><strong>{session.title}</strong><span>{session.team?.name || 'Team'} · {session.venue?.name || 'Venue pending'}</span></div>
            <div className="upcoming-meta"><span>{formatTime(session.start_time)}</span><StatusBadge status={session.status} /></div>
          </Link>)}</div> : <EmptyState title="No upcoming sessions" detail="New sessions will appear here once scheduled." />}
        </article>

        <article className="surface-panel attendance-panel">
          <div className="panel-heading"><div><div className="eyebrow">Showing up</div><h2>Attendance trend</h2></div><span className="chart-period">Last 6 weeks</span></div>
          {attendance.length ? <div className="attendance-chart" role="img" aria-label="Weekly attendance compared with approved registrations">
            {attendance.map((week) => {
              const total = week.registered || 0
              const attended = week.attended || 0
              return <div className="attendance-column" key={week.week_start}><span className="attendance-count">{attended}/{total}</span><div className="attendance-track"><div className="attendance-fill" style={{ height: `${Math.max(total ? 10 : 3, (attended / maxAttendance) * 100)}%` }} /></div><span className="attendance-label">{new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric' }).format(new Date(`${week.week_start}T00:00:00`))}</span></div>
            })}
          </div> : <EmptyState title="Attendance starts here" detail="Approved registrations will shape this trend." />}
          <div className="chart-legend"><span><i className="legend-swatch" />Players attended</span><span className="chart-footnote">Compared with approved registrations</span></div>
        </article>
      </section>
      <div className="dashboard-footer"><span><span className="live-dot" />Live club data</span><Link to="/registrations">Review player registrations <ArrowUpRight size={14} /></Link></div>
    </>}
  </>
}