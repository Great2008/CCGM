import { Link } from 'react-router-dom'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer style={{ background: 'var(--green-deep)', color: 'white', paddingTop: 60, paddingBottom: 28 }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 40, marginBottom: 48 }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 44, height: 44, background: 'rgba(255,255,255,0.15)',
                borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.3rem'
              }}>✝</div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '0.95rem', lineHeight: 1.2 }}>
                  Christian Church<br />Of God Mission
                </div>
                <div style={{ fontSize: '0.65rem', letterSpacing: '0.2em', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 700, marginTop: 2 }}>
                  God First
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>
              A warm, faith-filled community committed to worship, growth, and service in the name of Jesus Christ.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 18, color: 'var(--gold)' }}>Quick Links</h4>
            {[['/', 'Home'], ['/sermons', 'Sermons'], ['/events', 'Events'], ['/about', 'About Us'], ['/blog', 'Devotionals'], ['/gallery', 'Gallery']].map(([to, label]) => (
              <Link key={to} to={to} style={{
                display: 'block', color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem',
                marginBottom: 8, textDecoration: 'none', transition: 'color 0.2s'
              }}
              onMouseEnter={e => e.target.style.color = 'white'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.75)'}>
                → {label}
              </Link>
            ))}
          </div>

          {/* Service Times */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 18, color: 'var(--gold)' }}>Service Times</h4>
            {[
              ['Sunday Worship', '9:00 AM & 11:00 AM'],
              ['Wednesday Bible Study', '7:00 PM'],
              ['Friday Prayer Night', '6:30 PM'],
              ['Youth Service', 'Saturdays 4:00 PM'],
            ].map(([day, time]) => (
              <div key={day} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{day}</div>
                <div style={{ fontSize: '0.95rem', color: 'var(--green-light)' }}>{time}</div>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 18, color: 'var(--gold)' }}>Get In Touch</h4>
            {[
              ['📍', '123 Faith Avenue, Your City, Country'],
              ['📞', '+1 (555) 000-0000'],
              ['✉️', 'info@ccogm.org'],
            ].map(([icon, text]) => (
              <div key={text} style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1rem', marginTop: 1 }}>{icon}</span>
                <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>{text}</span>
              </div>
            ))}
            <Link to="/contact" style={{
              display: 'inline-block', marginTop: 10,
              border: '1.5px solid var(--gold)', color: 'var(--gold)',
              padding: '8px 22px', borderRadius: 30,
              fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none',
              letterSpacing: '0.08em', textTransform: 'uppercase'
            }}>
              🙏 Prayer Request
            </Link>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>
            © {year} Christian Church Of God Mission. All rights reserved.
          </p>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)' }}>
            "For God so loved the world..." — John 3:16
          </p>
        </div>
      </div>
    </footer>
  )
}
