import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Activity, CalendarDays, ClipboardCheck, Dumbbell, LogOut, Menu, Shield, ShieldCheck, Users, X } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { SoccerBallLogo } from './SoccerBallLogo'

const navigation = [
  { label: 'Dashboard', path: '/dashboard', icon: Activity },
  { label: 'Training sessions', path: '/sessions', icon: CalendarDays },
  { label: 'Registrations', path: '/registrations', icon: ClipboardCheck },
]

function initials(name = '') {
  return name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()
}

export function AppShell() {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const pageName = navigation.find((item) => location.pathname.startsWith(item.path))?.label
    ?? (location.pathname === '/admin/club'
      ? 'Club management'
      : location.pathname === '/club'
        ? 'Drill library'
        : 'KickOff')

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-frame">
      {menuOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
      <aside className={`sidebar ${menuOpen ? 'is-open' : ''}`}>
        <div className="brand-lockup">
          <div className="brand-mark"><SoccerBallLogo /></div>
          <div><span className="brand-name">KICKOFF</span><span className="brand-caption">Training operations</span></div>
        </div>
        <div className="nav-label">Workspace</div>
        <nav className="sidebar-nav" aria-label="Main navigation">
          {navigation.map(({ label, path, icon: Icon }) => (
            <NavLink key={path} to={path} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
              <Icon size={17} strokeWidth={1.9} />{label}
            </NavLink>
          ))}
        </nav>
       <div className="nav-label">Club</div>

<nav className="sidebar-nav" aria-label="Club navigation">
  <NavLink
    to="/club"
    end
    className={({ isActive }) =>
      `nav-link ${isActive ? 'active' : ''}`
    }
    onClick={() => setMenuOpen(false)}
  >
    <Dumbbell size={17} />
    Drill library
  </NavLink>

  {user?.role === 'admin' && (
    <>
      <NavLink
        to="/admin/club?tab=teams"
        className={() =>
          `nav-link ${
            location.pathname === '/admin/club' &&
            !location.search.includes('members')
              ? 'active'
              : ''
          }`
        }
        onClick={() => setMenuOpen(false)}
      >
        <ShieldCheck size={17} />
        Club management
      </NavLink>

      <NavLink
        to="/admin/club?tab=members"
        className={() =>
          `nav-link ${
            location.pathname === '/admin/club' &&
            location.search.includes('members')
              ? 'active'
              : ''
          }`
        }
        onClick={() => setMenuOpen(false)}
      >
        <Users size={17} />
        Member directory
      </NavLink>
    </>
  )}
</nav>
        <div className="sidebar-spacer" />
        <div className="sidebar-footnote">
          <strong>{user?.team?.name || (user?.role === 'admin' ? 'Club administration' : 'KickOff Academy')}</strong>
          {user?.role === 'coach' ? 'Coach workspace' : user?.role === 'admin' ? 'Administration workspace' : 'Player workspace'}
        </div>
        <button className="nav-link logout-link" type="button" onClick={handleLogout}><LogOut size={17} />Sign out</button>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-menu" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <span className="breadcrumb">KickOff <span aria-hidden="true">/</span> {pageName}</span>
          </div>
          <div className="topbar-right">
            {user?.role === 'admin' && <span className="role-chip"><Shield size={13} /> Admin</span>}
            <div className="profile-trigger">
              <span className="avatar">{initials(user?.name)}</span>
              <span className="profile-copy"><span className="profile-name">{user?.name}</span><span className="profile-role">{user?.role}</span></span>
            </div>
          </div>
        </header>
        <main className="page-content"><Outlet /></main>
      </section>
    </div>
  )
}
