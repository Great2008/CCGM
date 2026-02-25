export default function About() {
  const staff = [
    { name: 'Pastor John Mensah', role: 'Senior Pastor', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80', bio: 'Pastor John has led CCOGM for over 15 years with a heart for revival and community transformation.' },
    { name: 'Pastor Sarah Boateng', role: 'Associate Pastor & Women\'s Ministry', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80', bio: 'Pastor Sarah is passionate about empowering women to walk in their God-given purpose and destiny.' },
    { name: 'Deacon Kwame Asante', role: 'Head of Deacons & Outreach', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', bio: 'Deacon Kwame leads our community outreach and social justice initiatives with tireless dedication.' },
    { name: 'Sis. Grace Osei', role: 'Worship Leader', img: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80', bio: 'Grace leads our congregation into the presence of God through anointed worship every Sunday.' },
  ]

  return (
    <>
      <div style={{
        background: `linear-gradient(160deg, rgba(26,92,42,0.88) 0%, rgba(45,138,72,0.75) 100%), url('https://images.unsplash.com/photo-1507692049790-de58290a4334?w=1600&q=80') center/cover`,
        padding: '130px 5% 80px', textAlign: 'center',
      }}>
        <span className="section-label" style={{ color: 'var(--green-light)' }}>Our Story</span>
        <h1 style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: 'clamp(2rem, 5vw, 3.4rem)', marginBottom: 16 }}>
          About Our Church
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', maxWidth: 560, margin: '0 auto', lineHeight: 1.8, fontSize: '1.05rem' }}>
          Rooted in the Word, growing in grace, reaching the world.
        </p>
      </div>

      {/* Mission & Vision */}
      <section style={{ background: 'white', padding: '90px 5%' }}>
        <div className="container">
          <div className="about-mission-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
            <div>
              <span className="section-label">Who We Are</span>
              <h2 className="section-title">Our Mission & Vision</h2>
              <div className="section-divider" />
              <p style={{ color: 'var(--text-mid)', lineHeight: 1.85, marginBottom: 18, fontSize: '1rem' }}>
                Christian Church Of God Mission (CCOGM) was founded on the belief that every person deserves to encounter the transforming love of Jesus Christ. We are a multigenerational, multicultural family of believers united by one faith and one Lord.
              </p>
              <p style={{ color: 'var(--text-mid)', lineHeight: 1.85, marginBottom: 28, fontSize: '1rem' }}>
                Our mission is simple: <strong style={{ color: 'var(--green-deep)' }}>God First</strong>. We exist to worship God with everything we have, grow every believer into the fullness of Christ, and carry the Gospel to our community and beyond.
              </p>
              <div className="about-values-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[
                  ['🙏', 'Authentic Worship', 'Encountering God through Spirit-filled praise'],
                  ['📖', 'Biblical Teaching', 'Sound doctrine rooted in Scripture'],
                  ['🤝', 'Community', 'Life-giving fellowship and brotherhood'],
                  ['🌍', 'Outreach', 'Serving and reaching our city for Christ'],
                ].map(([icon, title, desc]) => (
                  <div key={title} style={{ background: 'var(--green-pale)', borderRadius: 10, padding: '16px' }}>
                    <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>{icon}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--green-deep)', marginBottom: 4 }}>{title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-mid)', lineHeight: 1.5 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=700&q=80"
                alt="Church community"
                style={{ width: '100%', borderRadius: 18, boxShadow: 'var(--shadow-lg)' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: 'var(--green-deep)', padding: '70px 5%' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 30, textAlign: 'center' }}>
            {[
              ['20+', 'Years of Ministry'],
              ['500+', 'Church Members'],
              ['4', 'Weekly Services'],
              ['12+', 'Ministries & Groups'],
            ].map(([num, label]) => (
              <div key={label}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 900, color: 'var(--gold)', lineHeight: 1 }}>{num}</div>
                <div style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)', marginTop: 8, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section style={{ background: 'var(--cream)', padding: '90px 5%' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <span className="section-label">The Team</span>
            <h2 className="section-title" style={{ margin: '0 auto' }}>Our Leadership</h2>
            <div className="section-divider" style={{ margin: '0 auto 0' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 26 }}>
            {staff.map(member => (
              <div key={member.name} className="card" style={{ textAlign: 'center', padding: 0 }}>
                <img src={member.img} alt={member.name}
                  style={{ width: '100%', height: 260, objectFit: 'cover', objectPosition: 'top' }} />
                <div style={{ padding: '22px 20px' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--green-deep)', marginBottom: 4 }}>{member.name}</h3>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--green-mid)', marginBottom: 12 }}>{member.role}</div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-mid)', lineHeight: 1.7 }}>{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <style>{`
        @media(max-width:768px){
          .about-mission-grid{grid-template-columns:1fr!important;gap:32px!important;}
          .about-values-grid{grid-template-columns:1fr!important;}
        }
      `}</style>
    </>
  )
}
