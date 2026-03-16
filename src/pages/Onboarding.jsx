import { useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { calculateCalories, calculateMacros, saveGoalToStorage } from '../utils/calories'

const GOALS = [
  { id:'Lose Body Fat',    icon:'🔥', desc:'Caloric deficit, fat loss' },
  { id:'Lose Fat Slowly',  icon:'📉', desc:'Gentle cut, preserve muscle' },
  { id:'Build Muscle',     icon:'💪', desc:'Lean bulk, strength gains' },
  { id:'Bulk',             icon:'🏋️', desc:'Aggressive muscle building' },
  { id:'Maintain Weight',  icon:'⚖️', desc:'Stay at current weight' },
  { id:'Improve Endurance',icon:'🏃', desc:'Cardio & stamina focus' },
  { id:'General Fitness',  icon:'⚡', desc:'Overall health & wellness' },
  { id:'Active Recovery',  icon:'🧘', desc:'Mobility & injury prevention' },
]

const ACTIVITY = [
  { id:'Sedentary',         desc:'Little or no exercise' },
  { id:'Lightly Active',    desc:'1-3 days/week exercise' },
  { id:'Moderately Active', desc:'3-5 days/week exercise' },
  { id:'Very Active',       desc:'6-7 days/week hard training' },
  { id:'Extremely Active',  desc:'Athlete, 2x/day training' },
]

const EXPERIENCE = [
  { id:'Beginner',     icon:'🌱', desc:'Less than 1 year training' },
  { id:'Intermediate', icon:'📈', desc:'1-3 years, know the basics' },
  { id:'Advanced',     icon:'🔥', desc:'3+ years, serious athlete' },
]

export default function Onboarding({ onComplete, prefillName='', prefillEmail='' }) {
  const [step, setStep] = useState(0)

  // Step 0: Welcome
  const [name,  setName]  = useState(prefillName)
  const [email, setEmail] = useState(prefillEmail)

  // Step 1: Body stats
  const [age,     setAge]     = useState('')
  const [gender,  setGender]  = useState('Male')
  const [height,  setHeight]  = useState('')
  const [weight,  setWeight]  = useState('')
  const [bodyFat, setBodyFat] = useState('')

  // Step 2: Goal
  const [goal, setGoal] = useState(null)

  // Step 3: Activity
  const [activity, setActivity] = useState(null)

  // Step 4: Experience
  const [experience, setExperience] = useState(null)

  function finish() {
    const profile = { name, email, goal, experience, activity, age, gender, height, weight, bodyFat, joinDate: new Date().toISOString() }
    const calories = calculateCalories({ weight, height, age, gender, activityLevel: activity, goal })
    const macros   = calculateMacros(calories, goal, weight)
    saveGoalToStorage(calories, macros)
    onComplete(profile)
  }

  const totalSteps = 5

  function Progress({ current }) {
    return (
      <div style={{ maxWidth:560, margin:'0 auto 36px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8, fontSize:12, color:'#6B6B8A' }}>
          <span>Step {current} of {totalSteps}</span>
          <span>{Math.round((current/totalSteps)*100)}% complete</span>
        </div>
        <div style={{ height:4, background:'#252540', borderRadius:2, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${(current/totalSteps)*100}%`, background:'linear-gradient(90deg,#39FF14,#00C851)', borderRadius:2, transition:'width .4s ease' }}/>
        </div>
      </div>
    )
  }

  // ── Step 0: Welcome ──
  if (step === 0) return (
    <div style={{ minHeight:'100vh', background:'#080810', display:'flex', alignItems:'center', justifyContent:'center', padding:40, position:'relative', overflow:'hidden' }}>
      <div style={{ position:'fixed', inset:0, pointerEvents:'none' }}>
        <div style={{ position:'absolute', top:'10%', left:'10%', width:600, height:600, background:'radial-gradient(circle,rgba(57,255,20,.05) 0%,transparent 70%)', borderRadius:'50%' }}/>
        <div style={{ position:'absolute', bottom:'10%', right:'10%', width:400, height:400, background:'radial-gradient(circle,rgba(0,229,255,.04) 0%,transparent 70%)', borderRadius:'50%' }}/>
      </div>
      <div className="anim-up" style={{ textAlign:'center', maxWidth:500, position:'relative' }}>
        <div style={{ width:72, height:72, background:'linear-gradient(135deg,#39FF14,#00C851)', borderRadius:20, display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, margin:'0 auto 24px', boxShadow:'0 0 40px rgba(57,255,20,.3)' }}>⚡</div>
        <div className="font-display" style={{ fontSize:64, lineHeight:.9, marginBottom:20 }}>
          VIBE<span className="gradient-text">FIT</span><br/>PRO
        </div>
        <p style={{ color:'#6B6B8A', fontSize:16, marginBottom:36, lineHeight:1.7 }}>
          AI-powered fitness built around <em>your</em> body and goals.<br/>
          We'll calculate your exact calorie target.
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:12, maxWidth:360, margin:'0 auto 32px' }}>
          <input className="vf-input" style={{ fontSize:15, padding:'13px' }} placeholder="Your first name" value={name} onChange={e=>setName(e.target.value)}/>
          <input className="vf-input" type="email" style={{ fontSize:15, padding:'13px' }} placeholder="Email address (optional)" value={email} onChange={e=>setEmail(e.target.value)}/>
        </div>
        <button className="btn-primary" style={{ fontSize:16, padding:'14px 44px' }} disabled={!name.trim()} onClick={() => setStep(1)}>
          Get Started <ArrowRight size={18}/>
        </button>
      </div>
    </div>
  )

  // ── Step 1: Body Stats ──
  if (step === 1) return (
    <div style={{ minHeight:'100vh', background:'#080810', display:'flex', alignItems:'center', justifyContent:'center', padding:40 }}>
      <div style={{ width:'100%', maxWidth:560 }}>
        <div className="anim-up">
          <Progress current={1}/>
          <h2 className="font-display" style={{ fontSize:44, marginBottom:8 }}>YOUR <span className="gradient-text">BODY STATS</span></h2>
          <p style={{ color:'#6B6B8A', marginBottom:28 }}>Used to calculate your personal calorie target</p>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
            <div>
              <label style={{ fontSize:11, color:'#6B6B8A', fontWeight:600, letterSpacing:'.5px', display:'block', marginBottom:6 }}>AGE</label>
              <input className="vf-input" type="number" placeholder="25" value={age} onChange={e=>setAge(e.target.value)}/>
            </div>
            <div>
              <label style={{ fontSize:11, color:'#6B6B8A', fontWeight:600, letterSpacing:'.5px', display:'block', marginBottom:6 }}>GENDER</label>
              <div style={{ display:'flex', gap:8 }}>
                {['Male','Female','Other'].map(g => (
                  <button key={g} onClick={() => setGender(g)}
                    style={{ flex:1, padding:'10px', borderRadius:8, border:`1px solid ${gender===g?'#39FF14':'#252540'}`, background:gender===g?'rgba(57,255,20,.1)':'#0F0F1A', color:gender===g?'#39FF14':'#6B6B8A', cursor:'pointer', fontSize:13, fontWeight:600, transition:'all .2s' }}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize:11, color:'#6B6B8A', fontWeight:600, letterSpacing:'.5px', display:'block', marginBottom:6 }}>HEIGHT (inches)</label>
              <input className="vf-input" type="number" placeholder="e.g. 71 (for 5ft 11in)" value={height} onChange={e=>setHeight(e.target.value)}/>
              <div style={{ fontSize:10, color:'#6B6B8A', marginTop:4 }}>5ft = 60in · 6ft = 72in</div>
            </div>
            <div>
              <label style={{ fontSize:11, color:'#6B6B8A', fontWeight:600, letterSpacing:'.5px', display:'block', marginBottom:6 }}>WEIGHT (lbs)</label>
              <input className="vf-input" type="number" placeholder="e.g. 185" value={weight} onChange={e=>setWeight(e.target.value)}/>
            </div>
            <div style={{ gridColumn:'1/-1' }}>
              <label style={{ fontSize:11, color:'#6B6B8A', fontWeight:600, letterSpacing:'.5px', display:'block', marginBottom:6 }}>ESTIMATED BODY FAT % (optional)</label>
              <input className="vf-input" type="number" placeholder="e.g. 18" value={bodyFat} onChange={e=>setBodyFat(e.target.value)}/>
              <div style={{ fontSize:10, color:'#6B6B8A', marginTop:4 }}>Not sure? Leave blank — we'll estimate from your other stats</div>
            </div>
          </div>

          <div style={{ display:'flex', gap:10 }}>
            <button className="btn-ghost" onClick={() => setStep(0)}>← Back</button>
            <button className="btn-primary" style={{ flex:1, justifyContent:'center', padding:13 }} disabled={!age||!height||!weight} onClick={() => setStep(2)}>
              Continue <ArrowRight size={17}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // ── Step 2: Goal ──
  if (step === 2) return (
    <div style={{ minHeight:'100vh', background:'#080810', display:'flex', alignItems:'center', justifyContent:'center', padding:40 }}>
      <div style={{ width:'100%', maxWidth:580 }}>
        <div className="anim-up">
          <Progress current={2}/>
          <h2 className="font-display" style={{ fontSize:44, marginBottom:8 }}>YOUR <span className="gradient-text">PRIMARY GOAL</span></h2>
          <p style={{ color:'#6B6B8A', marginBottom:28 }}>This shapes your calorie target and workout program</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:24 }}>
            {GOALS.map(g => (
              <div key={g.id} className={`onboard-option ${goal===g.id?'selected':''}`} onClick={() => setGoal(g.id)}>
                <span style={{ fontSize:26, flexShrink:0 }}>{g.icon}</span>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:goal===g.id?'#39FF14':'#F0F0FF' }}>{g.id}</div>
                  <div style={{ fontSize:12, color:'#6B6B8A' }}>{g.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button className="btn-ghost" onClick={() => setStep(1)}>← Back</button>
            <button className="btn-primary" style={{ flex:1, justifyContent:'center', padding:13 }} disabled={!goal} onClick={() => setStep(3)}>
              Continue <ArrowRight size={17}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // ── Step 3: Activity Level ──
  if (step === 3) return (
    <div style={{ minHeight:'100vh', background:'#080810', display:'flex', alignItems:'center', justifyContent:'center', padding:40 }}>
      <div style={{ width:'100%', maxWidth:560 }}>
        <div className="anim-up">
          <Progress current={3}/>
          <h2 className="font-display" style={{ fontSize:44, marginBottom:8 }}>ACTIVITY <span className="gradient-text">LEVEL</span></h2>
          <p style={{ color:'#6B6B8A', marginBottom:28 }}>How active are you outside the gym?</p>
          <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
            {ACTIVITY.map(a => (
              <div key={a.id} className={`onboard-option ${activity===a.id?'selected':''}`} onClick={() => setActivity(a.id)}>
                <div style={{ width:20, height:20, borderRadius:'50%', border:`2px solid ${activity===a.id?'#39FF14':'#252540'}`, background:activity===a.id?'#39FF14':'transparent', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {activity===a.id && <div style={{ width:8, height:8, borderRadius:'50%', background:'#080810' }}/>}
                </div>
                <div>
                  <div style={{ fontSize:15, fontWeight:700, color:activity===a.id?'#39FF14':'#F0F0FF' }}>{a.id}</div>
                  <div style={{ fontSize:12, color:'#6B6B8A' }}>{a.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button className="btn-ghost" onClick={() => setStep(2)}>← Back</button>
            <button className="btn-primary" style={{ flex:1, justifyContent:'center', padding:13 }} disabled={!activity} onClick={() => setStep(4)}>
              Continue <ArrowRight size={17}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // ── Step 4: Experience ──
  if (step === 4) return (
    <div style={{ minHeight:'100vh', background:'#080810', display:'flex', alignItems:'center', justifyContent:'center', padding:40 }}>
      <div style={{ width:'100%', maxWidth:560 }}>
        <div className="anim-up">
          <Progress current={4}/>
          <h2 className="font-display" style={{ fontSize:44, marginBottom:8 }}>EXPERIENCE <span className="gradient-text">LEVEL</span></h2>
          <p style={{ color:'#6B6B8A', marginBottom:28 }}>Determines exercise selection and intensity</p>
          <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:24 }}>
            {EXPERIENCE.map(e => (
              <div key={e.id} className={`onboard-option ${experience===e.id?'selected':''}`} onClick={() => setExperience(e.id)}>
                <span style={{ fontSize:32, flexShrink:0 }}>{e.icon}</span>
                <div>
                  <div style={{ fontSize:16, fontWeight:700, color:experience===e.id?'#39FF14':'#F0F0FF' }}>{e.id}</div>
                  <div style={{ fontSize:13, color:'#6B6B8A' }}>{e.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button className="btn-ghost" onClick={() => setStep(3)}>← Back</button>
            <button className="btn-primary" style={{ flex:1, justifyContent:'center', padding:13 }} disabled={!experience} onClick={() => setStep(5)}>
              Continue <ArrowRight size={17}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // ── Step 5: Summary ──
  if (step === 5) {
    const calories = calculateCalories({ weight, height, age, gender, activityLevel: activity, goal })
    const macros   = calculateMacros(calories, goal, weight)
    return (
      <div style={{ minHeight:'100vh', background:'#080810', display:'flex', alignItems:'center', justifyContent:'center', padding:40 }}>
        <div style={{ width:'100%', maxWidth:560 }}>
          <div className="anim-up">
            <Progress current={5}/>
            <div style={{ textAlign:'center', marginBottom:28 }}>
              <div style={{ width:80, height:80, background:'linear-gradient(135deg,#39FF14,#00C851)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:40, margin:'0 auto 20px', boxShadow:'0 0 40px rgba(57,255,20,.4)' }}>✓</div>
              <h2 className="font-display" style={{ fontSize:48, marginBottom:8 }}>YOU'RE <span className="gradient-text">ALL SET</span></h2>
              <p style={{ color:'#6B6B8A', fontSize:15 }}>Here's your personalized plan, <strong style={{ color:'#F0F0FF' }}>{name}</strong></p>
            </div>

            {/* Calorie target card */}
            <div style={{ background:'rgba(57,255,20,.06)', border:'1px solid rgba(57,255,20,.2)', borderRadius:16, padding:24, marginBottom:16, textAlign:'center' }}>
              <div style={{ fontSize:13, color:'#6B6B8A', marginBottom:8, letterSpacing:'.5px' }}>YOUR DAILY CALORIE GOAL</div>
              <div style={{ fontSize:64, fontWeight:900, color:'#39FF14', lineHeight:1 }}>{calories.toLocaleString()}</div>
              <div style={{ fontSize:14, color:'#6B6B8A', marginTop:6 }}>calories per day · calculated for {goal}</div>
            </div>

            {/* Macro targets */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:20 }}>
              {[{l:'Protein',v:macros.protein,u:'g',c:'#39FF14'},{l:'Carbs',v:macros.carbs,u:'g',c:'#00E5FF'},{l:'Fat',v:macros.fat,u:'g',c:'#FF6B35'}].map(m => (
                <div key={m.l} style={{ background:'#141422', border:'1px solid #252540', borderRadius:12, padding:'16px', textAlign:'center' }}>
                  <div style={{ fontSize:28, fontWeight:900, color:m.c }}>{m.v}{m.u}</div>
                  <div style={{ fontSize:12, color:'#6B6B8A' }}>{m.l}/day</div>
                </div>
              ))}
            </div>

            {/* Profile summary */}
            <div style={{ background:'#141422', border:'1px solid #252540', borderRadius:12, padding:16, marginBottom:24 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {[
                  ['Goal',     goal],
                  ['Activity', activity],
                  ['Weight',   weight+'lbs'],
                  ['Height',   height+' inches'],
                  ['Age',      age+' years'],
                  ['Experience', experience],
                ].map(([k,v]) => (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', fontSize:13, padding:'4px 0' }}>
                    <span style={{ color:'#6B6B8A' }}>{k}</span>
                    <span style={{ fontWeight:600 }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ fontSize:11, color:'#6B6B8A', marginTop:10, textAlign:'center' }}>
                You can adjust your calorie goal anytime in Settings
              </div>
            </div>

            <button className="btn-primary" style={{ width:'100%', justifyContent:'center', fontSize:16, padding:'14px' }} onClick={finish}>
              Open My Dashboard <ArrowRight size={18}/>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
