import { useState, useEffect } from 'react'
import { Plus, X, Search } from 'lucide-react'
import { storage, KEYS } from '../utils/storage'
import { searchFoods } from '../utils/foodDatabase'
import MealScanner from '../components/MealScanner'

const GOAL  = { calories:2400, protein:180, carbs:260, fat:70 }
const MEALS = [
  { id:'breakfast', label:'Breakfast', icon:'\u{1F305}' },
  { id:'lunch',     label:'Lunch',     icon:'\u2600\uFE0F'  },
  { id:'dinner',    label:'Dinner',    icon:'\u{1F319}'  },
  { id:'snacks',    label:'Snacks',    icon:'\u{1F34E}'  },
]

export default function CalorieTracker() {
  const today  = new Date().toISOString().split('T')[0]
  const [log, setLog]     = useState(() => {
    const s = storage.get(KEYS.FOOD_LOG)
    return s?.[today] || { breakfast:[], lunch:[], dinner:[], snacks:[] }
  })
  const [modal, setModal] = useState(null)
  const [query, setQuery] = useState('')
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  function saveLog(newLog) {
    setLog(newLog)
    const all = storage.get(KEYS.FOOD_LOG) || {}
    all[today] = newLog
    storage.set(KEYS.FOOD_LOG, all)
  }

  function addFood(meal, food) {
    const newLog = {
      ...log,
      [meal]: [...log[meal], {
        ...food,
        logged: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })
      }]
    }
    saveLog(newLog)
    setModal(null)
    setQuery('')
  }

  function removeFood(meal, idx) {
    saveLog({ ...log, [meal]: log[meal].filter((_,i) => i !== idx) })
  }

  const allFoods = Object.values(log).flat()
  const totals = {
    cal: allFoods.reduce((a,f) => a + (f.cal||0), 0),
    p:   allFoods.reduce((a,f) => a + (f.p||0),   0),
    c:   allFoods.reduce((a,f) => a + (f.c||0),   0),
    f:   allFoods.reduce((a,f) => a + (f.f||0),   0),
  }
  const remaining = GOAL.calories - totals.cal
  const results   = query.length > 0 ? searchFoods(query) : []

  return (
    <div>
      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(8,8,16,.88)', backdropFilter:'blur(10px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:16 }}
          onClick={() => { setModal(null); setQuery('') }}>
          <div style={{ background:'var(--vf-card)', border:'1px solid var(--vf-border)', borderRadius:20, width:'100%', maxWidth:480, padding:24, maxHeight:'85vh', display:'flex', flexDirection:'column' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
              <h3 style={{ margin:0, fontSize:18 }}>Add to {MEALS.find(m => m.id === modal)?.label}</h3>
              <button style={{ background:'none', border:'none', cursor:'pointer', color:'var(--vf-muted)' }} onClick={() => { setModal(null); setQuery('') }}><X size={20}/></button>
            </div>
            <div style={{ position:'relative', marginBottom:12 }}>
              <Search size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--vf-muted)' }}/>
              <input className="vf-input" style={{ paddingLeft:36 }} placeholder="Search 331 foods — Oreos, Big Mac, chicken..." value={query} onChange={e => setQuery(e.target.value)} autoFocus/>
            </div>
            {query.length === 0 && (
              <div style={{ padding:'20px', textAlign:'center', color:'var(--vf-muted)', fontSize:13 }}>
                Search 331 foods including fast food, snacks, candy and more
              </div>
            )}
            <div style={{ overflowY:'auto', flex:1 }}>
              {results.map(food => (
                <div key={food.id}
                  style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'11px 12px', borderRadius:10, cursor:'pointer', marginBottom:4, transition:'background .15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--vf-card2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  onClick={() => addFood(modal, food)}>
                  <div>
                    <div style={{ fontSize:14, fontWeight:500 }}>{food.name}</div>
                    <div style={{ fontSize:11, color:'var(--vf-muted)' }}>P:{food.p}g C:{food.c}g F:{food.f}g <span style={{ color:'var(--vf-muted)', fontSize:10 }}>{food.category}</span></div>
                  </div>
                  <div style={{ fontSize:16, fontWeight:800, color:'#39FF14', flexShrink:0, marginLeft:12 }}>{food.cal}</div>
                </div>
              ))}
              {query.length > 0 && results.length === 0 && (
                <div style={{ padding:'20px', textAlign:'center', color:'var(--vf-muted)', fontSize:13 }}>No results for "{query}"</div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="anim-up" style={{ marginBottom:24 }}>
        <h1 className="font-display" style={{ fontSize:isMobile?36:48, margin:0 }}>NUTRITION <span className="gradient-text">TRACKER</span></h1>
        <p style={{ color:'var(--vf-muted)', marginTop:6, fontSize:13 }}>{new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })}</p>
      </div>

      <div style={{ background:'var(--vf-card)', border:'1px solid var(--vf-border)', borderRadius:14, padding:'16px 20px', marginBottom:20 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10, flexWrap:'wrap', gap:8 }}>
          <div>
            <span style={{ fontSize:isMobile?28:36, fontWeight:900, color:remaining<0?'#FF6B35':'var(--vf-text)' }}>{totals.cal}</span>
            <span style={{ fontSize:13, color:'var(--vf-muted)', marginLeft:6 }}>/ {GOAL.calories} kcal</span>
          </div>
          <div style={{ fontSize:14, fontWeight:700, color:remaining>0?'#39FF14':'#FF6B35' }}>{remaining > 0 ? remaining + ' remaining' : Math.abs(remaining) + ' over'}</div>
        </div>
        <div className="progress-track" style={{ height:8, marginBottom:14 }}>
          <div className="progress-fill" style={{ width: Math.min((totals.cal/GOAL.calories)*100,100) + '%', background:remaining<0?'#FF6B35':'#39FF14' }}/>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
          {[{l:'Protein',v:totals.p,g:GOAL.protein,c:'#39FF14'},{l:'Carbs',v:totals.c,g:GOAL.carbs,c:'#00E5FF'},{l:'Fat',v:totals.f,g:GOAL.fat,c:'#FF6B35'}].map(m => (
            <div key={m.l} style={{ textAlign:'center', padding:'10px', background:'var(--vf-card2)', borderRadius:10 }}>
              <div style={{ fontSize:isMobile?16:20, fontWeight:800, color:m.c }}>{m.v}g</div>
              <div style={{ fontSize:10, color:'var(--vf-muted)' }}>{m.l} / {m.g}g</div>
              <div className="progress-track" style={{ height:3, marginTop:4 }}><div className="progress-fill" style={{ width: Math.min((m.v/m.g)*100,100) + '%', background:m.c }}/></div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {MEALS.map(m => (
          <div key={m.id} className="glass-card" style={{ padding:isMobile?14:20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:isMobile?18:22 }}>{m.icon}</span>
                <div>
                  <div style={{ fontSize:14, fontWeight:700 }}>{m.label}</div>
                  <div style={{ fontSize:11, color:'var(--vf-muted)' }}>{log[m.id].reduce((a,f) => a+(f.cal||0),0)} kcal</div>
                </div>
              </div>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <MealScanner meal={m.id} onFoodAdded={addFood}/>
                <button className="btn-primary" style={{ padding:'7px 14px', fontSize:12 }} onClick={() => { setModal(m.id); setQuery('') }}>
                  <Plus size={13}/> Add Food
                </button>
              </div>
            </div>
            {log[m.id].length === 0 ? (
              <div style={{ padding:'14px', textAlign:'center', border:'1px dashed var(--vf-border)', borderRadius:10, color:'var(--vf-muted)', fontSize:13 }}>
                Nothing logged yet — tap Add Food or Scan a photo
              </div>
            ) : log[m.id].map((food,i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 10px', borderRadius:8, marginBottom:3 }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:6 }}>
                    {food.name}
                    {food.aiScanned && <span style={{ fontSize:9, background:'rgba(57,255,20,.15)', color:'#39FF14', padding:'1px 5px', borderRadius:4 }}>AI</span>}
                  </div>
                  <div style={{ fontSize:10, color:'var(--vf-muted)' }}>{food.logged}</div>
                </div>
                <div style={{ display:'flex', gap:12, alignItems:'center', flexShrink:0 }}>
                  <div style={{ fontSize:14, fontWeight:800 }}>{food.cal}</div>
                  <div style={{ fontSize:10, color:'var(--vf-muted)' }}>kcal</div>
                  <button style={{ background:'none', border:'none', cursor:'pointer', color:'var(--vf-muted)', padding:4 }}
                    onMouseEnter={e => e.target.style.color='#FF6B35'} onMouseLeave={e => e.target.style.color='var(--vf-muted)'}
                    onClick={() => removeFood(m.id,i)}><X size={13}/></button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
