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

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setOpen(false) }, [location])

  const navStyle = {
    position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1000,
    background: scrolled ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(10px)',
    borderBottom: scrolled ? '2px solid var(--green-mid)' : '2px solid transparent',
    transition: 'all 0.3s ease',
    boxShadow: scrolled ? '0 2px 24px rgba(0,0,0,0.08)' : 'none',
  }

  return (
    <>
      <nav style={navStyle}>
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 5%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div style={{
              width: 40, height: 40, background: 'linear-gradient(135deg, var(--green-mid), var(--green-deep))',
              borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: '1.2rem', fontWeight: 900, flexShrink: 0,
              boxShadow: '0 3px 12px rgba(45,138,72,0.35)'
            }}>✝</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '0.95rem', color: 'var(--green-deep)', lineHeight: 1.1 }}>
                Christian Church Of God Mission
              </div>
              <div style={{ fontSize: '0.65rem', letterSpacing: '0.2em', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 700 }}>
                God First
              </div>
            </div>
          </Link>

          {/* Desktop links */}
          <ul style={{ display: 'flex', gap: 4, listStyle: 'none', alignItems: 'center', margin: 0 }} className="desktop-nav">
            {links.map(({ to, label }) => (
              <li key={to}>
                <NavLink to={to} end={to === '/'} style={({ isActive }) => ({
                  padding: '6px 14px', borderRadius: 8,
                  fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.04em',
                  textTransform: 'uppercase', textDecoration: 'none',
                  color: isActive ? 'var(--green-mid)' : 'var(--text-mid)',
                  background: isActive ? 'var(--green-pale)' : 'transparent',
                  transition: 'all 0.2s'
                })}>
                  {label}
                </NavLink>
              </li>
            ))}
            <li style={{ marginLeft: 8 }}>
              <Link to="/contact" style={{
                background: 'var(--green-mid)', color: 'white',
                padding: '9px 20px', borderRadius: 30,
                fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.06em',
                textTransform: 'uppercase', textDecoration: 'none',
                boxShadow: '0 3px 14px rgba(45,138,72,0.35)',
                transition: 'all 0.2s'
              }}>
                🙏 Prayer Request
              </Link>
            </li>
          </ul>

          {/* Hamburger */}
          <button
            onClick={() => setOpen(o => !o)}
            style={{
              display: 'none', background: 'none', border: 'none',
              fontSize: '1.4rem', color: 'var(--green-deep)', cursor: 'pointer',
              padding: 6
            }}
            className="hamburger"
            aria-label="Toggle menu"
          >
            {open ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div style={{
            background: 'white', borderTop: '1px solid var(--green-pale)',
            padding: '16px 5% 24px'
          }}>
            {links.map(({ to, label }) => (
              <NavLink key={to} to={to} end={to === '/'} style={({ isActive }) => ({
                display: 'block', padding: '11px 0',
                borderBottom: '1px solid var(--green-pale)',
                fontSize: '0.95rem', fontWeight: 700,
                color: isActive ? 'var(--green-mid)' : 'var(--text-dark)',
                textDecoration: 'none'
              })}>
                {label}
              </NavLink>
            ))}
            <Link to="/contact" style={{
              display: 'inline-block', marginTop: 16,
              background: 'var(--green-mid)', color: 'white',
              padding: '10px 24px', borderRadius: 30,
              fontSize: '0.88rem', fontWeight: 700, textDecoration: 'none'
            }}>
              🙏 Prayer Request
            </Link>
          </div>
        )}
      </nav>

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: flex !important; }
        }
      `}</style>
    </>
  )
}
