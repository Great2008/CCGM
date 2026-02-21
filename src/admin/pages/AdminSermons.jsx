import { useState, useEffect } from 'react'
import { useAdmin } from '../AdminApp'
import PageHeader from '../components/PageHeader'
import AdminCard from '../components/AdminCard'
import GithubWarning from '../components/GithubWarning'
import { loadWithFallback, writeContent } from '../github'

const EMPTY = { title:'', preacher:'', date:'', series:'', videoUrl:'', audioUrl:'', description:'', scripture:'', duration:'' }

export default function AdminSermons() {
  const { showToast } = useAdmin()
  const [items, setItems] = useState([])
  const [sha, setSha] = useState(null)
  const [form, setForm] = useState(null) // null=list, 'new'=new, obj=edit
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState(null)

  useEffect(() => {
    loadWithFallback('sermons.json', []).then(r => { setItems(r.content); setSha(r.sha); setLoading(false) })
  }, [])

  const save = async (updatedItems) => {
    setSaving(true)
    try {
      const result = await writeContent('sermons.json', updatedItems, sha)
      setSha(result.content.sha)
      setItems(updatedItems)
      showToast('Sermons saved! Site will update in ~30 seconds.')
      setForm(null)
    } catch (e) { showToast(e.message, 'error') }
    setSaving(false)
  }

  const handleSubmit = e => {
    e.preventDefault()
    const entry = { ...form, id: form.id || Date.now() }
    const updated = form.id && form.id !== 'new'
      ? items.map(i => i.id === form.id ? entry : i)
      : [...items, entry]
    save(updated)
  }

  const handleDelete = id => {
    save(items.filter(i => i.id !== id))
    setDeleteId(null)
  }

  const F = (k) => ({
    value: form?.[k] || '',
    onChange: e => setForm(f => ({ ...f, [k]: e.target.value }))
  })

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-light)' }}>Loading sermons...</div>

  if (form !== null) return (
    <div>
      <PageHeader icon="🎙" title={form.id ? 'Edit Sermon' : 'New Sermon'} />
      <GithubWarning />
      <AdminCard style={{ maxWidth: 720 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Sermon Title *</label><input {...F('title')} placeholder="e.g. Walking by Faith" required /></div>
            <div className="form-group"><label>Preacher *</label><input {...F('preacher')} placeholder="e.g. Pastor John Mensah" required /></div>
            <div className="form-group"><label>Date *</label><input type="date" {...F('date')} required /></div>
            <div className="form-group"><label>Series</label><input {...F('series')} placeholder="e.g. Faith Foundations" /></div>
            <div className="form-group"><label>Scripture Reference</label><input {...F('scripture')} placeholder="e.g. Hebrews 11:1-6" /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Video URL</label><input {...F('videoUrl')} placeholder="YouTube or Vimeo link" /></div>
            <div className="form-group"><label>Audio URL</label><input {...F('audioUrl')} placeholder="MP3 link" /></div>
            <div className="form-group"><label>Duration</label><input {...F('duration')} placeholder="e.g. 45 min" /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label>Description</label>
              <textarea {...F('description')} rows={4} placeholder="Brief description of the sermon..." style={{ resize: 'vertical' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="submit" className="btn btn-green" disabled={saving}>{saving ? '⏳ Saving...' : '💾 Save Sermon'}</button>
            <button type="button" className="btn btn-outline-green" onClick={() => setForm(null)}>Cancel</button>
          </div>
        </form>
      </AdminCard>
    </div>
  )

  return (
    <div>
      <PageHeader icon="🎙" title="Sermons" subtitle={`${items.length} sermon${items.length !== 1 ? 's' : ''}`}
        action={<button className="btn btn-green" onClick={() => setForm({ ...EMPTY })}>+ New Sermon</button>} />
      <GithubWarning />
      {items.length === 0 && (
        <AdminCard><div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-light)' }}>No sermons yet. Click "New Sermon" to add one.</div></AdminCard>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[...items].sort((a,b) => new Date(b.date) - new Date(a.date)).map(item => (
          <AdminCard key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: 'var(--green-deep)', fontSize: '1rem', marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-mid)' }}>{item.preacher} · {item.date} {item.series && `· ${item.series}`} {item.scripture && `· ${item.scripture}`}</div>
              {item.description && <div style={{ fontSize: '0.82rem', color: 'var(--text-light)', marginTop: 4 }}>{item.description.slice(0, 100)}{item.description.length > 100 ? '...' : ''}</div>}
              <div style={{ marginTop: 6, display: 'flex', gap: 8 }}>
                {item.videoUrl && <span style={{ fontSize: '0.72rem', background: '#e8f5e9', color: 'var(--green-deep)', padding: '2px 10px', borderRadius: 20, fontWeight: 700 }}>📹 Video</span>}
                {item.audioUrl && <span style={{ fontSize: '0.72rem', background: '#e3f2fd', color: '#1565c0', padding: '2px 10px', borderRadius: 20, fontWeight: 700 }}>🎵 Audio</span>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-outline-green" style={{ padding: '7px 16px', fontSize: '0.82rem' }} onClick={() => setForm(item)}>✏️ Edit</button>
              <button style={{ padding: '7px 16px', borderRadius: 8, border: '1.5px solid #fcc', background: 'white', color: '#c00', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'var(--font-body)' }} onClick={() => setDeleteId(item.id)}>🗑 Delete</button>
            </div>
          </AdminCard>
        ))}
      </div>
      {deleteId && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999 }}>
          <div style={{ background:'white', borderRadius:16, padding:32, maxWidth:380, width:'90%', textAlign:'center' }}>
            <div style={{ fontSize:'2.5rem', marginBottom:12 }}>⚠️</div>
            <h3 style={{ color:'var(--green-deep)', margin:'0 0 8px' }}>Delete Sermon?</h3>
            <p style={{ color:'var(--text-mid)', fontSize:'0.9rem', marginBottom:24 }}>This cannot be undone.</p>
            <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
              <button className="btn btn-green" onClick={() => handleDelete(deleteId)} disabled={saving}>{saving?'Deleting...':'Yes, Delete'}</button>
              <button className="btn btn-outline-green" onClick={() => setDeleteId(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
