import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import supabase from '../lib/supabase'

const BELL_SEEN_KEY = 'ccg-notif-last-seen'

const NAV_LINKS = [
  { to:'/',         label:'Home' },
  { to:'/sermons',  label:'Sermons' },
  { to:'/events',   label:'Events' },
  { to:'/about',    label:'About' },
  { to:'/blog',     label:'Blog' },
  { to:'/gallery',  label:'Gallery' },
  { to:'/sabbath-school', label:'📖 Sabbath' },
  { to:'/find-church', label:'⛪ Find Church' },
  { to:'/timeline', label:'🌐 Timeline' },
  { to:'/prayer-wall', label:'🙏 Prayer Wall' },
  { to:'/contact',  label:'Contact' },
]

const OFFLINE_LINKS = [
  { to:'/bible',          label:'📖 Bible',          sub:'Full KJV offline' },
  { to:'/hymnal',         label:'🎵 Hymnal',          sub:'Songs & lyrics' },
  { to:'/devotional',     label:'🌅 Daily Word',      sub:'365 devotionals' },
  { to:'/sabbath-school', label:'📚 Sabbath School',  sub:'Weekly lessons' },
]

export default function Navbar() {
  const [scrolled, setScrolled]       = useState(false)
  const [menuOpen, setMenuOpen]       = useState(false)
  const [offlineOpen, setOfflineOpen] = useState(false)
  const [isLive, setIsLive]           = useState(false)
  const [unread, setUnread]           = useState(0)
  const { pathname } = useLocation()
  const { user, profile, signOut } = useAuth()

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])
  useEffect(() => { setMenuOpen(false); setOfflineOpen(false) }, [pathname])

  // Check live status
  useEffect(() => {
    supabase.from('site_settings').select('value').eq('key','live').single()
      .then(({ data }) => setIsLive(!!data?.value?.isLive))
    const sub = supabase.channel('nav-live')
      .on('postgres_changes', { event:'UPDATE', schema:'public', table:'site_settings', filter:'key=eq.live' },
        payload => setIsLive(!!payload.new.value?.isLive))
      .subscribe()
    return () => supabase.removeChannel(sub)
  }, [])

  // Unread notification count
  useEffect(() => {
    const lastSeen = localStorage.getItem(BELL_SEEN_KEY)
    const query = supabase.from('notification_logs').select('*', { count: 'exact', head: true })
    if (lastSeen) query.gt('sent_at', lastSeen)
    query.then(({ count }) => setUnread(count || 0))

    const ch = supabase.channel('nav-notif')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notification_logs' },
        () => setUnread(n => n + 1))
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [])

  const isHome = pathname === '/'
  const solid  = scrolled || !isHome || menuOpen
  const initials = (profile?.display_name || profile?.full_name || '?').charAt(0).toUpperCase()

  const LiveLink = ({ mobile }) => (
    <Link to="/live" style={{
      display:'flex', alignItems:'center', gap:6,
      color: pathname==='/live' ? 'var(--gold)' : isLive ? '#ff4444' : 'rgba(255,255,255,0.82)',
      fontWeight: pathname==='/live' || isLive ? 700 : 500,
      fontSize: mobile ? '0.95rem' : '0.82rem',
      padding: mobile ? '12px 22px' : '6px 10px',
      borderRadius:6, textDecoration:'none',
      borderLeft: mobile ? (pathname==='/live' ? '3px solid var(--gold)' : '3px solid transparent') : 'none',
    }}>
      {isLive && <span style={{width:7,height:7,borderRadius:'50%',background:'#ff4444',animation:'blink 1s infinite',display:'inline-block',flexShrink:0}} />}
      📡 Live{isLive ? ' Now' : ''}
    </Link>
  )

  return (
    <>
      <nav style={{
        position:'fixed', top:0, left:0, right:0, zIndex:1000,
        background: solid ? 'rgba(15,31,61,0.97)' : 'transparent',
        backdropFilter: solid ? 'blur(14px)' : 'none',
        boxShadow: solid ? '0 2px 24px rgba(0,0,0,0.22)' : 'none',
        transition:'background 0.3s,box-shadow 0.3s',
        padding:'0 5%',
      }}>
        <div style={{maxWidth:1160,margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'space-between',height:66}}>

          {/* Logo */}
          <Link to="/" style={{display:'flex',alignItems:'center',gap:10,textDecoration:'none'}}>
            <img src="/logo.png" alt="CCG World" style={{width:36,height:36,objectFit:'contain',borderRadius:8}} />
            <div>
              <div style={{fontFamily:'var(--font-display)',fontWeight:900,fontSize:'1rem',color:'white',lineHeight:1.1}}>
                CCG <span style={{color:'var(--gold)'}}>World</span>
              </div>
              <div style={{fontSize:'0.55rem',color:'rgba(255,255,255,0.45)',letterSpacing:'0.15em',textTransform:'uppercase'}}>Christian Church Of God</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="desktop-nav" style={{display:'flex',alignItems:'center',gap:2}}>
            {NAV_LINKS.map(({to,label}) => (
              <Link key={to} to={to} style={{
                color: pathname===to ? 'var(--gold)' : 'rgba(255,255,255,0.82)',
                fontWeight: pathname===to ? 700 : 500,
                fontSize:'0.82rem', padding:'6px 10px', borderRadius:6,
                textDecoration:'none', transition:'color 0.2s',
              }}>{label}</Link>
            ))}
            <LiveLink />

            {/* Offline dropdown */}
            <div style={{position:'relative'}}>
              <button onClick={()=>setOfflineOpen(o=>!o)} style={{
                display:'flex',alignItems:'center',gap:5,
                color:'rgba(255,255,255,0.82)',background:'none',border:'1px solid rgba(255,255,255,0.18)',
                borderRadius:20,padding:'5px 12px',cursor:'pointer',fontSize:'0.78rem',fontFamily:'var(--font-body)',
              }}>📴 Offline {offlineOpen?'▲':'▼'}</button>
              {offlineOpen && (
                <div style={{position:'absolute',top:'calc(100%+8px)',right:0,background:'white',borderRadius:12,boxShadow:'0 12px 40px rgba(0,0,0,0.18)',minWidth:200,overflow:'hidden',zIndex:500}}>
                  {OFFLINE_LINKS.map(({to,label,sub})=>(
                    <Link key={to} to={to} style={{display:'flex',flexDirection:'column',padding:'12px 18px',textDecoration:'none',borderBottom:'1px solid #f1f5f9',transition:'background 0.15s'}}
                      onMouseEnter={e=>e.currentTarget.style.background='#f8faff'}
                      onMouseLeave={e=>e.currentTarget.style.background='white'}>
                      <span style={{fontWeight:700,color:'var(--brand-deep)',fontSize:'0.85rem'}}>{label}</span>
                      <span style={{fontSize:'0.72rem',color:'var(--text-light)',marginTop:2}}>{sub}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right side */}
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            {/* Notifications bell */}
            <Link to="/notifications" onClick={()=>localStorage.setItem(BELL_SEEN_KEY, new Date().toISOString())}
              style={{position:'relative',color:'rgba(255,255,255,0.7)',fontSize:'1.2rem',textDecoration:'none',padding:'4px',display:'flex'}}>
              🔔
              {unread > 0 && (
                <span style={{position:'absolute',top:-2,right:-2,width:16,height:16,borderRadius:'50%',background:'#ef4444',color:'white',fontSize:'0.55rem',fontWeight:900,display:'flex',alignItems:'center',justifyContent:'center'}}>
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </Link>

            {/* User avatar or sign-in */}
            {user ? (
              <div style={{width:34,height:34,borderRadius:'50%',background:'linear-gradient(135deg,var(--gold),#f97316)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:900,fontSize:'0.85rem',cursor:'pointer',flexShrink:0}}>
                {initials}
              </div>
            ) : (
              <Link to="/timeline" className="btn btn-gold" style={{padding:'7px 16px',fontSize:'0.78rem'}}>Sign In</Link>
            )}

            {/* Hamburger */}
            <button className="hamburger" onClick={()=>setMenuOpen(o=>!o)} style={{
              display:'none',flexDirection:'column',gap:5,background:'none',border:'none',
              cursor:'pointer',padding:4,
            }}>
              {[0,1,2].map(i=>(
                <span key={i} style={{display:'block',width:22,height:2,background:'white',borderRadius:2,
                  transition:'all 0.3s',
                  transform: menuOpen && i===0 ? 'translateY(7px) rotate(45deg)' : menuOpen && i===2 ? 'translateY(-7px) rotate(-45deg)' : menuOpen && i===1 ? 'scaleX(0)' : 'none',
                }} />
              ))}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div style={{
        position:'fixed',top:66,left:0,right:0,bottom:0,
        background:'rgba(10,20,48,0.98)',backdropFilter:'blur(16px)',
        zIndex:999,overflowY:'auto',
        transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition:'transform 0.32s cubic-bezier(0.4,0,0.2,1)',
      }}>
        <nav style={{padding:'10px 0'}}>
          {NAV_LINKS.map(({to,label})=>(
            <Link key={to} to={to} style={{
              display:'block',padding:'12px 22px',
              color: pathname===to ? 'var(--gold)' : 'rgba(255,255,255,0.82)',
              fontWeight: pathname===to ? 700 : 400,
              fontSize:'0.95rem', textDecoration:'none',
              borderLeft: pathname===to ? '3px solid var(--gold)' : '3px solid transparent',
              transition:'all 0.15s',
            }}>{label}</Link>
          ))}
          <LiveLink mobile />

          <div style={{padding:'14px 22px 6px',fontSize:'0.65rem',fontWeight:700,letterSpacing:'0.2em',textTransform:'uppercase',color:'rgba(255,255,255,0.3)'}}>OFFLINE ACCESS</div>
          {OFFLINE_LINKS.map(({to,label,sub})=>(
            <Link key={to} to={to} style={{
              display:'flex',flexDirection:'column',padding:'10px 22px',
              color:'rgba(255,255,255,0.75)',fontSize:'0.88rem',textDecoration:'none',
              borderLeft:'3px solid transparent',
            }}>
              <span>{label}</span>
              <span style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.35)',marginTop:1}}>{sub}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom — user section, NO admin link */}
        <div style={{padding:'16px 20px 32px',borderTop:'1px solid rgba(255,255,255,0.08)'}}>
          {user ? (
            <div>
              <div style={{color:'rgba(255,255,255,0.6)',fontSize:'0.8rem',marginBottom:10}}>Signed in as {profile?.display_name||profile?.full_name}</div>
              <button onClick={signOut} style={{width:'100%',padding:'11px',borderRadius:10,border:'1px solid rgba(255,255,255,0.15)',background:'transparent',color:'rgba(255,255,255,0.6)',cursor:'pointer',fontFamily:'var(--font-body)',fontSize:'0.85rem'}}>Sign Out</button>
            </div>
          ) : (
            <Link to="/timeline" className="btn btn-gold" style={{width:'100%',justifyContent:'center',padding:'12px'}}>🌐 Join Community</Link>
          )}
          {/* Admin link intentionally removed for mobile app */}
        </div>
      </div>

      <style>{`
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
        @media(max-width:960px){.desktop-nav{display:none!important;}.hamburger{display:flex!important;}}
        @media(min-width:961px){.hamburger{display:none!important;}}
      `}</style>
    </>
  )
}
