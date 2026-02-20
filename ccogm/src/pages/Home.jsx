import { Link } from 'react-router-dom'
import { sermons, events } from '../data/mockData'

export default function Home() {
  const latestSermon = sermons[0]
  const upcomingEvents = events.slice(0, 3)

  return (
    <>
      {/* ── HERO ── */}
      <section style={{
        minHeight: '100vh',
        background: `
          linear-gradient(160deg, rgba(26,92,42,0.90) 0%, rgba(45,138,72,0.78) 55%, rgba(74,184,102,0.55) 100%),
          url('https://images.unsplash.com/photo-1438232992991-995b671e4b8b?w=1600&q=80') center/cover no-repeat`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '100px 20px 80px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative cross bg */}
        <div style={{
          position: 'absolute', right: '5%', bottom: '5%',
          fontSize: '22rem', color: 'rgba(255,255,255,0.04)',
          lineHeight: 1, pointerEvents: 'none', userSelect: 'none',
        }}>✝</div>

        <div style={{ position: 'relative', maxWidth: 780 }}>
          {/* Motto badge */}
          <div style={{
            display: 'inline-block',
            border: '1px solid var(--gold)', color: 'var(--gold)',
            padding: '6px 24px', borderRadius: 30,
            fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase',
            marginBottom: 28,
          }}>✝ God First</div>

          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 900,
            fontSize: 'clamp(2.5rem, 6vw, 4.6rem)',
            color: 'white', lineHeight: 1.1, marginBottom: 20,
            textShadow: '0 2px 24px rgba(0,0,0,0.3)',
          }}>
            Welcome to<br />
            <em style={{ fontStyle: 'italic', color: '#a8e6b8' }}>Christian Church<br />Of God Mission</em>
          </h1>

          <p style={{
            fontSize: '1.15rem', color: 'rgba(255,255,255,0.88)',
            lineHeight: 1.8, marginBottom: 40, maxWidth: 540, margin: '0 auto 40px',
          }}>
            A community rooted in faith, love, and the Word of God. Join us as we worship, grow, and serve together.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/sermons" className="btn btn-gold">🎙 Watch Latest Sermon</Link>
            <Link to="/contact" className="btn btn-outline-white">🙏 Prayer Request</Link>
          </div>

          {/* Live banner */}
          <div style={{
            marginTop: 48, display: 'inline-flex', alignItems: 'center', gap: 10,
            background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.2)', borderRadius: 40,
            padding: '10px 24px',
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff4444', animation: 'pulse 1.5s infinite', display: 'inline-block' }} />
            <span style={{ color: 'white', fontSize: '0.88rem', fontWeight: 700 }}>Live every Sunday 9 AM & 11 AM</span>
          </div>
        </div>

        {/* Scroll hint */}
        <div style={{
          position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)',
          color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        }}>
          <span>Scroll</span>
          <span style={{ animation: 'bounce 2s infinite' }}>↓</span>
        </div>
      </section>

      {/* ── SERVICE TIMES ── */}
      <section style={{ background: 'var(--green-pale)', padding: '60px 5%' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
            {[
              { icon: '🌅', day: 'Sunday', time: '9:00 AM & 11:00 AM', label: 'Morning Worship' },
              { icon: '📖', day: 'Wednesday', time: '7:00 PM', label: 'Bible Study' },
              { icon: '🔥', day: 'Friday', time: '6:30 PM', label: 'Prayer Night' },
              { icon: '✨', day: 'Saturday', time: '4:00 PM', label: 'Youth Service' },
            ].map(({ icon, day, time, label }) => (
              <div key={day} style={{
                background: 'white', borderRadius: 14, padding: '24px 20px', textAlign: 'center',
                borderTop: '4px solid var(--green-mid)', boxShadow: 'var(--shadow-sm)',
                transition: 'transform 0.2s', cursor: 'default',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{ fontSize: '1.8rem', marginBottom: 10 }}>{icon}</div>
                <div style={{ fontWeight: 900, fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--green-mid)', marginBottom: 4 }}>{day}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--green-deep)', marginBottom: 4, fontWeight: 700 }}>{time}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LATEST SERMON ── */}
      <section style={{ background: 'var(--green-deep)', padding: '90px 5%' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
            <div>
              <span className="section-label" style={{ color: 'var(--green-light)' }}>Latest Message</span>
              <h2 className="section-title" style={{ color: 'white' }}>{latestSermon.title}</h2>
              <div className="section-divider" style={{ background: 'linear-gradient(90deg, var(--green-light), var(--gold))' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <span className="tag" style={{ background: 'rgba(255,255,255,0.12)', color: 'var(--gold)' }}>{latestSermon.series}</span>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)' }}>{latestSermon.date}</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.78)', lineHeight: 1.8, fontSize: '1rem', marginBottom: 12 }}>{latestSermon.description}</p>
              <p style={{ color: 'var(--green-light)', fontSize: '0.88rem', fontWeight: 700, marginBottom: 28 }}>
                📖 {latestSermon.scripture} — {latestSermon.pastor}
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <Link to="/sermons" className="btn btn-gold">▶ Watch Now</Link>
                <Link to="/sermons" className="btn btn-outline-white" style={{ border: '1.5px solid rgba(255,255,255,0.4)', color: 'white' }}>
                  All Sermons →
                </Link>
              </div>
            </div>
            <div style={{ position: 'relative' }}>
              <img
                src={latestSermon.thumbnail}
                alt={latestSermon.title}
                style={{ width: '100%', borderRadius: 16, boxShadow: '0 24px 60px rgba(0,0,0,0.4)' }}
              />
              <div style={{
                position: 'absolute', inset: 0, borderRadius: 16,
                background: 'rgba(26,92,42,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.95)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.8rem', boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                  cursor: 'pointer', transition: 'transform 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                  ▶
                </div>
              </div>
              <div style={{
                position: 'absolute', bottom: -16, left: -16,
                background: 'var(--gold)', color: 'var(--green-deep)',
                borderRadius: 10, padding: '12px 18px',
                fontWeight: 900, fontSize: '0.85rem',
              }}>
                🎙 {latestSermon.duration}
              </div>
            </div>
          </div>
        </div>
        <style>{`@media(max-width:768px){.hero-sermon-grid{grid-template-columns:1fr!important}}`}</style>
      </section>

      {/* ── UPCOMING EVENTS ── */}
      <section style={{ background: 'var(--cream)', padding: '90px 5%' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <span className="section-label">What's Coming Up</span>
              <h2 className="section-title">Upcoming Events</h2>
              <div className="section-divider" />
            </div>
            <Link to="/events" className="btn btn-outline-green">View All Events →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {upcomingEvents.map(event => (
              <div key={event.id} className="card">
                <div style={{ position: 'relative', overflow: 'hidden', height: 180 }}>
                  <img src={event.image} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                    onMouseEnter={e => e.target.style.transform = 'scale(1.06)'}
                    onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
                  <div style={{ position: 'absolute', top: 12, left: 12 }}>
                    <span className="tag">{event.category}</span>
                  </div>
                  {event.recurring && (
                    <div style={{ position: 'absolute', top: 12, right: 12, background: 'var(--gold)', color: 'var(--green-deep)', padding: '3px 10px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700 }}>
                      Recurring
                    </div>
                  )}
                </div>
                <div style={{ padding: 22 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10, fontSize: '0.82rem', color: 'var(--text-light)' }}>
                    <span>📅 {event.date}</span>
                    <span>·</span>
                    <span>⏰ {event.time}</span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--green-deep)', marginBottom: 8 }}>{event.title}</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-mid)', lineHeight: 1.65 }}>{event.description}</p>
                  <div style={{ marginTop: 16, fontSize: '0.82rem', color: 'var(--green-mid)', fontWeight: 700 }}>📍 {event.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CALL TO ACTION ── */}
      <section style={{
        background: 'linear-gradient(135deg, var(--green-mid) 0%, var(--green-deep) 100%)',
        padding: '80px 5%', textAlign: 'center',
      }}>
        <div className="container">
          <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>✝</div>
          <h2 style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', marginBottom: 16 }}>
            New Here? You're Family Already.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.82)', maxWidth: 520, margin: '0 auto 36px', lineHeight: 1.8, fontSize: '1.05rem' }}>
            Whether you're searching for faith, returning to God, or looking for a community — our doors are always open.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/about" className="btn btn-gold">Learn About Us</Link>
            <Link to="/contact" className="btn btn-outline-white">Get In Touch</Link>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
        @media(max-width: 768px) {
          .hero-sermon-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  )
}
