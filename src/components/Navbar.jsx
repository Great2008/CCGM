import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

const NAV_LINKS = [
  { to: '/',         label: 'Home' },
  { to: '/sermons',  label: 'Sermons' },
  { to: '/events',   label: 'Events' },
  { to: '/about',    label: 'About' },
  { to: '/blog',     label: 'Blog' },
  { to: '/gallery',  label: 'Gallery' },
  { to: '/contact',  label: 'Contact' },
]

const OFFLINE_LINKS = [
  { to: '/bible',      label: '📖 Bible',           sub: 'Full KJV offline' },
  { to: '/hymnal',     label: '🎵 Hymnal',           sub: 'Songs & lyrics' },
  { to: '/devotional', label: '🌅 Daily Word',       sub: '365 devotionals' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [offlineOpen, setOfflineOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false); setOfflineOpen(false) }, [pathname])

  const isHome = pathname === '/'
  const solid  = scrolled || !isHome || menuOpen

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: solid ? 'rgba(26,92,42,0.98)' : 'transparent',
        backdropFilter: solid ? 'blur(12px)' : 'none',
        boxShadow: solid ? '0 2px 20px rgba(0,0,0,0.18)' : 'none',
        transition: 'background 0.3s, box-shadow 0.3s',
        padding: '0 5%',
      }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 38, height: 38, background: 'rgba(255,255,255,0.15)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>✝</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: 'white', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(0.72rem,1.5vw,0.88rem)', lineHeight: 1.2 }}>Christian Church</span>
              <span style={{ color: 'var(--gold)', fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700 }}>Of God Mission</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {NAV_LINKS.map(({ to, label }) => (
              <Link key={to} to={to} style={{
                color: pathname === to ? 'var(--gold)' : 'rgba(255,255,255,0.88)',
                fontWeight: pathname === to ? 700 : 500,
                fontSize: '0.85rem', padding: '6px 12px', borderRadius: 6,
                textDecoration: 'none', transition: 'color 0.2s',
              }}
              onMouseEnter={e => { if (pathname !== to) e.target.style.color = 'white' }}
              onMouseLeave={e => { if (pathname !== to) e.target.style.color = 'rgba(255,255,255,0.88)' }}>
                {label}
              </Link>
            ))}

            {/* Offline dropdown */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setOfflineOpen(o => !o)} style={{
                color: 'rgba(255,255,255,0.88)', fontSize: '0.85rem', padding: '6px 12px',
                borderRadius: 6, background: 'transparent', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-body)',
              }}>
                📴 Offline <span style={{ fontSize: '0.6rem', opacity: 0.7 }}>{offlineOpen ? '▲' : '▼'}</span>
              </button>
              {offlineOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  background: 'white', borderRadius: 12, padding: 8,
                  boxShadow: '0 12px 40px rgba(0,0,0,0.18)', minWidth: 210,
                  border: '1px solid rgba(0,0,0,0.06)',
                }}>
                  {OFFLINE_LINKS.map(({ to, label, sub }) => (
                    <Link key={to} to={to} style={{ display: 'block', padding: '10px 14px', borderRadius: 8, textDecoration: 'none', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--green-pale)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <div style={{ color: 'var(--green-deep)', fontWeight: 700, fontSize: '0.88rem' }}>{label}</div>
                      <div style={{ color: 'var(--text-light)', fontSize: '0.72rem', marginTop: 1 }}>{sub} · <span style={{ color: 'var(--green-mid)', fontWeight: 700 }}>✅ Offline</span></div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link to="/contact" className="btn btn-gold" style={{ padding: '8px 20px', fontSize: '0.8rem', marginLeft: 8 }}>🙏 Pray</Link>
          </div>

          {/* Hamburger */}
          <button className="hamburger" onClick={() => setMenuOpen(o => !o)}
            style={{ display: 'none', flexDirection: 'column', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}
            aria-label="Menu">
            {[0,1,2].map(i => (
              <span key={i} style={{
                display: 'block', width: 24, height: 2.5, background: 'white', borderRadius: 2,
                transformOrigin: 'center',
                transform: menuOpen
                  ? i === 0 ? 'translateY(7.5px) rotate(45deg)'
                  : i === 2 ? 'translateY(-7.5px) rotate(-45deg)'
                  : 'scaleX(0)'
                  : 'none',
                opacity: menuOpen && i === 1 ? 0 : 1,
                transition: 'transform 0.28s, opacity 0.2s',
              }} />
            ))}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 999,
        background: 'rgba(0,0,0,0.5)',
        opacity: menuOpen ? 1 : 0, pointerEvents: menuOpen ? 'all' : 'none',
        transition: 'opacity 0.28s',
      }} onClick={() => setMenuOpen(false)} />

      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 1000,
        width: 'min(300px, 85vw)',
        background: 'var(--green-deep)',
        transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex', flexDirection: 'column',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.3)',
        overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: 'white', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>✝ CCOGM</div>
          <button onClick={() => setMenuOpen(false)} style={{ color: 'rgba(255,255,255,0.7)', background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>

        {/* Links */}
        <nav style={{ padding: '12px 0', flex: 1 }}>
          {NAV_LINKS.map(({ to, label }) => (
            <Link key={to} to={to} style={{
              display: 'block', padding: '13px 24px',
              color: pathname === to ? 'var(--gold)' : 'rgba(255,255,255,0.85)',
              fontWeight: pathname === to ? 700 : 400,
              fontSize: '1rem', textDecoration: 'none',
              borderLeft: pathname === to ? '3px solid var(--gold)' : '3px solid transparent',
              transition: 'all 0.2s',
            }}>
              {label}
            </Link>
          ))}

          {/* Offline section */}
          <div style={{ margin: '12px 20px 6px', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>Offline Resources</div>
          {OFFLINE_LINKS.map(({ to, label, sub }) => (
            <Link key={to} to={to} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 24px', color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem', textDecoration: 'none' }}>
              <span>{label}</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--green-light)', fontWeight: 700 }}>✅ Offline</span>
            </Link>
          ))}
        </nav>

        {/* Bottom CTA */}
        <div style={{ padding: '16px 20px 32px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Link to="/contact" className="btn btn-gold" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>🙏 Prayer Request</Link>
          <Link to="/admin" style={{ display: 'block', textAlign: 'center', marginTop: 12, color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem' }}>Admin Panel</Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) { .desktop-nav { display: none !important; } .hamburger { display: flex !important; } }
        @media (min-width: 961px) { .hamburger { display: none !important; } }
      `}</style>
    </>
  )
}
