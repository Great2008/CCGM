import { useState, useRef, useEffect } from 'react'
import { HYMNS, HYMN_CATEGORIES } from '../data/hymnData'

export default function Hymnal() {
  const [category, setCategory] = useState('All')
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [fontSize, setFontSize] = useState(16)
  const audioRef = useRef(null)

  const filtered = HYMNS.filter(h => {
    const matchCat = category === 'All' || h.category === category
    const matchSearch = h.title.toLowerCase().includes(search.toLowerCase()) ||
                        h.author.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const selectHymn = (hymn) => {
    setSelected(hymn)
    setPlaying(false)
    setProgress(0)
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0 }
  }

  const togglePlay = () => {
    if (!audioRef.current) return
    if (playing) { audioRef.current.pause(); setPlaying(false) }
    else { audioRef.current.play(); setPlaying(true) }
  }

  const handleTimeUpdate = () => {
    if (!audioRef.current) return
    setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100 || 0)
  }

  const handleSeek = (e) => {
    if (!audioRef.current) return
    const pct = e.nativeEvent.offsetX / e.currentTarget.offsetWidth
    audioRef.current.currentTime = pct * audioRef.current.duration
  }

  const fmt = (s) => `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`

  return (
    <>
      <div style={{
        background: 'linear-gradient(135deg, var(--green-deep) 0%, var(--green-mid) 100%)',
        padding: '120px 5% 40px',
      }}>
        <div className="container">
          <span className="section-label" style={{ color: 'var(--green-light)' }}>Worship & Praise</span>
          <h1 style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: 'clamp(2rem, 5vw, 3rem)', margin: '4px 0 20px' }}>
            🎵 Hymnal
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', maxWidth: 480, lineHeight: 1.7, marginBottom: 28 }}>
            Classic hymns of faith — lyrics and audio available offline.
          </p>

          {/* Search */}
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍  Search hymns or authors..."
            style={{
              width: '100%', maxWidth: 480, padding: '12px 20px', borderRadius: 40,
              border: 'none', fontSize: '0.95rem', fontFamily: 'var(--font-body)', outline: 'none',
              background: 'rgba(255,255,255,0.15)', color: 'white',
            }} />
        </div>
      </div>

      <div style={{ background: 'var(--cream)', padding: '0 5% 60px' }}>
        <div className="container">
          {/* Category filters */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 28, marginBottom: 28 }}>
            {HYMN_CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)} style={{
                padding: '8px 20px', borderRadius: 30, border: '1.5px solid',
                borderColor: category === cat ? 'var(--green-mid)' : '#ddd',
                background: category === cat ? 'var(--green-mid)' : 'white',
                color: category === cat ? 'white' : 'var(--text-mid)',
                fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
              }}>{cat}</button>
            ))}
          </div>

          <div className="hymnal-layout" style={{ display: 'grid', gridTemplateColumns: selected ? '320px 1fr' : '1fr', gap: 24 }}>

            {/* Hymn list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filtered.map(hymn => (
                <div key={hymn.id} onClick={() => selectHymn(hymn)} style={{
                  background: selected?.id === hymn.id ? 'var(--green-deep)' : 'white',
                  color: selected?.id === hymn.id ? 'white' : 'var(--text-dark)',
                  borderRadius: 12, padding: '16px 20px', cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  borderLeft: `4px solid ${selected?.id === hymn.id ? 'var(--gold)' : 'var(--green-mid)'}`,
                  transition: 'all 0.2s',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: 4 }}>
                        {selected?.id === hymn.id ? '▶ ' : ''}{hymn.title}
                      </div>
                      <div style={{ fontSize: '0.78rem', opacity: 0.7 }}>{hymn.author}</div>
                    </div>
                    <span style={{
                      fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em',
                      padding: '3px 10px', borderRadius: 20,
                      background: selected?.id === hymn.id ? 'rgba(255,255,255,0.2)' : 'var(--green-pale)',
                      color: selected?.id === hymn.id ? 'white' : 'var(--green-deep)',
                    }}>{hymn.category}</span>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-light)' }}>
                  No hymns found matching "{search}"
                </div>
              )}
            </div>

            {/* Hymn detail */}
            {selected && (
              <div style={{ background: 'white', borderRadius: 16, boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg, var(--green-deep), var(--green-mid))', padding: '28px 32px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <h2 style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: '1.6rem', margin: '0 0 6px' }}>{selected.title}</h2>
                      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.88rem' }}>{selected.author}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button onClick={() => setFontSize(f => Math.max(13, f-1))} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: '0.85rem' }}>A−</button>
                      <button onClick={() => setFontSize(f => Math.min(22, f+1))} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: '0.95rem' }}>A+</button>
                    </div>
                  </div>

                  {/* Audio player */}
                  <div style={{ marginTop: 20, background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: '14px 18px' }}>
                    <audio ref={audioRef} src={selected.audioUrl}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
                      onEnded={() => setPlaying(false)} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <button onClick={togglePlay} style={{
                        width: 44, height: 44, borderRadius: '50%', border: 'none', cursor: 'pointer',
                        background: 'var(--gold)', color: 'var(--green-deep)',
                        fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {playing ? '⏸' : '▶'}
                      </button>
                      <div style={{ flex: 1 }}>
                        <div onClick={handleSeek} style={{
                          height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 4, cursor: 'pointer', marginBottom: 6,
                        }}>
                          <div style={{ height: '100%', width: `${progress}%`, background: 'var(--gold)', borderRadius: 4, transition: 'width 0.2s' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>
                          <span>{fmt(audioRef.current?.currentTime || 0)}</span>
                          <span>🎵 Audio playback</span>
                          <span>{fmt(duration)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lyrics */}
                <div style={{ padding: '28px 32px', maxHeight: 520, overflowY: 'auto' }}>
                  {selected.verses.map(verse => (
                    <div key={verse.number} style={{ marginBottom: 28 }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--green-mid)', marginBottom: 8 }}>
                        Verse {verse.number}
                      </div>
                      <p style={{ fontSize: fontSize, lineHeight: 2, color: 'var(--text-dark)', whiteSpace: 'pre-line', fontStyle: 'italic' }}>
                        {verse.text}
                      </p>
                    </div>
                  ))}
                  {selected.chorus && (
                    <div style={{ background: 'var(--green-pale)', borderRadius: 10, padding: '18px 22px', borderLeft: '4px solid var(--gold)' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>
                        Chorus
                      </div>
                      <p style={{ fontSize: fontSize, lineHeight: 2, color: 'var(--green-deep)', whiteSpace: 'pre-line', fontWeight: 700, fontStyle: 'italic' }}>
                        {selected.chorus}
                      </p>
                    </div>
                  )}
                  <div style={{ marginTop: 24, padding: '12px 16px', background: '#f8f8f8', borderRadius: 8, fontSize: '0.78rem', color: 'var(--text-light)' }}>
                    ✅ Lyrics available offline · 🎵 Audio streams when online
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @media(max-width:768px){
          .hymnal-layout{grid-template-columns:1fr!important;}
        }
      `}</style>
    </>
  )
}
