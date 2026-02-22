import { useState, useEffect } from 'react'
import { useAdmin } from '../AdminApp'
import PageHeader from '../components/PageHeader'
import AdminCard from '../components/AdminCard'
import GithubWarning from '../components/GithubWarning'
import { loadWithFallback, writeContent } from '../github'

const ICONS = ['🤝','🙏','📖','⛪','🔥','✨','🌟','🎵','📢','✝','🕊','💒']

const DEFAULT = {
  hero: {
    title: 'Welcome to Christian Church Of God Mission',
    subtitle: 'A community rooted in faith, love, and the Word of God. Join us as we worship, grow, and serve together.',
    ctaText: 'Join Us This Saturday',
    ctaLink: '/events',
  },
  serviceTimes: [
    { day: 'Sunday',    name: 'Meetings of Different Bodies', time: '', icon: '🤝' },
    { day: 'Monday',    name: "Children's Prayer",            time: '', icon: '🙏' },
    { day: 'Tuesday',   name: 'Bible Study',                  time: '', icon: '📖' },
    { day: 'Wednesday', name: 'Midweek Service',              time: '', icon: '⛪' },
    { day: 'Thursday',  name: 'Deliverance Service',          time: '', icon: '🔥' },
    { day: 'Friday',    name: 'Sabbath Preparation',          time: '', icon: '✨' },
    { day: 'Saturday',  name: 'Divine Service',               time: '', icon: '🌟' },
  ],
  announcement: { show: false, text: '' },
  stats: [
    { label: 'Years of Ministry', value: '25+' },
    { label: 'Active Members',    value: '500+' },
    { label: 'Weekly Services',   value: '7' },
    { label: 'Countries Reached', value: '12+' },
  ],
  contact: { address: '', phone: '', email: '', mapUrl: '' },
}

export default function AdminHomepage() {
  const { showToast } = useAdmin()
  const [data, setData] = useState(DEFAULT)
  const [sha, setSha] = useState(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('hero')

  useEffect(() => {
    loadWithFallback('homepage.json', DEFAULT).then(r => {
      setData(d => ({ ...d, ...r.content, serviceTimes: r.content.serviceTimes || d.serviceTimes }))
      setSha(r.sha); setLoading(false)
    })
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      const res = await writeContent('homepage.json', data, sha)
      setSha(res.content.sha)
      showToast('Homepage saved! Site rebuilds in ~30s.')
    } catch(e) { showToast(e.message, 'error') }
    setSaving(false)
  }

  const updateService = (idx, key, val) => {
    const times = [...data.serviceTimes]
    times[idx] = { ...times[idx], [key]: val }
    setData(d => ({ ...d, serviceTimes: times }))
  }

  const updateStat = (idx, key, val) => {
    const stats = [...data.stats]
    stats[idx] = { ...stats[idx], [key]: val }
    setData(d => ({ ...d, stats }))
  }

  const tabs = [
    ['hero','🏠 Hero & CTA'],
    ['services','⛪ Weekly Programs'],
    ['announcement','📢 Announcement'],
    ['stats','📊 Statistics'],
    ['contact','📍 Contact'],
  ]

  if (loading) return <div style={{textAlign:'center',padding:60,color:'var(--text-light)'}}>Loading...</div>

  return (
    <div>
      <PageHeader icon="🏠" title="Homepage Content" subtitle="All changes go live within 30 seconds after saving"
        action={<button className="btn btn-green" onClick={save} disabled={saving}>{saving?'⏳ Saving...':'💾 Save All Changes'}</button>} />
      <GithubWarning />

      <div style={{display:'flex',gap:6,marginBottom:24,flexWrap:'wrap'}}>
        {tabs.map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={{
            padding:'9px 18px',borderRadius:30,border:'1.5px solid',
            borderColor:tab===id?'var(--green-mid)':'#ddd',
            background:tab===id?'var(--green-mid)':'white',
            color:tab===id?'white':'var(--text-mid)',
            fontSize:'0.82rem',fontWeight:700,cursor:'pointer',fontFamily:'var(--font-body)',
          }}>{label}</button>
        ))}
      </div>

      {/* HERO */}
      {tab==='hero'&&(
        <AdminCard style={{maxWidth:720}}>
          <h3 style={{margin:'0 0 20px',color:'var(--green-deep)'}}>Hero Section & Call to Action</h3>
          <div className="form-group"><label>Page Title</label><input value={data.hero.title} onChange={e=>setData(d=>({...d,hero:{...d.hero,title:e.target.value}}))} /></div>
          <div className="form-group"><label>Subtitle / Tagline</label><textarea value={data.hero.subtitle} onChange={e=>setData(d=>({...d,hero:{...d.hero,subtitle:e.target.value}}))} rows={3} style={{resize:'vertical'}} /></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            <div className="form-group"><label>Button Text</label><input value={data.hero.ctaText} onChange={e=>setData(d=>({...d,hero:{...d.hero,ctaText:e.target.value}}))} placeholder="Join Us This Saturday" /></div>
            <div className="form-group"><label>Button Link</label><input value={data.hero.ctaLink} onChange={e=>setData(d=>({...d,hero:{...d.hero,ctaLink:e.target.value}}))} placeholder="/events" /></div>
          </div>
        </AdminCard>
      )}

      {/* SERVICE TIMES */}
      {tab==='services'&&(
        <AdminCard style={{maxWidth:800}}>
          <h3 style={{margin:'0 0 8px',color:'var(--green-deep)'}}>Weekly Programs</h3>
          <p style={{color:'var(--text-light)',fontSize:'0.85rem',marginBottom:20}}>Edit the name and time for each day. Saturday (Divine Service) is your main Sabbath worship.</p>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {data.serviceTimes.map((s,i)=>(
              <div key={i} style={{display:'grid',gridTemplateColumns:'40px 100px 1fr 160px',gap:12,alignItems:'center',padding:'12px 16px',background:s.day==='Saturday'?'#fffbf0':'#f9f9f9',borderRadius:10,border:s.day==='Saturday'?'1.5px solid var(--gold)':'1.5px solid #eee'}}>
                {/* Icon picker */}
                <select value={s.icon||'✝'} onChange={e=>updateService(i,'icon',e.target.value)} style={{padding:'6px 4px',borderRadius:6,border:'1.5px solid #ddd',fontSize:'1.1rem',fontFamily:'var(--font-body)',background:'white'}}>
                  {ICONS.map(ic=><option key={ic} value={ic}>{ic}</option>)}
                </select>
                <div style={{fontWeight:900,fontSize:'0.82rem',color:s.day==='Saturday'?'#b8860b':'var(--green-deep)',letterSpacing:'0.05em'}}>{s.day}</div>
                <div className="form-group" style={{margin:0}}><input value={s.name} onChange={e=>updateService(i,'name',e.target.value)} placeholder="Program name" style={{padding:'8px 12px',borderRadius:8,border:'1.5px solid #ddd',width:'100%',fontFamily:'var(--font-body)',fontSize:'0.9rem'}} /></div>
                <div className="form-group" style={{margin:0}}><input value={s.time} onChange={e=>updateService(i,'time',e.target.value)} placeholder="e.g. 9:00 AM" style={{padding:'8px 12px',borderRadius:8,border:'1.5px solid #ddd',width:'100%',fontFamily:'var(--font-body)',fontSize:'0.9rem'}} /></div>
              </div>
            ))}
          </div>
          <p style={{marginTop:14,fontSize:'0.78rem',color:'var(--text-light)'}}>
            💡 Leave time blank if it varies. Saturday is highlighted as the Divine Service (Sabbath).
          </p>
        </AdminCard>
      )}

      {/* ANNOUNCEMENT */}
      {tab==='announcement'&&(
        <AdminCard style={{maxWidth:720}}>
          <h3 style={{margin:'0 0 20px',color:'var(--green-deep)'}}>Announcement Banner</h3>
          <div className="form-group">
            <label style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer'}}>
              <input type="checkbox" checked={data.announcement?.show||false} onChange={e=>setData(d=>({...d,announcement:{...d.announcement,show:e.target.checked}}))} style={{width:18,height:18}} />
              Show announcement banner at top of homepage
            </label>
          </div>
          <div className="form-group">
            <label>Announcement Text</label>
            <textarea value={data.announcement?.text||''} onChange={e=>setData(d=>({...d,announcement:{...d.announcement,text:e.target.value}}))} rows={3} placeholder="🎉 Join us for our Annual Thanksgiving Service this Saturday at 10 AM!" style={{resize:'vertical'}} />
          </div>
          {data.announcement?.show && data.announcement?.text && (
            <div style={{background:'var(--gold)',borderRadius:10,padding:'12px 18px',marginTop:8,color:'var(--green-deep)',fontWeight:700,fontSize:'0.9rem'}}>
              Preview: {data.announcement.text}
            </div>
          )}
        </AdminCard>
      )}

      {/* STATS */}
      {tab==='stats'&&(
        <AdminCard style={{maxWidth:600}}>
          <h3 style={{margin:'0 0 20px',color:'var(--green-deep)'}}>Statistics</h3>
          {data.stats?.map((s,i)=>(
            <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
              <div className="form-group" style={{margin:0}}><label style={{fontSize:'0.75rem'}}>Value</label><input value={s.value} onChange={e=>updateStat(i,'value',e.target.value)} placeholder="500+" /></div>
              <div className="form-group" style={{margin:0}}><label style={{fontSize:'0.75rem'}}>Label</label><input value={s.label} onChange={e=>updateStat(i,'label',e.target.value)} placeholder="Active Members" /></div>
            </div>
          ))}
        </AdminCard>
      )}

      {/* CONTACT */}
      {tab==='contact'&&(
        <AdminCard style={{maxWidth:720}}>
          <h3 style={{margin:'0 0 20px',color:'var(--green-deep)'}}>Contact Details</h3>
          <div className="form-group"><label>Church Address</label><input value={data.contact?.address||''} onChange={e=>setData(d=>({...d,contact:{...d.contact,address:e.target.value}}))} placeholder="123 Church Street, City, Country" /></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            <div className="form-group"><label>Phone Number</label><input value={data.contact?.phone||''} onChange={e=>setData(d=>({...d,contact:{...d.contact,phone:e.target.value}}))} placeholder="+233 20 000 0000" /></div>
            <div className="form-group"><label>Email Address</label><input type="email" value={data.contact?.email||''} onChange={e=>setData(d=>({...d,contact:{...d.contact,email:e.target.value}}))} placeholder="info@ccogm.org" /></div>
          </div>
          <div className="form-group"><label>Google Maps Embed URL <span style={{fontWeight:400,color:'var(--text-light)',fontSize:'0.78rem'}}>(optional — from maps.google.com "Share > Embed")</span></label><input value={data.contact?.mapUrl||''} onChange={e=>setData(d=>({...d,contact:{...d.contact,mapUrl:e.target.value}}))} placeholder="https://maps.google.com/maps?q=..." /></div>
        </AdminCard>
      )}

      <div style={{marginTop:24}}>
        <button className="btn btn-green" onClick={save} disabled={saving} style={{fontSize:'1rem',padding:'13px 32px'}}>
          {saving?'⏳ Saving...':'💾 Save All Homepage Changes'}
        </button>
      </div>
    </div>
  )
}
