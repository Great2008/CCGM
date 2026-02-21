import { useState, useEffect, createContext, useContext } from 'react'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminSermons from './pages/AdminSermons'
import AdminEvents from './pages/AdminEvents'
import AdminBlog from './pages/AdminBlog'
import AdminGallery from './pages/AdminGallery'
import AdminHomepage from './pages/AdminHomepage'
import AdminPrayer from './pages/AdminPrayer'

export const AdminContext = createContext(null)
export const useAdmin = () => useContext(AdminContext)

const PAGES = {
  dashboard: AdminDashboard,
  sermons: AdminSermons,
  events: AdminEvents,
  blog: AdminBlog,
  gallery: AdminGallery,
  homepage: AdminHomepage,
  prayer: AdminPrayer,
}

export default function AdminApp() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('ccogm_admin') === 'true')
  const [page, setPage] = useState('dashboard')
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const logout = () => { sessionStorage.removeItem('ccogm_admin'); setAuthed(false) }

  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />

  const Page = PAGES[page] || AdminDashboard

  return (
    <AdminContext.Provider value={{ showToast, setPage }}>
      <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'var(--font-body)', background: '#f4f6f9' }}>
        {/* Sidebar */}
        <aside style={{
          width: 240, background: 'var(--green-deep)', display: 'flex',
          flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh',
          boxShadow: '4px 0 20px rgba(0,0,0,0.15)', zIndex: 100,
        }}>
          {/* Logo */}
          <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.15)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>✝</div>
              <div>
                <div style={{ color: 'white', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.88rem', lineHeight: 1.2 }}>CCOGM</div>
                <div style={{ color: 'var(--gold)', fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Admin Panel</div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
            {[
              ['dashboard', '📊', 'Dashboard'],
              ['sermons', '🎙', 'Sermons'],
              ['events', '📅', 'Events'],
              ['blog', '✍️', 'Blog & Devotionals'],
              ['gallery', '🖼', 'Gallery'],
              ['homepage', '🏠', 'Homepage'],
              ['prayer', '🙏', 'Prayer Requests'],
            ].map(([id, icon, label]) => (
              <button key={id} onClick={() => setPage(id)} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                width: '100%', padding: '11px 20px', border: 'none', cursor: 'pointer',
                background: page === id ? 'rgba(255,255,255,0.15)' : 'transparent',
                color: page === id ? 'white' : 'rgba(255,255,255,0.65)',
                fontSize: '0.88rem', fontWeight: page === id ? 700 : 400,
                fontFamily: 'var(--font-body)', textAlign: 'left',
                borderLeft: page === id ? '3px solid var(--gold)' : '3px solid transparent',
                transition: 'all 0.2s',
              }}>
                <span style={{ fontSize: '1rem', width: 20, textAlign: 'center' }}>{icon}</span>
                {label}
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <a href="/" target="_blank" rel="noreferrer" style={{
              display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem',
              textDecoration: 'none', marginBottom: 10,
            }}>↗ View Live Site</a>
            <button onClick={logout} style={{
              width: '100%', padding: '9px', borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.2)', background: 'transparent',
              color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}>Sign Out</button>
          </div>
        </aside>

        {/* Main content */}
        <main style={{ marginLeft: 240, flex: 1, minHeight: '100vh', padding: '32px' }}>
          <Page />
        </main>

        {/* Toast */}
        {toast && (
          <div style={{
            position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
            background: toast.type === 'success' ? 'var(--green-deep)' : '#c00',
            color: 'white', padding: '14px 22px', borderRadius: 12,
            boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
            fontSize: '0.9rem', fontWeight: 600, maxWidth: 340,
            animation: 'slideIn 0.3s ease',
          }}>
            {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
          </div>
        )}
        <style>{`@keyframes slideIn { from { transform: translateY(20px); opacity:0 } to { transform: translateY(0); opacity:1 } }`}</style>
      </div>
    </AdminContext.Provider>
  )
}
