import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home' },
  { to: '/sermons', label: 'Sermons' },
  { to: '/events', label: 'Events' },
  { to: '/about', label: 'About Us' },
  { to: '/blog', label: 'Devotionals' },
  { to: '/gallery', label: 'Gallery' },
]

const offlineLinks = [
  { to: '/bible', label: '📖 Bible', tip: 'KJV — Offline' },
  { to: '/hymnal', label: '🎵 Hymnal', tip: 'Audio — Offline' },
  { to: '/devotional', label: '🌅 Daily Word', tip: 'Syncs Offline' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setOpen(false); setToolsOpen(false) }, [location])

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1000,
        background: scrolled ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: scrolled ? '2px solid var(--green-mid)' : '2px solid transparent',
        transition: 'all 0.3s ease',
        boxShadow: scrolled ? '0 2px 24px rgba(0,0,0,0.08)' : 'none',
      }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 5%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div style={{
              width: 40, height: 40, background: 'linear-gradient(135deg, var(--green-mid), var(--green-deep))',
              borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: '1.2rem', flexShrink: 0,
              boxShadow: '0 3px 12px rgba(45,138,72,0.35)'
            }}>✝</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '0.92rem', color: 'var(--green-deep)', lineHeight: 1.1 }}>
                Christian Church Of God Mission
              </div>
              <div style={{ fontSize: '0.62rem', letterSpacing: '0.2em', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 700 }}>God First</div>
            </div>
          </Link>

          {/* Desktop */}
          <ul style={{ display: 'flex', gap: 2, listStyle: 'none', alignItems: 'center', margin: 0 }} className="desktop-nav">
            {links.map(({ to, label }) => (
              <li key={to}>
                <NavLink to={to} end={to === '/'} style={({ isActive }) => ({
                  padding: '6px 12px', borderRadius: 8,
                  fontSize: '0.83rem', fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase',
                  textDecoration: 'none',
                  color: isActive ? 'var(--green-mid)' : 'var(--text-mid)',
                  background: isActive ? 'var(--green-pale)' : 'transparent',
                  transition: 'all 0.2s'
                })}>{label}</NavLink>
              </li>
            ))}

            {/* Offline Tools dropdown */}
            <li style={{ position: 'relative' }}>
              <button onClick={() => setToolsOpen(o => !o)} style={{
                padding: '6px 12px', borderRadius: 8,
                fontSize: '0.83rem', fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase',
                border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)',
                color: 'var(--green-mid)', background: 'var(--green-pale)',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                📴 Offline {toolsOpen ? '▲' : '▼'}
              </button>
              {toolsOpen && (
                <div style={{
                  position: 'absolute', top: '110%', right: 0,
                  background: 'white', borderRadius: 14, boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                  overflow: 'hidden', minWidth: 200, border: '1px solid var(--green-pale)',
                }}>
                  {offlineLinks.map(({ to, label, tip }) => (
                    <NavLink key={to} to={to} style={({ isActive }) => ({
                      display: 'flex', flexDirection: 'column', padding: '14px 18px',
                      textDecoration: 'none', borderBottom: '1px solid var(--green-pale)',
                      background: isActive ? 'var(--green-pale)' : 'white',
                      transition: 'background 0.15s',
                    })}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--green-pale)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--green-deep)' }}>{label}</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--green-mid)', marginTop: 2 }}>✅ {tip}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </li>

            <li style={{ marginLeft: 6 }}>
              <Link to="/contact" style={{
                background: 'var(--green-mid)', color: 'white',
                padding: '9px 18px', borderRadius: 30,
                fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
                textDecoration: 'none', boxShadow: '0 3px 14px rgba(45,138,72,0.35)',
              }}>🙏 Prayer</Link>
            </li>
          </ul>

          <button onClick={() => setOpen(o => !o)} style={{
            display: 'none', background: 'none', border: 'none',
            fontSize: '1.4rem', color: 'var(--green-deep)', cursor: 'pointer', padding: 6
          }} className="hamburger" aria-label="Toggle menu">
            {open ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div style={{ background: 'white', borderTop: '1px solid var(--green-pale)', padding: '12px 5% 20px' }}>
            {[...links, ...offlineLinks].map(({ to, label, tip }) => (
              <NavLink key={to} to={to} end={to === '/'} style={({ isActive }) => ({
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '11px 0', borderBottom: '1px solid var(--green-pale)',
                fontSize: '0.95rem', fontWeight: 700,
                color: isActive ? 'var(--green-mid)' : 'var(--text-dark)', textDecoration: 'none',
              })}>
                <span>{label}</span>
                {tip && <span style={{ fontSize: '0.7rem', color: 'var(--green-mid)', background: 'var(--green-pale)', padding: '2px 10px', borderRadius: 20 }}>✅ Offline</span>}
              </NavLink>
            ))}
            <Link to="/contact" style={{
              display: 'inline-block', marginTop: 14,
              background: 'var(--green-mid)', color: 'white',
              padding: '10px 24px', borderRadius: 30, fontSize: '0.88rem', fontWeight: 700, textDecoration: 'none',
            }}>🙏 Prayer Request</Link>
          </div>
        )}
      </nav>

      <style>{`
        @media (max-width: 960px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: flex !important; }
        }
      `}</style>
    </>
  )
}
