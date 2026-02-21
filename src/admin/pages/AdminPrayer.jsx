import { useState, useEffect } from 'react'
import { useAdmin } from '../AdminApp'
import PageHeader from '../components/PageHeader'
import AdminCard from '../components/AdminCard'
import GithubWarning from '../components/GithubWarning'
import { loadWithFallback, writeContent } from '../github'

const STATUS_COLORS = {
  new: { bg:'#e3f2fd', text:'#1565c0', label:'New' },
  praying: { bg:'#e8f5e9', text:'#2e7d32', label:'Praying' },
  answered: { bg:'#fff9c4', text:'#f57f17', label:'Answered' },
  closed: { bg:'#f5f5f5', text:'#757575', label:'Closed' },
}

export default function AdminPrayer() {
  const { showToast } = useAdmin()
  const [items, setItems] = useState([])
  const [sha, setSha] = useState(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [note, setNote] = useState('')

  useEffect(() => {
    loadWithFallback('prayers.json', []).then(r => { setItems(r.content); setSha(r.sha); setLoading(false) })
  }, [])

  const save = async (updated) => {
    setSaving(true)
    try {
      const res = await writeContent('prayers.json', updated, sha)
      setSha(res.content.sha); setItems(updated)
      showToast('Prayer list updated!')
    } catch(e) { showToast(e.message, 'error') }
    setSaving(false)
  }

  const updateStatus = (id, status) => {
    const updated = items.map(i => i.id===id ? {...i, status, updatedAt: new Date().toISOString()} : i)
    save(updated)
    if (selected?.id === id) setSelected(s => ({ ...s, status }))
  }

  const addNote = (id) => {
    if (!note.trim()) return
    const updated = items.map(i => i.id===id ? {
      ...i,
      notes: [...(i.notes||[]), { text: note.trim(), date: new Date().toLocaleDateString(), by: 'Pastor' }],
      updatedAt: new Date().toISOString(),
    } : i)
    save(updated)
    setSelected(s => ({ ...s, notes: [...(s.notes||[]), { text: note.trim(), date: new Date().toLocaleDateString(), by:'Pastor' }] }))
    setNote('')
  }

  const deleteRequest = id => {
    save(items.filter(i => i.id !== id))
    setSelected(null)
  }

  const filtered = items.filter(i => filterStatus === 'all' || i.status === filterStatus || (!i.status && filterStatus === 'new'))
  const counts = { all: items.length, new: items.filter(i=>!i.status||i.status==='new').length, praying: items.filter(i=>i.status==='praying').length, answered: items.filter(i=>i.status==='answered').length }

  if (loading) return <div style={{textAlign:'center',padding:60,color:'var(--text-light)'}}>Loading prayer requests...</div>

  return (
    <div>
      <PageHeader icon="🙏" title="Prayer Requests" subtitle={`${counts.all} total · ${counts.new} new · ${counts.praying} praying · ${counts.answered} answered`} />
      <GithubWarning />

      {/* Filter tabs */}
      <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
        {[['all','All',counts.all],['new','New',counts.new],['praying','Praying',counts.praying],['answered','Answered',counts.answered],['closed','Closed','']].map(([id,label,count]) => (
          <button key={id} onClick={()=>setFilterStatus(id)} style={{
            padding:'8px 18px', borderRadius:30, border:'1.5px solid',
            borderColor: filterStatus===id ? 'var(--green-mid)' : '#ddd',
            background: filterStatus===id ? 'var(--green-mid)' : 'white',
            color: filterStatus===id ? 'white' : 'var(--text-mid)',
            fontSize:'0.82rem', fontWeight:700, cursor:'pointer', fontFamily:'var(--font-body)',
            display:'flex', gap:6, alignItems:'center',
          }}>
            {label} {count!=='' && <span style={{background:'rgba(255,255,255,0.3)',borderRadius:20,padding:'0 6px',fontSize:'0.72rem'}}>{count}</span>}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <AdminCard><div style={{textAlign:'center',padding:'40px 20px',color:'var(--text-light)'}}>No {filterStatus !== 'all' ? filterStatus : ''} prayer requests.</div></AdminCard>
      )}

      <div style={{display:'grid',gridTemplateColumns:selected?'1fr 380px':'1fr',gap:20,alignItems:'start'}}>
        {/* List */}
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {filtered.map(item => {
            const sc = STATUS_COLORS[item.status||'new']
            return (
              <div key={item.id} onClick={()=>setSelected(item)} style={{
                background: selected?.id===item.id ? 'var(--green-pale)' : 'white',
                borderRadius:12, padding:'16px 18px', cursor:'pointer',
                boxShadow:'0 2px 10px rgba(0,0,0,0.07)', transition:'all 0.2s',
                borderLeft: `4px solid ${selected?.id===item.id ? 'var(--green-mid)' : 'transparent'}`,
              }}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12}}>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,color:'var(--green-deep)',marginBottom:4,fontSize:'0.95rem'}}>{item.name||'Anonymous'}</div>
                    <div style={{fontSize:'0.82rem',color:'var(--text-dark)',lineHeight:1.6,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{item.request}</div>
                    <div style={{fontSize:'0.72rem',color:'var(--text-light)',marginTop:6}}>{item.email && `📧 ${item.email} · `}{item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : item.date}</div>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:6}}>
                    <span style={{padding:'3px 12px',borderRadius:20,fontSize:'0.68rem',fontWeight:700,background:sc.bg,color:sc.text}}>{sc.label}</span>
                    {item.notes?.length>0 && <span style={{fontSize:'0.7rem',color:'var(--text-light)'}}>💬 {item.notes.length} note{item.notes.length!==1?'s':''}</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Detail */}
        {selected && (
          <div style={{position:'sticky',top:20}}>
            <AdminCard>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
                <h3 style={{margin:0,color:'var(--green-deep)',fontSize:'1rem'}}>{selected.name||'Anonymous'}</h3>
                <button onClick={()=>setSelected(null)} style={{background:'none',border:'none',cursor:'pointer',fontSize:'1.2rem',color:'var(--text-light)'}}>✕</button>
              </div>
              {selected.email && <div style={{fontSize:'0.82rem',color:'var(--text-mid)',marginBottom:12}}>📧 {selected.email}</div>}
              <div style={{background:'var(--green-pale)',borderRadius:10,padding:'14px',marginBottom:16,fontSize:'0.9rem',lineHeight:1.8,color:'var(--text-dark)'}}>{selected.request}</div>
              {selected.prayerType && <div style={{fontSize:'0.78rem',color:'var(--text-light)',marginBottom:16}}>Type: {selected.prayerType}</div>}

              {/* Status */}
              <div style={{marginBottom:16}}>
                <div style={{fontSize:'0.75rem',fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--text-light)',marginBottom:8}}>Update Status</div>
                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                  {Object.entries(STATUS_COLORS).map(([s,c]) => (
                    <button key={s} onClick={()=>updateStatus(selected.id,s)} disabled={saving} style={{
                      padding:'5px 14px',borderRadius:20,border:`1.5px solid ${c.bg}`,
                      background: (selected.status||'new')===s ? c.bg : 'white',
                      color: (selected.status||'new')===s ? c.text : 'var(--text-mid)',
                      fontSize:'0.75rem',fontWeight:700,cursor:'pointer',fontFamily:'var(--font-body)',
                    }}>{c.label}</button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {selected.notes?.length>0 && (
                <div style={{marginBottom:16}}>
                  <div style={{fontSize:'0.75rem',fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--text-light)',marginBottom:8}}>Pastor's Notes</div>
                  {selected.notes.map((n,i) => (
                    <div key={i} style={{background:'#f9f9f9',borderRadius:8,padding:'10px 12px',marginBottom:8,fontSize:'0.82rem',lineHeight:1.7,color:'var(--text-dark)'}}>
                      {n.text}<div style={{fontSize:'0.7rem',color:'var(--text-light)',marginTop:4}}>{n.by} · {n.date}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add note */}
              <div>
                <div style={{fontSize:'0.75rem',fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--text-light)',marginBottom:8}}>Add Note</div>
                <textarea value={note} onChange={e=>setNote(e.target.value)} rows={3}
                  placeholder="Add a pastoral note or update..."
                  style={{width:'100%',padding:'10px 12px',borderRadius:8,border:'1.5px solid #ddd',fontFamily:'var(--font-body)',fontSize:'0.85rem',resize:'vertical',boxSizing:'border-box'}} />
                <div style={{display:'flex',justifyContent:'space-between',marginTop:10,gap:8}}>
                  <button className="btn btn-green" style={{flex:1,justifyContent:'center',fontSize:'0.82rem',padding:'8px'}} onClick={()=>addNote(selected.id)} disabled={!note.trim()||saving}>💬 Add Note</button>
                  <button style={{padding:'8px 14px',borderRadius:8,border:'1.5px solid #fcc',background:'white',color:'#c00',cursor:'pointer',fontSize:'0.78rem',fontFamily:'var(--font-body)'}} onClick={()=>deleteRequest(selected.id)}>🗑 Delete</button>
                </div>
              </div>
            </AdminCard>
          </div>
        )}
      </div>
    </div>
  )
}
