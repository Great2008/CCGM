import { useState } from 'react'
import { galleryImages } from '../data/mockData'

export default function Gallery() {
  const [filter, setFilter] = useState('All')
  const [lightbox, setLightbox] = useState(null)
  const categories = ['All', ...new Set(galleryImages.map(i => i.category))]
  const filtered = filter === 'All' ? galleryImages : galleryImages.filter(i => i.category === filter)

  return (
    <>
      <div style={{
        background: 'linear-gradient(135deg, var(--green-deep) 0%, var(--green-mid) 100%)',
        padding: '130px 5% 60px', textAlign: 'center',
      }}>
        <span className="section-label" style={{ color: 'var(--green-light)' }}>Our Community</span>
        <h1 style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: 'clamp(2rem, 5vw, 3.2rem)', marginBottom: 16 }}>
          Photo Gallery
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', maxWidth: 520, margin: '0 auto' }}>
          Capturing moments of faith, fellowship, and worship in our church family.
        </p>
      </div>

      <section style={{ background: 'var(--cream)', padding: '60px 5%' }}>
        <div className="container">
          {/* Filter */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 40, flexWrap: 'wrap', justifyContent: 'center' }}>
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

          {/* Masonry grid */}
          <div style={{ columns: '3 280px', gap: 18 }}>
            {filtered.map(img => (
              <div key={img.id} style={{ breakInside: 'avoid', marginBottom: 18, cursor: 'pointer' }}
                onClick={() => setLightbox(img)}>
                <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 12 }}>
                  <img src={img.src} alt={img.caption}
                    style={{ width: '100%', display: 'block', transition: 'transform 0.4s' }}
                    onMouseEnter={e => { e.target.style.transform = 'scale(1.05)'; e.target.nextSibling.style.opacity = '1' }}
                    onMouseLeave={e => { e.target.style.transform = 'scale(1)'; e.target.nextSibling.style.opacity = '0' }} />
                  <div style={{
                    position: 'absolute', inset: 0, opacity: 0,
                    background: 'rgba(26,92,42,0.75)', transition: 'opacity 0.3s',
                    display: 'flex', alignItems: 'flex-end', padding: 16,
                    pointerEvents: 'none',
                  }}>
                    <div>
                      <span className="tag" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', marginBottom: 6, display: 'inline-block' }}>{img.category}</span>
                      <p style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>{img.caption}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: 900, width: '100%' }}>
            <img src={lightbox.src} alt={lightbox.caption} style={{ width: '100%', borderRadius: 12, boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
              <p style={{ color: 'white', fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>{lightbox.caption}</p>
              <button onClick={() => setLightbox(null)} style={{
                background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
                color: 'white', padding: '8px 20px', borderRadius: 30, cursor: 'pointer',
                fontSize: '0.88rem',
              }}>✕ Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
