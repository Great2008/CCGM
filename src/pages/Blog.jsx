import { blogPosts } from '../data/mockData'

export default function Blog() {
  const [featured, ...rest] = blogPosts

  return (
    <>
      <div style={{
        background: 'linear-gradient(135deg, var(--green-deep) 0%, var(--green-mid) 100%)',
        padding: '130px 5% 60px', textAlign: 'center',
      }}>
        <span className="section-label" style={{ color: 'var(--green-light)' }}>Daily Inspiration</span>
        <h1 style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: 'clamp(2rem, 5vw, 3.2rem)', marginBottom: 16 }}>
          Blog & Devotionals
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', maxWidth: 520, margin: '0 auto', lineHeight: 1.8 }}>
          Daily encouragement, scripture reflections, and faith-building articles from our pastors and leaders.
        </p>
      </div>

      <section style={{ background: 'var(--cream)', padding: '70px 5%' }}>
        <div className="container">
          {/* Featured */}
          <div style={{ marginBottom: 56 }}>
            <span className="section-label">Featured Post</span>
            <div className="card blog-featured-card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', overflow: 'hidden' }}>
              <img src={featured.image} alt={featured.title} style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: 300 }} />
              <div style={{ padding: '40px 36px' }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'center' }}>
                  <span className="tag">{featured.category}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>{featured.readTime}</span>
                </div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', color: 'var(--green-deep)', marginBottom: 12, lineHeight: 1.3 }}>{featured.title}</h2>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-light)', marginBottom: 14 }}>
                  By <strong style={{ color: 'var(--green-mid)' }}>{featured.author}</strong> · {featured.date}
                </div>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-mid)', lineHeight: 1.8, marginBottom: 24 }}>{featured.excerpt}</p>
                <button className="btn btn-green">Read Full Article →</button>
              </div>
            </div>
          </div>

          {/* Rest */}
          <span className="section-label">More Devotionals</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 24, marginTop: 16 }}>
            {rest.map(post => (
              <div key={post.id} className="card">
                <img src={post.image} alt={post.title} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
                <div style={{ padding: '22px' }}>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'center' }}>
                    <span className="tag">{post.category}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{post.readTime}</span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--green-deep)', marginBottom: 8, lineHeight: 1.35 }}>{post.title}</h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginBottom: 10 }}>
                    By <strong style={{ color: 'var(--green-mid)' }}>{post.author}</strong> · {post.date}
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-mid)', lineHeight: 1.65, marginBottom: 16 }}>{post.excerpt}</p>
                  <button className="btn btn-outline-green" style={{ padding: '8px 20px', fontSize: '0.8rem' }}>Read More →</button>
                </div>
              </div>
            ))}
          </div>

          {/* Newsletter */}
          <div style={{
            marginTop: 64,
            background: 'linear-gradient(135deg, var(--green-mid) 0%, var(--green-deep) 100%)',
            borderRadius: 20, padding: '50px 40px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: 10 }}>📬</div>
            <h3 style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: '1.7rem', marginBottom: 10 }}>
              Get Daily Devotionals in Your Inbox
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 28, maxWidth: 420, margin: '0 auto 28px' }}>
              Start every morning in the Word. Subscribe for free daily devotionals.
            </p>
            <form onSubmit={e => e.preventDefault()} style={{ display: 'flex', gap: 12, maxWidth: 440, margin: '0 auto', flexWrap: 'wrap' }}>
              <input type="email" placeholder="Enter your email address" style={{
                flex: '1 1 220px', padding: '13px 18px', borderRadius: 40,
                border: 'none', fontSize: '0.95rem', outline: 'none', fontFamily: 'var(--font-body)',
              }} />
              <button type="submit" className="btn btn-gold">Subscribe →</button>
            </form>
          </div>
        </div>
      </section>
    </>
      <style>{`
        @media(max-width:768px){
          .blog-featured-card{grid-template-columns:1fr!important;}
        }
      `}</style>
  )
}
