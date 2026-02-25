import { useState } from 'react'
import { events } from '../data/mockData'

export default function Events() {
  const [filter, setFilter] = useState('All')
  const categories = ['All', ...new Set(events.map(e => e.category))]
  const filtered = filter === 'All' ? events : events.filter(e => e.category === filter)

  return (
    <>
      <div style={{
        background: 'linear-gradient(135deg, var(--green-deep) 0%, var(--green-mid) 100%)',
        padding: 'clamp(90px,14vw,130px) 5% 60px', textAlign: 'center',
      }}>
        <span className="section-label" style={{ color: 'var(--green-light)' }}>Stay Connected</span>
        <h1 style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: 'clamp(2rem, 5vw, 3.2rem)', marginBottom: 16 }}>
          Events & Gatherings
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', maxWidth: 520, margin: '0 auto', lineHeight: 1.8 }}>
          Join us for worship services, community events, and special gatherings throughout the year.
        </p>
      </div>

      <section style={{ background: 'var(--cream)', padding: '60px 5%' }}>
        <div className="container">
          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 40, flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setFilter(cat)} style={{
                padding: '9px 22px', borderRadius: 30,
                border: '1.5px solid', borderColor: filter === cat ? 'var(--green-mid)' : '#ddd',
                background: filter === cat ? 'var(--green-mid)' : 'white',
                color: filter === cat ? 'white' : 'var(--text-mid)',
                fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
              }}>
                {cat}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: 26 }}>
            {filtered.map(event => (
              <div key={event.id} className="card">
                <div style={{ position: 'relative', height: 210, overflow: 'hidden' }}>
                  <img src={event.image} alt={event.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                    onMouseEnter={e => e.target.style.transform = 'scale(1.07)'}
                    onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
                  <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
                    <span className="tag">{event.category}</span>
                    {event.recurring && (
                      <span style={{ background: 'var(--gold)', color: 'var(--green-deep)', padding: '4px 10px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700 }}>
                        Recurring
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ padding: '24px' }}>
                  {/* Date block */}
                  <div style={{
                    display: 'inline-flex', gap: 16, alignItems: 'center',
                    background: 'var(--green-pale)', borderRadius: 8,
                    padding: '8px 14px', marginBottom: 14, fontSize: '0.82rem', color: 'var(--green-deep)',
                  }}>
                    <span>📅 {event.date}</span>
                    <span>⏰ {event.time}</span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--green-deep)', marginBottom: 10 }}>
                    {event.title}
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-mid)', lineHeight: 1.65, marginBottom: 14 }}>
                    {event.description}
                  </p>
                  <div style={{ fontSize: '0.82rem', color: 'var(--green-mid)', fontWeight: 700 }}>
                    📍 {event.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
