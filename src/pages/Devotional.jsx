import { useState, useEffect } from 'react'

const CACHE_KEY = 'ccogm_devotionals'
const SYNCED_KEY = 'ccogm_devotionals_synced'

// Pre-loaded seed devotionals (always available offline)
const SEED_DEVOTIONALS = [
  {
    id: 1, date: '2025-02-21', title: 'God First in Everything',
    scripture: 'Matthew 6:33', scriptureText: 'But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.',
    author: 'Pastor John Mensah', category: 'Faith',
    body: `Today\'s devotional reminds us of the foundational principle our church is built upon: God First.\n\nIt is so easy to let the worries of life crowd out the voice of God. We wake up and immediately check our phones, plan our schedules, and think about our problems — before we have spent even a moment in the presence of the Lord.\n\nBut Jesus gives us a beautiful promise in Matthew 6:33. He says when we prioritize the Kingdom of God — His reign, His righteousness, His will — all the things we worry about will be taken care of. This is not passivity; it is proper order.\n\n**Reflection:** What are you seeking first today? Make a conscious decision to begin every morning with prayer, scripture, and surrender before you open your calendar or your inbox.\n\n**Prayer:** Lord, I choose to put You first today. Before my plans, my worries, and my ambitions — I seek Your Kingdom. Order my steps and provide for every need as You have promised. Amen.`,
    tags: ['Priority', 'Trust', 'Kingdom'],
  },
  {
    id: 2, date: '2025-02-20', title: 'The Peace That Passes Understanding',
    scripture: 'Philippians 4:6-7', scriptureText: 'Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God. And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.',
    author: 'Pastor Sarah Boateng', category: 'Peace',
    body: `In a world filled with anxiety and uncertainty, the Apostle Paul wrote some of the most radical words ever penned: "Be careful for nothing" — meaning, be anxious about nothing.\n\nThis wasn\'t wishful thinking. Paul wrote these words from prison. He had every human reason to worry. Yet he discovered a supernatural secret: the exchange of anxiety for peace happens through prayer and thanksgiving.\n\nWhen we bring our burdens to God — not with complaints but with thanksgiving for who He is — something miraculous happens. His peace, which the human mind cannot fully comprehend or manufacture, stands guard over our hearts like a sentinel.\n\n**Reflection:** What anxiety are you carrying today that you haven\'t fully surrendered to God in prayer?\n\n**Prayer:** Father, I release every worry to You right now. I trust in Your faithfulness. Guard my heart and mind with Your supernatural peace today. Amen.`,
    tags: ['Peace', 'Prayer', 'Anxiety'],
  },
  {
    id: 3, date: '2025-02-19', title: 'Renewed Strength for the Weary',
    scripture: 'Isaiah 40:31', scriptureText: 'But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.',
    author: 'Deacon Kwame Asante', category: 'Strength',
    body: `Are you tired today? Spiritually drained? Running on empty? Isaiah 40:31 is your promise for this very moment.\n\nThe Hebrew word for "wait" here is "qavah" — it means to bind together, to twist, like strands of a rope becoming stronger. Waiting on God is not passive resignation; it is active trust that intertwines our weakness with His strength.\n\nGod promises three increasing levels of renewal: mounting up like eagles (supernatural lift above circumstances), running without weariness (sustained energy for the journey), and walking without fainting (faithful endurance for the long haul of life).\n\nWhatever season you are in, God\'s strength is available. But it comes to those who wait — those who choose to trust Him instead of striving in their own power.\n\n**Reflection:** Are you striving or waiting? Ask God to renew your strength today.\n\n**Prayer:** Lord, I am weary. I choose to wait on You. Renew my strength from the inside out. Let me soar above every circumstance by Your Spirit. Amen.`,
    tags: ['Strength', 'Waiting', 'Renewal'],
  },
  {
    id: 4, date: '2025-02-18', title: 'Walking by Faith, Not by Sight',
    scripture: '2 Corinthians 5:7', scriptureText: 'For we walk by faith, not by sight.',
    author: 'Pastor John Mensah', category: 'Faith',
    body: `Eight simple words that carry the entire weight of the Christian life: "For we walk by faith, not by sight."\n\nFaith is not the absence of doubt — it is the choice to trust God despite doubt. It is not pretending circumstances don\'t exist; it is believing that God is greater than any circumstance.\n\nAbraham left his homeland not knowing where he was going — walking by faith. Moses led a nation into an unknown wilderness — walking by faith. The disciples left their nets — walking by faith. And God honored every step.\n\nToday, you may not see how your situation will resolve. You may not understand why you\'re in the valley. But faith says: God has a plan, His Word is true, and the step in front of me is enough.\n\n**Reflection:** What step of faith is God asking you to take today that requires trusting Him without seeing the full picture?\n\n**Prayer:** Lord, I choose to walk by faith today. Where I cannot see, I trust. Where I do not understand, I lean on Your wisdom. Lead me step by step. Amen.`,
    tags: ['Faith', 'Trust', 'Courage'],
  },
  {
    id: 5, date: '2025-02-17', title: 'The Lord Is My Shepherd',
    scripture: 'Psalm 23:1', scriptureText: 'The LORD is my shepherd; I shall not want.',
    author: 'Sis. Grace Osei', category: 'Provision',
    body: `David, the shepherd king, opens Psalm 23 with one of the most comforting declarations in all of Scripture. He doesn\'t say "The Lord is a shepherd." He says "The Lord is MY shepherd."\n\nThis is personal. Intimate. A relationship, not a religion.\n\nA shepherd knows every sheep by name. He leads, he protects, he tends wounds, he searches for the lost. And because the Lord is YOUR shepherd, He knows your name, your need, your fear, your dream.\n\n"I shall not want" does not mean we will have everything we desire — it means we will lack nothing we truly need. Under His care, we are fully provided for.\n\nNo matter what you are facing today — financial pressure, relational strain, physical weakness — you have a Shepherd who is present, attentive, and more than able to meet every need.\n\n**Reflection:** How does seeing God as your personal shepherd change how you approach your needs today?\n\n**Prayer:** Lord, You are my Shepherd. I choose to rest in Your care. I trust that under Your watch, I lack nothing. Quiet my heart to follow Your lead. Amen.`,
    tags: ['Provision', 'Trust', 'Psalm'],
  },
  {
    id: 6, date: '2025-02-16', title: 'Gratitude as a Way of Life',
    scripture: '1 Thessalonians 5:18', scriptureText: 'In every thing give thanks: for this is the will of God in Christ Jesus concerning you.',
    author: 'Pastor Sarah Boateng', category: 'Gratitude',
    body: `Notice that Paul doesn\'t say "give thanks FOR everything" — as if every painful thing is inherently good. He says give thanks "IN everything." There is a profound difference.\n\nGratitude is not denial of difficulty. It is the spiritual discipline of finding God\'s faithfulness in the middle of it.\n\nScience has confirmed what Scripture has always taught: gratitude rewires the brain, reduces anxiety, and increases resilience. But more importantly, gratitude is described here as the will of God. It is not optional. It is the atmosphere of the Christian life.\n\nEvery morning, before your feet hit the floor, name three things you are grateful to God for. Do it for 30 days and watch how your perspective transforms.\n\n**Reflection:** What three things are you genuinely grateful for right now — even in the middle of your difficulties?\n\n**Prayer:** Father, I choose gratitude today. Thank You for life, for breath, for salvation, for presence. You are good, and Your mercies are new every morning. Amen.`,
    tags: ['Gratitude', 'Thankfulness', 'Discipline'],
  },
]

function getToday() {
  return new Date().toISOString().split('T')[0]
}

export default function Devotional() {
  const [devotionals, setDevotionals] = useState(SEED_DEVOTIONALS)
  const [selected, setSelected] = useState(SEED_DEVOTIONALS[0])
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [syncing, setSyncing] = useState(false)
  const [lastSynced, setLastSynced] = useState(() => localStorage.getItem(SYNCED_KEY) || null)
  const [category, setCategory] = useState('All')
  const [bookmarked, setBookmarked] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ccogm_bookmarks') || '[]') } catch { return [] }
  })
  const [showBookmarks, setShowBookmarks] = useState(false)

  useEffect(() => {
    const on = () => setIsOnline(true)
    const off = () => setIsOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    // Load cached devotionals
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (parsed.length > 0) setDevotionals(parsed)
      }
    } catch {}
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  // Sync from API when online
  const syncDevotionals = async () => {
    if (!navigator.onLine) return
    setSyncing(true)
    try {
      // In production: const res = await fetch('/api/blog?type=devotional')
      // For now we simulate a sync with extended seed data
      await new Promise(r => setTimeout(r, 1200))
      const synced = [...SEED_DEVOTIONALS]
      setDevotionals(synced)
      localStorage.setItem(CACHE_KEY, JSON.stringify(synced))
      const now = new Date().toLocaleString()
      setLastSynced(now)
      localStorage.setItem(SYNCED_KEY, now)
    } catch {}
    finally { setSyncing(false) }
  }

  useEffect(() => { if (isOnline) syncDevotionals() }, [isOnline])

  const toggleBookmark = (id) => {
    const updated = bookmarked.includes(id) ? bookmarked.filter(b => b !== id) : [...bookmarked, id]
    setBookmarked(updated)
    localStorage.setItem('ccogm_bookmarks', JSON.stringify(updated))
  }

  const categories = ['All', ...new Set(devotionals.map(d => d.category))]
  const display = devotionals.filter(d => {
    const matchCat = category === 'All' || d.category === category
    const matchBk = showBookmarks ? bookmarked.includes(d.id) : true
    return matchCat && matchBk
  })

  const isToday = selected?.date === getToday()

  return (
    <>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--green-deep) 0%, var(--green-mid) 100%)',
        padding: '120px 5% 40px',
      }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <span className="section-label" style={{ color: 'var(--green-light)' }}>Daily Bread</span>
              <h1 style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: 'clamp(2rem, 5vw, 3rem)', margin: '4px 0 0' }}>
                🌅 Daily Devotional
              </h1>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{
                padding: '5px 14px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700,
                background: isOnline ? 'rgba(74,184,102,0.25)' : 'rgba(255,100,100,0.25)',
                color: isOnline ? '#a8e6b8' : '#ffaaaa',
                border: `1px solid ${isOnline ? 'rgba(74,184,102,0.4)' : 'rgba(255,100,100,0.4)'}`,
              }}>{isOnline ? '🟢 Online' : '🔴 Offline'}</span>
              <button onClick={syncDevotionals} disabled={!isOnline || syncing} style={{
                padding: '8px 18px', borderRadius: 30, border: '1.5px solid rgba(255,255,255,0.4)',
                background: 'transparent', color: 'white', fontSize: '0.82rem', fontWeight: 700,
                cursor: isOnline ? 'pointer' : 'not-allowed', opacity: isOnline ? 1 : 0.5,
                fontFamily: 'var(--font-body)',
              }}>
                {syncing ? '⏳ Syncing...' : '🔄 Sync Now'}
              </button>
            </div>
          </div>
          {lastSynced && (
            <div style={{ marginTop: 10, fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
              Last synced: {lastSynced} · {devotionals.length} devotionals cached offline ✅
            </div>
          )}
        </div>
      </div>

      <div style={{ background: 'var(--cream)', padding: '0 5% 60px' }}>
        <div className="container">
          {/* Filters */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 24, marginBottom: 24, alignItems: 'center' }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)} style={{
                padding: '7px 18px', borderRadius: 30, border: '1.5px solid',
                borderColor: category === cat ? 'var(--green-mid)' : '#ddd',
                background: category === cat ? 'var(--green-mid)' : 'white',
                color: category === cat ? 'white' : 'var(--text-mid)',
                fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
              }}>{cat}</button>
            ))}
            <button onClick={() => setShowBookmarks(b => !b)} style={{
              marginLeft: 'auto', padding: '7px 18px', borderRadius: 30, border: '1.5px solid',
              borderColor: showBookmarks ? 'var(--gold)' : '#ddd',
              background: showBookmarks ? 'var(--gold)' : 'white',
              color: showBookmarks ? 'var(--green-deep)' : 'var(--text-mid)',
              fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
            }}>⭐ Bookmarks ({bookmarked.length})</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24 }}>

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 700, overflowY: 'auto', paddingRight: 4 }}>
              {display.map(d => (
                <div key={d.id} onClick={() => setSelected(d)} style={{
                  background: selected?.id === d.id ? 'var(--green-deep)' : 'white',
                  color: selected?.id === d.id ? 'white' : 'var(--text-dark)',
                  borderRadius: 12, padding: '14px 16px', cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s',
                  borderLeft: `4px solid ${selected?.id === d.id ? 'var(--gold)' : d.date === getToday() ? 'var(--green-light)' : 'transparent'}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.72rem', opacity: 0.7 }}>{d.date}</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {d.date === getToday() && <span style={{ fontSize: '0.65rem', background: 'var(--green-light)', color: 'var(--green-deep)', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>TODAY</span>}
                      {bookmarked.includes(d.id) && <span>⭐</span>}
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, lineHeight: 1.3, marginBottom: 4 }}>{d.title}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{d.scripture}</div>
                </div>
              ))}
              {display.length === 0 && (
                <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-light)' }}>
                  {showBookmarks ? 'No bookmarked devotionals yet.' : 'No devotionals found.'}
                </div>
              )}
            </div>

            {/* Detail */}
            {selected && (
              <div style={{ background: 'white', borderRadius: 16, boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
                {/* Top bar */}
                <div style={{ background: 'linear-gradient(135deg, var(--green-deep), var(--green-mid))', padding: '28px 32px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
                        {selected.date} {isToday && '· Today\'s Devotional'}
                      </div>
                      <h2 style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: '1.6rem', margin: '0 0 8px' }}>{selected.title}</h2>
                      <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>By {selected.author}</div>
                    </div>
                    <button onClick={() => toggleBookmark(selected.id)} style={{
                      background: bookmarked.includes(selected.id) ? 'var(--gold)' : 'rgba(255,255,255,0.15)',
                      border: 'none', borderRadius: 30, padding: '8px 18px', cursor: 'pointer',
                      color: bookmarked.includes(selected.id) ? 'var(--green-deep)' : 'white',
                      fontSize: '0.82rem', fontWeight: 700, fontFamily: 'var(--font-body)',
                    }}>
                      {bookmarked.includes(selected.id) ? '⭐ Bookmarked' : '☆ Bookmark'}
                    </button>
                  </div>

                  {/* Scripture */}
                  <div style={{ marginTop: 20, background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '16px 20px' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 6 }}>
                      📖 {selected.scripture}
                    </div>
                    <p style={{ color: 'white', fontStyle: 'italic', lineHeight: 1.8, fontSize: '0.97rem' }}>
                      "{selected.scriptureText}"
                    </p>
                  </div>
                </div>

                {/* Body */}
                <div style={{ padding: '28px 32px', maxHeight: 480, overflowY: 'auto' }}>
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
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--green-pale)' }}>
                    {selected.tags.map(tag => (
                      <span key={tag} className="tag">#{tag}</span>
                    ))}
                    <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-light)' }}>✅ Cached offline</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
