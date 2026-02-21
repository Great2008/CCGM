import { useState } from 'react'

const ADMIN_USER = import.meta.env.VITE_ADMIN_USER || 'admin'
const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASS || 'ccogm2025'

export default function AdminLogin({ onLogin }) {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true); setError('')
    await new Promise(r => setTimeout(r, 600))
    if (user.trim() === ADMIN_USER && pass === ADMIN_PASS) {
      sessionStorage.setItem('ccogm_admin', 'true')
      onLogin()
    } else {
      setError('Invalid username or password.')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--green-deep) 0%, var(--green-mid) 100%)', padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 20, padding: '44px 40px', width: '100%', maxWidth: 420, boxShadow: '0 24px 80px rgba(0,0,0,0.25)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg, var(--green-mid), var(--green-deep))', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto 14px', boxShadow: '0 6px 20px rgba(45,138,72,0.35)' }}>✝</div>
          <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--green-deep)', fontSize: '1.5rem', margin: '0 0 4px' }}>Admin Panel</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '0.85rem', margin: 0 }}>Christian Church Of God Mission</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input value={user} onChange={e => setUser(e.target.value)} placeholder="admin" required autoFocus />
          </div>
          <div className="form-group" style={{ position: 'relative' }}>
            <label>Password</label>
            <input type={showPass ? 'text' : 'password'} value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" required style={{ paddingRight: 48 }} />
            <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 14, bottom: 12, background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--text-light)' }}>{showPass ? '🙈' : '👁'}</button>
          </div>
          {error && <div style={{ background: '#fff0f0', border: '1px solid #fcc', borderRadius: 8, padding: '10px 14px', color: '#c00', fontSize: '0.85rem', marginBottom: 16 }}>❌ {error}</div>}
          <button type="submit" className="btn btn-green" style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: '0.95rem', marginTop: 8 }} disabled={loading}>
            {loading ? '⏳ Signing in...' : '🔐 Sign In'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.78rem', color: 'var(--text-light)' }}>
          Set credentials in Vercel dashboard:<br />
          <code style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: 4 }}>VITE_ADMIN_USER</code> &amp; <code style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: 4 }}>VITE_ADMIN_PASS</code>
        </p>
      </div>
    </div>
  )
}
