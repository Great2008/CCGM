import { useState, useEffect } from 'react'
import { useAdmin } from '../AdminApp'
import AdminCard from '../components/AdminCard'
import PageHeader from '../components/PageHeader'
import { readContent } from '../github'

export default function AdminDashboard() {
  const { setPage } = useAdmin()
  const [counts, setCounts] = useState({ sermons: 0, events: 0, posts: 0, prayers: 0, gallery: 0 })

  useEffect(() => {
    const load = async () => {
      try {
        const [s, e, b, p, g] = await Promise.allSettled([
          readContent('sermons.json'), readContent('events.json'),
          readContent('blog.json'), readContent('prayers.json'), readContent('gallery.json')
        ])
        setCounts({
          sermons: s.value?.content?.length || 0,
          events: e.value?.content?.length || 0,
          posts: b.value?.content?.length || 0,
          prayers: p.value?.content?.length || 0,
          gallery: g.value?.content?.length || 0,
        })
      } catch {}
    }
    load()
  }, [])

  const stats = [
    { label: 'Sermons', value: counts.sermons, icon: '🎙', page: 'sermons', color: '#e8f5e9' },
    { label: 'Events', value: counts.events, icon: '📅', page: 'events', color: '#e3f2fd' },
    { label: 'Blog Posts', value: counts.posts, icon: '✍️', page: 'blog', color: '#fce4ec' },
    { label: 'Prayer Requests', value: counts.prayers, icon: '🙏', page: 'prayer', color: '#fff3e0' },
    { label: 'Gallery Photos', value: counts.gallery, icon: '🖼', page: 'gallery', color: '#f3e5f5' },
  ]

  const quickActions = [
    { label: 'New Sermon', icon: '🎙', page: 'sermons' },
    { label: 'New Event', icon: '📅', page: 'events' },
    { label: 'New Post', icon: '✍️', page: 'blog' },
    { label: 'Edit Homepage', icon: '🏠', page: 'homepage' },
    { label: 'View Prayers', icon: '🙏', page: 'prayer' },
    { label: 'Add Photos', icon: '🖼', page: 'gallery' },
  ]

  return (
    <div>
      <PageHeader icon="📊" title="Dashboard" subtitle={`Welcome back! — ${new Date().toLocaleDateString('en-GB', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}`} />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
        {stats.map(s => (
          <div key={s.label} onClick={() => setPage(s.page)} style={{
            background: s.color, borderRadius: 14, padding: '20px', cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--green-deep)', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-mid)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <AdminCard style={{ marginBottom: 28 }}>
        <h3 style={{ margin: '0 0 18px', color: 'var(--green-deep)', fontSize: '1rem', fontWeight: 700 }}>⚡ Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
          {quickActions.map(a => (
            <button key={a.label} onClick={() => setPage(a.page)} style={{
              padding: '14px 12px', borderRadius: 10, border: '1.5px solid var(--green-pale)',
              background: 'white', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700,
              color: 'var(--green-deep)', fontFamily: 'var(--font-body)', transition: 'all 0.2s',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--green-pale)'; e.currentTarget.style.borderColor = 'var(--green-mid)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = 'var(--green-pale)' }}>
              <span style={{ fontSize: '1.4rem' }}>{a.icon}</span>
              {a.label}
            </button>
          ))}
        </div>
      </AdminCard>

      {/* Info */}
      <AdminCard>
        <h3 style={{ margin: '0 0 14px', color: 'var(--green-deep)', fontSize: '1rem', fontWeight: 700 }}>ℹ️ How Content Publishing Works</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))', gap: 14 }}>
          {[
            ['📝 Edit Content', 'Use any section in the left sidebar to add, edit or delete content.'],
            ['💾 Save Changes', 'Click Save and the change is written directly to your GitHub repo as a JSON file.'],
            ['🚀 Auto Deploy', 'Vercel detects the GitHub change and rebuilds your site in ~30 seconds.'],
            ['🔑 Setup Required', 'Add VITE_GH_TOKEN, VITE_GH_OWNER, VITE_GH_REPO to Vercel environment variables.'],
          ].map(([title, desc]) => (
            <div key={title} style={{ background: 'var(--green-pale)', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontWeight: 700, color: 'var(--green-deep)', marginBottom: 4, fontSize: '0.88rem' }}>{title}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-mid)', lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
      </AdminCard>
    </div>
  )
}
