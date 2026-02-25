import { useState, useEffect } from 'react'
import { DEVOTIONALS_365, DEV_CATEGORIES } from '../data/devotionalsData'

const BOOKMARKS_KEY = 'ccogm_bookmarks'
const LAST_READ_KEY = 'ccogm_last_devotional'

function getMonthDay() {
  const d = new Date()
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[d.getMonth()]} ${d.getDate()}`
}

export default function Devotional() {
  const today = getMonthDay()
  const todayDev = DEVOTIONALS_365.find(d => d.date === today) || DEVOTIONALS_365[0]

  const [selected, setSelected] = useState(() => {
    try {
      const lastId = localStorage.getItem(LAST_READ_KEY)
      return lastId ? DEVOTIONALS_365.find(d => d.id === parseInt(lastId)) || todayDev : todayDev
    } catch { return todayDev }
  })
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [showBookmarks, setShowBookmarks] = useState(false)
  const [bookmarked, setBookmarked] = useState(() => {
    try { return JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || '[]') } catch { return [] }
  })
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const on = () => setIsOnline(true), off = () => setIsOnline(false)
    window.addEventListener('online', on); window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  useEffect(() => {
    try { localStorage.setItem(LAST_READ_KEY, selected.id) } catch {}
  }, [selected.id])

  const toggleBookmark = id => {
    const updated = bookmarked.includes(id) ? bookmarked.filter(b => b !== id) : [...bookmarked, id]
    setBookmarked(updated)
    try { localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated)) } catch {}
  }

  const filtered = DEVOTIONALS_365.filter(d => {
    const matchCat = category === 'All' || d.category === category
    const matchSearch = !search || d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.scripture.toLowerCase().includes(search.toLowerCase()) ||
      d.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
    const matchBk = showBookmarks ? bookmarked.includes(d.id) : true
    return matchCat && matchSearch && matchBk
  })

  const isToday = selected.date === today

  return (
    <>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--green-deep) 0%, var(--green-mid) 100%)', padding: '120px 5% 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, paddingBottom: 28 }}>
            <div>
              <span className="section-label" style={{ color: 'var(--green-light)' }}>Daily Bread</span>
              <h1 style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: 'clamp(2rem,5vw,3rem)', margin: '4px 0 10px' }}>🌅 Daily Devotional</h1>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ padding: '4px 14px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, background: 'rgba(74,184,102,0.25)', color: '#a8e6b8', border: '1px solid rgba(74,184,102,0.4)' }}>
                  ✅ 365 Devotionals — 100% Offline
                </span>
                <span style={{ padding: '4px 14px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, background: isOnline ? 'rgba(74,184,102,0.15)' : 'rgba(255,100,100,0.2)', color: isOnline ? '#a8e6b8' : '#ffaaaa', border: '1px solid rgba(255,255,255,0.15)' }}>
                  {isOnline ? '🟢 Online' : '🔴 Offline'}
                </span>
              </div>
            </div>
            <button onClick={() => { setSelected(todayDev); setCategory('All'); setSearch('') }} style={{
              padding: '10px 22px', borderRadius: 30, border: '1.5px solid rgba(255,255,255,0.5)',
              background: 'transparent', color: 'white', fontSize: '0.85rem', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'var(--font-body)',
            }}>📅 Today's Devotional</button>
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--cream)', padding: '0 5% 60px' }}>
        <div className="container">
          {/* Filters bar */}
          <div style={{ display: 'flex', gap: 10, paddingTop: 24, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="🔍 Search devotionals, scriptures, tags..."
              style={{ flex: '1 1 220px', padding: '9px 16px', borderRadius: 30, border: '1.5px solid #ddd', fontSize: '0.88rem', fontFamily: 'var(--font-body)', outline: 'none' }} />
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {DEV_CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)} style={{
                  padding: '7px 16px', borderRadius: 30, border: '1.5px solid',
                  borderColor: category === cat ? 'var(--green-mid)' : '#ddd',
                  background: category === cat ? 'var(--green-mid)' : 'white',
                  color: category === cat ? 'white' : 'var(--text-mid)',
                  fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                }}>{cat}</button>
              ))}
            </div>
            <button onClick={() => setShowBookmarks(b => !b)} style={{
              padding: '7px 16px', borderRadius: 30, border: '1.5px solid',
              borderColor: showBookmarks ? 'var(--gold)' : '#ddd',
              background: showBookmarks ? 'var(--gold)' : 'white',
              color: showBookmarks ? 'var(--green-deep)' : 'var(--text-mid)',
              fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
            }}>⭐ {bookmarked.length}</button>
          </div>

          <div className="dev-layout" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 22 }}>
            {/* Sidebar list */}
            <div style={{ maxHeight: 680, overflowY: 'auto', paddingRight: 4 }}>
              {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-light)', fontSize: '0.88rem' }}>
                  {showBookmarks ? 'No bookmarks yet.' : 'No results found.'}
                </div>
              )}
              {filtered.map(d => (
                <div key={d.id} onClick={() => setSelected(d)} style={{
                  background: selected?.id === d.id ? 'var(--green-deep)' : 'white',
                  color: selected?.id === d.id ? 'white' : 'var(--text-dark)',
                  borderRadius: 11, padding: '12px 14px', cursor: 'pointer', marginBottom: 8,
                  boxShadow: 'var(--shadow-sm)', transition: 'all 0.18s',
                  borderLeft: `4px solid ${selected?.id === d.id ? 'var(--gold)' : d.date === today ? 'var(--green-light)' : 'transparent'}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.7rem', opacity: 0.65 }}>{d.date}</span>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      {d.date === today && <span style={{ fontSize: '0.6rem', background: 'var(--green-light)', color: 'var(--green-deep)', padding: '1px 7px', borderRadius: 10, fontWeight: 900 }}>TODAY</span>}
                      {bookmarked.includes(d.id) && <span style={{ fontSize: '0.8rem' }}>⭐</span>}
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.88rem', fontWeight: 700, lineHeight: 1.3, marginBottom: 3 }}>{d.title}</div>
                  <div style={{ fontSize: '0.72rem', opacity: 0.65 }}>{d.scripture}</div>
                </div>
              ))}
            </div>

            {/* Detail pane */}
            {selected && (
              <div style={{ background: 'white', borderRadius: 16, boxShadow: 'var(--shadow-md)', overflow: 'hidden', alignSelf: 'start' }}>
                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg, var(--green-deep), var(--green-mid))', padding: '28px 32px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
                        {selected.date}{isToday ? " · Today's Devotional" : ''} · {selected.category}
                      </div>
                      <h2 style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: 'clamp(1.3rem,3vw,1.8rem)', margin: '0 0 6px' }}>{selected.title}</h2>
                      <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)' }}>By {selected.author}</div>
                    </div>
                    <button onClick={() => toggleBookmark(selected.id)} style={{
                      background: bookmarked.includes(selected.id) ? 'var(--gold)' : 'rgba(255,255,255,0.15)',
                      border: 'none', borderRadius: 30, padding: '8px 18px', cursor: 'pointer',
                      color: bookmarked.includes(selected.id) ? 'var(--green-deep)' : 'white',
                      fontSize: '0.82rem', fontWeight: 700, fontFamily: 'var(--font-body)',
                      flexShrink: 0,
                    }}>{bookmarked.includes(selected.id) ? '⭐ Saved' : '☆ Save'}</button>
                  </div>
                  {/* Scripture */}
                  <div style={{ marginTop: 20, background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '16px 20px' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 6 }}>📖 {selected.scripture}</div>
                    <p style={{ color: 'white', fontStyle: 'italic', lineHeight: 1.8, fontSize: '0.95rem', margin: 0 }}>"{selected.scriptureText}"</p>
                  </div>
                </div>

                {/* Body */}
                <div style={{ padding: '28px 32px' }}>
                  {selected.body.split('\n\n').map((para, i) => (
                    <p key={i} style={{ lineHeight: 1.9, color: 'var(--text-dark)', marginBottom: 18, fontSize: '0.97rem' }}>
                      {para.split('**').map((chunk, j) =>
                        j % 2 === 1
                          ? <strong key={j} style={{ color: 'var(--green-deep)' }}>{chunk}</strong>
                          : chunk
                      )}
                    </p>
                  ))}

                  {/* Tags */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--green-pale)', alignItems: 'center' }}>
                    {selected.tags?.map(tag => <span key={tag} className="tag">#{tag}</span>)}
                    <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--green-mid)', fontWeight: 700 }}>✅ Available Offline</span>
                  </div>

                  {/* Navigation */}
                  <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                    <button onClick={() => { const idx = DEVOTIONALS_365.findIndex(d => d.id === selected.id); if (idx > 0) setSelected(DEVOTIONALS_365[idx - 1]) }} className="btn btn-outline-green" style={{ flex: 1, justifyContent: 'center', padding: '10px', fontSize: '0.82rem' }}>← Previous</button>
                    <button onClick={() => { const idx = DEVOTIONALS_365.findIndex(d => d.id === selected.id); if (idx < DEVOTIONALS_365.length - 1) setSelected(DEVOTIONALS_365[idx + 1]) }} className="btn btn-green" style={{ flex: 1, justifyContent: 'center', padding: '10px', fontSize: '0.82rem' }}>Next Day →</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
      <style>{`
        @media(max-width:768px){
          .dev-layout{flex-direction:column!important;}
          .dev-sidebar{max-height:260px;overflow-y:auto;flex-shrink:0;}
          .dev-content{width:100%!important;}
        }
      `}</style>
  )
}
