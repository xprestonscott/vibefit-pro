import { useState, useEffect, useRef } from 'react'
import { Plus, X, Search, Clock, ChevronDown, ChevronUp, Trash2, History, Target, Edit2, Check } from 'lucide-react'
import { getGoalFromStorage, saveGoalToStorage, calculateMacros } from '../utils/calories'
import { storage, KEYS } from '../utils/storage'
import { searchUSDA } from '../utils/usdaApi'
import MealScanner from '../components/MealScanner'

function getGoal() {
  const { calories, macros } = getGoalFromStorage()
  return { calories, protein: macros.protein, carbs: macros.carbs, fat: macros.fat }
}
const MEALS = [
  { id:'breakfast', label:'Breakfast', icon:'\u{1F305}' },
  { id:'lunch',     label:'Lunch',     icon:'\u2600\uFE0F' },
  { id:'dinner',    label:'Dinner',    icon:'\u{1F319}' },
  { id:'snacks',    label:'Snacks',    icon:'\u{1F34E}' },
]

const RECENT_KEY = 'vf_recent_foods'

function getRecent() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]') } catch { return [] }
}

function saveRecent(food) {
  const recent = getRecent().filter(f => f.name !== food.name).slice(0, 19)
  recent.unshift({ ...food, usedAt: new Date().toISOString() })
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent))
}

function AddFoodModal({ meal, onAdd, onClose }) {
  const [query, setQuery]         = useState('')
  const [results, setResults]     = useState([])
  const [recent, setRecent]       = useState(getRecent)
  const [searching, setSearching] = useState(false)
  const [selected, setSelected]   = useState(null)
  const [servings, setServings]   = useState(1)
  const [servingUnit, setUnit]    = useState('serving')
  const debounceRef = useRef()

  useEffect(() => {
    if (!query || query.length < 2) { setResults([]); return }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      const r = await searchUSDA(query)
      setResults(r)
      setSearching(false)
    }, 500)
    return () => clearTimeout(debounceRef.current)
  }, [query])

  function handleSelect(food) {
    setSelected(food)
    setServings(1)
    setUnit(food.serving || 'serving')
  }

  function handleAdd() {
    if (!selected) return
    const mult = Number(servings) || 1
    const food = {
      id: Date.now(),
      name: selected.name + (selected.brand ? ` (${selected.brand})` : ''),
      cal:  Math.round((selected.cal||0)*mult),
      p:    Math.round((selected.p||0)*mult),
      c:    Math.round((selected.c||0)*mult),
      f:    Math.round((selected.f||0)*mult),
      servings: mult,
      servingUnit,
      logged: new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),
    }
    saveRecent({ ...selected, servingUnit })
    setRecent(getRecent())
    onAdd(meal, food)
    onClose()
  }

  const mult = Number(servings) || 1
  const showRecent = query.length < 2

  return (
    <div style={{position:'fixed',inset:0,zIndex:99999,background:'rgba(8,8,16,.97)',backdropFilter:'blur(16px)',display:'flex',alignItems:'center',justifyContent:'center',padding:16}}
      onClick={onClose}>
      <div style={{background:'#141422',border:'1px solid #252540',borderRadius:20,width:'100%',maxWidth:520,maxHeight:'92vh',display:'flex',flexDirection:'column',boxShadow:'0 24px 80px rgba(0,0,0,.6)',overflow:'hidden'}}
        onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div style={{padding:'18px 20px',borderBottom:'1px solid #252540',display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0}}>
          <div>
            <div style={{fontSize:16,fontWeight:700}}>Add to {MEALS.find(m=>m.id===meal)?.label}</div>
            <div style={{fontSize:11,color:'#6B6B8A',marginTop:2}}>Search millions of foods</div>
          </div>
          <button onClick={onClose} style={{background:'#1C1C2E',border:'1px solid #252540',borderRadius:8,width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'#6B6B8A'}}>
            <X size={16}/>
          </button>
        </div>

        {/* Search bar */}
        <div style={{padding:'14px 20px 10px',flexShrink:0}}>
          <div style={{position:'relative'}}>
            <Search size={15} style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'#6B6B8A'}}/>
            {searching && <div style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',width:14,height:14,border:'2px solid #252540',borderTopColor:'#39FF14',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>}
            <input className="vf-input" style={{paddingLeft:40,paddingRight:36,fontSize:15}} placeholder='Search any food — "chicken breast", "oreo", "big mac"...' value={query} onChange={e=>setQuery(e.target.value)} autoFocus/>
          </div>
        </div>

        {/* Results / Recent */}
        <div style={{flex:1,overflowY:'auto',padding:'0 20px 10px'}}>

          {/* Recent searches */}
          {showRecent && recent.length > 0 && (
            <div>
              <div style={{fontSize:11,color:'#6B6B8A',fontWeight:600,letterSpacing:'1px',marginBottom:8,display:'flex',alignItems:'center',gap:6}}>
                <Clock size={11}/> RECENTLY LOGGED
              </div>
              {recent.slice(0,8).map((food,i) => (
                <div key={i}
                  style={{padding:'10px 12px',borderRadius:10,cursor:'pointer',marginBottom:4,border:'1px solid transparent',transition:'all .15s'}}
                  onMouseEnter={e=>{e.currentTarget.style.background='#1C1C2E';e.currentTarget.style.borderColor='#252540'}}
                  onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.borderColor='transparent'}}
                  onClick={()=>handleSelect(food)}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div style={{flex:1,minWidth:0,paddingRight:10}}>
                      <div style={{fontSize:13,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{food.name}</div>
                      <div style={{fontSize:10,color:'#6B6B8A'}}>P:{food.p}g · C:{food.c}g · F:{food.f}g · per {food.serving||'serving'}</div>
                    </div>
                    <div style={{fontSize:14,fontWeight:800,color:'#F0F0FF',flexShrink:0}}>{food.cal} <span style={{fontSize:9,color:'#6B6B8A'}}>kcal</span></div>
                  </div>
                </div>
              ))}
              <div style={{borderTop:'1px solid #252540',margin:'10px 0'}}/>
            </div>
          )}

          {/* Empty state */}
          {showRecent && recent.length === 0 && (
            <div style={{textAlign:'center',padding:'32px 0',color:'#6B6B8A'}}>
              <div style={{fontSize:36,marginBottom:10}}>🔍</div>
              <div style={{fontSize:14,fontWeight:600,marginBottom:6}}>Search any food</div>
              <div style={{fontSize:12}}>Millions of foods from the USDA database</div>
            </div>
          )}

          {/* Search results */}
          {!showRecent && results.length === 0 && !searching && (
            <div style={{textAlign:'center',padding:'24px 0',color:'#6B6B8A',fontSize:13}}>
              No results for "{query}" — try different keywords
            </div>
          )}

          {results.map(food => (
            <div key={food.id}
              style={{padding:'11px 12px',borderRadius:12,cursor:'pointer',marginBottom:5,border:`1px solid ${selected?.id===food.id?'rgba(57,255,20,.4)':'transparent'}`,background:selected?.id===food.id?'rgba(57,255,20,.06)':'transparent',transition:'all .15s'}}
              onMouseEnter={e=>{if(selected?.id!==food.id){e.currentTarget.style.background='#1C1C2E';e.currentTarget.style.borderColor='#252540'}}}
              onMouseLeave={e=>{if(selected?.id!==food.id){e.currentTarget.style.background='transparent';e.currentTarget.style.borderColor='transparent'}}}
              onClick={()=>handleSelect(food)}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                <div style={{flex:1,minWidth:0,paddingRight:10}}>
                  <div style={{fontSize:14,fontWeight:600,color:'#F0F0FF',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{food.name}</div>
                  <div style={{fontSize:11,color:'#6B6B8A',marginTop:2}}>
                    {food.brand && <span style={{color:'#00E5FF',marginRight:6}}>{food.brand}</span>}
                    P:{food.p}g · C:{food.c}g · F:{food.f}g
                    {food.serving && <span style={{marginLeft:6}}>· per {food.serving}</span>}
                  </div>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <div style={{fontSize:17,fontWeight:800,color:selected?.id===food.id?'#39FF14':'#F0F0FF'}}>{food.cal}</div>
                  <div style={{fontSize:9,color:'#6B6B8A'}}>kcal</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Serving size + Add */}
        {selected && (
          <div style={{padding:'14px 20px',borderTop:'1px solid #252540',flexShrink:0,background:'#0F0F1A'}}>
            <div style={{fontSize:13,fontWeight:700,marginBottom:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{selected.name}</div>
            <div style={{fontSize:11,color:'#6B6B8A',marginBottom:12}}>Adjust serving size below</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
              <div>
                <label style={{fontSize:10,color:'#6B6B8A',fontWeight:600,letterSpacing:'.5px',display:'block',marginBottom:4}}>SERVINGS</label>
                <input type="number" className="vf-input" value={servings} min="0.25" step="0.25" onChange={e=>setServings(e.target.value)} style={{textAlign:'center',fontSize:16,fontWeight:700}}/>
              </div>
              <div>
                <label style={{fontSize:10,color:'#6B6B8A',fontWeight:600,letterSpacing:'.5px',display:'block',marginBottom:4}}>UNIT</label>
                <input type="text" className="vf-input" value={servingUnit} onChange={e=>setUnit(e.target.value)} placeholder="serving, cup, oz..." style={{fontSize:13}}/>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:14}}>
              {[{l:'Cal',v:Math.round(selected.cal*mult),c:'#39FF14'},{l:'Protein',v:Math.round(selected.p*mult)+'g',c:'#39FF14'},{l:'Carbs',v:Math.round(selected.c*mult)+'g',c:'#00E5FF'},{l:'Fat',v:Math.round(selected.f*mult)+'g',c:'#FF6B35'}].map(m=>(
                <div key={m.l} style={{background:'#1C1C2E',borderRadius:10,padding:'8px',textAlign:'center'}}>
                  <div style={{fontSize:15,fontWeight:800,color:m.c}}>{m.v}</div>
                  <div style={{fontSize:9,color:'#6B6B8A'}}>{m.l}</div>
                </div>
              ))}
            </div>
            <div style={{display:'flex',gap:10}}>
              <button className="btn-ghost" style={{flex:1,justifyContent:'center'}} onClick={()=>setSelected(null)}>Back</button>
              <button className="btn-primary" style={{flex:2,justifyContent:'center',fontSize:14,padding:'12px'}} onClick={handleAdd}>
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
  const [log, setLog]       = useState(()=>{ const s=storage.get(KEYS.FOOD_LOG); return s?.[today]||{breakfast:[],lunch:[],dinner:[],snacks:[]} })
  const [modal, setModal]   = useState(null)
  const [showLog, setShowLog] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(()=>{ const fn=()=>setIsMobile(window.innerWidth<768); window.addEventListener('resize',fn); return()=>window.removeEventListener('resize',fn) },[])

  function saveLog(newLog) {
    setLog(newLog)
    const all = storage.get(KEYS.FOOD_LOG)||{}
    all[today] = newLog
    storage.set(KEYS.FOOD_LOG, all)
  }

  function addFood(meal, food) {
    if (!meal||!food) return
    saveLog({...log,[meal]:[...log[meal],food]})
    setModal(null)
  }

  function removeFood(meal, idx) {
    saveLog({...log,[meal]:log[meal].filter((_,i)=>i!==idx)})
  }

  function clearDay() {
    if (window.confirm('Clear all food logged today?')) {
      saveLog({breakfast:[],lunch:[],dinner:[],snacks:[]})
    }
  }

  const allFoods = Object.values(log).flat()
  const totals = {
    cal: allFoods.reduce((a,f)=>a+(f.cal||0),0),
    p:   allFoods.reduce((a,f)=>a+(f.p||0),0),
    c:   allFoods.reduce((a,f)=>a+(f.c||0),0),
    f:   allFoods.reduce((a,f)=>a+(f.f||0),0),
  }
  const GOAL = getGoal()
  const remaining = GOAL.calories - totals.cal

  // History
  const [showHistory, setShowHistory] = useState(false)
  const [showGoalEditor, setShowGoalEditor] = useState(false)
  const [customCal, setCustomCal] = useState(() => getGoalFromStorage().calories)
  const [goalSaved, setGoalSaved] = useState(false)

  function saveGoal(cal) {
    const macros = calculateMacros(Number(cal), null, null)
    saveGoalToStorage(Number(cal), macros)
    setCustomCal(cal)
    setGoalSaved(true)
    setTimeout(() => setGoalSaved(false), 2000)
  }

  function getPastDays() {
    const all = storage.get(KEYS.FOOD_LOG) || {}
    return Object.entries(all)
      .filter(([date]) => date !== today)
      .sort((a,b) => b[0].localeCompare(a[0]))
      .slice(0, 14)
      .map(([date, meals]) => {
        const foods = Object.values(meals).flat()
        return {
          date,
          label: new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' }),
          cal:   foods.reduce((a,f) => a+(f.cal||0), 0),
          p:     foods.reduce((a,f) => a+(f.p||0), 0),
          c:     foods.reduce((a,f) => a+(f.c||0), 0),
          f:     foods.reduce((a,f) => a+(f.f||0), 0),
          count: foods.length,
          meals,
        }
      })
  }

  return (
    <div>
      {modal && (
          meal={modal}
          mealLabel={MEALS.find(m=>m.id===modal)?.label || modal}
          onAdd={addFood}
          onClose={()=>setModal(null)}
        />
      )}

      <div className="anim-up" style={{marginBottom:20}}>
        <h1 className="font-display" style={{fontSize:isMobile?36:48,margin:0}}>
          NUTRITION <span className="gradient-text">TRACKER</span>
        </h1>
        <p style={{color:'#6B6B8A',marginTop:6,fontSize:13}}>
          {new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}
        </p>
      </div>

      {/* Goal editor */}
      {showGoalEditor && (
        <div style={{background:'#141422',border:'1px solid rgba(57,255,20,.2)',borderRadius:14,padding:20,marginBottom:16}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <div style={{fontSize:15,fontWeight:700,display:'flex',alignItems:'center',gap:8}}><Target size={16} style={{color:'#39FF14'}}/>Daily Calorie Goal</div>
            <button style={{background:'none',border:'none',cursor:'pointer',color:'#6B6B8A'}} onClick={()=>setShowGoalEditor(false)}><X size={16}/></button>
          </div>
          <div style={{display:'flex',gap:10,marginBottom:12}}>
            <input type="number" className="vf-input" value={customCal} onChange={e=>setCustomCal(e.target.value)} style={{flex:1,fontSize:18,fontWeight:800,textAlign:'center'}} placeholder="e.g. 2200"/>
            <button className={goalSaved?'btn-primary':'btn-ghost'} style={{padding:'10px 20px',flexShrink:0}} onClick={()=>saveGoal(customCal)}>
              {goalSaved?<><Check size={14}/>Saved!</>:<>Save</>}
            </button>
          </div>
          <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
            {[1400,1600,1800,2000,2200,2400,2600,2800,3000,3200,3500].map(c=>(
              <button key={c} onClick={()=>setCustomCal(c)} style={{padding:'6px 12px',borderRadius:8,border:`1px solid ${Number(customCal)===c?'rgba(57,255,20,.4)':'#252540'}`,background:Number(customCal)===c?'rgba(57,255,20,.08)':'#1C1C2E',color:Number(customCal)===c?'#39FF14':'#6B6B8A',cursor:'pointer',fontSize:12,fontWeight:600,transition:'all .15s'}}>
                {c}
              </button>
            ))}
          </div>
          <div style={{fontSize:11,color:'#6B6B8A',marginTop:10}}>Macros will auto-adjust when you save</div>
        </div>
      )}

      {/* Calorie summary */}
      <div style={{background:'#141422',border:'1px solid #252540',borderRadius:14,padding:'18px 20px',marginBottom:16}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10,flexWrap:'wrap',gap:8}}>
          <div>
            <span style={{fontSize:isMobile?32:42,fontWeight:900,color:remaining<0?'#FF6B35':'#F0F0FF'}}>{totals.cal}</span>
            <span style={{fontSize:13,color:'#6B6B8A',marginLeft:6}}>/ {getGoal().calories} kcal</span>
          </div>
          <div style={{fontSize:14,fontWeight:700,color:remaining>0?'#39FF14':'#FF6B35'}}>
            {remaining>0?`${remaining} remaining`:`${Math.abs(remaining)} over goal`}
          </div>
        </div>
        <div style={{height:8,background:'#252540',borderRadius:4,overflow:'hidden',marginBottom:14}}>
          <div style={{height:'100%',width:`${Math.min((totals.cal/getGoal().calories)*100,100)}%`,background:remaining<0?'#FF6B35':'linear-gradient(90deg,#39FF14,#00C851)',borderRadius:4,transition:'width 1s ease'}}/>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
          {[{l:'Protein',v:totals.p,g:getGoal().protein,c:'#39FF14'},{l:'Carbs',v:totals.c,g:getGoal().carbs,c:'#00E5FF'},{l:'Fat',v:totals.f,g:getGoal().fat,c:'#FF6B35'}].map(m=>(
            <div key={m.l} style={{textAlign:'center',padding:'10px',background:'#1C1C2E',borderRadius:10}}>
              <div style={{fontSize:isMobile?16:18,fontWeight:800,color:m.c}}>{m.v}g</div>
              <div style={{fontSize:10,color:'#6B6B8A'}}>{m.l} / {m.g}g</div>
              <div style={{height:3,background:'#252540',borderRadius:2,marginTop:4,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${Math.min((m.v/m.g)*100,100)}%`,background:m.c,borderRadius:2}}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick action buttons */}
      <div style={{display:'flex',gap:8,marginBottom:12}}>
        <button className="btn-ghost" style={{fontSize:12,padding:'7px 14px'}} onClick={()=>setShowGoalEditor(v=>!v)}>
          <Target size={13}/> Goal: {getGoalFromStorage().calories} kcal
        </button>
        <button className="btn-ghost" style={{fontSize:12,padding:'7px 14px'}} onClick={()=>setShowHistory(v=>!v)}>
          <History size={13}/> Food History
        </button>
      </div>

      {/* History panel */}
      {showHistory && (
        <div style={{background:'#141422',border:'1px solid #252540',borderRadius:14,marginBottom:16,overflow:'hidden'}}>
          <div style={{padding:'14px 18px',borderBottom:'1px solid #252540',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div style={{fontSize:15,fontWeight:700,display:'flex',alignItems:'center',gap:8}}><History size={15} style={{color:'#00E5FF'}}/>Past 14 Days</div>
            <button style={{background:'none',border:'none',cursor:'pointer',color:'#6B6B8A'}} onClick={()=>setShowHistory(false)}><X size={16}/></button>
          </div>
          {getPastDays().length === 0 ? (
            <div style={{padding:'24px',textAlign:'center',color:'#6B6B8A',fontSize:13}}>No history yet — start logging food today!</div>
          ) : getPastDays().map(day => (
            <div key={day.date} style={{borderBottom:'1px solid rgba(37,37,64,.4)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 18px'}}>
                <div>
                  <div style={{fontSize:14,fontWeight:600}}>{day.label}</div>
                  <div style={{fontSize:11,color:'#6B6B8A',marginTop:2}}>{day.count} foods logged</div>
                </div>
                <div style={{display:'flex',gap:16,alignItems:'center'}}>
                  <div style={{textAlign:'center'}}><div style={{fontSize:13,color:'#39FF14',fontWeight:700}}>{day.p}g</div><div style={{fontSize:9,color:'#6B6B8A'}}>Protein</div></div>
                  <div style={{textAlign:'center'}}><div style={{fontSize:13,color:'#00E5FF',fontWeight:700}}>{day.c}g</div><div style={{fontSize:9,color:'#6B6B8A'}}>Carbs</div></div>
                  <div style={{textAlign:'center'}}><div style={{fontSize:13,color:'#FF6B35',fontWeight:700}}>{day.f}g</div><div style={{fontSize:9,color:'#6B6B8A'}}>Fat</div></div>
                  <div style={{textAlign:'right',minWidth:48}}>
                    <div style={{fontSize:18,fontWeight:900,color:day.cal>=getGoalFromStorage().calories?'#39FF14':'#F0F0FF'}}>{day.cal}</div>
                    <div style={{fontSize:9,color:'#6B6B8A'}}>kcal</div>
                  </div>
                </div>
              </div>
              <div style={{height:3,background:'#252540',margin:'0 18px 10px'}}>
                <div style={{height:'100%',width:`${Math.min((day.cal/getGoalFromStorage().calories)*100,100)}%`,background:day.cal>=getGoalFromStorage().calories?'#39FF14':'#FF6B35',borderRadius:2}}/>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Daily log summary toggle */}
      {allFoods.length > 0 && (
        <div style={{background:'#141422',border:'1px solid #252540',borderRadius:14,marginBottom:16,overflow:'hidden'}}>
          <button
            style={{width:'100%',padding:'14px 18px',background:'none',border:'none',cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center',color:'#F0F0FF'}}
            onClick={()=>setShowLog(v=>!v)}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:30,height:30,borderRadius:8,background:'rgba(57,255,20,.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>📋</div>
              <div style={{textAlign:'left'}}>
                <div style={{fontSize:14,fontWeight:700}}>Today's Full Log</div>
                <div style={{fontSize:11,color:'#6B6B8A'}}>{allFoods.length} items · {totals.cal} kcal total</div>
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <button onClick={e=>{e.stopPropagation();clearDay()}} style={{background:'rgba(255,107,53,.1)',border:'1px solid rgba(255,107,53,.3)',borderRadius:6,padding:'4px 10px',color:'#FF6B35',cursor:'pointer',fontSize:11,display:'flex',alignItems:'center',gap:4}}>
                <Trash2 size={11}/> Clear
              </button>
              {showLog ? <ChevronUp size={16} style={{color:'#6B6B8A'}}/> : <ChevronDown size={16} style={{color:'#6B6B8A'}}/>}
            </div>
          </button>

          {showLog && (
            <div style={{borderTop:'1px solid #252540'}}>
              {/* Summary row */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:1,background:'#252540'}}>
                {[{l:'Total Cal',v:totals.cal,c:'#39FF14'},{l:'Protein',v:totals.p+'g',c:'#39FF14'},{l:'Carbs',v:totals.c+'g',c:'#00E5FF'},{l:'Fat',v:totals.f+'g',c:'#FF6B35'}].map(s=>(
                  <div key={s.l} style={{background:'#0F0F1A',padding:'10px',textAlign:'center'}}>
                    <div style={{fontSize:16,fontWeight:800,color:s.c}}>{s.v}</div>
                    <div style={{fontSize:10,color:'#6B6B8A'}}>{s.l}</div>
                  </div>
                ))}
              </div>

              {/* All foods list */}
              <div style={{maxHeight:360,overflowY:'auto'}}>
                {MEALS.map(m => {
                  const foods = log[m.id]
                  if (!foods || foods.length === 0) return null
                  return (
                    <div key={m.id}>
                      <div style={{padding:'8px 16px',background:'rgba(37,37,64,.4)',fontSize:11,color:'#6B6B8A',fontWeight:600,letterSpacing:'.5px',display:'flex',justifyContent:'space-between'}}>
                        <span>{m.icon} {m.label.toUpperCase()}</span>
                        <span>{foods.reduce((a,f)=>a+(f.cal||0),0)} kcal</span>
                      </div>
                      {foods.map((food,i) => (
                        <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 16px',borderBottom:'1px solid rgba(37,37,64,.4)',transition:'background .15s'}}
                          onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.02)'}
                          onMouseLeave={e=>e.currentTarget.style.background='none'}>
                          <div style={{flex:1,minWidth:0,paddingRight:10}}>
                            <div style={{fontSize:13,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                              {food.name}
                              {food.aiScanned && <span style={{fontSize:9,background:'rgba(57,255,20,.15)',color:'#39FF14',padding:'1px 5px',borderRadius:4,marginLeft:6}}>AI</span>}
                            </div>
                            <div style={{fontSize:10,color:'#6B6B8A',marginTop:1}}>
                              {food.logged}
                              {food.servings && food.servings!==1 && <span style={{marginLeft:6}}>· {food.servings} {food.servingUnit||'serving'}</span>}
                              <span style={{marginLeft:6}}>· P:{food.p}g C:{food.c}g F:{food.f}g</span>
                            </div>
                          </div>
                          <div style={{display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
                            <div style={{textAlign:'right'}}>
                              <div style={{fontSize:14,fontWeight:800}}>{food.cal}</div>
                              <div style={{fontSize:9,color:'#6B6B8A'}}>kcal</div>
                            </div>
                            <button style={{background:'none',border:'none',cursor:'pointer',color:'#6B6B8A',padding:4,transition:'color .15s'}}
                              onMouseEnter={e=>e.target.style.color='#FF6B35'} onMouseLeave={e=>e.target.style.color='#6B6B8A'}
                              onClick={()=>removeFood(m.id,i)}>
                              <X size={13}/>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Meal sections */}
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {MEALS.map(m => (
          <div key={m.id} style={{background:'#141422',border:'1px solid #252540',borderRadius:14,overflow:'hidden'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 16px',borderBottom:log[m.id].length>0?'1px solid #252540':'none'}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <span style={{fontSize:20}}>{m.icon}</span>
                <div>
                  <div style={{fontSize:14,fontWeight:700}}>{m.label}</div>
                  <div style={{fontSize:11,color:'#6B6B8A'}}>{log[m.id].reduce((a,f)=>a+(f.cal||0),0)} kcal · {log[m.id].length} items</div>
                </div>
              </div>
              <div style={{display:'flex',gap:8}}>
                <MealScanner meal={m.id} onFoodAdded={addFood}/>
                <button className="btn-primary" style={{padding:'7px 14px',fontSize:12}} onClick={()=>setModal(m.id)}>
                  <Plus size={13}/> Add Food
                </button>
              </div>
            </div>

            {log[m.id].length===0 && (
              <div style={{padding:'16px',textAlign:'center',color:'#6B6B8A',fontSize:13}}>
                Nothing logged yet — tap Add Food or Scan
              </div>
            )}

            {log[m.id].map((food,i) => (
              <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 16px',borderBottom:i<log[m.id].length-1?'1px solid rgba(37,37,64,.4)':'none',transition:'background .15s'}}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.02)'}
                onMouseLeave={e=>e.currentTarget.style.background='none'}>
                <div style={{flex:1,minWidth:0,paddingRight:10}}>
                  <div style={{fontSize:13,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',display:'flex',alignItems:'center',gap:6}}>
                    {food.name}
                    {food.aiScanned && <span style={{fontSize:9,background:'rgba(57,255,20,.15)',color:'#39FF14',padding:'1px 5px',borderRadius:4,flexShrink:0}}>AI</span>}
                  </div>
                  <div style={{fontSize:10,color:'#6B6B8A',marginTop:1}}>
                    {food.logged}
                    {food.servings && food.servings!==1 && <span style={{marginLeft:6}}>· {food.servings} {food.servingUnit||'serving'}</span>}
                  </div>
                </div>
                <div style={{display:'flex',gap:10,alignItems:'center',flexShrink:0}}>
                  {!isMobile && (
                    <>
                      <div style={{textAlign:'center',minWidth:30}}><div style={{fontSize:11,color:'#39FF14',fontWeight:700}}>{food.p}g</div><div style={{fontSize:9,color:'#6B6B8A'}}>P</div></div>
                      <div style={{textAlign:'center',minWidth:30}}><div style={{fontSize:11,color:'#00E5FF',fontWeight:700}}>{food.c}g</div><div style={{fontSize:9,color:'#6B6B8A'}}>C</div></div>
                      <div style={{textAlign:'center',minWidth:30}}><div style={{fontSize:11,color:'#FF6B35',fontWeight:700}}>{food.f}g</div><div style={{fontSize:9,color:'#6B6B8A'}}>F</div></div>
                    </>
                  )}
                  <div style={{textAlign:'center',minWidth:40}}>
                    <div style={{fontSize:15,fontWeight:800}}>{food.cal}</div>
                    <div style={{fontSize:9,color:'#6B6B8A'}}>kcal</div>
                  </div>
                  <button style={{background:'none',border:'none',cursor:'pointer',color:'#6B6B8A',padding:4,transition:'color .15s',flexShrink:0}}
                    onMouseEnter={e=>e.target.style.color='#FF6B35'} onMouseLeave={e=>e.target.style.color='#6B6B8A'}
                    onClick={()=>removeFood(m.id,i)}>
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
