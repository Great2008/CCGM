import { Link } from 'react-router-dom'
import { useHomepageContent } from '../hooks/useContent'

export default function Footer() {
  const { data: hp } = useHomepageContent()
  const year = new Date().getFullYear()

  return (
    <footer style={{background:'var(--green-deep)',color:'white',paddingTop:56,paddingBottom:24}}>
      <div className="container">
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:36,marginBottom:44}}>

          {/* Brand */}
          <div>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
              <div style={{width:44,height:44,background:'rgba(255,255,255,0.15)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.3rem',flexShrink:0}}>✝</div>
              <div>
                <div style={{fontFamily:'var(--font-display)',fontWeight:900,fontSize:'0.92rem',lineHeight:1.2}}>Christian Church<br/>Of God Mission</div>
                <div style={{fontSize:'0.62rem',letterSpacing:'0.2em',color:'var(--gold)',textTransform:'uppercase',fontWeight:700,marginTop:2}}>God First</div>
              </div>
            </div>
            <p style={{fontSize:'0.88rem',color:'rgba(255,255,255,0.7)',lineHeight:1.8}}>
              A warm, faith-filled community committed to worship, growth, and service in the name of Jesus Christ.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{fontFamily:'var(--font-display)',fontSize:'1.05rem',marginBottom:16,color:'var(--gold)'}}>Quick Links</h4>
            {[['/', 'Home'],['/sermons','Sermons'],['/events','Events'],['/about','About Us'],['/bible','📖 Bible'],['/hymnal','🎵 Hymnal'],['/devotional','🌅 Devotional'],['/gallery','Gallery']].map(([to,label])=>(
              <Link key={to} to={to} style={{display:'block',color:'rgba(255,255,255,0.72)',fontSize:'0.88rem',marginBottom:7,textDecoration:'none',transition:'color 0.2s'}}
              onMouseEnter={e=>e.target.style.color='white'}
              onMouseLeave={e=>e.target.style.color='rgba(255,255,255,0.72)'}>
                → {label}
              </Link>
            ))}
          </div>

          {/* Service Times — admin-editable */}
          <div>
            <h4 style={{fontFamily:'var(--font-display)',fontSize:'1.05rem',marginBottom:16,color:'var(--gold)'}}>Weekly Programs</h4>
            {hp.serviceTimes.map(({day,name,time})=>(
              <div key={day} style={{marginBottom:10}}>
                <div style={{fontSize:'0.75rem',fontWeight:700,color:'rgba(255,255,255,0.9)',letterSpacing:'0.08em',textTransform:'uppercase'}}>{day}</div>
                <div style={{fontSize:'0.88rem',color:day==='Saturday'?'var(--gold)':'var(--green-light)',fontWeight:day==='Saturday'?700:400}}>{name}{time?` · ${time}`:''}</div>
              </div>
            ))}
          </div>

          {/* Contact — admin-editable */}
          <div>
            <h4 style={{fontFamily:'var(--font-display)',fontSize:'1.05rem',marginBottom:16,color:'var(--gold)'}}>Get In Touch</h4>
            {[
              hp.contact?.address && ['📍', hp.contact.address],
              hp.contact?.phone   && ['📞', hp.contact.phone],
              hp.contact?.email   && ['✉️', hp.contact.email],
            ].filter(Boolean).map(([icon,text])=>(
              <div key={text} style={{display:'flex',gap:10,marginBottom:11,alignItems:'flex-start'}}>
                <span style={{fontSize:'1rem',marginTop:1,flexShrink:0}}>{icon}</span>
                <span style={{fontSize:'0.88rem',color:'rgba(255,255,255,0.72)',lineHeight:1.5}}>{text}</span>
              </div>
            ))}
            {!hp.contact?.address && !hp.contact?.phone && (
              <p style={{fontSize:'0.82rem',color:'rgba(255,255,255,0.4)',fontStyle:'italic'}}>Update contact details in the admin panel.</p>
            )}
            <Link to="/contact" style={{display:'inline-block',marginTop:12,border:'1.5px solid var(--gold)',color:'var(--gold)',padding:'8px 22px',borderRadius:30,fontSize:'0.78rem',fontWeight:700,textDecoration:'none',letterSpacing:'0.08em',textTransform:'uppercase'}}>
              🙏 Prayer Request
            </Link>
          </div>
        </div>

        <div style={{borderTop:'1px solid rgba(255,255,255,0.12)',paddingTop:18,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10}}>
          <p style={{fontSize:'0.8rem',color:'rgba(255,255,255,0.45)'}}>© {year} Christian Church Of God Mission. All rights reserved.</p>
          <p style={{fontSize:'0.8rem',color:'rgba(255,255,255,0.35)'}}>"For God so loved the world..." — John 3:16</p>
        </div>
      </div>
    </footer>
  )
}
