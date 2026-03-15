import { useState } from 'react'
import { Zap, RefreshCw, Check, ChevronRight, Send, X, RotateCcw, Dumbbell } from 'lucide-react'
import { storage, KEYS } from '../utils/storage'
import { generateWorkoutPlan, adjustWorkout } from '../utils/ai'

const SPLITS = [
  { id:'ppl', name:'Push / Pull / Legs', icon:'💪', desc:'Classic bodybuilding split. Great for 3-6 days/week.', recommended:'3–6 days', days:['Push Day','Pull Day','Leg Day','Push Day','Pull Day','Leg Day'] },
  { id:'upperLower', name:'Upper / Lower', icon:'⬆️', desc:'Balance strength across 4 sessions. Most popular split.', recommended:'4 days', days:['Upper A','Lower A','Upper B','Lower B'] },
  { id:'fullBody', name:'Full Body', icon:'🏋️', desc:'Train everything each session. Best for beginners.', recommended:'2–3 days', days:['Full Body A','Full Body B','Full Body C'] },
  { id:'broSplit', name:'Bro Split', icon:'🦾', desc:'One muscle group per day. Classic bodybuilder style.', recommended:'5 days', days:['Chest Day','Back Day','Shoulder Day','Arm Day','Leg Day'] },
  { id:'arnold', name:'Arnold Split', icon:'👑', desc:'Chest+Back, Shoulders+Arms, Legs. Twice a week.', recommended:'6 days', days:['Chest & Back','Shoulders & Arms','Legs','Chest & Back','Shoulders & Arms','Legs'] },
  { id:'custom', name:'Custom / AI Choice', icon:'🤖', desc:"Let the AI pick the best split for your goals and schedule.", recommended:'2–6 days', days:['Day 1','Day 2','Day 3','Day 4','Day 5','Day 6'] },
]

const EQUIPMENT_OPTIONS = ['Full Commercial Gym','Home Gym (Barbell + Rack)','Dumbbells Only','Resistance Bands','Bodyweight Only']
const DAY_OPTIONS = [2,3,4,5,6]

export default function WorkoutPlanner({ user }) {
  const [plan, setPlan] = useState(() => storage.get(KEYS.WORKOUTS))
  const [selectedSplit, setSelectedSplit] = useState(null)
  const [daysPerWeek, setDays] = useState(4)
  const [equipment, setEquipment] = useState('Full Commercial Gym')
  const [configStep, setConfigStep] = useState('split')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)
  const [selectedDay, setSelectedDay] = useState(null)
  const [adjustText, setAdjustText] = useState('')
  const [adjusting, setAdjusting] = useState(false)
  const [showAdjust, setShowAdjust] = useState(false)
  const [chatHistory, setChatHistory] = useState([])
  const [completedExs, setCompletedExs] = useState({})

  const splitInfo = SPLITS.find(s => s.id === selectedSplit)
  const days = plan ? Object.keys(plan.workouts) : []
  const currentWorkout = plan && selectedDay ? plan.workouts[selectedDay] : null

  async function handleGenerate() {
    if (!selectedSplit || !splitInfo) return
    setGenerating(true)
    setError(null)
    try {
      const config = { splitType: selectedSplit, splitName: splitInfo.name, daysPerWeek, equipment, experience: user.experience, splitDays: splitInfo.days }
      const result = await generateWorkoutPlan(user, config)
      setPlan(result)
      storage.set(KEYS.WORKOUTS, result)
      const firstDay = Object.keys(result.workouts)[0]
      setSelectedDay(firstDay)
      setConfigStep('split')
    } catch (err) {
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  async function handleAdjust() {
    if (!adjustText.trim() || !currentWorkout || !selectedDay) return
    setAdjusting(true)
    setError(null)
    const userMsg = { role: 'user', content: adjustText }
    try {
      const updated = await adjustWorkout(currentWorkout, adjustText)
      const newPlan = { ...plan, workouts: { ...plan.workouts, [selectedDay]: updated } }
      setPlan(newPlan)
      storage.set(KEYS.WORKOUTS, newPlan)
      setChatHistory(h => [...h, userMsg, { role: 'assistant', content: `Done! I updated "${currentWorkout.name}" based on your request.` }])
      setAdjustText('')
    } catch (err) {
      setError(err.message)
      setChatHistory(h => [...h, userMsg, { role: 'assistant', content: `Error: ${err.message}` }])
      setAdjustText('')
    } finally {
      setAdjusting(false)
    }
  }

  function toggleExercise(exIdx) {
    const key = `${selectedDay}-${exIdx}`
    setCompletedExs(prev => ({ ...prev, [key]: !prev[key] }))
  }

  function resetPlan() {
    storage.remove(KEYS.WORKOUTS)
    setPlan(null)
    setSelectedDay(null)
    setSelectedSplit(null)
    setConfigStep('split')
    setCompletedExs({})
    setChatHistory([])
  }

  if (generating) return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'60vh',textAlign:'center'}}>
      <div className="spinner" style={{marginBottom:28}}/>
      <div className="font-display" style={{fontSize:36,marginBottom:12}}>AI IS BUILDING <span className="gradient-text">YOUR PROGRAM</span></div>
      <div style={{color:'var(--vf-muted)',fontSize:15}}>Generating {daysPerWeek} personalized workouts for your {splitInfo?.name} split...</div>
      {error && <div style={{marginTop:20,color:'#FF6B35',background:'rgba(255,107,53,.1)',border:'1px solid rgba(255,107,53,.3)',borderRadius:10,padding:'12px 20px',maxWidth:500}}>{error}</div>}
    </div>
  )

  if (!plan) return (
    <div>
      <div className="anim-up" style={{marginBottom:32}}>
        <h1 className="font-display" style={{fontSize:48,margin:0}}>BUILD YOUR <span className="gradient-text">PROGRAM</span></h1>
        <p style={{color:'var(--vf-muted)',marginTop:6}}>AI-generated workouts tailored to your split, equipment, and goals</p>
      </div>

      {configStep === 'split' && (
        <div className="anim-up">
          <h3 style={{fontSize:18,fontWeight:700,marginBottom:20}}>Step 1 — Choose Your Split</h3>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:28}}>
            {SPLITS.map(s => (
              <div key={s.id} className={`split-card ${selectedSplit===s.id?'selected':''}`} onClick={() => setSelectedSplit(s.id)}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                  <span style={{fontSize:32}}>{s.icon}</span>
                  {selectedSplit===s.id && <div style={{width:22,height:22,borderRadius:'50%',background:'#39FF14',display:'flex',alignItems:'center',justifyContent:'center'}}><Check size={13} style={{color:'#080810'}}/></div>}
                </div>
                <div style={{fontSize:15,fontWeight:700,marginBottom:4,color:selectedSplit===s.id?'#39FF14':'var(--vf-text)'}}>{s.name}</div>
                <div style={{fontSize:12,color:'var(--vf-muted)',marginBottom:8,lineHeight:1.5}}>{s.desc}</div>
                <span className="badge badge-green" style={{fontSize:10}}>{s.recommended}</span>
              </div>
            ))}
          </div>
          {error && <div style={{color:'#FF6B35',background:'rgba(255,107,53,.1)',border:'1px solid rgba(255,107,53,.3)',borderRadius:10,padding:'12px 20px',marginBottom:16}}>{error}</div>}
          <button className="btn-primary" style={{padding:'12px 32px',fontSize:15}} disabled={!selectedSplit} onClick={() => setConfigStep('config')}>
            Configure This Split <ChevronRight size={18}/>
          </button>
        </div>
      )}

      {configStep === 'config' && (
        <div className="anim-up">
          <button className="btn-ghost" style={{marginBottom:24,fontSize:13}} onClick={() => setConfigStep('split')}>← Back to Split Selection</button>
          <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:32,padding:'20px 24px',background:'var(--vf-card)',border:'1px solid rgba(57,255,20,.2)',borderRadius:14}}>
            <span style={{fontSize:40}}>{splitInfo?.icon}</span>
            <div>
              <div style={{fontSize:20,fontWeight:700}}>{splitInfo?.name}</div>
              <div style={{color:'var(--vf-muted)',fontSize:14}}>{splitInfo?.desc}</div>
            </div>
          </div>

          <h3 style={{fontSize:18,fontWeight:700,marginBottom:20}}>Step 2 — Configure</h3>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:32}}>
            <div>
              <label style={{fontSize:12,color:'var(--vf-muted)',fontWeight:600,letterSpacing:'.5px',display:'block',marginBottom:10}}>DAYS PER WEEK</label>
              <div style={{display:'flex',gap:8}}>
                {DAY_OPTIONS.map(d => (
                  <button key={d} onClick={() => setDays(d)}
                    style={{width:44,height:44,borderRadius:10,border:`2px solid ${daysPerWeek===d?'#39FF14':'var(--vf-border)'}`,background:daysPerWeek===d?'rgba(57,255,20,.15)':'var(--vf-card2)',color:daysPerWeek===d?'#39FF14':'var(--vf-muted)',fontWeight:700,fontSize:16,cursor:'pointer',transition:'all .2s'}}>
                    {d}
                  </button>
                ))}
              </div>
              <div style={{fontSize:12,color:'var(--vf-muted)',marginTop:8}}>Training days: {splitInfo?.days.slice(0,daysPerWeek).join(' → ')}</div>
            </div>
            <div>
              <label style={{fontSize:12,color:'var(--vf-muted)',fontWeight:600,letterSpacing:'.5px',display:'block',marginBottom:10}}>AVAILABLE EQUIPMENT</label>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {EQUIPMENT_OPTIONS.map(eq => (
                  <div key={eq} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',borderRadius:10,border:`1px solid ${equipment===eq?'rgba(57,255,20,.4)':'var(--vf-border)'}`,background:equipment===eq?'rgba(57,255,20,.08)':'var(--vf-card2)',cursor:'pointer',transition:'all .2s'}} onClick={() => setEquipment(eq)}>
                    <div style={{width:18,height:18,borderRadius:'50%',border:`2px solid ${equipment===eq?'#39FF14':'var(--vf-border)'}`,background:equipment===eq?'#39FF14':'transparent',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
                      {equipment===eq && <div style={{width:8,height:8,borderRadius:'50%',background:'#080810'}}/>}
                    </div>
                    <span style={{fontSize:14,color:equipment===eq?'var(--vf-text)':'var(--vf-muted)'}}>{eq}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{background:'rgba(57,255,20,.06)',border:'1px solid rgba(57,255,20,.2)',borderRadius:12,padding:'14px 18px',marginBottom:24,display:'flex',gap:12,alignItems:'flex-start'}}>
            <Zap size={16} style={{color:'#39FF14',flexShrink:0,marginTop:2}}/>
            <div style={{fontSize:13,color:'var(--vf-muted)',lineHeight:1.6}}>
              AI will generate a complete <strong style={{color:'var(--vf-text)'}}>{daysPerWeek}-day {splitInfo?.name}</strong> program with real exercises, sets, reps, and coaching notes — tailored for your <strong style={{color:'var(--vf-text)'}}>{user.experience}</strong> level and <strong style={{color:'var(--vf-text)'}}>{user.goal}</strong> goal.
            </div>
          </div>

          {error && <div style={{color:'#FF6B35',background:'rgba(255,107,53,.1)',border:'1px solid rgba(255,107,53,.3)',borderRadius:10,padding:'12px 20px',marginBottom:16}}>{error}</div>}

          <div style={{display:'flex',gap:12}}>
            <button className="btn-ghost" onClick={() => setConfigStep('split')}>← Back</button>
            <button className="btn-primary" style={{padding:'12px 36px',fontSize:15}} onClick={handleGenerate}>
              <Zap size={16}/> Generate My Program with AI
            </button>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div>
      <div className="anim-up" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:28}}>
        <div>
          <h1 className="font-display" style={{fontSize:48,margin:0}}>{plan.planName?.toUpperCase()}</h1>
          <p style={{color:'var(--vf-muted)',marginTop:6}}>{plan.split} · {plan.daysPerWeek} days/week · {equipment}</p>
        </div>
        <div style={{display:'flex',gap:10}}>
          <button className="btn-ghost" style={{fontSize:13}} onClick={resetPlan}><RotateCcw size={14}/>Rebuild Program</button>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'240px 1fr',gap:20}}>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {days.map(dk => {
            const w = plan.workouts[dk]
            const exCount = w.exercises?.length || 0
            const doneCount = w.exercises?.filter((_,i) => completedExs[`${dk}-${i}`]).length || 0
            return (
              <div key={dk} style={{padding:'14px 16px',borderRadius:12,cursor:'pointer',border:`1px solid ${selectedDay===dk?'rgba(57,255,20,.4)':'var(--vf-border)'}`,background:selectedDay===dk?'rgba(57,255,20,.08)':'var(--vf-card)',transition:'all .2s'}} onClick={() => {setSelectedDay(dk);setShowAdjust(false);setChatHistory([])}}>
                <div style={{fontSize:13,fontWeight:700,color:selectedDay===dk?'#39FF14':'var(--vf-text)',marginBottom:3}}>{w.name}</div>
                <div style={{fontSize:11,color:'var(--vf-muted)'}}>{exCount} exercises · {w.duration}min</div>
                {doneCount > 0 && <div style={{fontSize:11,color:'#39FF14',marginTop:4}}>{doneCount}/{exCount} done</div>}
              </div>
            )
          })}
        </div>

        <div>
          {!currentWorkout ? (
            <div className="glass-card" style={{padding:48,textAlign:'center'}}>
              <Dumbbell size={48} style={{color:'var(--vf-muted)',margin:'0 auto 16px'}}/>
              <div style={{fontSize:16,fontWeight:600}}>Select a workout day from the left</div>
            </div>
          ) : (
            <div>
              <div className="glass-card anim-up" style={{padding:24,marginBottom:16}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
                  <div>
                    <h2 style={{margin:0,fontSize:24,fontWeight:800}}>{currentWorkout.name}</h2>
                    <div style={{color:'var(--vf-muted)',fontSize:13,marginTop:4}}>{currentWorkout.duration} min · {currentWorkout.exercises?.length} exercises</div>
                    {currentWorkout.warmup && <div style={{fontSize:12,color:'#00E5FF',marginTop:6}}>Warmup: {currentWorkout.warmup}</div>}
                  </div>
                  <button className="btn-primary" style={{padding:'9px 16px',fontSize:13}} onClick={() => setShowAdjust(v => !v)}>
                    <Zap size={14}/> Adjust with AI
                  </button>
                </div>

                {showAdjust && (
                  <div style={{background:'rgba(57,255,20,.05)',border:'1px solid rgba(57,255,20,.2)',borderRadius:12,padding:'16px',marginBottom:16}}>
                    <div style={{fontSize:13,fontWeight:700,color:'#39FF14',marginBottom:10}}>🤖 AI Workout Adjustment</div>
                    {chatHistory.length > 0 && (
                      <div style={{maxHeight:150,overflowY:'auto',marginBottom:12,display:'flex',flexDirection:'column',gap:8}}>
                        {chatHistory.map((m,i) => (
                          <div key={i} style={{fontSize:13,padding:'8px 12px',borderRadius:8,background:m.role==='user'?'rgba(57,255,20,.1)':'var(--vf-card2)',alignSelf:m.role==='user'?'flex-end':'flex-start',maxWidth:'85%',color:m.role==='user'?'#39FF14':'var(--vf-text)'}}>
                            {m.content}
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={{display:'flex',gap:10}}>
                      <input className="vf-input" placeholder='e.g. "Make this harder" · "Replace squats" · "Add more chest work"' value={adjustText} onChange={e=>setAdjustText(e.target.value)}
                        onKeyDown={e => e.key==='Enter' && !adjusting && handleAdjust()} style={{flex:1}}/>
                      <button className="btn-primary" style={{padding:'10px 16px',flexShrink:0}} onClick={handleAdjust} disabled={adjusting||!adjustText.trim()}>
                        {adjusting ? <div style={{width:16,height:16,border:'2px solid rgba(8,8,16,.3)',borderTopColor:'#080810',borderRadius:'50%',animation:'spin 1s linear infinite'}}/> : <Send size={15}/>}
                      </button>
                    </div>
                    <div style={{fontSize:11,color:'var(--vf-muted)',marginTop:8}}>AI will update this day's workout in real-time based on your request.</div>
                    {error && <div style={{color:'#FF6B35',fontSize:12,marginTop:8}}>{error}</div>}
                  </div>
                )}
              </div>

              <div className="glass-card" style={{padding:0,overflow:'hidden'}}>
                {currentWorkout.exercises?.map((ex, i) => {
                  const key = `${selectedDay}-${i}`
                  const done = !!completedExs[key]
                  return (
                    <div key={i} className="exercise-row" style={{opacity:done?.65:1}}>
                      <button onClick={() => toggleExercise(i)} style={{width:30,height:30,borderRadius:8,flexShrink:0,border:`2px solid ${done?'#39FF14':'var(--vf-border)'}`,background:done?'#39FF14':'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'all .2s'}}>
                        {done && <Check size={14} style={{color:'#080810'}}/>}
                      </button>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:15,fontWeight:600,textDecoration:done?'line-through':'none',color:done?'var(--vf-muted)':'var(--vf-text)'}}>{ex.name}</div>
                        <div style={{fontSize:12,color:'var(--vf-muted)',marginTop:2}}>{ex.muscle} · {ex.sets} sets × {ex.reps} · Rest: {ex.rest}</div>
                        {ex.notes && <div style={{fontSize:11,color:'#FF6B35',marginTop:2}}>💡 {ex.notes}</div>}
                      </div>
                      <div style={{textAlign:'right',flexShrink:0}}>
                        <div style={{fontSize:13,fontWeight:700,color:done?'#39FF14':'var(--vf-muted)'}}>{ex.sets} × {ex.reps}</div>
                      </div>
                    </div>
                  )
                })}
                {currentWorkout.cooldown && (
                  <div style={{padding:'12px 16px',fontSize:12,color:'var(--vf-muted)',borderTop:'1px solid rgba(37,37,64,.6)'}}>
                    Cooldown: {currentWorkout.cooldown}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
