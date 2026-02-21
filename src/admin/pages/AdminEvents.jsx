import { useState, useEffect } from 'react'
import { useAdmin } from '../AdminApp'
import PageHeader from '../components/PageHeader'
import AdminCard from '../components/AdminCard'
import GithubWarning from '../components/GithubWarning'
import { loadWithFallback, writeContent } from '../github'

const EMPTY = { title:'', date:'', endDate:'', time:'', location:'', category:'', description:'', imageUrl:'', registrationUrl:'' }
const CATEGORIES = ['Worship','Fellowship','Youth','Outreach','Conference','Prayer','Special']

export default function AdminEvents() {
  const { showToast } = useAdmin()
  const [items, setItems] = useState([])
  const [sha, setSha] = useState(null)
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState(null)

  useEffect(() => {
    loadWithFallback('events.json', []).then(r => { setItems(r.content); setSha(r.sha); setLoading(false) })
  }, [])

  const save = async updated => {
    setSaving(true)
    try {
      const res = await writeContent('events.json', updated, sha)
      setSha(res.content.sha); setItems(updated)
      showToast('Events saved! Site updates in ~30s.')
      setForm(null)
    } catch(e) { showToast(e.message, 'error') }
    setSaving(false)
  }

  const handleSubmit = e => {
    e.preventDefault()
    const entry = { ...form, id: form.id || Date.now() }
    const updated = form.id ? items.map(i => i.id === form.id ? entry : i) : [...items, entry]
    save(updated)
  }

  const F = k => ({ value: form?.[k]||'', onChange: e => setForm(f=>({...f,[k]:e.target.value})) })

  const upcoming = [...items].filter(i => new Date(i.date) >= new Date()).sort((a,b)=>new Date(a.date)-new Date(b.date))
  const past = [...items].filter(i => new Date(i.date) < new Date()).sort((a,b)=>new Date(b.date)-new Date(a.date))

  if (loading) return <div style={{textAlign:'center',padding:60,color:'var(--text-light)'}}>Loading events...</div>

  if (form !== null) return (
    <div>
      <PageHeader icon="📅" title={form.id ? 'Edit Event' : 'New Event'} />
      <GithubWarning />
      <AdminCard style={{ maxWidth: 720 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <div className="form-group" style={{ gridColumn:'1/-1' }}><label>Event Title *</label><input {...F('title')} required placeholder="e.g. Easter Sunday Service" /></div>
            <div className="form-group"><label>Date *</label><input type="date" {...F('date')} required /></div>
            <div className="form-group"><label>End Date</label><input type="date" {...F('endDate')} /></div>
            <div className="form-group"><label>Time *</label><input {...F('time')} placeholder="e.g. 10:00 AM – 12:00 PM" required /></div>
            <div className="form-group">
              <label>Category</label>
              <select {...F('category')} style={{ padding:'10px 14px', borderRadius:8, border:'1.5px solid #ddd', width:'100%', fontFamily:'var(--font-body)' }}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ gridColumn:'1/-1' }}><label>Location</label><input {...F('location')} placeholder="e.g. Main Auditorium / Zoom link" /></div>
            <div className="form-group" style={{ gridColumn:'1/-1' }}><label>Image URL</label><input {...F('imageUrl')} placeholder="https://..." /></div>
            <div className="form-group" style={{ gridColumn:'1/-1' }}><label>Registration URL</label><input {...F('registrationUrl')} placeholder="Optional registration link" /></div>
            <div className="form-group" style={{ gridColumn:'1/-1' }}>
              <label>Description</label>
              <textarea {...F('description')} rows={4} placeholder="Event description..." style={{resize:'vertical'}} />
            </div>
          </div>
          <div style={{display:'flex',gap:12,marginTop:8}}>
            <button type="submit" className="btn btn-green" disabled={saving}>{saving?'⏳ Saving...':'💾 Save Event'}</button>
            <button type="button" className="btn btn-outline-green" onClick={()=>setForm(null)}>Cancel</button>
          </div>
        </form>
      </AdminCard>
    </div>
  )

  const EventRow = ({item}) => (
    <AdminCard style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
      <div style={{flex:1}}>
        <div style={{fontWeight:700,color:'var(--green-deep)',marginBottom:4}}>{item.title}</div>
        <div style={{fontSize:'0.82rem',color:'var(--text-mid)'}}>📅 {item.date} · ⏰ {item.time} {item.location && `· 📍 ${item.location}`}</div>
        {item.category && <span style={{display:'inline-block',marginTop:6,fontSize:'0.72rem',background:'var(--green-pale)',color:'var(--green-deep)',padding:'2px 10px',borderRadius:20,fontWeight:700}}>{item.category}</span>}
      </div>
      <div style={{display:'flex',gap:8}}>
        <button className="btn btn-outline-green" style={{padding:'7px 16px',fontSize:'0.82rem'}} onClick={()=>setForm(item)}>✏️ Edit</button>
        <button style={{padding:'7px 16px',borderRadius:8,border:'1.5px solid #fcc',background:'white',color:'#c00',cursor:'pointer',fontSize:'0.82rem',fontFamily:'var(--font-body)'}} onClick={()=>setDeleteId(item.id)}>🗑</button>
      </div>
    </AdminCard>
  )

  return (
    <div>
      <PageHeader icon="📅" title="Events" subtitle={`${upcoming.length} upcoming · ${past.length} past`}
        action={<button className="btn btn-green" onClick={()=>setForm({...EMPTY})}>+ New Event</button>} />
      <GithubWarning />
      {items.length === 0 && <AdminCard><div style={{textAlign:'center',padding:'40px 20px',color:'var(--text-light)'}}>No events yet.</div></AdminCard>}
      {upcoming.length > 0 && (<><h3 style={{color:'var(--green-deep)',marginBottom:12}}>Upcoming</h3>{upcoming.map(i=><EventRow key={i.id} item={i}/>)}</>)}
      {past.length > 0 && (<><h3 style={{color:'var(--text-mid)',margin:'24px 0 12px'}}>Past Events</h3>{past.map(i=><EventRow key={i.id} item={i}/>)}</>)}
      {deleteId && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}}>
          <div style={{background:'white',borderRadius:16,padding:32,maxWidth:380,width:'90%',textAlign:'center'}}>
            <div style={{fontSize:'2.5rem',marginBottom:12}}>⚠️</div>
            <h3 style={{color:'var(--green-deep)',margin:'0 0 8px'}}>Delete Event?</h3>
            <p style={{color:'var(--text-mid)',fontSize:'0.9rem',marginBottom:24}}>This cannot be undone.</p>
            <div style={{display:'flex',gap:12,justifyContent:'center'}}>
              <button className="btn btn-green" onClick={()=>{save(items.filter(i=>i.id!==deleteId));setDeleteId(null)}} disabled={saving}>{saving?'Deleting...':'Yes, Delete'}</button>
              <button className="btn btn-outline-green" onClick={()=>setDeleteId(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
