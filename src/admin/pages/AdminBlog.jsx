import { useState, useEffect } from 'react'
import { useAdmin } from '../AdminApp'
import PageHeader from '../components/PageHeader'
import AdminCard from '../components/AdminCard'
import GithubWarning from '../components/GithubWarning'
import { loadWithFallback, writeContent } from '../github'

const EMPTY = { title:'', author:'', date:'', category:'', excerpt:'', body:'', imageUrl:'', tags:'', published: true, type:'blog' }
const CATS = ['Devotional','Sermon Notes','Announcement','Ministry','Testimony','Teaching']

export default function AdminBlog() {
  const { showToast } = useAdmin()
  const [items, setItems] = useState([])
  const [sha, setSha] = useState(null)
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState(null)
  const [preview, setPreview] = useState(false)

  useEffect(() => {
    loadWithFallback('blog.json', []).then(r => { setItems(r.content); setSha(r.sha); setLoading(false) })
  }, [])

  const save = async updated => {
    setSaving(true)
    try {
      const res = await writeContent('blog.json', updated, sha)
      setSha(res.content.sha); setItems(updated)
      showToast('Post saved! Site updates in ~30s.')
      setForm(null)
    } catch(e) { showToast(e.message, 'error') }
    setSaving(false)
  }

  const handleSubmit = e => {
    e.preventDefault()
    const entry = {
      ...form,
      id: form.id || Date.now(),
      tags: typeof form.tags === 'string' ? form.tags.split(',').map(t=>t.trim()).filter(Boolean) : form.tags,
      date: form.date || new Date().toISOString().split('T')[0],
    }
    const updated = form.id ? items.map(i=>i.id===form.id?entry:i) : [...items, entry]
    save(updated)
  }

  const F = k => ({ value: form?.[k]||'', onChange: e => setForm(f=>({...f,[k]:e.target.value})) })

  if (loading) return <div style={{textAlign:'center',padding:60,color:'var(--text-light)'}}>Loading posts...</div>

  if (form !== null) return (
    <div>
      <PageHeader icon="✍️" title={form.id ? 'Edit Post' : 'New Post'}
        action={
          <div style={{display:'flex',gap:10}}>
            <button className="btn btn-outline-green" onClick={()=>setPreview(p=>!p)} style={{fontSize:'0.85rem'}}>
              {preview ? '📝 Edit' : '👁 Preview'}
            </button>
            <button className="btn btn-green" onClick={handleSubmit} disabled={saving} style={{fontSize:'0.85rem'}}>
              {saving ? '⏳ Saving...' : '💾 Publish'}
            </button>
            <button className="btn btn-outline-green" onClick={()=>setForm(null)} style={{fontSize:'0.85rem'}}>Cancel</button>
          </div>
        }
      />
      <GithubWarning />
      {preview ? (
        <AdminCard style={{maxWidth:760}}>
          {form.imageUrl && <img src={form.imageUrl} alt="" style={{width:'100%',height:280,objectFit:'cover',borderRadius:10,marginBottom:24}} />}
          <div style={{fontSize:'0.78rem',color:'var(--green-mid)',fontWeight:700,marginBottom:8,textTransform:'uppercase',letterSpacing:'0.12em'}}>{form.category}</div>
          <h1 style={{fontFamily:'var(--font-display)',color:'var(--green-deep)',fontSize:'1.8rem',marginBottom:8}}>{form.title||'Untitled'}</h1>
          <div style={{fontSize:'0.82rem',color:'var(--text-light)',marginBottom:20}}>{form.author} · {form.date}</div>
          <p style={{color:'var(--text-mid)',fontStyle:'italic',marginBottom:24,lineHeight:1.8}}>{form.excerpt}</p>
          {(form.body||'').split('\n\n').map((p,i)=><p key={i} style={{lineHeight:1.9,marginBottom:16,color:'var(--text-dark)'}}>{p}</p>)}
        </AdminCard>
      ) : (
        <AdminCard style={{maxWidth:760}}>
          <form onSubmit={handleSubmit}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
              <div className="form-group" style={{gridColumn:'1/-1'}}><label>Title *</label><input {...F('title')} required placeholder="Post title" /></div>
              <div className="form-group"><label>Author</label><input {...F('author')} placeholder="e.g. Pastor John Mensah" /></div>
              <div className="form-group"><label>Date</label><input type="date" {...F('date')} /></div>
              <div className="form-group">
                <label>Category</label>
                <select value={form?.category||''} onChange={e=>setForm(f=>({...f,category:e.target.value}))} style={{padding:'10px 14px',borderRadius:8,border:'1.5px solid #ddd',width:'100%',fontFamily:'var(--font-body)'}}>
                  <option value="">Select category</option>
                  {CATS.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Type</label>
                <select value={form?.type||'blog'} onChange={e=>setForm(f=>({...f,type:e.target.value}))} style={{padding:'10px 14px',borderRadius:8,border:'1.5px solid #ddd',width:'100%',fontFamily:'var(--font-body)'}}>
                  <option value="blog">Blog Post</option>
                  <option value="devotional">Devotional</option>
                </select>
              </div>
              <div className="form-group" style={{gridColumn:'1/-1'}}><label>Cover Image URL</label><input {...F('imageUrl')} placeholder="https://..." /></div>
              <div className="form-group" style={{gridColumn:'1/-1'}}><label>Excerpt</label><textarea {...F('excerpt')} rows={2} placeholder="Short summary shown in listings..." style={{resize:'vertical'}} /></div>
              <div className="form-group" style={{gridColumn:'1/-1'}}>
                <label>Body <span style={{fontWeight:400,color:'var(--text-light)',fontSize:'0.78rem'}}>(Use blank lines to separate paragraphs)</span></label>
                <textarea {...F('body')} rows={14} placeholder="Write your full post here..." style={{resize:'vertical',fontFamily:'monospace',fontSize:'0.88rem',lineHeight:1.7}} />
              </div>
              <div className="form-group" style={{gridColumn:'1/-1'}}><label>Tags <span style={{fontWeight:400,color:'var(--text-light)',fontSize:'0.78rem'}}>(comma separated)</span></label><input {...F('tags')} placeholder="e.g. Faith, Prayer, Healing" /></div>
              <div className="form-group">
                <label style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer'}}>
                  <input type="checkbox" checked={form?.published!==false} onChange={e=>setForm(f=>({...f,published:e.target.checked}))} style={{width:18,height:18}} />
                  Published (visible on site)
                </label>
              </div>
            </div>
            <div style={{display:'flex',gap:12,marginTop:16}}>
              <button type="submit" className="btn btn-green" disabled={saving}>{saving?'⏳ Saving...':'💾 Publish Post'}</button>
              <button type="button" className="btn btn-outline-green" onClick={()=>setForm(null)}>Cancel</button>
            </div>
          </form>
        </AdminCard>
      )}
    </div>
  )

  return (
    <div>
      <PageHeader icon="✍️" title="Blog & Devotionals" subtitle={`${items.length} post${items.length!==1?'s':''}`}
        action={<button className="btn btn-green" onClick={()=>setForm({...EMPTY,date:new Date().toISOString().split('T')[0]})}>+ New Post</button>} />
      <GithubWarning />
      {items.length === 0 && <AdminCard><div style={{textAlign:'center',padding:'40px 20px',color:'var(--text-light)'}}>No posts yet.</div></AdminCard>}
      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        {[...items].sort((a,b)=>new Date(b.date)-new Date(a.date)).map(item=>(
          <AdminCard key={item.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
            <div style={{flex:1,display:'flex',gap:14,alignItems:'center'}}>
              {item.imageUrl && <img src={item.imageUrl} alt="" style={{width:56,height:56,borderRadius:8,objectFit:'cover',flexShrink:0}} />}
              <div>
                <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:4}}>
                  <span style={{fontWeight:700,color:'var(--green-deep)'}}>{item.title}</span>
                  {!item.published && <span style={{fontSize:'0.68rem',background:'#fff3e0',color:'#e65100',padding:'1px 8px',borderRadius:20,fontWeight:700}}>DRAFT</span>}
                  <span style={{fontSize:'0.68rem',background:'var(--green-pale)',color:'var(--green-deep)',padding:'1px 8px',borderRadius:20,fontWeight:700}}>{item.type==='devotional'?'Devotional':'Blog'}</span>
                </div>
                <div style={{fontSize:'0.82rem',color:'var(--text-mid)'}}>{item.author} · {item.date} {item.category && `· ${item.category}`}</div>
                {item.excerpt && <div style={{fontSize:'0.8rem',color:'var(--text-light)',marginTop:4}}>{item.excerpt.slice(0,90)}...</div>}
              </div>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button className="btn btn-outline-green" style={{padding:'7px 16px',fontSize:'0.82rem'}} onClick={()=>setForm({...item,tags:Array.isArray(item.tags)?item.tags.join(', '):item.tags})}>✏️ Edit</button>
              <button style={{padding:'7px 16px',borderRadius:8,border:'1.5px solid #fcc',background:'white',color:'#c00',cursor:'pointer',fontSize:'0.82rem',fontFamily:'var(--font-body)'}} onClick={()=>setDeleteId(item.id)}>🗑</button>
            </div>
          </AdminCard>
        ))}
      </div>
      {deleteId && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}}>
          <div style={{background:'white',borderRadius:16,padding:32,maxWidth:380,width:'90%',textAlign:'center'}}>
            <div style={{fontSize:'2.5rem',marginBottom:12}}>⚠️</div>
            <h3 style={{color:'var(--green-deep)',margin:'0 0 8px'}}>Delete Post?</h3>
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
