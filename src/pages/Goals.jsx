import { useState, useEffect } from 'react'
import { Plus, X, Check, Target, TrendingUp } from 'lucide-react'
import { storage, KEYS } from '../utils/storage'
import { getLimit, getCurrentPlan } from '../utils/subscription'
import UpgradeModal from '../components/UpgradeModal'

export default function Goals() {
  const [goals, setGoals]     = useState(() => storage.get(KEYS.GOALS) || [])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm]       = useState({ title:'', current:'', target:'', unit:'', deadline:'' })
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  function saveGoals(g) { setGoals(g); storage.set(KEYS.GOALS, g) }

  const [upgradeFeature, setUpgradeFeature] = useState(null)

  function addGoal() {
    if (!form.title || !form.target) return
    const maxGoals = getLimit('maxGoals')
    if (goals.length >= maxGoals) { setUpgradeFeature('maxGoals'); return }
    saveGoals([...goals, { ...form, id:Date.now(), current:Number(form.current)||0, target:Number(form.target), created:new Date().toISOString() }])
    setForm({ title:'', current:'', target:'', unit:'', deadline:'' })
    setShowAdd(false)
  }

  function updateProgress(id, val) { saveGoals(goals.map(g => g.id===id ? {...g, current:Number(val)} : g)) }
  function removeGoal(id) { saveGoals(goals.filter(g => g.id!==id)) }

  return (
    <div>
      {upgradeFeature && <UpgradeModal feature={upgradeFeature} onClose={() => setUpgradeFeature(null)}/>}
      <div className="anim-up page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:28, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 className="font-display page-title" style={{ fontSize:isMobile?36:48, margin:0 }}>MY <span className="gradient-text">GOALS</span></h1>
          <p style={{ color:'var(--vf-muted)', marginTop:6, fontSize:14 }}>Track what matters most to you</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(true)}><Plus size={14}/>New Goal</button>
      </div>

      {showAdd && (
        <div className="glass-card anim-up" style={{ padding:isMobile?18:28, marginBottom:20, border:'1px solid rgba(57,255,20,.2)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:18 }}>
            <h3 style={{ margin:0, fontSize:17 }}>Create New Goal</h3>
            <button style={{ background:'none', border:'none', cursor:'pointer', color:'var(--vf-muted)' }} onClick={() => setShowAdd(false)}><X size={18}/></button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'2fr 1fr 1fr 1fr', gap:10, marginBottom:14 }}>
            <div><label style={{ fontSize:10, color:'var(--vf-muted)', fontWeight:600, letterSpacing:'.5px', display:'block', marginBottom:5 }}>GOAL TITLE</label>
              <input className="vf-input" placeholder="e.g. Bench Press 225 lbs" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}/></div>
            <div><label style={{ fontSize:10, color:'var(--vf-muted)', fontWeight:600, letterSpacing:'.5px', display:'block', marginBottom:5 }}>CURRENT</label>
              <input className="vf-input" type="number" placeholder="0" value={form.current} onChange={e=>setForm(f=>({...f,current:e.target.value}))}/></div>
            <div><label style={{ fontSize:10, color:'var(--vf-muted)', fontWeight:600, letterSpacing:'.5px', display:'block', marginBottom:5 }}>TARGET</label>
              <input className="vf-input" type="number" placeholder="225" value={form.target} onChange={e=>setForm(f=>({...f,target:e.target.value}))}/></div>
            <div><label style={{ fontSize:10, color:'var(--vf-muted)', fontWeight:600, letterSpacing:'.5px', display:'block', marginBottom:5 }}>UNIT</label>
              <input className="vf-input" placeholder="lbs, miles..." value={form.unit} onChange={e=>setForm(f=>({...f,unit:e.target.value}))}/></div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
            <button className="btn-primary" disabled={!form.title||!form.target} onClick={addGoal}><Target size={13}/>Create Goal</button>
          </div>
        </div>
      )}

      {goals.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 20px' }}>
          <div style={{ fontSize:56, marginBottom:16 }}>🎯</div>
          <div className="font-display" style={{ fontSize:isMobile?28:36, marginBottom:10 }}>NO GOALS YET</div>
          <p style={{ color:'var(--vf-muted)', marginBottom:24, fontSize:14 }}>Set your first goal and start tracking progress.</p>
          <button className="btn-primary" style={{ padding:'12px 28px' }} onClick={() => setShowAdd(true)}><Plus size={14}/>Add Your First Goal</button>
        </div>
      ) : (
        <div className="grid-2">
          {goals.map(g => {
            const pct = Math.min(Math.round((g.current/g.target)*100), 100)
            return (
              <div key={g.id} className="glass-card" style={{ padding:isMobile?16:22 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
                  <div style={{ flex:1, paddingRight:10 }}>
                    <div style={{ fontSize:isMobile?14:16, fontWeight:700, marginBottom:3 }}>{g.title}</div>
                    {g.deadline && <div style={{ fontSize:11, color:'var(--vf-muted)' }}>Deadline: {g.deadline}</div>}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ fontSize:isMobile?22:28, fontWeight:900, color:'#39FF14', lineHeight:1 }}>{pct}%</div>
                    <button style={{ background:'none', border:'none', cursor:'pointer', color:'var(--vf-muted)', padding:4 }} onClick={() => removeGoal(g.id)}><X size={15}/></button>
                  </div>
                </div>
                <div className="progress-track" style={{ height:8, marginBottom:10 }}>
                  <div className="progress-fill" style={{ width:`${pct}%`, background:'linear-gradient(90deg,#39FF14,#00C851)' }}/>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:12, flexWrap:'wrap', gap:4 }}>
                  <span style={{ color:'var(--vf-muted)' }}>Current: <span style={{ color:'var(--vf-text)', fontWeight:600 }}>{g.current} {g.unit}</span></span>
                  <span style={{ color:'var(--vf-muted)' }}>Target: <span style={{ color:'var(--vf-text)', fontWeight:600 }}>{g.target} {g.unit}</span></span>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <input className="vf-input" type="number" placeholder="Update progress" style={{ flex:1, padding:'8px 10px', fontSize:13 }}
                    onKeyDown={e => { if(e.key==='Enter') { updateProgress(g.id,e.target.value); e.target.value='' }}}/>
                  <button className="btn-ghost" style={{ padding:'8px 12px', fontSize:12, flexShrink:0 }}
                    onClick={e => { const inp=e.currentTarget.previousSibling; updateProgress(g.id,inp.value); inp.value='' }}>
                    <Check size={13}/>
                  </button>
                </div>
                {pct >= 100 && (
                  <div style={{ marginTop:10, textAlign:'center', padding:'8px', background:'rgba(57,255,20,.1)', border:'1px solid rgba(57,255,20,.3)', borderRadius:8, fontSize:13, color:'#39FF14', fontWeight:700 }}>
                    🏆 Goal Achieved!
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
