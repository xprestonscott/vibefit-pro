import { useState } from 'react'
import { Plus, X, Check, Target, TrendingUp } from 'lucide-react'
import { storage, KEYS } from '../utils/storage'

export default function Goals() {
  const [goals, setGoals] = useState(() => storage.get(KEYS.GOALS) || [])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ title:'', current:'', target:'', unit:'', deadline:'' })

  function saveGoals(g) { setGoals(g); storage.set(KEYS.GOALS, g) }
  function addGoal() {
    if (!form.title || !form.target) return
    const newGoal = { ...form, id: Date.now(), current: Number(form.current)||0, target: Number(form.target), created: new Date().toISOString() }
    saveGoals([...goals, newGoal])
    setForm({title:'',current:'',target:'',unit:'',deadline:''})
    setShowAdd(false)
  }
  function updateProgress(id, val) { saveGoals(goals.map(g => g.id===id ? {...g, current: Number(val)} : g)) }
  function removeGoal(id) { saveGoals(goals.filter(g => g.id!==id)) }

  return (
    <div>
      <div className="anim-up" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:32}}>
        <div>
          <h1 className="font-display" style={{fontSize:48,margin:0}}>MY <span className="gradient-text">GOALS</span></h1>
          <p style={{color:'var(--vf-muted)',marginTop:6}}>Track what matters most to you</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(true)}><Plus size={15}/>New Goal</button>
      </div>

      {showAdd && (
        <div className="glass-card anim-up" style={{padding:28,marginBottom:24,border:'1px solid rgba(57,255,20,.2)'}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}><h3 style={{margin:0}}>Create New Goal</h3><button style={{background:'none',border:'none',cursor:'pointer',color:'var(--vf-muted)'}} onClick={() => setShowAdd(false)}><X size={18}/></button></div>
          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:12,marginBottom:16}}>
            <div><label style={{fontSize:11,color:'var(--vf-muted)',fontWeight:600,letterSpacing:'.5px',display:'block',marginBottom:6}}>GOAL TITLE</label><input className="vf-input" placeholder="e.g. Bench Press 225 lbs" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}/></div>
            <div><label style={{fontSize:11,color:'var(--vf-muted)',fontWeight:600,letterSpacing:'.5px',display:'block',marginBottom:6}}>CURRENT</label><input className="vf-input" type="number" placeholder="0" value={form.current} onChange={e=>setForm(f=>({...f,current:e.target.value}))}/></div>
            <div><label style={{fontSize:11,color:'var(--vf-muted)',fontWeight:600,letterSpacing:'.5px',display:'block',marginBottom:6}}>TARGET</label><input className="vf-input" type="number" placeholder="225" value={form.target} onChange={e=>setForm(f=>({...f,target:e.target.value}))}/></div>
            <div><label style={{fontSize:11,color:'var(--vf-muted)',fontWeight:600,letterSpacing:'.5px',display:'block',marginBottom:6}}>UNIT</label><input className="vf-input" placeholder="lbs, miles..." value={form.unit} onChange={e=>setForm(f=>({...f,unit:e.target.value}))}/></div>
          </div>
          <div style={{display:'flex',gap:10}}>
            <button className="btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
            <button className="btn-primary" disabled={!form.title||!form.target} onClick={addGoal}><Target size={14}/>Create Goal</button>
          </div>
        </div>
      )}

      {goals.length === 0 ? (
        <div style={{textAlign:'center',padding:'80px 40px'}}>
          <div style={{fontSize:64,marginBottom:20}}>🎯</div>
          <div className="font-display" style={{fontSize:36,marginBottom:12}}>NO GOALS YET</div>
          <p style={{color:'var(--vf-muted)',marginBottom:28}}>Set your first goal and start tracking progress toward it.</p>
          <button className="btn-primary" style={{padding:'12px 32px'}} onClick={() => setShowAdd(true)}><Plus size={15}/>Add Your First Goal</button>
        </div>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:16}}>
          {goals.map(g => {
            const pct = Math.min(Math.round((g.current/g.target)*100), 100)
            return (
              <div key={g.id} className="glass-card" style={{padding:24}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
                  <div style={{flex:1,paddingRight:12}}>
                    <div style={{fontSize:17,fontWeight:700,marginBottom:4}}>{g.title}</div>
                    {g.deadline && <div style={{fontSize:12,color:'var(--vf-muted)'}}>Deadline: {g.deadline}</div>}
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <div style={{fontSize:28,fontWeight:900,color:'#39FF14',lineHeight:1}}>{pct}%</div>
                    <button style={{background:'none',border:'none',cursor:'pointer',color:'var(--vf-muted)',padding:4}} onClick={() => removeGoal(g.id)}><X size={16}/></button>
                  </div>
                </div>
                <div className="progress-track" style={{height:10,marginBottom:12}}><div className="progress-fill" style={{width:`${pct}%`,background:`linear-gradient(90deg, #39FF14, #00C851)`}}/></div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:14}}>
                  <span style={{color:'var(--vf-muted)'}}>Current: <span style={{color:'var(--vf-text)',fontWeight:600}}>{g.current} {g.unit}</span></span>
                  <span style={{color:'var(--vf-muted)'}}>Target: <span style={{color:'var(--vf-text)',fontWeight:600}}>{g.target} {g.unit}</span></span>
                </div>
                <div style={{marginTop:14,display:'flex',gap:8,alignItems:'center'}}>
                  <input className="vf-input" type="number" placeholder="Update progress" style={{flex:1,padding:'8px 12px'}}
                    onKeyDown={e => { if(e.key==='Enter') updateProgress(g.id, e.target.value) }}/>
                  <button className="btn-ghost" style={{padding:'8px 14px',fontSize:12,flexShrink:0}}
                    onKeyDown={e => {}} onClick={e => { const inp=e.currentTarget.previousSibling; updateProgress(g.id,inp.value); inp.value='' }}>
                    <Check size={14}/> Update
                  </button>
                </div>
                {pct >= 100 && <div style={{marginTop:12,textAlign:'center',padding:'8px',background:'rgba(57,255,20,.1)',border:'1px solid rgba(57,255,20,.3)',borderRadius:8,fontSize:14,color:'#39FF14',fontWeight:700}}>🏆 Goal Achieved!</div>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
