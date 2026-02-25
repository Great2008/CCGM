import { useState, useEffect } from 'react'
import { useAdmin } from '../AdminApp'
import { getContent, setContent } from '../supabase'

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const ICONS = ['📡','🌟','🙏','📖','⛪','🔥','✨','🤝','🎵','✝']

const DEFAULT = {
  isLive: false,
  liveTitle: 'Sunday Divine Service',
  liveDescription: 'Join us live as we worship together.',
  youtubeUrl: '',
  facebookUrl: '',
  schedule: [
    { day:'Sunday',    name:'Meetings of Different Bodies', time:'', icon:'🤝', broadcast:false },
    { day:'Monday',    name:"Children's Prayer",            time:'', icon:'🙏', broadcast:false },
    { day:'Tuesday',   name:'Bible Study',                  time:'', icon:'📖', broadcast:false },
    { day:'Wednesday', name:'Midweek Service',              time:'', icon:'⛪', broadcast:false },
    { day:'Thursday',  name:'Deliverance Service',          time:'', icon:'🔥', broadcast:false },
    { day:'Friday',    name:'Sabbath Preparation',          time:'', icon:'✨', broadcast:false },
    { day:'Saturday',  name:'Divine Service',               time:'', icon:'🌟', broadcast:true  },
  ],
}

export default function AdminLive() {
  const { showToast } = useAdmin()
  const [data, setData]     = useState(DEFAULT)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getContent('live').then(d => {
      if (d) setData(prev => ({ ...prev, ...d, schedule: d.schedule || prev.schedule }))
      setLoading(false)
    })
  }, [])

  const save = async () => {
    setSaving(true)
    try { await setContent('live', data); showToast('Live settings saved!') }
    catch(e) { showToast(e.message, 'error') }
    setSaving(false)
  }

  const updateSchedule = (i, key, val) => {
    const s = [...data.schedule]; s[i] = { ...s[i], [key]: val }
    setData(d => ({ ...d, schedule: s }))
  }

  if (loading) return <div style={{textAlign:'center',padding:60,color:'var(--text-light)'}}>Loading...</div>

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:24,flexWrap:'wrap',gap:14}}>
        <div>
          <h1 style={{fontFamily:'var(--font-display)',color:'var(--brand-deep)',fontSize:'1.7rem',margin:'0 0 4px'}}>📡 Live Stream</h1>
          <p style={{color:'var(--text-light)',margin:0,fontSize:'0.86rem'}}>Manage your live broadcast settings</p>
        </div>
        <button className="btn btn-green" onClick={save} disabled={saving}>{saving?'⏳ Saving...':'💾 Save Settings'}</button>
      </div>

      {/* LIVE TOGGLE */}
      <div style={{background: data.isLive ? 'linear-gradient(135deg,#dc2626,#b91c1c)' : 'white', borderRadius:16, padding:'24px 28px', marginBottom:20, boxShadow:'var(--shadow-sm)', border: data.isLive ? 'none' : '1.5px solid #e2e8f0', transition:'all 0.3s'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:16}}>
          <div>
            <div style={{fontFamily:'var(--font-display)',fontWeight:900,fontSize:'1.2rem',color: data.isLive ? 'white' : 'var(--brand-deep)',marginBottom:4}}>
              {data.isLive ? '🔴 You Are Live!' : '⚫ Stream is Offline'}
            </div>
            <div style={{fontSize:'0.85rem',color: data.isLive ? 'rgba(255,255,255,0.8)' : 'var(--text-light)'}}>
              {data.isLive ? 'Members can see your live stream right now.' : 'Toggle on when your service begins.'}
            </div>
          </div>
          {/* Big toggle */}
          <div onClick={()=>setData(d=>({...d,isLive:!d.isLive}))} style={{
            width:72,height:38,borderRadius:30,cursor:'pointer',position:'relative',
            background: data.isLive ? 'rgba(255,255,255,0.3)' : '#e2e8f0',
            transition:'background 0.3s',flexShrink:0,border: data.isLive ? '2px solid rgba(255,255,255,0.5)' : '2px solid #cbd5e1',
          }}>
            <div style={{
              position:'absolute',top:3,left: data.isLive ? 36 : 3,
              width:28,height:28,borderRadius:'50%',
              background: data.isLive ? 'white' : '#94a3b8',
              transition:'left 0.25s',boxShadow:'0 2px 6px rgba(0,0,0,0.2)',
            }} />
          </div>
        </div>
      </div>

      {/* STREAM DETAILS */}
      <div style={{background:'white',borderRadius:16,padding:'24px 28px',marginBottom:20,boxShadow:'var(--shadow-sm)',border:'1.5px solid #e2e8f0'}}>
        <h3 style={{margin:'0 0 18px',color:'var(--brand-deep)',fontFamily:'var(--font-display)'}}>Stream Details</h3>
        <div className="form-group">
          <label>Stream Title (shown to viewers)</label>
          <input value={data.liveTitle} onChange={e=>setData(d=>({...d,liveTitle:e.target.value}))} placeholder="e.g. Saturday Divine Service" />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea value={data.liveDescription} onChange={e=>setData(d=>({...d,liveDescription:e.target.value}))} rows={2} placeholder="e.g. Join us as we worship together in the presence of God." style={{resize:'vertical'}} />
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          <div className="form-group" style={{margin:0}}>
            <label>▶ YouTube Live URL</label>
            <input value={data.youtubeUrl} onChange={e=>setData(d=>({...d,youtubeUrl:e.target.value}))} placeholder="https://youtube.com/live/..." />
            <small style={{color:'var(--text-light)',fontSize:'0.74rem'}}>Paste the live video URL from YouTube Studio</small>
          </div>
          <div className="form-group" style={{margin:0}}>
            <label>📘 Facebook Live URL</label>
            <input value={data.facebookUrl} onChange={e=>setData(d=>({...d,facebookUrl:e.target.value}))} placeholder="https://facebook.com/..." />
            <small style={{color:'var(--text-light)',fontSize:'0.74rem'}}>Paste the Facebook live video URL</small>
          </div>
        </div>
      </div>

      {/* SCHEDULE */}
      <div style={{background:'white',borderRadius:16,padding:'24px 28px',marginBottom:20,boxShadow:'var(--shadow-sm)',border:'1.5px solid #e2e8f0'}}>
        <h3 style={{margin:'0 0 6px',color:'var(--brand-deep)',fontFamily:'var(--font-display)'}}>Broadcast Schedule</h3>
        <p style={{color:'var(--text-light)',fontSize:'0.85rem',marginBottom:20}}>Set which services you broadcast live and at what time. These show in the countdown and schedule on the Live page.</p>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {data.schedule.map((s,i)=>(
            <div key={i} style={{
              display:'grid',gridTemplateColumns:'36px 40px 100px 1fr 140px',
              gap:10,alignItems:'center',padding:'12px 14px',borderRadius:10,
              background: s.broadcast ? (s.day==='Saturday'?'#fffbf0':'#f0fdf4') : '#f8fafc',
              border: s.broadcast ? (s.day==='Saturday'?'1.5px solid #fcd34d':'1.5px solid #bbf7d0') : '1.5px solid #e2e8f0',
            }}>
              {/* Broadcast toggle */}
              <div onClick={()=>updateSchedule(i,'broadcast',!s.broadcast)} style={{width:28,height:16,borderRadius:10,background:s.broadcast?'var(--brand-light)':'#cbd5e1',cursor:'pointer',position:'relative',transition:'background 0.2s',flexShrink:0}}>
                <div style={{position:'absolute',top:2,left:s.broadcast?12:2,width:12,height:12,borderRadius:'50%',background:'white',transition:'left 0.2s',boxShadow:'0 1px 3px rgba(0,0,0,0.2)'}} />
              </div>
              {/* Icon */}
              <select value={s.icon||'📡'} onChange={e=>updateSchedule(i,'icon',e.target.value)} style={{padding:'4px 2px',borderRadius:6,border:'1.5px solid #e2e8f0',fontSize:'1.1rem',background:'white',cursor:'pointer'}}>
                {ICONS.map(ic=><option key={ic} value={ic}>{ic}</option>)}
              </select>
              <div style={{fontWeight:700,fontSize:'0.8rem',color:s.day==='Saturday'?'#b45309':'var(--brand-deep)'}}>{s.day}</div>
              <input value={s.name} onChange={e=>updateSchedule(i,'name',e.target.value)} style={{padding:'7px 10px',borderRadius:7,border:'1.5px solid #e2e8f0',width:'100%',fontFamily:'var(--font-body)',fontSize:'0.88rem',boxSizing:'border-box'}} />
              <input value={s.time} onChange={e=>updateSchedule(i,'time',e.target.value)} placeholder="e.g. 9:00 AM" style={{padding:'7px 10px',borderRadius:7,border:'1.5px solid #e2e8f0',width:'100%',fontFamily:'var(--font-body)',fontSize:'0.88rem',boxSizing:'border-box'}} />
            </div>
          ))}
        </div>
        <p style={{fontSize:'0.76rem',color:'var(--text-light)',marginTop:12}}>💡 Toggle the switch on each row to include it in the broadcast schedule.</p>
      </div>

      <button className="btn btn-green" onClick={save} disabled={saving} style={{padding:'12px 32px',fontSize:'0.95rem'}}>
        {saving?'⏳ Saving...':'💾 Save All Live Settings'}
      </button>
    </div>
  )
}
