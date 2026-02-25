import { useState } from 'react'
import { sermons } from '../data/mockData'

export default function Sermons() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')

  const series = ['All', ...new Set(sermons.map(s => s.series))]

  const filtered = sermons.filter(s => {
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase()) ||
                        s.pastor.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'All' || s.series === filter
    return matchSearch && matchFilter
  })

  return (
    <>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--green-deep) 0%, var(--green-mid) 100%)',
        padding: 'clamp(90px,14vw,130px) 5% 60px', textAlign: 'center',
      }}>
        <span className="section-label" style={{ color: 'var(--green-light)' }}>Messages & Teachings</span>
        <h1 style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: 'clamp(2rem, 5vw, 3.2rem)', marginBottom: 16 }}>
          Sermons & Messages
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', maxWidth: 520, margin: '0 auto', lineHeight: 1.8 }}>
          Grow in faith through the preached Word. Stream, download, or share our messages.
        </p>
      </div>

      <section style={{ background: 'var(--cream)', padding: '60px 5%' }}>
        <div className="container">
          {/* Search & Filter */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 40, flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="🔍  Search sermons or pastor..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                flex: '1 1 280px', padding: '12px 18px', borderRadius: 40,
                border: '1.5px solid #ddd', fontSize: '0.95rem',
                fontFamily: 'var(--font-body)', outline: 'none',
              }}
            />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {series.map(s => (
                <button key={s} onClick={() => setFilter(s)} style={{
                  padding: '10px 20px', borderRadius: 30,
                  border: '1.5px solid',
                  borderColor: filter === s ? 'var(--green-mid)' : '#ddd',
                  background: filter === s ? 'var(--green-mid)' : 'white',
                  color: filter === s ? 'white' : 'var(--text-mid)',
                  fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.2s',
                }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: 24 }}>
            {filtered.map(sermon => (
              <div key={sermon.id} className="card">
                <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
                  <img src={sermon.thumbnail} alt={sermon.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                    onMouseEnter={e => e.target.style.transform = 'scale(1.07)'}
                    onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(26,92,42,0.7) 0%, transparent 60%)',
                    display: 'flex', alignItems: 'flex-end', padding: 14,
                  }}>
                    <span style={{ background: 'rgba(255,255,255,0.9)', color: 'var(--green-deep)', padding: '3px 12px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700 }}>
                      ⏱ {sermon.duration}
                    </span>
                  </div>
                  <div style={{ position: 'absolute', top: 12, left: 12 }}>
                    <span className="tag">{sermon.series}</span>
                  </div>
                </div>
                <div style={{ padding: '22px 24px' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginBottom: 8 }}>
                    {sermon.date} · 👁 {sermon.views.toLocaleString()} views
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--green-deep)', marginBottom: 8, lineHeight: 1.35 }}>
                    {sermon.title}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--green-mid)', fontWeight: 700, marginBottom: 10 }}>
                    📖 {sermon.scripture} — {sermon.pastor}
                  </p>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-mid)', lineHeight: 1.65, marginBottom: 18 }}>
                    {sermon.description}
                  </p>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <a href={sermon.videoUrl} target="_blank" rel="noreferrer" className="btn btn-green" style={{ padding: '9px 20px', fontSize: '0.8rem' }}>
                      ▶ Watch
                    </a>
                    <a href={sermon.audioUrl} className="btn btn-outline-green" style={{ padding: '9px 20px', fontSize: '0.8rem' }}>
                      🎧 Audio
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-light)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔍</div>
              <p>No sermons found matching your search.</p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
