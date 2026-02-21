import { useState, useEffect, useRef } from 'react'
import { KJV_BOOKS, BOOK_SLUG, POPULAR_VERSES } from '../data/bibleData'

const CACHE_PREFIX = 'kjv_'
const API = 'https://bible-api.com'

function useOfflineStorage(key, defaultVal) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : defaultVal } catch { return defaultVal }
  })
  const save = (v) => { setVal(v); try { localStorage.setItem(key, JSON.stringify(v)) } catch {} }
  return [val, save]
}

export default function Bible() {
  const OT = KJV_BOOKS.filter(b => b.testament === 'OT')
  const NT = KJV_BOOKS.filter(b => b.testament === 'NT')

  const [selectedBook, setSelectedBook] = useOfflineStorage('bible_book', KJV_BOOKS[39]) // Matthew
  const [selectedChapter, setSelectedChapter] = useOfflineStorage('bible_chapter', 1)
  const [verses, setVerses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [tab, setTab] = useState('read') // 'read' | 'search' | 'popular'
  const [fontSize, setFontSize] = useOfflineStorage('bible_fontsize', 17)
  const [bookTab, setBookTab] = useState('NT')
  const [bookOpen, setBookOpen] = useState(false)
  const searchRef = useRef()

  useEffect(() => {
    const on = () => setIsOnline(true)
    const off = () => setIsOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  const cacheKey = `${CACHE_PREFIX}${selectedBook.id}_${selectedChapter}`

  const fetchChapter = async (book, chapter) => {
    setLoading(true); setError(null); setVerses([])
    const key = `${CACHE_PREFIX}${book.id}_${chapter}`
    // Try cache first
    try {
      const cached = localStorage.getItem(key)
      if (cached) { setVerses(JSON.parse(cached)); setLoading(false); return }
    } catch {}
    if (!navigator.onLine) {
      setError('You are offline. This chapter has not been cached yet. Please connect to the internet to load it.'); setLoading(false); return
    }
    try {
      const slug = BOOK_SLUG[book.id]
      const res = await fetch(`${API}/${slug}+${chapter}?translation=kjv`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      const v = data.verses || []
      setVerses(v)
      try { localStorage.setItem(key, JSON.stringify(v)) } catch {}
    } catch (e) {
      setError('Could not load chapter. Check your connection.')
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchChapter(selectedBook, selectedChapter) }, [selectedBook.id, selectedChapter])

  const handleBook = (book) => { setSelectedBook(book); setSelectedChapter(1); setBookOpen(false) }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!search.trim()) return
    if (!navigator.onLine) { setSearchResults([{ text: 'Search requires an internet connection.', reference: '' }]); return }
    setSearchLoading(true)
    try {
      const res = await fetch(`${API}/${encodeURIComponent(search)}?translation=kjv`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setSearchResults(data.verses || [])
    } catch { setSearchResults([]) }
    finally { setSearchLoading(false) }
  }

  const chapterNums = Array.from({ length: selectedBook.chapters }, (_, i) => i + 1)

  return (
    <>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--green-deep) 0%, var(--green-mid) 100%)',
        padding: '120px 5% 40px',
      }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <span className="section-label" style={{ color: 'var(--green-light)' }}>King James Version</span>
              <h1 style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: 'clamp(2rem, 5vw, 3rem)', margin: '4px 0 0' }}>
                📖 Holy Bible
              </h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                padding: '5px 14px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700,
                background: isOnline ? 'rgba(74,184,102,0.25)' : 'rgba(255,100,100,0.25)',
                color: isOnline ? '#a8e6b8' : '#ffaaaa',
                border: `1px solid ${isOnline ? 'rgba(74,184,102,0.4)' : 'rgba(255,100,100,0.4)'}`,
              }}>
                {isOnline ? '🟢 Online' : '🔴 Offline'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.12)', borderRadius: 30, padding: '6px 14px' }}>
                <button onClick={() => setFontSize(f => Math.max(13, f - 1))} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1rem', cursor: 'pointer' }}>A−</button>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>{fontSize}px</span>
                <button onClick={() => setFontSize(f => Math.min(24, f + 1))} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.1rem', cursor: 'pointer' }}>A+</button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginTop: 24 }}>
            {[['read','📖 Read'],['search','🔍 Search'],['popular','⭐ Popular']].map(([t,l]) => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '9px 20px', borderRadius: '10px 10px 0 0', border: 'none', cursor: 'pointer',
                background: tab === t ? 'white' : 'rgba(255,255,255,0.15)',
                color: tab === t ? 'var(--green-deep)' : 'white',
                fontWeight: 700, fontSize: '0.85rem', fontFamily: 'var(--font-body)',
              }}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--cream)', minHeight: '70vh', padding: '0 5% 60px' }}>
        <div className="container">

          {/* ── READ TAB ── */}
          {tab === 'read' && (
            <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24, paddingTop: 32 }}>

              {/* Sidebar */}
              <div>
                {/* Book selector */}
                <div style={{ background: 'white', borderRadius: 14, boxShadow: 'var(--shadow-sm)', overflow: 'hidden', marginBottom: 16 }}>
                  <button onClick={() => setBookOpen(o => !o)} style={{
                    width: '100%', padding: '14px 18px', background: 'var(--green-mid)', color: 'white',
                    border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)',
                    fontSize: '1rem', fontWeight: 700, textAlign: 'left', display: 'flex', justifyContent: 'space-between',
                  }}>
                    <span>{selectedBook.name}</span>
                    <span>{bookOpen ? '▲' : '▼'}</span>
                  </button>
                  {bookOpen && (
                    <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                      <div style={{ display: 'flex', borderBottom: '1px solid #eee' }}>
                        {['OT','NT'].map(t => (
                          <button key={t} onClick={() => setBookTab(t)} style={{
                            flex: 1, padding: '10px', border: 'none', cursor: 'pointer',
                            background: bookTab === t ? 'var(--green-pale)' : 'white',
                            color: bookTab === t ? 'var(--green-deep)' : 'var(--text-mid)',
                            fontWeight: 700, fontSize: '0.82rem', fontFamily: 'var(--font-body)',
                          }}>{t === 'OT' ? 'Old Testament' : 'New Testament'}</button>
                        ))}
                      </div>
                      {(bookTab === 'OT' ? OT : NT).map(book => (
                        <button key={book.id} onClick={() => handleBook(book)} style={{
                          display: 'block', width: '100%', padding: '9px 16px', border: 'none', cursor: 'pointer',
                          background: selectedBook.id === book.id ? 'var(--green-pale)' : 'white',
                          color: selectedBook.id === book.id ? 'var(--green-deep)' : 'var(--text-dark)',
                          fontWeight: selectedBook.id === book.id ? 700 : 400,
                          fontSize: '0.88rem', textAlign: 'left', fontFamily: 'var(--font-body)',
                          borderBottom: '1px solid #f5f5f5',
                        }}>{book.name}</button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Chapter grid */}
                <div style={{ background: 'white', borderRadius: 14, boxShadow: 'var(--shadow-sm)', padding: 16 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: 10 }}>Chapter</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
                    {chapterNums.map(n => (
                      <button key={n} onClick={() => setSelectedChapter(n)} style={{
                        padding: '8px 4px', borderRadius: 8, border: '1.5px solid',
                        borderColor: selectedChapter === n ? 'var(--green-mid)' : '#eee',
                        background: selectedChapter === n ? 'var(--green-mid)' : 'white',
                        color: selectedChapter === n ? 'white' : 'var(--text-dark)',
                        fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                        fontFamily: 'var(--font-body)', transition: 'all 0.15s',
                      }}>{n}</button>
                    ))}
                  </div>
                </div>

                {/* Prev/Next */}
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button onClick={() => { if (selectedChapter > 1) setSelectedChapter(c => c - 1) }} className="btn btn-outline-green" style={{ flex: 1, padding: '10px', fontSize: '0.82rem', justifyContent: 'center' }}>← Prev</button>
                  <button onClick={() => { if (selectedChapter < selectedBook.chapters) setSelectedChapter(c => c + 1) }} className="btn btn-green" style={{ flex: 1, padding: '10px', fontSize: '0.82rem', justifyContent: 'center' }}>Next →</button>
                </div>
              </div>

              {/* Verses */}
              <div style={{ background: 'white', borderRadius: 14, boxShadow: 'var(--shadow-sm)', padding: '32px 36px', minHeight: 500 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--green-deep)', fontSize: '1.5rem', marginBottom: 24, paddingBottom: 16, borderBottom: '2px solid var(--green-pale)' }}>
                  {selectedBook.name} {selectedChapter}
                </h2>
                {loading && (
                  <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-light)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: 12, animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</div>
                    <p>Loading chapter...</p>
                  </div>
                )}
                {error && (
                  <div style={{ background: '#fff3f3', border: '1px solid #fcc', borderRadius: 10, padding: 20, color: '#c00' }}>
                    📵 {error}
                  </div>
                )}
                {!loading && !error && verses.map(v => (
                  <p key={v.verse} style={{ fontSize: fontSize, lineHeight: 1.9, marginBottom: 14, color: 'var(--text-dark)' }}>
                    <sup style={{ color: 'var(--green-mid)', fontWeight: 900, fontSize: '0.75em', marginRight: 4 }}>{v.verse}</sup>
                    {v.text}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* ── SEARCH TAB ── */}
          {tab === 'search' && (
            <div style={{ paddingTop: 32, maxWidth: 760 }}>
              <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
                <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)}
                  placeholder='Search e.g. "John 3:16" or "faith"'
                  style={{ flex: 1, padding: '13px 18px', borderRadius: 40, border: '1.5px solid #ddd', fontSize: '1rem', fontFamily: 'var(--font-body)', outline: 'none' }} />
                <button type="submit" className="btn btn-green" disabled={searchLoading}>
                  {searchLoading ? '⏳' : '🔍 Search'}
                </button>
              </form>
              {searchResults.map((v, i) => (
                <div key={i} style={{ background: 'white', borderRadius: 12, padding: '20px 24px', marginBottom: 14, boxShadow: 'var(--shadow-sm)', borderLeft: '4px solid var(--green-mid)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--green-deep)', marginBottom: 8, fontSize: '0.9rem' }}>{v.reference}</div>
                  <p style={{ fontSize: fontSize, lineHeight: 1.8, color: 'var(--text-dark)' }}>{v.text}</p>
                </div>
              ))}
            </div>
          )}

          {/* ── POPULAR TAB ── */}
          {tab === 'popular' && (
            <div style={{ paddingTop: 32 }}>
              <p style={{ color: 'var(--text-mid)', marginBottom: 28, fontSize: '1rem' }}>
                These verses are pre-cached and available <strong>offline</strong> anytime. ✅
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                {POPULAR_VERSES.map((v, i) => (
                  <div key={i} style={{
                    background: 'white', borderRadius: 14, padding: '24px',
                    boxShadow: 'var(--shadow-sm)', borderTop: '4px solid var(--green-mid)',
                    display: 'flex', flexDirection: 'column', gap: 12,
                  }}>
                    <div style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)', fontSize: '1.1rem', fontWeight: 700 }}>{v.ref}</div>
                    <p style={{ fontSize: fontSize, lineHeight: 1.85, color: 'var(--text-dark)', fontStyle: 'italic', flex: 1 }}>"{v.text}"</p>
                    <div style={{ fontSize: '0.78rem', color: 'var(--green-mid)', fontWeight: 700 }}>— King James Version ✅ Offline</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </>
  )
}
