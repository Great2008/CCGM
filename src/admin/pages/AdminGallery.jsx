import { useState, useEffect } from 'react'
import { useAdmin } from '../AdminApp'
import PageHeader from '../components/PageHeader'
import AdminCard from '../components/AdminCard'
import GithubWarning from '../components/GithubWarning'
import { loadWithFallback, writeContent } from '../github'

const EMPTY = { title:'', url:'', category:'', date:'', caption:'' }
const CATS = ['Worship','Events','Community','Outreach','Youth','Leadership','Baptism','Christmas','Easter']

export default function AdminGallery() {
  const { showToast } = useAdmin()
  const [items, setItems] = useState([])
  const [sha, setSha] = useState(null)
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState(null)
  const [bulkUrls, setBulkUrls] = useState('')
  const [showBulk, setShowBulk] = useState(false)

  useEffect(() => {
    loadWithFallback('gallery.json', []).then(r => { setItems(r.content); setSha(r.sha); setLoading(false) })
  }, [])

  const save = async updated => {
    setSaving(true)
    try {
      const res = await writeContent('gallery.json', updated, sha)
      setSha(res.content.sha); setItems(updated)
      showToast('Gallery saved! Site updates in ~30s.')
      setForm(null); setShowBulk(false); setBulkUrls('')
    } catch(e) { showToast(e.message, 'error') }
    setSaving(false)
  }

  const handleSubmit = e => {
    e.preventDefault()
    const entry = { ...form, id: form.id || Date.now() }
    const updated = form.id ? items.map(i=>i.id===form.id?entry:i) : [...items, entry]
    save(updated)
  }

  const handleBulk = () => {
    const urls = bulkUrls.split('\n').map(u=>u.trim()).filter(Boolean)
    if (!urls.length) return
    const newItems = urls.map(url => ({ id: Date.now() + Math.random(), url, title:'', category:'', date: new Date().toISOString().split('T')[0], caption:'' }))
    save([...items, ...newItems])
  }

  const F = k => ({ value: form?.[k]||'', onChange: e=>setForm(f=>({...f,[k]:e.target.value})) })

  if (loading) return <div style={{textAlign:'center',padding:60,color:'var(--text-light)'}}>Loading gallery...</div>

  if (form !== null) return (
    <div>
      <PageHeader icon="🖼" title={form.id ? 'Edit Photo' : 'Add Photo'} />
      <GithubWarning />
      <AdminCard style={{maxWidth:600}}>
        <form onSubmit={handleSubmit}>
          <div style={{marginBottom:20}}>
            {form.url && <img src={form.url} alt="" style={{width:'100%',height:240,objectFit:'cover',borderRadius:10,marginBottom:16}} />}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            <div className="form-group" style={{gridColumn:'1/-1'}}><label>Image URL *</label><input {...F('url')} required placeholder="https://... (Google Photos, Imgur, etc.)" /></div>
            <div className="form-group" style={{gridColumn:'1/-1'}}><label>Title</label><input {...F('title')} placeholder="e.g. Easter Sunday 2025" /></div>
            <div className="form-group">
              <label>Category</label>
              <select value={form?.category||''} onChange={e=>setForm(f=>({...f,category:e.target.value}))} style={{padding:'10px 14px',borderRadius:8,border:'1.5px solid #ddd',width:'100%',fontFamily:'var(--font-body)'}}>
                <option value="">Select category</option>
                {CATS.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Date</label><input type="date" {...F('date')} /></div>
            <div className="form-group" style={{gridColumn:'1/-1'}}><label>Caption</label><textarea {...F('caption')} rows={2} style={{resize:'vertical'}} placeholder="Optional caption..." /></div>
          </div>
          <div style={{display:'flex',gap:12,marginTop:8}}>
            <button type="submit" className="btn btn-green" disabled={saving}>{saving?'⏳ Saving...':'💾 Save Photo'}</button>
            <button type="button" className="btn btn-outline-green" onClick={()=>setForm(null)}>Cancel</button>
          </div>
        </form>
      </AdminCard>
    </div>
  )

  return (
    <div>
      <PageHeader icon="🖼" title="Gallery" subtitle={`${items.length} photo${items.length!==1?'s':''}`}
        action={
          <div style={{display:'flex',gap:10}}>
            <button className="btn btn-outline-green" onClick={()=>setShowBulk(s=>!s)}>📋 Bulk Add</button>
            <button className="btn btn-green" onClick={()=>setForm({...EMPTY,date:new Date().toISOString().split('T')[0]})}>+ Add Photo</button>
          </div>
        }
      />
      <GithubWarning />
      {showBulk && (
        <AdminCard style={{marginBottom:24,maxWidth:600}}>
          <h3 style={{margin:'0 0 12px',color:'var(--green-deep)',fontSize:'1rem'}}>📋 Bulk Add — Paste one image URL per line</h3>
          <textarea value={bulkUrls} onChange={e=>setBulkUrls(e.target.value)} rows={6}
            placeholder={'https://images.unsplash.com/photo-1...\nhttps://images.unsplash.com/photo-2...\nhttps://...'}
            style={{width:'100%',padding:12,borderRadius:8,border:'1.5px solid #ddd',fontFamily:'monospace',fontSize:'0.85rem',resize:'vertical',boxSizing:'border-box'}} />
          <div style={{display:'flex',gap:12,marginTop:12}}>
            <button className="btn btn-green" onClick={handleBulk} disabled={saving||!bulkUrls.trim()}>{saving?'⏳ Saving...':'✅ Add All Photos'}</button>
            <button className="btn btn-outline-green" onClick={()=>{setShowBulk(false);setBulkUrls('')}}>Cancel</button>
          </div>
        </AdminCard>
      )}
      {items.length === 0 && <AdminCard><div style={{textAlign:'center',padding:'40px 20px',color:'var(--text-light)'}}>No photos yet.</div></AdminCard>}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:14}}>
        {items.map(item=>(
          <div key={item.id} style={{background:'white',borderRadius:12,overflow:'hidden',boxShadow:'0 2px 10px rgba(0,0,0,0.07)',position:'relative'}}>
            <div style={{height:160,background:'#f0f0f0',overflow:'hidden'}}>
              {item.url ? <img src={item.url} alt={item.title} style={{width:'100%',height:'100%',objectFit:'cover'}} /> : <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',fontSize:'2rem'}}>🖼</div>}
            </div>
            <div style={{padding:'10px 12px'}}>
              <div style={{fontSize:'0.82rem',fontWeight:700,color:'var(--green-deep)',marginBottom:2,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{item.title||'Untitled'}</div>
              {item.category && <div style={{fontSize:'0.7rem',color:'var(--green-mid)',marginBottom:6}}>{item.category}</div>}
              <div style={{display:'flex',gap:6}}>
                <button onClick={()=>setForm(item)} style={{flex:1,padding:'5px',borderRadius:6,border:'1.5px solid var(--green-mid)',background:'white',color:'var(--green-deep)',cursor:'pointer',fontSize:'0.75rem',fontFamily:'var(--font-body)',fontWeight:700}}>✏️ Edit</button>
                <button onClick={()=>setDeleteId(item.id)} style={{padding:'5px 8px',borderRadius:6,border:'1.5px solid #fcc',background:'white',color:'#c00',cursor:'pointer',fontSize:'0.75rem',fontFamily:'var(--font-body)'}}>🗑</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {deleteId && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}}>
          <div style={{background:'white',borderRadius:16,padding:32,maxWidth:360,width:'90%',textAlign:'center'}}>
            <div style={{fontSize:'2.5rem',marginBottom:12}}>⚠️</div>
            <h3 style={{color:'var(--green-deep)',margin:'0 0 8px'}}>Remove Photo?</h3>
            <p style={{color:'var(--text-mid)',fontSize:'0.9rem',marginBottom:24}}>This cannot be undone.</p>
            <div style={{display:'flex',gap:12,justifyContent:'center'}}>
              <button className="btn btn-green" onClick={()=>{save(items.filter(i=>i.id!==deleteId));setDeleteId(null)}} disabled={saving}>{saving?'Removing...':'Yes, Remove'}</button>
              <button className="btn btn-outline-green" onClick={()=>setDeleteId(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
