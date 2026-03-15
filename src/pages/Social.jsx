import { useState } from 'react'
import { MessageCircle, UserPlus, Users, Trophy, Check, X, Heart } from 'lucide-react'

const BUDDIES = [
  {id:1,name:'Jake M.',location:'Claremore, OK · 18 mi',avatar:'💪',vibe:'Strength',schedule:'4x/week',match:94},
  {id:2,name:'Ashley R.',location:'Owasso, OK · 24 mi',avatar:'🏃',vibe:'Hybrid',schedule:'5x/week',match:88},
  {id:3,name:'Marcus T.',location:'Tulsa, OK · 31 mi',avatar:'🏋️',vibe:'Powerlifting',schedule:'4x/week',match:85},
]
const CHALLENGES = [
  {id:1,title:'30-Day Squat Challenge',emoji:'🦵',participants:142,joined:false,desc:'Progressive squat volume for 30 days'},
  {id:2,title:'Oklahoma Spring Shred',emoji:'🌪️',participants:89,joined:false,desc:'8-week fat loss challenge, local prizes!'},
  {id:3,title:'100 Pull-Up Month',emoji:'💪',participants:234,joined:false,desc:'Accumulate 100 pull-ups this month'},
]

export default function Social() {
  const [tab, setTab] = useState('buddies')
  const [buddies, setBuddies] = useState(BUDDIES)
  const [challenges, setChal] = useState(CHALLENGES)

  return (
    <div>
      <div className="anim-up" style={{marginBottom:32}}>
        <h1 className="font-display" style={{fontSize:48,margin:0}}>COMMUNITY <span className="gradient-text">HUB</span></h1>
        <p style={{color:'var(--vf-muted)',marginTop:6}}>Find workout buddies near you · Join challenges · Connect</p>
      </div>
      <div style={{display:'flex',gap:8,marginBottom:24}}>
        {[{id:'buddies',l:'🤝 Buddy Matches'},{id:'challenges',l:'🏆 Challenges'},{id:'local',l:'📍 Local Gyms'}].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={tab===t.id?'btn-primary':'btn-ghost'} style={{padding:'8px 18px',fontSize:13}}>{t.l}</button>
        ))}
      </div>

      {tab==='buddies' && (
        <div>
          <div style={{fontSize:14,color:'var(--vf-muted)',marginBottom:20}}>{buddies.length} nearby athletes matched to your workout style</div>
          {buddies.length===0 ? <div style={{textAlign:'center',padding:60}}><div style={{fontSize:48,marginBottom:12}}>🎉</div><div style={{fontSize:16,fontWeight:600}}>All caught up on matches!</div></div> : (
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:14}}>
              {buddies.map(b => (
                <div key={b.id} className="glass-card" style={{padding:22}}>
                  <div style={{display:'flex',gap:14,marginBottom:14}}>
                    <div style={{width:52,height:52,borderRadius:12,background:'var(--vf-card2)',border:'1px solid var(--vf-border)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0}}>{b.avatar}</div>
                    <div style={{flex:1}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                        <div><div style={{fontSize:16,fontWeight:700}}>{b.name}</div><div style={{fontSize:12,color:'var(--vf-muted)',marginTop:2}}>{b.location}</div></div>
                        <div style={{background:'rgba(57,255,20,.12)',border:'1px solid rgba(57,255,20,.3)',borderRadius:8,padding:'4px 10px',textAlign:'center'}}>
                          <div style={{fontSize:16,fontWeight:800,color:'#39FF14',lineHeight:1}}>{b.match}%</div>
                          <div style={{fontSize:9,color:'var(--vf-muted)'}}>MATCH</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{display:'flex',gap:8,marginBottom:14}}>
                    <span className="badge badge-green">{b.vibe}</span>
                    <span className="badge badge-cyan">{b.schedule}</span>
                  </div>
                  <div style={{display:'flex',gap:8}}>
                    <button style={{width:38,height:38,borderRadius:8,border:'1px solid var(--vf-border)',background:'var(--vf-card2)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--vf-muted)'}} onClick={() => setBuddies(p=>p.filter(x=>x.id!==b.id))}><X size={15}/></button>
                    <button className="btn-ghost" style={{flex:1,justifyContent:'center',fontSize:13}}><MessageCircle size={13}/>Message</button>
                    <button className="btn-primary" style={{flex:1,justifyContent:'center',fontSize:13}} onClick={() => setBuddies(p=>p.filter(x=>x.id!==b.id))}><UserPlus size={13}/>Connect</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab==='challenges' && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:14}}>
          {challenges.map(c => (
            <div key={c.id} style={{background:'var(--vf-card)',border:`1px solid ${c.joined?'rgba(57,255,20,.3)':'var(--vf-border)'}`,borderRadius:16,padding:22,transition:'all .2s'}}>
              <div style={{display:'flex',gap:12,alignItems:'center',marginBottom:10}}>
                <span style={{fontSize:32}}>{c.emoji}</span>
                <div><div style={{fontSize:15,fontWeight:700}}>{c.title}</div><div style={{fontSize:12,color:'var(--vf-muted)'}}>{c.participants} participants</div></div>
                {c.joined && <span className="badge badge-green" style={{marginLeft:'auto'}}><Check size={9}/>Joined</span>}
              </div>
              <p style={{fontSize:13,color:'var(--vf-muted)',margin:'0 0 14px',lineHeight:1.5}}>{c.desc}</p>
              <button className={c.joined?'btn-ghost':'btn-primary'} style={{width:'100%',justifyContent:'center'}} onClick={() => setChal(p=>p.map(x=>x.id===c.id?{...x,joined:!x.joined}:x))}>
                {c.joined?'Leave':'Join Challenge'}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab==='local' && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:14}}>
          {[{n:"Anytime Fitness",c:"Claremore, OK",d:"18 mi",m:12,i:"🏋️",o:true},{n:"Planet Fitness",c:"Owasso, OK",d:"24 mi",m:34,i:"💪",o:true},{n:"Gold's Gym",c:"Tulsa, OK",d:"31 mi",m:89,i:"🥇",o:true},{n:"CrossFit 918",c:"Tulsa, OK",d:"35 mi",m:8,i:"🔥",o:false}].map(g => (
            <div key={g.n} style={{background:'var(--vf-card)',border:'1px solid var(--vf-border)',borderRadius:14,padding:'18px 20px',display:'flex',gap:14}}>
              <div style={{fontSize:32}}>{g.i}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:15,fontWeight:700}}>{g.n}</div>
                <div style={{fontSize:12,color:'var(--vf-muted)',margin:'2px 0 8px'}}>{g.c} · {g.d}</div>
                <div style={{display:'flex',gap:8}}>
                  <span className={`badge ${g.o?'badge-green':'badge-amber'}`}>{g.o?'● Open':'● Closed'}</span>
                  <span className="badge badge-cyan"><Users size={9}/>{g.m} members</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
