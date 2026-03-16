import { useState, useEffect, useRef } from 'react'
import { Plus, X, Search, Globe, Database } from 'lucide-react'
import { storage, KEYS } from '../utils/storage'
import { searchFoods } from '../utils/foodDatabase'
import { searchUSDA } from '../utils/usdaApi'
import MealScanner from '../components/MealScanner'

const GOAL  = { calories:2400, protein:180, carbs:260, fat:70 }
const MEALS = [
  { id:'breakfast', label:'Breakfast', icon:'\u{1F305}' },
  { id:'lunch',     label:'Lunch',     icon:'\u2600\uFE0F' },
  { id:'dinner',    label:'Dinner',    icon:'\u{1F319}' },
  { id:'snacks',    label:'Snacks',    icon:'\u{1F34E}' },
]

function AddFoodModal({ meal, onAdd, onClose }) {
  const [query, setQuery]         = useState('')
  const [localResults, setLocal]  = useState([])
  const [usdaResults, setUSDA]    = useState([])
  const [searching, setSearching] = useState(false)
  const [tab, setTab]             = useState('local') // local | usda
  const [selected, setSelected]   = useState(null)
  const [servings, setServings]   = useState(1)
  const [servingUnit, setUnit]    = useState('serving')
  const debounceRef = useRef()

  useEffect(() => {
    if (!query || query.length < 2) {
      setLocal([]); setUSDA([]); return
    }
    // Local search is instant
    setLocal(searchFoods(query))

    // USDA search debounced
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      const results = await searchUSDA(query)
      setUSDA(results)
      setSearching(false)
    }, 600)

    return () => clearTimeout(debounceRef.current)
  }, [query])

  const results = tab === 'local' ? localResults : usdaResults

  function handleSelect(food) {
    setSelected(food)
    setServings(1)
    setUnit(food.serving || 'serving')
  }

  function handleAdd() {
    if (!selected) return
    const mult = Number(servings) || 1
    onAdd(meal, {
      id:   Date.now(),
      name: selected.name + (selected.brand ? ` (${selected.brand})` : ''),
      cal:  Math.round((selected.cal || 0) * mult),
      p:    Math.round((selected.p   || 0) * mult),
      c:    Math.round((selected.c   || 0) * mult),
      f:    Math.round((selected.f   || 0) * mult),
      servings: mult,
      servingUnit: servingUnit,
      logged: new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),
      source: selected.source || 'local',
    })
    onClose()
  }

  const mult = Number(servings) || 1

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:9000,
      background:'rgba(8,8,16,.95)', backdropFilter:'blur(16px)',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:16,
    }} onClick={onClose}>
      <div style={{
        background:'#141422', border:'1px solid #252540',
        borderRadius:20, width:'100%', maxWidth:520,
        maxHeight:'90vh', display:'flex', flexDirection:'column',
        boxShadow:'0 24px 80px rgba(0,0,0,.6)',
        overflow:'hidden',
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{padding:'18px 20px', borderBottom:'1px solid #252540', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0}}>
          <div>
            <div style={{fontSize:16, fontWeight:700}}>Add to {MEALS.find(m=>m.id===meal)?.label}</div>
            <div style={{fontSize:12, color:'#6B6B8A', marginTop:2}}>Search local database or 1M+ USDA foods</div>
          </div>
          <button onClick={onClose} style={{background:'#1C1C2E', border:'1px solid #252540', borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#6B6B8A'}}>
            <X size={16}/>
          </button>
        </div>

        {/* Search */}
        <div style={{padding:'14px 20px 0', flexShrink:0}}>
          <div style={{position:'relative', marginBottom:12}}>
            <Search size={14} style={{position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#6B6B8A'}}/>
            <input
              className="vf-input"
              style={{paddingLeft:36, fontSize:15}}
              placeholder='Search food e.g. "chicken", "oreo", "big mac"...'
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
            />
          </div>

          {/* Tabs */}
          <div style={{display:'flex', gap:8, marginBottom:12}}>
            <button onClick={() => setTab('local')}
              style={{flex:1, padding:'8px', borderRadius:8, border:`1px solid ${tab==='local'?'rgba(57,255,20,.4)':'#252540'}`, background:tab==='local'?'rgba(57,255,20,.08)':'transparent', color:tab==='local'?'#39FF14':'#6B6B8A', cursor:'pointer', fontSize:12, fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', gap:6}}>
              <Database size={12}/> Local ({localResults.length})
            </button>
            <button onClick={() => setTab('usda')}
              style={{flex:1, padding:'8px', borderRadius:8, border:`1px solid ${tab==='usda'?'rgba(0,229,255,.4)':'#252540'}`, background:tab==='usda'?'rgba(0,229,255,.08)':'transparent', color:tab==='usda'?'#00E5FF':'#6B6B8A', cursor:'pointer', fontSize:12, fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', gap:6}}>
              <Globe size={12}/> USDA Database {searching?'(searching...)':'('+usdaResults.length+')'}
            </button>
          </div>
        </div>

        {/* Results */}
        <div style={{flex:1, overflowY:'auto', padding:'0 20px'}}>
          {query.length === 0 && (
            <div style={{textAlign:'center', padding:'32px 0', color:'#6B6B8A'}}>
              <div style={{fontSize:32, marginBottom:10}}>🔍</div>
              <div style={{fontSize:14}}>Start typing to search</div>
              <div style={{fontSize:12, marginTop:6}}>Local: 471 common foods · USDA: 1 million+ foods</div>
            </div>
          )}

          {query.length > 0 && results.length === 0 && !searching && (
            <div style={{textAlign:'center', padding:'24px 0', color:'#6B6B8A', fontSize:13}}>
              No results for "{query}"
              {tab === 'local' && <div style={{marginTop:6, fontSize:12}}>Try the USDA tab for more options</div>}
            </div>
          )}

          {searching && tab === 'usda' && (
            <div style={{textAlign:'center', padding:'20px 0'}}>
              <div style={{width:24, height:24, border:'2px solid #252540', borderTopColor:'#00E5FF', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto 8px'}}/>
              <div style={{fontSize:12, color:'#6B6B8A'}}>Searching USDA database...</div>
            </div>
          )}

          {results.map(food => (
            <div key={food.id}
              style={{
                padding:'12px', borderRadius:12, cursor:'pointer', marginBottom:6,
                border:`1px solid ${selected?.id===food.id?'rgba(57,255,20,.4)':'transparent'}`,
                background: selected?.id===food.id ? 'rgba(57,255,20,.06)' : 'transparent',
                transition:'all .15s',
              }}
              onMouseEnter={e => { if(selected?.id!==food.id) e.currentTarget.style.background='#1C1C2E' }}
              onMouseLeave={e => { if(selected?.id!==food.id) e.currentTarget.style.background='transparent' }}
              onClick={() => handleSelect(food)}
            >
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                <div style={{flex:1, minWidth:0, paddingRight:10}}>
                  <div style={{fontSize:14, fontWeight:600, color:'#F0F0FF', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{food.name}</div>
                  <div style={{fontSize:11, color:'#6B6B8A', marginTop:2}}>
                    {food.brand && <span style={{color:'#00E5FF', marginRight:6}}>{food.brand}</span>}
                    P:{food.p}g · C:{food.c}g · F:{food.f}g
                    {food.serving && <span style={{marginLeft:6}}>· per {food.serving}</span>}
                  </div>
                </div>
                <div style={{textAlign:'right', flexShrink:0}}>
                  <div style={{fontSize:17, fontWeight:800, color:selected?.id===food.id?'#39FF14':'#F0F0FF'}}>{food.cal}</div>
                  <div style={{fontSize:9, color:'#6B6B8A'}}>kcal</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Serving size selector + Add button */}
        {selected && (
          <div style={{padding:'14px 20px', borderTop:'1px solid #252540', flexShrink:0, background:'#0F0F1A'}}>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:13, fontWeight:700, color:'#F0F0FF', marginBottom:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{selected.name}</div>
              <div style={{fontSize:11, color:'#6B6B8A', marginBottom:10}}>Adjust serving size</div>

              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10}}>
                <div>
                  <label style={{fontSize:10, color:'#6B6B8A', fontWeight:600, letterSpacing:'.5px', display:'block', marginBottom:4}}>SERVINGS</label>
                  <input
                    type="number"
                    className="vf-input"
                    value={servings}
                    min="0.25"
                    step="0.25"
                    onChange={e => setServings(e.target.value)}
                    style={{textAlign:'center', fontSize:16, fontWeight:700}}
                  />
                </div>
                <div>
                  <label style={{fontSize:10, color:'#6B6B8A', fontWeight:600, letterSpacing:'.5px', display:'block', marginBottom:4}}>UNIT</label>
                  <input
                    type="text"
                    className="vf-input"
                    value={servingUnit}
                    onChange={e => setUnit(e.target.value)}
                    placeholder="serving, cup, oz..."
                    style={{fontSize:13}}
                  />
                </div>
              </div>

              {/* Live macro preview */}
              <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:12}}>
                {[
                  {l:'Calories', v:Math.round(selected.cal*mult), c:'#39FF14'},
                  {l:'Protein',  v:Math.round(selected.p*mult)+'g',  c:'#39FF14'},
                  {l:'Carbs',    v:Math.round(selected.c*mult)+'g',  c:'#00E5FF'},
                  {l:'Fat',      v:Math.round(selected.f*mult)+'g',  c:'#FF6B35'},
                ].map(m => (
                  <div key={m.l} style={{background:'#1C1C2E', borderRadius:10, padding:'8px', textAlign:'center'}}>
                    <div style={{fontSize:15, fontWeight:800, color:m.c}}>{m.v}</div>
                    <div style={{fontSize:9, color:'#6B6B8A'}}>{m.l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{display:'flex', gap:10}}>
              <button className="btn-ghost" style={{flex:1, justifyContent:'center'}} onClick={() => setSelected(null)}>
                Back
              </button>
              <button className="btn-primary" style={{flex:2, justifyContent:'center', fontSize:14, padding:'12px'}} onClick={handleAdd}>
                <Plus size={14}/> Add to {MEALS.find(m=>m.id===meal)?.label}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CalorieTracker() {
  const today = new Date().toISOString().split('T')[0]
  const [log, setLog]     = useState(() => {
    const s = storage.get(KEYS.FOOD_LOG)
    return s?.[today] || { breakfast:[], lunch:[], dinner:[], snacks:[] }
  })
  const [modal, setModal] = useState(null)
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
    if (!meal || !food) return
    saveLog({ ...log, [meal]: [...log[meal], food] })
    setModal(null)
  }

  function removeFood(meal, idx) {
    saveLog({ ...log, [meal]: log[meal].filter((_,i) => i !== idx) })
  }

  const allFoods = Object.values(log).flat()
  const totals = {
    cal: allFoods.reduce((a,f) => a+(f.cal||0), 0),
    p:   allFoods.reduce((a,f) => a+(f.p||0),   0),
    c:   allFoods.reduce((a,f) => a+(f.c||0),   0),
    f:   allFoods.reduce((a,f) => a+(f.f||0),   0),
  }
  const remaining = GOAL.calories - totals.cal

  return (
    <div>
      {modal && <AddFoodModal meal={modal} onAdd={addFood} onClose={() => setModal(null)}/>}

      <div className="anim-up" style={{marginBottom:20}}>
        <h1 className="font-display" style={{fontSize:isMobile?36:48, margin:0}}>
          NUTRITION <span className="gradient-text">TRACKER</span>
        </h1>
        <p style={{color:'#6B6B8A', marginTop:6, fontSize:13}}>
          {new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}
        </p>
      </div>

      {/* Calorie summary */}
      <div style={{background:'#141422', border:'1px solid #252540', borderRadius:14, padding:'18px 20px', marginBottom:16}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10, flexWrap:'wrap', gap:8}}>
          <div>
            <span style={{fontSize:isMobile?32:42, fontWeight:900, color:remaining<0?'#FF6B35':'#F0F0FF'}}>{totals.cal}</span>
            <span style={{fontSize:13, color:'#6B6B8A', marginLeft:6}}>/ {GOAL.calories} kcal</span>
          </div>
          <div style={{fontSize:14, fontWeight:700, color:remaining>0?'#39FF14':'#FF6B35'}}>
            {remaining>0 ? `${remaining} remaining` : `${Math.abs(remaining)} over goal`}
          </div>
        </div>
        <div style={{height:8, background:'#252540', borderRadius:4, overflow:'hidden', marginBottom:14}}>
          <div style={{height:'100%', width:`${Math.min((totals.cal/GOAL.calories)*100,100)}%`, background:remaining<0?'#FF6B35':'linear-gradient(90deg,#39FF14,#00C851)', borderRadius:4, transition:'width 1s ease'}}/>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8}}>
          {[{l:'Protein',v:totals.p,g:GOAL.protein,c:'#39FF14'},{l:'Carbs',v:totals.c,g:GOAL.carbs,c:'#00E5FF'},{l:'Fat',v:totals.f,g:GOAL.fat,c:'#FF6B35'}].map(m => (
            <div key={m.l} style={{textAlign:'center', padding:'10px', background:'#1C1C2E', borderRadius:10}}>
              <div style={{fontSize:isMobile?16:18, fontWeight:800, color:m.c}}>{m.v}g</div>
              <div style={{fontSize:10, color:'#6B6B8A'}}>{m.l} / {m.g}g</div>
              <div style={{height:3, background:'#252540', borderRadius:2, marginTop:4, overflow:'hidden'}}>
                <div style={{height:'100%', width:`${Math.min((m.v/m.g)*100,100)}%`, background:m.c, borderRadius:2}}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Meal sections */}
      <div style={{display:'flex', flexDirection:'column', gap:10}}>
        {MEALS.map(m => (
          <div key={m.id} style={{background:'#141422', border:'1px solid #252540', borderRadius:14, overflow:'hidden'}}>
            {/* Meal header */}
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 16px', borderBottom: log[m.id].length > 0 ? '1px solid #252540' : 'none'}}>
              <div style={{display:'flex', alignItems:'center', gap:10}}>
                <span style={{fontSize:20}}>{m.icon}</span>
                <div>
                  <div style={{fontSize:14, fontWeight:700}}>{m.label}</div>
                  <div style={{fontSize:11, color:'#6B6B8A'}}>{log[m.id].reduce((a,f)=>a+(f.cal||0),0)} kcal</div>
                </div>
              </div>
              <div style={{display:'flex', gap:8}}>
                <MealScanner meal={m.id} onFoodAdded={addFood}/>
                <button className="btn-primary" style={{padding:'7px 14px', fontSize:12}} onClick={() => setModal(m.id)}>
                  <Plus size={13}/> Add Food
                </button>
              </div>
            </div>

            {/* Food items */}
            {log[m.id].length === 0 && (
              <div style={{padding:'16px', textAlign:'center', color:'#6B6B8A', fontSize:13}}>
                Nothing logged yet — tap Add Food or Scan
              </div>
            )}

            {log[m.id].map((food,i) => (
              <div key={i} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 16px', borderBottom: i < log[m.id].length-1 ? '1px solid rgba(37,37,64,.5)' : 'none', transition:'background .15s'}}
                onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,.02)'}
                onMouseLeave={e => e.currentTarget.style.background='none'}>
                <div style={{flex:1, minWidth:0, paddingRight:10}}>
                  <div style={{fontSize:13, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:6}}>
                    {food.name}
                    {food.aiScanned && <span style={{fontSize:9, background:'rgba(57,255,20,.15)', color:'#39FF14', padding:'1px 5px', borderRadius:4, flexShrink:0}}>AI</span>}
                    {food.source==='usda' && <span style={{fontSize:9, background:'rgba(0,229,255,.15)', color:'#00E5FF', padding:'1px 5px', borderRadius:4, flexShrink:0}}>USDA</span>}
                  </div>
                  <div style={{fontSize:10, color:'#6B6B8A', marginTop:1}}>
                    {food.logged}
                    {food.servings && food.servings !== 1 && <span style={{marginLeft:6}}>· {food.servings} {food.servingUnit || 'serving'}</span>}
                  </div>
                </div>
                <div style={{display:'flex', gap:10, alignItems:'center', flexShrink:0}}>
                  {!isMobile && (
                    <>
                      <div style={{textAlign:'center', minWidth:32}}><div style={{fontSize:11,color:'#39FF14',fontWeight:700}}>{food.p}g</div><div style={{fontSize:9,color:'#6B6B8A'}}>P</div></div>
                      <div style={{textAlign:'center', minWidth:32}}><div style={{fontSize:11,color:'#00E5FF',fontWeight:700}}>{food.c}g</div><div style={{fontSize:9,color:'#6B6B8A'}}>C</div></div>
                      <div style={{textAlign:'center', minWidth:32}}><div style={{fontSize:11,color:'#FF6B35',fontWeight:700}}>{food.f}g</div><div style={{fontSize:9,color:'#6B6B8A'}}>F</div></div>
                    </>
                  )}
                  <div style={{textAlign:'center', minWidth:40}}>
                    <div style={{fontSize:15, fontWeight:800}}>{food.cal}</div>
                    <div style={{fontSize:9, color:'#6B6B8A'}}>kcal</div>
                  </div>
                  <button style={{background:'none', border:'none', cursor:'pointer', color:'#6B6B8A', padding:4, transition:'color .15s', flexShrink:0}}
                    onMouseEnter={e=>e.target.style.color='#FF6B35'} onMouseLeave={e=>e.target.style.color='#6B6B8A'}
                    onClick={() => removeFood(m.id,i)}>
                    <X size={14}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
