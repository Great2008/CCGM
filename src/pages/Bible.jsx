import { useState, useEffect } from 'react'
import { KJV_BOOKS } from '../data/bibleData'

// Full KJV Bible — preloaded JSON (generated via: npm run fetch-bible)
// Falls back gracefully if file not yet generated
let KJV_DATA = {}
try {
  const mod = await import('../data/kjvFull.json', { assert: { type: 'json' } }).catch(() => null)
  if (mod) KJV_DATA = mod.default
} catch {}

function useStorage(key, def) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : def } catch { return def }
  })
  const save = v => { setVal(v); try { localStorage.setItem(key, JSON.stringify(v)) } catch {} }
  return [val, save]
}

const POPULAR = [
  { ref: 'John 3:16', book: 'JHN', ch: 3, v: 16 },
  { ref: 'Philippians 4:13', book: 'PHP', ch: 4, v: 13 },
  { ref: 'Jeremiah 29:11', book: 'JER', ch: 29, v: 11 },
  { ref: 'Psalm 23:1', book: 'PSA', ch: 23, v: 1 },
  { ref: 'Romans 8:28', book: 'ROM', ch: 8, v: 28 },
  { ref: 'Proverbs 3:5', book: 'PRO', ch: 3, v: 5 },
  { ref: 'Isaiah 40:31', book: 'ISA', ch: 40, v: 31 },
  { ref: 'Matthew 6:33', book: 'MAT', ch: 6, v: 33 },
  { ref: 'Psalm 119:105', book: 'PSA', ch: 119, v: 105 },
  { ref: '2 Timothy 3:16', book: '2TI', ch: 3, v: 16 },
  { ref: 'Romans 10:9', book: 'ROM', ch: 10, v: 9 },
  { ref: 'Hebrews 11:1', book: 'HEB', ch: 11, v: 1 },
]

const isPreloaded = Object.keys(KJV_DATA).length > 0

export default function Bible() {
  const OT = KJV_BOOKS.filter(b => b.testament === 'OT')
  const NT = KJV_BOOKS.filter(b => b.testament === 'NT')

  const [selBook, setSelBook] = useStorage('bible_book', KJV_BOOKS[39])
  const [selChapter, setSelChapter] = useStorage('bible_chapter', 1)
  const [verses, setVerses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState('read')
  const [fontSize, setFontSize] = useStorage('bible_fontsize', 17)
  const [bookTab, setBookTab] = useState('NT')
  const [bookOpen, setBookOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [highlightedVerse, setHighlightedVerse] = useState(null)

  useEffect(() => {
    const on = () => setIsOnline(true)
    const off = () => setIsOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  const loadChapter = (book, chapter) => {
    setLoading(true); setError(null); setVerses([])
    try {
      const bookData = KJV_DATA[book.id]
      if (bookData && bookData[chapter - 1]) {
        const chapterVerses = bookData[chapter - 1].map((text, i) => ({
          verse: i + 1,
          text: typeof text === 'string' ? text : String(text)
        }))
        setVerses(chapterVerses)
        setLoading(false)
        return
      }
      // Fallback: try localStorage cache from previous online session
      const cacheKey = `kjv_${book.id}_${chapter}`
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        setVerses(JSON.parse(cached))
        setLoading(false)
        return
      }
      // Fallback: fetch online if not preloaded
      if (!navigator.onLine) {
        setError('This chapter is not preloaded yet. Please connect to the internet to load it.')
        setLoading(false)
        return
      }
      const slug = book.name.toLowerCase().replace(/ /g, '+')
      fetch(`https://bible-api.com/${slug}+${chapter}?translation=kjv`)
        .then(r => r.json())
        .then(data => {
          const v = data.verses || []
          setVerses(v)
          try { localStorage.setItem(cacheKey, JSON.stringify(v)) } catch {}
          setLoading(false)
        })
        .catch(() => { setError('Could not load chapter. Check your connection.'); setLoading(false) })
    } catch (e) {
      setError('Error loading chapter: ' + e.message)
      setLoading(false)
    }
  }

  useEffect(() => { loadChapter(selBook, selChapter) }, [selBook.id, selChapter])

  const handleBook = book => { setSelBook(book); setSelChapter(1); setBookOpen(false); setHighlightedVerse(null) }

  const goToVerse = (bookId, ch, verseNum) => {
    const book = KJV_BOOKS.find(b => b.id === bookId)
    if (book) { setSelBook(book); setSelChapter(ch); setHighlightedVerse(verseNum); setTab('read') }
  }

  const handleSearch = e => {
    e.preventDefault()
    if (!search.trim() || !isPreloaded) return
    const q = search.toLowerCase()
    const results = []
    for (const book of KJV_BOOKS) {
      const bd = KJV_DATA[book.id]
      if (!bd) continue
      for (let ci = 0; ci < bd.length; ci++) {
        for (let vi = 0; vi < bd[ci].length; vi++) {
          const text = bd[ci][vi]
          if (typeof text === 'string' && text.toLowerCase().includes(q)) {
            results.push({ book, chapter: ci + 1, verse: vi + 1, text, reference: `${book.name} ${ci+1}:${vi+1}` })
            if (results.length >= 50) break
          }
        }
        if (results.length >= 50) break
      }
      if (results.length >= 50) break
    }
    setSearchResults(results)
  }

  const chNums = Array.from({ length: selBook.chapters }, (_, i) => i + 1)

  return (
    <>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--green-deep) 0%, var(--green-mid) 100%)', padding: '120px 5% 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, paddingBottom: 24 }}>
            <div>
              <span className="section-label" style={{ color: 'var(--green-light)' }}>King James Version</span>
              <h1 style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: 'clamp(2rem,5vw,3rem)', margin: '4px 0 8px' }}>📖 Holy Bible</h1>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ padding: '4px 14px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, background: isPreloaded ? 'rgba(74,184,102,0.25)' : 'rgba(255,200,0,0.2)', color: isPreloaded ? '#a8e6b8' : '#ffe066', border: `1px solid ${isPreloaded ? 'rgba(74,184,102,0.4)' : 'rgba(255,200,0,0.4)'}` }}>
                  {isPreloaded ? '✅ Full Bible Preloaded — 100% Offline' : '⚠️ Run: npm run fetch-bible'}
                </span>
                <span style={{ padding: '4px 14px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, background: isOnline ? 'rgba(74,184,102,0.15)' : 'rgba(255,100,100,0.2)', color: isOnline ? '#a8e6b8' : '#ffaaaa', border: '1px solid rgba(255,255,255,0.15)' }}>
                  {isOnline ? '🟢 Online' : '🔴 Offline'}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.12)', borderRadius: 30, padding: '6px 16px' }}>
              <button onClick={() => setFontSize(f => Math.max(13, f - 1))} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1rem', cursor: 'pointer' }}>A−</button>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', minWidth: 30, textAlign: 'center' }}>{fontSize}px</span>
              <button onClick={() => setFontSize(f => Math.min(24, f + 1))} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.1rem', cursor: 'pointer' }}>A+</button>
            </div>
          </div>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4 }}>
            {[['read','📖 Read'],['search','🔍 Search'],['popular','⭐ Popular']].map(([t,l]) => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '10px 22px', borderRadius: '10px 10px 0 0', border: 'none', cursor: 'pointer',
                background: tab === t ? 'var(--cream)' : 'rgba(255,255,255,0.15)',
                color: tab === t ? 'var(--green-deep)' : 'white',
                fontWeight: 700, fontSize: '0.85rem', fontFamily: 'var(--font-body)',
              }}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--cream)', minHeight: '70vh', padding: '0 5% 60px' }}>
        <div className="container">

          {/* ── READ ── */}
          {tab === 'read' && (
            <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24, paddingTop: 28 }}>
              {/* Sidebar */}
              <div>
                {/* Book dropdown */}
                <div style={{ background: 'white', borderRadius: 14, boxShadow: 'var(--shadow-sm)', overflow: 'hidden', marginBottom: 14 }}>
                  <button onClick={() => setBookOpen(o => !o)} style={{
                    width: '100%', padding: '13px 18px', background: 'var(--green-mid)', color: 'white',
                    border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)',
                    fontSize: '1rem', fontWeight: 700, textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <span>{selBook.name}</span><span style={{ fontSize: '0.7rem' }}>{bookOpen ? '▲' : '▼'}</span>
                  </button>
                  {bookOpen && (
                    <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                      <div style={{ display: 'flex', borderBottom: '1px solid #eee', position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
                        {['OT','NT'].map(t => (
                          <button key={t} onClick={() => setBookTab(t)} style={{
                            flex: 1, padding: '9px', border: 'none', cursor: 'pointer',
                            background: bookTab === t ? 'var(--green-pale)' : 'white',
                            color: bookTab === t ? 'var(--green-deep)' : 'var(--text-mid)',
                            fontWeight: 700, fontSize: '0.82rem', fontFamily: 'var(--font-body)',
                          }}>{t === 'OT' ? 'Old Testament' : 'New Testament'}</button>
                        ))}
                      </div>
                      {(bookTab === 'OT' ? OT : NT).map(book => (
                        <button key={book.id} onClick={() => handleBook(book)} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          width: '100%', padding: '9px 16px', border: 'none', cursor: 'pointer',
                          background: selBook.id === book.id ? 'var(--green-pale)' : 'white',
                          color: selBook.id === book.id ? 'var(--green-deep)' : 'var(--text-dark)',
                          fontWeight: selBook.id === book.id ? 700 : 400,
                          fontSize: '0.88rem', textAlign: 'left', fontFamily: 'var(--font-body)',
                          borderBottom: '1px solid #f5f5f5',
                        }}>
                          <span>{book.name}</span>
                          {KJV_DATA[book.id] && <span style={{ fontSize: '0.65rem', color: 'var(--green-mid)', fontWeight: 700 }}>✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Chapter grid */}
                <div style={{ background: 'white', borderRadius: 14, boxShadow: 'var(--shadow-sm)', padding: 14, marginBottom: 12 }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: 10 }}>Chapter</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 5 }}>
                    {chNums.map(n => (
                      <button key={n} onClick={() => setSelChapter(n)} style={{
                        padding: '7px 4px', borderRadius: 7, border: '1.5px solid',
                        borderColor: selChapter === n ? 'var(--green-mid)' : '#eee',
                        background: selChapter === n ? 'var(--green-mid)' : 'white',
                        color: selChapter === n ? 'white' : 'var(--text-dark)',
                        fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)',
                      }}>{n}</button>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => { if (selChapter > 1) setSelChapter(c => c - 1) }} className="btn btn-outline-green" style={{ flex: 1, padding: '9px', fontSize: '0.82rem', justifyContent: 'center' }}>← Prev</button>
                  <button onClick={() => { if (selChapter < selBook.chapters) setSelChapter(c => c + 1) }} className="btn btn-green" style={{ flex: 1, padding: '9px', fontSize: '0.82rem', justifyContent: 'center' }}>Next →</button>
                </div>
              </div>

              {/* Verses panel */}
              <div style={{ background: 'white', borderRadius: 14, boxShadow: 'var(--shadow-sm)', padding: '32px 36px', minHeight: 500 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 16, borderBottom: '2px solid var(--green-pale)' }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--green-deep)', fontSize: '1.5rem', margin: 0 }}>{selBook.name} {selChapter}</h2>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{verses.length} verses</span>
                </div>
                {loading && <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-light)' }}><div style={{ fontSize: '2rem', marginBottom: 10 }}>📖</div>Loading...</div>}
                {error && <div style={{ background: '#fff3f3', border: '1px solid #fcc', borderRadius: 10, padding: 20, color: '#c00' }}>📵 {error}</div>}
                {!loading && !error && verses.map(v => (
                  <p key={v.verse} style={{
                    fontSize: fontSize, lineHeight: 1.95, marginBottom: 10, color: 'var(--text-dark)',
                    background: highlightedVerse === v.verse ? 'var(--green-pale)' : 'transparent',
                    borderRadius: 6, padding: highlightedVerse === v.verse ? '4px 8px' : '0',
                    transition: 'background 0.3s',
                  }}>
                    <sup style={{ color: 'var(--green-mid)', fontWeight: 900, fontSize: '0.72em', marginRight: 5 }}>{v.verse}</sup>
                    {v.text}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* ── SEARCH ── */}
          {tab === 'search' && (
            <div style={{ paddingTop: 32, maxWidth: 800 }}>
              {!isPreloaded && (
                <div style={{ background: '#fff9e6', border: '1px solid #ffe066', borderRadius: 10, padding: '14px 18px', marginBottom: 20, fontSize: '0.9rem', color: '#665500' }}>
                  ⚠️ Full-text search requires the preloaded Bible. Run <code>npm run fetch-bible</code> then redeploy.
                </div>
              )}
              <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder='Search the entire KJV Bible — e.g. "grace", "love", "faith"'
                  style={{ flex: 1, padding: '13px 20px', borderRadius: 40, border: '1.5px solid #ddd', fontSize: '1rem', fontFamily: 'var(--font-body)', outline: 'none' }} />
                <button type="submit" className="btn btn-green" disabled={!isPreloaded}>🔍 Search</button>
              </form>
              {searchResults.length > 0 && (
                <div style={{ marginBottom: 12, fontSize: '0.82rem', color: 'var(--text-light)' }}>
                  Showing first {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "<strong>{search}</strong>"
                </div>
              )}
              {searchResults.map((r, i) => (
                <div key={i} onClick={() => goToVerse(r.book.id, r.chapter, r.verse)} style={{
                  background: 'white', borderRadius: 12, padding: '18px 22px', marginBottom: 12,
                  boxShadow: 'var(--shadow-sm)', borderLeft: '4px solid var(--green-mid)',
                  cursor: 'pointer', transition: 'transform 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}>
                  <div style={{ fontWeight: 700, color: 'var(--green-deep)', marginBottom: 6, fontSize: '0.88rem' }}>{r.reference}</div>
                  <p style={{ fontSize: fontSize - 1, lineHeight: 1.8, color: 'var(--text-dark)', margin: 0 }}>{r.text}</p>
                </div>
              ))}
              {searchResults.length === 0 && search && <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-light)' }}>No results found for "{search}"</div>}
            </div>
          )}

          {/* ── POPULAR ── */}
          {tab === 'popular' && (
            <div style={{ paddingTop: 32 }}>
              <p style={{ color: 'var(--text-mid)', marginBottom: 28 }}>Click any verse to jump to it in the Reader.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
                {POPULAR.map((v) => {
                  const text = KJV_DATA[v.book]?.[v.ch - 1]?.[v.v - 1] || null
                  return (
                    <div key={v.ref} onClick={() => goToVerse(v.book, v.ch, v.v)} style={{
                      background: 'white', borderRadius: 14, padding: '22px',
                      boxShadow: 'var(--shadow-sm)', borderTop: '4px solid var(--green-mid)',
                      cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)' }}>
                      <div style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)', fontSize: '1rem', fontWeight: 700, marginBottom: 10 }}>{v.ref}</div>
                      <p style={{ fontSize: fontSize - 1, lineHeight: 1.85, color: 'var(--text-dark)', fontStyle: 'italic', margin: '0 0 12px' }}>
                        {text ? `"${text}"` : <span style={{ color: 'var(--text-light)' }}>Run npm run fetch-bible to preload</span>}
                      </p>
                      <div style={{ fontSize: '0.72rem', color: 'var(--green-mid)', fontWeight: 700 }}>→ Read in context</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
