import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Check, Edit3, Plus, Search, Shield, Trash2, Users } from 'lucide-react'
import { EmptyState, ErrorBanner, LoadingState, PageHeading, Pagination } from '../components/Ui'
import { useAuth } from '../context/useAuth'
import { api } from '../services/api'

const adminTabs = [
  ['teams', 'Teams', '/teams'],
  ['venues', 'Venues', '/venues'],
  ['drills', 'Drills', '/drills'],
  ['members', 'Members', '/users'],
]
const categories = ['passing', 'dribbling', 'shooting', 'fitness', 'defending']

function blankForm(tab) {
  if (tab === 'teams') return { name: '', division: '', description: '' }
  if (tab === 'venues') return { name: '', address: '', capacity: '', notes: '' }
  if (tab === 'drills') return { name: '', category: 'passing', description: '', default_minutes: 15 }
  return { role: 'player', team_id: '', is_active: true }
}

export function ClubPage() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const isAdmin = user?.role === 'admin'
  const requestedTab = searchParams.get('tab')
  const tab = isAdmin && adminTabs.some(([key]) => key === requestedTab) ? requestedTab : isAdmin ? 'teams' : 'drills'
  const activeTab = adminTabs.find(([key]) => key === tab) || adminTabs[2]
  const [rows, setRows] = useState([])
  const [teams, setTeams] = useState([])
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(blankForm(tab))
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    let active = true
    const params = { page }
    if (tab === 'members' || tab === 'drills') params.search = appliedSearch
    if (tab === 'drills' && category) params.category = category
    api.get(activeTab[2], { params })
      .then(({ data }) => {
        if (!active) return
        setError('')
        setRows(data.data || [])
        setPagination(data.meta || { current_page: 1, last_page: 1, total: (data.data || []).length })
      })
      .catch(() => { if (active) setError('Club data could not be loaded.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [activeTab, tab, page, appliedSearch, category, refresh])

  useEffect(() => {
    if (!isAdmin) return
    api.get('/teams', { params: { page: 1 } }).then(({ data }) => setTeams(data.data || [])).catch(() => {})
  }, [isAdmin, refresh])

  const displayedRows = useMemo(() => {
    if (tab === 'members' || tab === 'drills' || !appliedSearch) return rows
    const query = appliedSearch.toLowerCase()
    return rows.filter((row) => `${row.name} ${row.address || ''} ${row.division || ''}`.toLowerCase().includes(query))
  }, [rows, tab, appliedSearch])

  function chooseTab(nextTab) {
    setSearchParams({ tab: nextTab })
    setLoading(true)
    setPage(1)
    setSearch('')
    setAppliedSearch('')
    setCategory('')
  }

  function openCreate() {
    setEditing(null)
    setForm(blankForm(tab))
    setFormErrors({})
    setModal(true)
  }

  function openEdit(row) {
    setEditing(row)
    setForm(tab === 'members'
      ? { role: row.role, team_id: row.team_id || '', is_active: row.is_active }
      : tab === 'drills'
        ? { name: row.name, category: row.category, description: row.description || '', default_minutes: row.default_minutes }
        : tab === 'venues'
          ? { name: row.name, address: row.address, capacity: row.capacity || '', notes: row.notes || '' }
          : { name: row.name, division: row.division || '', description: row.description || '' })
    setFormErrors({})
    setModal(true)
  }

  async function submitForm(event) {
    event.preventDefault()
    const nextErrors = {}
    if (tab !== 'members' && !form.name?.trim()) nextErrors.name = ['This field is required.']
    if (tab === 'venues' && !form.address?.trim()) nextErrors.address = ['Enter a venue address.']
    if (Object.keys(nextErrors).length) return setFormErrors(nextErrors)

    setSaving(true)
    setFormErrors({})
    const payload = { ...form }
    if (tab === 'venues') payload.capacity = payload.capacity ? Number(payload.capacity) : null
    if (tab === 'drills') payload.default_minutes = Number(payload.default_minutes)
    if (tab === 'members') payload.team_id = payload.team_id ? Number(payload.team_id) : null
    try {
      if (editing) {
        await api.patch(`${activeTab[2]}/${editing.id}`, payload)
        setNotice(`${activeTab[1].slice(0, -1)} updated.`)
      } else {
        await api.post(activeTab[2], payload)
        setNotice(`${activeTab[1].slice(0, -1)} created.`)
      }
      setModal(false)
      setRefresh((value) => value + 1)
      window.setTimeout(() => setNotice(''), 3200)
    } catch (requestError) {
      setFormErrors(requestError.response?.data?.errors || { form: requestError.response?.data?.message || 'Unable to save these changes.' })
    } finally {
      setSaving(false)
    }
  }

  async function deleteRow(row) {
    const name = row.name || row.title || row.email
    if (!window.confirm(`Delete “${name}”? This action cannot be undone.`)) return
    try {
      await api.delete(`${activeTab[2]}/${row.id}`)
      setNotice(`${activeTab[1].slice(0, -1)} deleted.`)
      setRefresh((value) => value + 1)
      window.setTimeout(() => setNotice(''), 3200)
    } catch (requestError) {
      setError(requestError.response?.data?.message || `Unable to delete ${name}. It may be in use by a session.`)
    }
  }

  const heading = tab === 'members' ? 'Member directory' : tab === 'teams' ? 'Teams' : tab === 'venues' ? 'Training venues' : 'Drill library'

  return <>
    <PageHeading eyebrow={isAdmin ? 'Club administration' : 'Training resources'} title={heading} subtitle={isAdmin ? 'Keep club records and access roles up to date.' : 'Browse the drills available to your team.'} action={isAdmin && tab !== 'members' ? <button className="primary-button" onClick={openCreate}><Plus size={16} />Add {activeTab[1].slice(0, -1).toLowerCase()}</button> : null} />
    {notice && <div className="success-banner" role="status"><Check size={15} />{notice}</div>}
    {error && <ErrorBanner onRetry={() => setRefresh((value) => value + 1)}>{error}</ErrorBanner>}
    {isAdmin && <div className="club-tabs" role="tablist" aria-label="Club management sections">{adminTabs.map(([key, label]) => <button role="tab" aria-selected={tab === key} className={`club-tab ${tab === key ? 'active' : ''}`} key={key} onClick={() => chooseTab(key)}>{key === 'members' ? <Users size={15} /> : key === 'drills' ? <Shield size={15} /> : null}{label}</button>)}</div>}
    <form className="club-filters" onSubmit={(event) => { event.preventDefault(); setAppliedSearch(search); setPage(1); setLoading(true) }}>
      <label className="search-field"><Search size={15} /><input placeholder={`Search ${tab}`} value={search} onChange={(event) => setSearch(event.target.value)} /></label>
      {tab === 'drills' && <select aria-label="Filter by drill category" value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); setLoading(true) }}><option value="">All categories</option>{categories.map((value) => <option key={value} value={value}>{value}</option>)}</select>}
      <span className="scope-note">{pagination.total || 0} {tab}</span>
    </form>
    {loading ? <LoadingState label={`Loading ${tab}...`} /> : displayedRows.length ? <div className="club-table-wrap"><table className="club-table"><thead><tr>{tableHeaders(tab).map((label) => <th key={label}>{label}</th>)}{isAdmin && <th><span className="sr-only">Actions</span></th>}</tr></thead><tbody>{displayedRows.map((row) => <ClubRow key={`${tab}-${row.id}`} row={row} tab={tab} isAdmin={isAdmin} onEdit={() => openEdit(row)} onDelete={() => deleteRow(row)} />)}</tbody></table></div> : <div className="surface-panel"><EmptyState title={`No ${tab} found`} detail={tab === 'members' ? 'Registered club members will appear here.' : 'Add a record to get started.'} /></div>}
    <Pagination currentPage={pagination.current_page || page} lastPage={pagination.last_page || 1} onPageChange={(nextPage) => { setPage(nextPage); setLoading(true) }} />
    {modal && <ClubFormModal tab={tab} form={form} setForm={setForm} teams={teams} errors={formErrors} editing={editing} saving={saving} onClose={() => setModal(false)} onSubmit={submitForm} />}
  </>
}

function tableHeaders(tab) {
  if (tab === 'members') return ['Member', 'Role', 'Team', 'Access']
  if (tab === 'teams') return ['Team', 'Division', 'Players', 'Sessions']
  if (tab === 'venues') return ['Venue', 'Address', 'Capacity', 'Sessions']
  return ['Drill', 'Category', 'Length', 'Description']
}

function ClubRow({ row, tab, isAdmin, onEdit, onDelete }) {
  return <tr>
    {tab === 'members' && <><td><strong>{row.name}</strong><small>{row.email}</small></td><td><span className={`role-token role-${row.role}`}>{row.role}</span></td><td>{row.team?.name || 'Unassigned'}</td><td><span className={`active-token ${row.is_active ? 'is-active' : 'is-inactive'}`}><i />{row.is_active ? 'Active' : 'Inactive'}</span></td></>}
    {tab === 'teams' && <><td><strong>{row.name}</strong></td><td>{row.division || '—'}</td><td>{row.players_count ?? 0}</td><td>{row.sessions_count ?? 0}</td></>}
    {tab === 'venues' && <><td><strong>{row.name}</strong></td><td>{row.address}</td><td>{row.capacity || '—'}</td><td>{row.sessions_count ?? 0}</td></>}
    {tab === 'drills' && <><td><strong>{row.name}</strong></td><td><span className="category-token">{row.category}</span></td><td>{row.default_minutes} min</td><td className="table-description">{row.description || '—'}</td></>}
    {isAdmin && <td className="table-actions"><button className="icon-action action-edit" aria-label={`Edit ${row.name || row.email}`} onClick={onEdit}><Edit3 size={14} /></button>{tab !== 'members' && <button className="icon-action action-reject" aria-label={`Delete ${row.name}`} onClick={onDelete}><Trash2 size={14} /></button>}</td>}
  </tr>
}

function ClubFormModal({ tab, form, setForm, teams, errors, editing, saving, onClose, onSubmit }) {
  const isMember = tab === 'members'
  const title = isMember ? `Manage ${editing?.name}` : `${editing ? 'Edit' : 'Add'} ${tab.slice(0, -1)}`
  const fieldError = (name) => errors[name]?.[0] || ''
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const input = (name, label, props = {}) => <div className="field"><label htmlFor={name}>{label}</label><input id={name} value={form[name] ?? ''} onChange={(event) => update(name, event.target.value)} {...props} />{fieldError(name) && <span className="field-error">{fieldError(name)}</span>}</div>

  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="session-modal club-modal" role="dialog" aria-modal="true" aria-labelledby="club-form-title">
    <header className="modal-heading"><div><div className="eyebrow">Club records</div><h2 id="club-form-title">{title}</h2></div><button className="icon-button" aria-label="Close" onClick={onClose}><span aria-hidden="true">×</span></button></header>
    <form className="session-form" onSubmit={onSubmit} noValidate>
      {errors.form && <div className="form-error">{errors.form}</div>}
      {tab === 'teams' && <>{input('name', 'Team name', { required: true, maxLength: 80 })}{input('division', 'Division', { maxLength: 30 })}<div className="field"><label htmlFor="description">Description</label><textarea id="description" rows="3" value={form.description} onChange={(event) => update('description', event.target.value)} /></div></>}
      {tab === 'venues' && <>{input('name', 'Venue name', { required: true, maxLength: 120 })}{input('address', 'Address', { required: true, maxLength: 255 })}{input('capacity', 'Capacity', { type: 'number', min: 1, max: 65535 })}<div className="field"><label htmlFor="notes">Notes</label><textarea id="notes" rows="3" value={form.notes} onChange={(event) => update('notes', event.target.value)} /></div></>}
      {tab === 'drills' && <>{input('name', 'Drill name', { required: true, maxLength: 120 })}<div className="form-grid"><div className="field"><label htmlFor="category">Category</label><select id="category" value={form.category} onChange={(event) => update('category', event.target.value)}>{categories.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>{input('default_minutes', 'Minutes', { type: 'number', min: 1, max: 180 })}</div><div className="field"><label htmlFor="description">Description</label><textarea id="description" rows="3" value={form.description} onChange={(event) => update('description', event.target.value)} /></div></>}
      {isMember && <><div className="member-summary"><span className="avatar">{editing?.name?.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span><span><strong>{editing?.name}</strong><small>{editing?.email}</small></span></div><div className="field"><label htmlFor="role">Role</label><select id="role" value={form.role} onChange={(event) => update('role', event.target.value)}><option value="player">Player</option><option value="coach">Coach</option><option value="admin">Admin</option></select></div><div className="field"><label htmlFor="team_id">Team</label><select id="team_id" value={form.team_id} onChange={(event) => update('team_id', event.target.value)}><option value="">No team</option>{teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}</select>{fieldError('team_id') && <span className="field-error">{fieldError('team_id')}</span>}</div><label className="toggle-row"><input type="checkbox" checked={Boolean(form.is_active)} onChange={(event) => update('is_active', event.target.checked)} /><span><strong>Account active</strong><small>Inactive accounts cannot sign in.</small></span></label></>}
      <footer className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button type="submit" className="primary-button" disabled={saving}>{saving ? 'Saving...' : editing ? 'Save changes' : 'Create record'}</button></footer>
    </form>
  </section></div>
}