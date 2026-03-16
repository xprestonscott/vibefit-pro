import { useState } from 'react'
import { Upload, Shield, Zap, Check, TrendingUp, RefreshCw, Lock } from 'lucide-react'
import { checkLimit, incrementUsage, getCurrentPlan } from '../utils/subscription'
import UpgradeModal from '../components/UpgradeModal'
import { analyzePhysique } from '../utils/ai'

function ScoreRing({ score, size=100, color='#39FF14', label }) {
  const r=(size-12)/2, circ=2*Math.PI*r, dash=(score/100)*circ
  return (
    <div style={{textAlign:'center'}}>
      <svg width={size} height={size} style={{transform:'rotate(-90deg)'}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--vf-border)" strokeWidth={8}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{filter:`drop-shadow(0 0 6px ${color}80)`,transition:'stroke-dasharray 1.5s ease'}}/>
        <text x={size/2} y={size/2+2} textAnchor="middle" dominantBaseline="middle"
          style={{fill:'var(--vf-text)',fontSize:size*.24,fontWeight:800,fontFamily:'Outfit',transform:'rotate(90deg)',transformOrigin:'center'}}>
          {score}
        </text>
      </svg>
      {label && <div style={{fontSize:11,color:'var(--vf-muted)',marginTop:4,fontWeight:600,letterSpacing:'.3px'}}>{label}</div>}
    </div>
  )
}

const EMPTY = { age:'', gender:'Male', height:'', weight:'', bodyFat:'', experience:'Intermediate', goal:'', lifts:'', problemAreas:'', notes:'' }

export default function PhysiqueAnalysis({ user }) {
  const [form, setForm] = useState({ ...EMPTY, goal: user?.goal||'', experience: user?.experience||'Intermediate' })
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [photo, setPhoto] = useState(null)
  const [upgradeFeature, setUpgradeFeature] = useState(null)

  function setField(k, v) { setForm(f => ({...f, [k]: v})) }

  async function handleAnalyze() {
    if (!form.age || !form.height || !form.weight) { setError('Please fill in Age, Height, and Weight at minimum.'); return }
    if (!checkLimit('aiScansPerMonth')) { setUpgradeFeature('aiScansPerMonth'); return }
    incrementUsage('aiScansPerMonth')
    setAnalyzing(true)
    setError(null)
    try {
      const data = await analyzePhysique(form)
      setResult(data)
    } catch(err) {
      setError(err.message)
    } finally {
      setAnalyzing(false)
    }
  }

  if (upgradeFeature) return <UpgradeModal feature={upgradeFeature} onClose={() => setUpgradeFeature(null)}/>

  if (analyzing) return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'60vh',textAlign:'center'}}>
      <div className="spinner" style={{marginBottom:28}}/>
      <div className="font-display" style={{fontSize:36,marginBottom:12}}>ANALYZING YOUR <span className="gradient-text">PHYSIQUE</span></div>
      <div style={{color:'var(--vf-muted)',marginBottom:32}}>AI is reviewing your measurements and generating a detailed assessment...</div>
      {['Processing body composition data','Evaluating muscle balance','Identifying improvement areas','Generating recommendations'].map((s,i) => (
        <div key={i} style={{display:'flex',gap:12,alignItems:'center',marginBottom:10,color:'var(--vf-muted)',fontSize:13}}>
          <div style={{width:8,height:8,borderRadius:'50%',background:'var(--vf-green)',animation:'pulse 1.5s ease infinite',animationDelay:`${i*.3}s`}}/>
          {s}
        </div>
      ))}
    </div>
  )

  if (result) return (
    <div>
      <div className="anim-up" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:32}}>
        <div>
          <h1 className="font-display" style={{fontSize:48,margin:0}}>PHYSIQUE <span className="gradient-text">REPORT</span></h1>
          <p style={{color:'var(--vf-muted)',marginTop:6}}>AI-powered assessment based on your measurements</p>
        </div>
        <button className="btn-ghost" onClick={() => setResult(null)}><RefreshCw size={14}/>New Analysis</button>
      </div>

      <div className="glass-card anim-up" style={{padding:32,marginBottom:20}}>
        <div style={{display:'flex',gap:16,justifyContent:'center',flexWrap:'wrap',marginBottom:24}}>
          <ScoreRing score={Number(result.overallScore)||72} size={130} color="#39FF14" label="Overall Score"/>
          <ScoreRing score={Number(result.postureScore)||68} size={90} color="#FF6B35" label="Posture"/>
          <ScoreRing score={Number(result.symmetryScore)||81} size={90} color="#8B5CF6" label="Symmetry"/>
          <ScoreRing score={Number(result.muscleBalanceScore)||74} size={90} color="#00E5FF" label="Muscle Balance"/>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
          {[
            {label:'Overall',    score:Number(result.overallScore)||72,      color:'#39FF14'},
            {label:'Posture',    score:Number(result.postureScore)||68,       color:'#FF6B35'},
            {label:'Symmetry',   score:Number(result.symmetryScore)||81,      color:'#8B5CF6'},
            {label:'Muscle Bal', score:Number(result.muscleBalanceScore)||74, color:'#00E5FF'},
          ].map(s => (
            <div key={s.label} style={{background:'var(--vf-card2)',borderRadius:12,padding:'14px',textAlign:'center',border:`1px solid ${s.color}20`}}>
              <div style={{fontSize:32,fontWeight:900,color:s.color,lineHeight:1}}>{s.score}</div>
              <div style={{fontSize:11,color:'var(--vf-muted)',marginTop:4}}>{s.label}</div>
              <div className="progress-track" style={{height:4,marginTop:8}}>
                <div className="progress-fill" style={{width:`${s.score}%`,background:s.color}}/>
              </div>
            </div>
          ))}
        </div>
        <div style={{display:'flex',gap:12,alignItems:'flex-start',padding:'14px 16px',background:'var(--vf-card2)',borderRadius:12}}>
          <div style={{fontSize:24,flexShrink:0}}>📊</div>
          <div>
            <div style={{fontSize:13,fontWeight:700,marginBottom:4}}>{result.bodyFatCategory}</div>
            <div style={{fontSize:13,color:'var(--vf-muted)',lineHeight:1.6}}>{result.summary}</div>
          </div>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
        <div className="glass-card" style={{padding:24}}>
          <h4 style={{margin:'0 0 16px',fontSize:15,fontWeight:700,color:'#39FF14'}}>💪 Strengths</h4>
          {result.strengths?.map((s,i) => (
            <div key={i} style={{display:'flex',gap:10,marginBottom:10,padding:'10px 12px',background:'rgba(57,255,20,.05)',border:'1px solid rgba(57,255,20,.15)',borderRadius:10}}>
              <Check size={14} style={{color:'#39FF14',flexShrink:0,marginTop:2}}/><span style={{fontSize:13,lineHeight:1.5}}>{s}</span>
            </div>
          ))}
        </div>
        <div className="glass-card" style={{padding:24}}>
          <h4 style={{margin:'0 0 16px',fontSize:15,fontWeight:700,color:'#FF6B35'}}>⚠️ Areas to Improve</h4>
          {result.improvements?.map((s,i) => (
            <div key={i} style={{display:'flex',gap:10,marginBottom:10,padding:'10px 12px',background:'rgba(255,107,53,.05)',border:'1px solid rgba(255,107,53,.15)',borderRadius:10}}>
              <div style={{width:6,height:6,borderRadius:'50%',background:'#FF6B35',flexShrink:0,marginTop:6}}/><span style={{fontSize:13,lineHeight:1.5}}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card" style={{padding:24,marginBottom:16}}>
        <h4 style={{margin:'0 0 16px',fontSize:15,fontWeight:700,display:'flex',gap:8,alignItems:'center'}}>
          <Zap size={15} style={{color:'#39FF14'}}/> Recommended Exercises
        </h4>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12}}>
          {result.exerciseRecommendations?.map((r,i) => (
            <div key={i} style={{background:'var(--vf-card2)',borderRadius:12,padding:'14px 16px',border:'1px solid var(--vf-border)'}}>
              <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>{r.name}</div>
              <div style={{fontSize:12,color:'#39FF14',marginBottom:6}}>{r.sets}</div>
              <div style={{fontSize:12,color:'var(--vf-muted)',lineHeight:1.5}}>{r.reason}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <div className="glass-card" style={{padding:24}}>
          <h4 style={{margin:'0 0 14px',fontSize:15,fontWeight:700}}>🥗 Nutrition Tips</h4>
          {result.nutritionTips?.map((t,i) => (
            <div key={i} style={{fontSize:13,color:'var(--vf-muted)',padding:'8px 0',borderBottom:i<result.nutritionTips.length-1?'1px solid rgba(37,37,64,.5)':'none',lineHeight:1.5}}>{t}</div>
          ))}
        </div>
        <div className="glass-card" style={{padding:24,display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',textAlign:'center'}}>
          <div style={{fontSize:48,marginBottom:12}}>📅</div>
          <div style={{fontSize:15,fontWeight:700,marginBottom:8}}>Timeline Estimate</div>
          <div style={{fontSize:14,color:'#39FF14',fontWeight:600}}>{result.timelineEstimate}</div>
        </div>
      </div>
    </div>
  )

  return (
    <div>
      <div className="anim-up" style={{marginBottom:32}}>
        <h1 className="font-display" style={{fontSize:48,margin:0}}>AI PHYSIQUE <span className="gradient-text">ANALYSIS</span></h1>
        <p style={{color:'var(--vf-muted)',marginTop:6}}>Enter your measurements for a detailed AI-powered physique assessment</p>
      </div>

      <div style={{background:'rgba(0,229,255,.06)',border:'1px solid rgba(0,229,255,.2)',borderRadius:12,padding:'14px 18px',marginBottom:28,display:'flex',gap:12}}>
        <Shield size={17} style={{color:'#00E5FF',flexShrink:0,marginTop:2}}/>
        <div style={{fontSize:13,color:'var(--vf-muted)',lineHeight:1.6}}>
          <strong style={{color:'#00E5FF'}}>Privacy first.</strong> Your data is sent directly to the AI model and never stored. Photos are processed locally and not uploaded anywhere.
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
        <div>
          <h3 style={{fontSize:16,fontWeight:700,marginBottom:16}}>Body Measurements</h3>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
            {[['Age','age','e.g. 28','number'],['Weight (lbs)','weight','e.g. 185','number'],['Height','height',"e.g. 5'11'",'text'],['Est. Body Fat %','bodyFat','e.g. 18','number']].map(([label,key,ph,type]) => (
              <div key={key}>
                <label style={{fontSize:11,color:'var(--vf-muted)',fontWeight:600,letterSpacing:'.5px',display:'block',marginBottom:6}}>{label.toUpperCase()}</label>
                <input className="vf-input" type={type} placeholder={ph} value={form[key]} onChange={e=>setField(key,e.target.value)}/>
              </div>
            ))}
          </div>
          <div style={{marginBottom:12}}>
            <label style={{fontSize:11,color:'var(--vf-muted)',fontWeight:600,letterSpacing:'.5px',display:'block',marginBottom:6}}>GENDER</label>
            <div style={{display:'flex',gap:8}}>
              {['Male','Female','Other'].map(g => (
                <button key={g} onClick={() => setField('gender',g)} style={{flex:1,padding:'10px',borderRadius:8,border:`1px solid ${form.gender===g?'#39FF14':'var(--vf-border)'}`,background:form.gender===g?'rgba(57,255,20,.1)':'var(--vf-card2)',color:form.gender===g?'#39FF14':'var(--vf-muted)',cursor:'pointer',fontSize:13,fontWeight:600,transition:'all .2s'}}>{g}</button>
              ))}
            </div>
          </div>
          <div>
            <label style={{fontSize:11,color:'var(--vf-muted)',fontWeight:600,letterSpacing:'.5px',display:'block',marginBottom:6}}>CURRENT LIFTS (optional)</label>
            <input className="vf-input" placeholder="e.g. Bench 185, Squat 225, Deadlift 275" value={form.lifts} onChange={e=>setField('lifts',e.target.value)}/>
          </div>
        </div>

        <div>
          <h3 style={{fontSize:16,fontWeight:700,marginBottom:16}}>Goals & Focus Areas</h3>
          <div style={{marginBottom:12}}>
            <label style={{fontSize:11,color:'var(--vf-muted)',fontWeight:600,letterSpacing:'.5px',display:'block',marginBottom:6}}>GOAL</label>
            <input className="vf-input" placeholder="e.g. Build muscle, reduce body fat" value={form.goal} onChange={e=>setField('goal',e.target.value)}/>
          </div>
          <div style={{marginBottom:12}}>
            <label style={{fontSize:11,color:'var(--vf-muted)',fontWeight:600,letterSpacing:'.5px',display:'block',marginBottom:6}}>EXPERIENCE LEVEL</label>
            <div style={{display:'flex',gap:8}}>
              {['Beginner','Intermediate','Advanced'].map(lv => (
                <button key={lv} onClick={() => setField('experience',lv)} style={{flex:1,padding:'10px',borderRadius:8,border:`1px solid ${form.experience===lv?'#39FF14':'var(--vf-border)'}`,background:form.experience===lv?'rgba(57,255,20,.1)':'var(--vf-card2)',color:form.experience===lv?'#39FF14':'var(--vf-muted)',cursor:'pointer',fontSize:12,fontWeight:600,transition:'all .2s'}}>{lv}</button>
              ))}
            </div>
          </div>
          <div style={{marginBottom:12}}>
            <label style={{fontSize:11,color:'var(--vf-muted)',fontWeight:600,letterSpacing:'.5px',display:'block',marginBottom:6}}>PROBLEM AREAS</label>
            <input className="vf-input" placeholder="e.g. Lagging arms, belly fat, weak lower back" value={form.problemAreas} onChange={e=>setField('problemAreas',e.target.value)}/>
          </div>
          <div style={{marginBottom:16}}>
            <label style={{fontSize:11,color:'var(--vf-muted)',fontWeight:600,letterSpacing:'.5px',display:'block',marginBottom:6}}>ADDITIONAL NOTES</label>
            <textarea className="vf-input" style={{minHeight:80,resize:'vertical'}} placeholder="Any injuries, limitations, or specific areas you want the AI to focus on..." value={form.notes} onChange={e=>setField('notes',e.target.value)}/>
          </div>

          <div className="upload-zone" style={{marginBottom:16}} onClick={() => document.getElementById('photoInput').click()}>
            <input id="photoInput" type="file" accept="image/*" style={{display:'none'}} onChange={e => { const f=e.target.files[0]; if(f) setPhoto(URL.createObjectURL(f)) }}/>
            {photo ? <img src={photo} style={{maxHeight:120,borderRadius:8,marginBottom:8}}/> : <div style={{fontSize:32,marginBottom:8}}>📸</div>}
            <div style={{fontSize:14,fontWeight:600,marginBottom:4}}>{photo?'Photo added (optional)':'Upload a photo (optional)'}</div>
            <div style={{fontSize:12,color:'var(--vf-muted)'}}>Stored locally only, never uploaded</div>
          </div>

          {error && <div style={{color:'#FF6B35',background:'rgba(255,107,53,.1)',border:'1px solid rgba(255,107,53,.3)',borderRadius:10,padding:'10px 14px',marginBottom:12,fontSize:13}}>{error}</div>}

          <button className="btn-primary" style={{width:'100%',justifyContent:'center',padding:14,fontSize:15}} onClick={handleAnalyze} disabled={!form.age||!form.weight||!form.height}>
            <Zap size={16}/> Analyze with AI
          </button>
          <div style={{fontSize:11,color:'var(--vf-muted)',textAlign:'center',marginTop:8}}>Age, height, and weight required. All other fields improve accuracy.</div>
        </div>
      </div>
    </div>
  )
}
