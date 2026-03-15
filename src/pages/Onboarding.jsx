import { useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'

const GOALS = [
  {id:'Build Strength', icon:'🏋️', desc:'Heavier lifts, more power'},
  {id:'Build Muscle', icon:'💪', desc:'Hypertrophy & size'},
  {id:'Lose Body Fat', icon:'🔥', desc:'Lean out & cut'},
  {id:'Improve Endurance', icon:'🏃', desc:'Cardio & stamina'},
  {id:'General Fitness', icon:'⚡', desc:'Overall health & wellness'},
  {id:'Active Recovery', icon:'🧘', desc:'Mobility & injury prevention'},
]

const EXPERIENCE = [
  {id:'Beginner', icon:'🌱', desc:'Less than 1 year of consistent training'},
  {id:'Intermediate', icon:'📈', desc:'1-3 years, know the basics'},
  {id:'Advanced', icon:'🔥', desc:'3+ years, serious athlete'},
]

export default function Onboarding({ onComplete, prefillName='', prefillEmail='' }) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [goal, setGoal] = useState(null)
  const [experience, setExperience] = useState(null)

  function finish() {
    onComplete({ name, email, goal, experience, joinDate: new Date().toISOString() })
  }

  if (step === 0) return (
    <div style={{minHeight:'100vh',background:'var(--vf-bg)',display:'flex',alignItems:'center',justifyContent:'center',padding:40,position:'relative',overflow:'hidden'}}>
      <div style={{position:'fixed',inset:0,pointerEvents:'none'}}>
        <div style={{position:'absolute',top:'15%',left:'10%',width:600,height:600,background:'radial-gradient(circle,rgba(57,255,20,.05) 0%,transparent 70%)',borderRadius:'50%'}}/>
        <div style={{position:'absolute',bottom:'10%',right:'10%',width:400,height:400,background:'radial-gradient(circle,rgba(0,229,255,.04) 0%,transparent 70%)',borderRadius:'50%'}}/>
      </div>
      <div className="anim-up" style={{textAlign:'center',maxWidth:500,position:'relative'}}>
        <div style={{fontSize:72,marginBottom:20}}>⚡</div>
        <div className="font-display" style={{fontSize:80,lineHeight:.9,marginBottom:20}}>
          <span>VIBE</span><span className="gradient-text">FIT</span><br/><span>PRO</span>
        </div>
        <p style={{color:'var(--vf-muted)',fontSize:17,marginBottom:40,lineHeight:1.7}}>
          AI-powered fitness built around <em>your</em> goals.<br/>
          No generic plans. No pre-filled data. Just results.
        </p>
        <div style={{display:'flex',flexDirection:'column',gap:12,maxWidth:380,margin:'0 auto 36px'}}>
          <input className="vf-input" style={{fontSize:16,padding:'14px'}} placeholder="Your first name" value={name} onChange={e=>setName(e.target.value)}/>
          <input className="vf-input" style={{fontSize:16,padding:'14px'}} type="email" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)}/>
        </div>
        <button className="btn-primary" style={{fontSize:16,padding:'14px 44px'}} disabled={!name.trim()} onClick={() => setStep(1)}>
          Get Started <ArrowRight size={18}/>
        </button>
      </div>
    </div>
  )

  if (step === 1) return (
    <div style={{minHeight:'100vh',background:'var(--vf-bg)',display:'flex',alignItems:'center',justifyContent:'center',padding:40}}>
      <div style={{width:'100%',maxWidth:600}}>
        <div className="anim-up">
          <div style={{marginBottom:6,fontSize:13,color:'var(--vf-muted)'}}>Step 1 of 2</div>
          <div className="progress-track" style={{height:3,marginBottom:36}}><div className="progress-fill" style={{width:'50%',background:'#39FF14'}}/></div>
          <h2 className="font-display" style={{fontSize:48,marginBottom:8}}>WHAT'S YOUR <span className="gradient-text">PRIMARY GOAL?</span></h2>
          <p style={{color:'var(--vf-muted)',marginBottom:32}}>This shapes your entire AI-generated program.</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:32}}>
            {GOALS.map(g => (
              <div key={g.id} className={`onboard-option ${goal===g.id?'selected':''}`} onClick={() => setGoal(g.id)}>
                <span style={{fontSize:28,flexShrink:0}}>{g.icon}</span>
                <div>
                  <div style={{fontSize:15,fontWeight:600,color:goal===g.id?'#39FF14':'var(--vf-text)'}}>{g.id}</div>
                  <div style={{fontSize:12,color:'var(--vf-muted)'}}>{g.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <button className="btn-primary" style={{width:'100%',justifyContent:'center',padding:14,fontSize:15}} disabled={!goal} onClick={() => setStep(2)}>
            Continue <ArrowRight size={18}/>
          </button>
        </div>
      </div>
    </div>
  )

  if (step === 2) return (
    <div style={{minHeight:'100vh',background:'var(--vf-bg)',display:'flex',alignItems:'center',justifyContent:'center',padding:40}}>
      <div style={{width:'100%',maxWidth:600}}>
        <div className="anim-up">
          <div style={{marginBottom:6,fontSize:13,color:'var(--vf-muted)'}}>Step 2 of 2</div>
          <div className="progress-track" style={{height:3,marginBottom:36}}><div className="progress-fill" style={{width:'100%',background:'#39FF14'}}/></div>
          <h2 className="font-display" style={{fontSize:48,marginBottom:8}}>YOUR <span className="gradient-text">EXPERIENCE LEVEL?</span></h2>
          <p style={{color:'var(--vf-muted)',marginBottom:32}}>Be honest — it affects exercise selection and intensity.</p>
          <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:32}}>
            {EXPERIENCE.map(e => (
              <div key={e.id} className={`onboard-option ${experience===e.id?'selected':''}`} onClick={() => setExperience(e.id)}>
                <span style={{fontSize:32,flexShrink:0}}>{e.icon}</span>
                <div>
                  <div style={{fontSize:16,fontWeight:700,color:experience===e.id?'#39FF14':'var(--vf-text)'}}>{e.id}</div>
                  <div style={{fontSize:13,color:'var(--vf-muted)'}}>{e.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <button className="btn-primary" style={{width:'100%',justifyContent:'center',padding:14,fontSize:15}} disabled={!experience} onClick={finish}>
            Build My Program <ArrowRight size={18}/>
          </button>
        </div>
      </div>
    </div>
  )

  return null
}
