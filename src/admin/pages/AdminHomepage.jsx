import { useState, useEffect } from 'react'
import { useAdmin } from '../AdminApp'
import PageHeader from '../components/PageHeader'
import AdminCard from '../components/AdminCard'
import GithubWarning from '../components/GithubWarning'
import { loadWithFallback, writeContent } from '../github'

const DEFAULT = {
  hero: { title: 'Welcome to Christian Church Of God Mission', subtitle: 'God First — A community of faith, love, and purpose.', ctaText: 'Join Us This Sunday', ctaLink: '/events' },
  serviceTimes: [
    { day: 'Sunday', name: 'Main Worship Service', time: '9:00 AM – 12:00 PM' },
    { day: 'Wednesday', name: 'Bible Study & Prayer', time: '6:00 PM – 8:00 PM' },
    { day: 'Friday', name: 'Youth Service', time: '5:30 PM – 7:30 PM' },
  ],
  announcement: { show: false, text: '' },
  stats: [
    { label: 'Years of Ministry', value: '25+' },
    { label: 'Active Members', value: '500+' },
    { label: 'Weekly Services', value: '3' },
    { label: 'Countries Reached', value: '12+' },
  ],
  contact: { address: '', phone: '', email: '', mapUrl: '' }
}

export default function AdminHomepage() {
  const { showToast } = useAdmin()
  const [data, setData] = useState(DEFAULT)
  const [sha, setSha] = useState(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('hero')

  useEffect(() => {
    loadWithFallback('homepage.json', DEFAULT).then(r => {
      setData({ ...DEFAULT, ...r.content })
      setSha(r.sha)
      setLoading(false)
    })
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      const res = await writeContent('homepage.json', data, sha)
      setSha(res.content.sha)
      showToast('Homepage updated! Site rebuilds in ~30s.')
    } catch(e) { showToast(e.message, 'error') }
    setSaving(false)
  }

  const updateService = (idx, key, val) => {
    const times = [...data.serviceTimes]
    times[idx] = { ...times[idx], [key]: val }
    setData(d => ({ ...d, serviceTimes: times }))
  }

  const addService = () => setData(d => ({ ...d, serviceTimes: [...d.serviceTimes, { day:'', name:'', time:'' }] }))
  const removeService = idx => setData(d => ({ ...d, serviceTimes: d.serviceTimes.filter((_,i)=>i!==idx) }))

  const updateStat = (idx, key, val) => {
    const stats = [...data.stats]
    stats[idx] = { ...stats[idx], [key]: val }
    setData(d => ({ ...d, stats }))
  }

  const tabs = [['hero','🏠 Hero'],['services','⏰ Services'],['announcement','📢 Announcement'],['stats','📊 Stats'],['contact','📍 Contact']]

  if (loading) return <div style={{textAlign:'center',padding:60,color:'var(--text-light)'}}>Loading homepage settings...</div>

  return (
    <div>
      <PageHeader icon="🏠" title="Homepage Content"
        action={<button className="btn btn-green" onClick={save} disabled={saving}>{saving?'⏳ Saving...':'💾 Save Changes'}</button>} />
      <GithubWarning />

      {/* Tabs */}
      <div style={{display:'flex',gap:4,marginBottom:24,flexWrap:'wrap'}}>
        {tabs.map(([id,label]) => (
          <button key={id} onClick={()=>setActiveTab(id)} style={{
            padding:'9px 18px', borderRadius:30, border:'1.5px solid',
            borderColor: activeTab===id ? 'var(--green-mid)' : '#ddd',
            background: activeTab===id ? 'var(--green-mid)' : 'white',
            color: activeTab===id ? 'white' : 'var(--text-mid)',
            fontSize:'0.82rem', fontWeight:700, cursor:'pointer', fontFamily:'var(--font-body)',
          }}>{label}</button>
        ))}
      </div>

      {/* Hero */}
      {activeTab === 'hero' && (
        <AdminCard style={{maxWidth:720}}>
          <h3 style={{margin:'0 0 20px',color:'var(--green-deep)'}}>Hero Section</h3>
          <div className="form-group"><label>Headline</label><input value={data.hero.title} onChange={e=>setData(d=>({...d,hero:{...d.hero,title:e.target.value}}))} placeholder="Welcome to..." /></div>
          <div className="form-group"><label>Subtitle</label><textarea value={data.hero.subtitle} onChange={e=>setData(d=>({...d,hero:{...d.hero,subtitle:e.target.value}}))} rows={2} style={{resize:'vertical'}} /></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            <div className="form-group"><label>CTA Button Text</label><input value={data.hero.ctaText} onChange={e=>setData(d=>({...d,hero:{...d.hero,ctaText:e.target.value}}))} /></div>
            <div className="form-group"><label>CTA Link</label><input value={data.hero.ctaLink} onChange={e=>setData(d=>({...d,hero:{...d.hero,ctaLink:e.target.value}}))} placeholder="/events" /></div>
          </div>
        </AdminCard>
      )}

      {/* Services */}
      {activeTab === 'services' && (
        <AdminCard style={{maxWidth:720}}>
          <h3 style={{margin:'0 0 20px',color:'var(--green-deep)'}}>Service Times</h3>
          {data.serviceTimes.map((s,i) => (
            <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr auto',gap:12,marginBottom:12,alignItems:'end'}}>
              <div className="form-group" style={{margin:0}}><label style={{fontSize:'0.75rem'}}>Day</label><input value={s.day} onChange={e=>updateService(i,'day',e.target.value)} placeholder="Sunday" /></div>
              <div className="form-group" style={{margin:0}}><label style={{fontSize:'0.75rem'}}>Service Name</label><input value={s.name} onChange={e=>updateService(i,'name',e.target.value)} placeholder="Main Worship" /></div>
              <div className="form-group" style={{margin:0}}><label style={{fontSize:'0.75rem'}}>Time</label><input value={s.time} onChange={e=>updateService(i,'time',e.target.value)} placeholder="9:00 AM – 12:00 PM" /></div>
              <button onClick={()=>removeService(i)} style={{padding:'10px 12px',borderRadius:8,border:'1.5px solid #fcc',background:'white',color:'#c00',cursor:'pointer',height:42}}>🗑</button>
            </div>
          ))}
          <button onClick={addService} style={{marginTop:8,padding:'9px 18px',borderRadius:30,border:'1.5px dashed var(--green-mid)',background:'transparent',color:'var(--green-mid)',cursor:'pointer',fontFamily:'var(--font-body)',fontWeight:700,fontSize:'0.85rem'}}>+ Add Service</button>
        </AdminCard>
      )}

      {/* Announcement */}
      {activeTab === 'announcement' && (
        <AdminCard style={{maxWidth:720}}>
          <h3 style={{margin:'0 0 20px',color:'var(--green-deep)'}}>Announcement Banner</h3>
          <div className="form-group">
            <label style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer'}}>
              <input type="checkbox" checked={data.announcement?.show||false} onChange={e=>setData(d=>({...d,announcement:{...d.announcement,show:e.target.checked}}))} style={{width:18,height:18}} />
              Show announcement banner on homepage
            </label>
          </div>
          <div className="form-group"><label>Announcement Text</label><textarea value={data.announcement?.text||''} onChange={e=>setData(d=>({...d,announcement:{...d.announcement,text:e.target.value}}))} rows={3} placeholder="e.g. 🎉 Join us for our Annual Thanksgiving Service this Sunday at 10 AM!" style={{resize:'vertical'}} /></div>
          {data.announcement?.show && data.announcement?.text && (
            <div style={{background:'var(--gold)',borderRadius:10,padding:'12px 18px',marginTop:8,color:'var(--green-deep)',fontWeight:700,fontSize:'0.9rem'}}>
              Preview: {data.announcement.text}
            </div>
          )}
        </AdminCard>
      )}

      {/* Stats */}
      {activeTab === 'stats' && (
        <AdminCard style={{maxWidth:720}}>
          <h3 style={{margin:'0 0 20px',color:'var(--green-deep)'}}>Statistics / Numbers</h3>
          {data.stats?.map((s,i) => (
            <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
              <div className="form-group" style={{margin:0}}><label style={{fontSize:'0.75rem'}}>Value</label><input value={s.value} onChange={e=>updateStat(i,'value',e.target.value)} placeholder="500+" /></div>
              <div className="form-group" style={{margin:0}}><label style={{fontSize:'0.75rem'}}>Label</label><input value={s.label} onChange={e=>updateStat(i,'label',e.target.value)} placeholder="Active Members" /></div>
            </div>
          ))}
        </AdminCard>
      )}

      {/* Contact */}
      {activeTab === 'contact' && (
        <AdminCard style={{maxWidth:720}}>
          <h3 style={{margin:'0 0 20px',color:'var(--green-deep)'}}>Contact Details</h3>
          <div className="form-group"><label>Address</label><input value={data.contact?.address||''} onChange={e=>setData(d=>({...d,contact:{...d.contact,address:e.target.value}}))} placeholder="123 Church Street, City" /></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            <div className="form-group"><label>Phone</label><input value={data.contact?.phone||''} onChange={e=>setData(d=>({...d,contact:{...d.contact,phone:e.target.value}}))} placeholder="+233 20 000 0000" /></div>
            <div className="form-group"><label>Email</label><input type="email" value={data.contact?.email||''} onChange={e=>setData(d=>({...d,contact:{...d.contact,email:e.target.value}}))} placeholder="info@ccogm.org" /></div>
          </div>
          <div className="form-group"><label>Google Maps Embed URL</label><input value={data.contact?.mapUrl||''} onChange={e=>setData(d=>({...d,contact:{...d.contact,mapUrl:e.target.value}}))} placeholder="https://maps.google.com/maps?q=..." /></div>
        </AdminCard>
      )}

      <div style={{marginTop:24}}>
        <button className="btn btn-green" onClick={save} disabled={saving} style={{fontSize:'1rem',padding:'13px 32px'}}>
          {saving ? '⏳ Saving...' : '💾 Save All Homepage Changes'}
        </button>
      </div>
    </div>
  )
}
