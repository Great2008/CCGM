import { useState } from 'react'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: 'Prayer Request', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Replace with real API call: await fetch('/api/contact', { method: 'POST', body: JSON.stringify(form) })
      await new Promise(r => setTimeout(r, 1200))
      setSubmitted(true)
    } catch (err) {
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div style={{
        background: 'linear-gradient(135deg, var(--green-deep) 0%, var(--green-mid) 100%)',
        padding: 'clamp(90px,14vw,130px) 5% 60px', textAlign: 'center',
      }}>
        <span className="section-label" style={{ color: 'var(--green-light)' }}>We'd Love to Hear From You</span>
        <h1 style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: 'clamp(2rem, 5vw, 3.2rem)', marginBottom: 16 }}>
          Contact & Prayer Requests
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', maxWidth: 520, margin: '0 auto', lineHeight: 1.8 }}>
          Reach out for prayer, information, or just to say hello. Our team will respond within 24 hours.
        </p>
      </div>

      <section style={{ background: 'var(--cream)', padding: '80px 5%' }}>
        <div className="container">
          <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 60, alignItems: 'start' }}>

            {/* Info Panel */}
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--green-deep)', fontSize: '1.6rem', marginBottom: 28 }}>Find Us</h2>
              {[
                { icon: '📍', title: 'Address', detail: '131 Ahoada Road \n Omoku,Rivers State,Nigeria' },
                { icon: '📞', title: 'Phone', detail: '+234 nil' },
                { icon: '✉️', title: 'Email', detail: 'ccgmworldwide@gmail.com' },
                { icon: '🕐', title: 'Office Hours', detail: 'Mon–Fri: 9 AM – 5 PM\nWeekends: Church Hours' },
              ].map(({ icon, title, detail }) => (
                <div key={title} style={{
                  display: 'flex', gap: 16, marginBottom: 26,
                  padding: '18px 20px', background: 'white', borderRadius: 12, boxShadow: 'var(--shadow-sm)',
                }}>
                  <div style={{
                    width: 44, height: 44, background: 'var(--green-pale)', borderRadius: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0,
                  }}>{icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--green-deep)', marginBottom: 4, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{title}</div>
                    <div style={{ fontSize: '0.92rem', color: 'var(--text-mid)', whiteSpace: 'pre-line', lineHeight: 1.6 }}>{detail}</div>
                  </div>
                </div>
              ))}

              <div style={{ background: 'var(--green-pale)', borderRadius: 14, padding: '20px 22px', marginTop: 10 }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>🙏</div>
                <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--green-deep)', marginBottom: 6 }}>24/7 Prayer Line</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-mid)', lineHeight: 1.7 }}>
                  Our prayer team is committed to standing with you in faith at any hour.
                </p>
                <div style={{ fontWeight: 700, color: 'var(--green-mid)', marginTop: 8 }}>+1 (555) 000-0001</div>
              </div>
            </div>

            {/* Form */}
            <div style={{ background: 'white', borderRadius: 18, padding: '40px', boxShadow: 'var(--shadow-md)' }}>
              {submitted ? (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>🙏</div>
                  <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--green-deep)', fontSize: '1.6rem', marginBottom: 12 }}>
                    Thank You, {form.name}!
                  </h3>
                  <p style={{ color: 'var(--text-mid)', lineHeight: 1.8, maxWidth: 360, margin: '0 auto 24px' }}>
                    Your message has been received. Our team will be in prayer for you and will reach out shortly.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', subject: 'Prayer Request', message: '' }) }}
                    className="btn btn-green"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <>
                  <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--green-deep)', fontSize: '1.5rem', marginBottom: 28 }}>
                    Send a Message
                  </h2>
                  <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div className="form-group">
                        <label>Full Name *</label>
                        <input name="name" required value={form.name} onChange={handleChange} placeholder="Your full name" />
                      </div>
                      <div className="form-group">
                        <label>Email Address *</label>
                        <input name="email" type="email" required value={form.email} onChange={handleChange} placeholder="your@email.com" />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div className="form-group">
                        <label>Phone Number</label>
                        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Optional" />
                      </div>
                      <div className="form-group">
                        <label>Subject *</label>
                        <select name="subject" value={form.subject} onChange={handleChange}>
                          <option>Prayer Request</option>
                          <option>General Inquiry</option>
                          <option>New Member</option>
                          <option>Pastoral Counseling</option>
                          <option>Volunteering</option>
                          <option>Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Your Message *</label>
                      <textarea name="message" required value={form.message} onChange={handleChange} placeholder="Share what's on your heart..." style={{ minHeight: 140 }} />
                    </div>
                    <button type="submit" className="btn btn-green" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                      {loading ? '⏳ Sending...' : '✉️ Send Message'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
      <style>{`
        @media(max-width:768px){
          .contact-grid{grid-template-columns:1fr!important;gap:32px!important;}
        }
      `}</style>
    </>
  )
}
