import { useState } from 'react'
import { Plus, X, Search, Camera, Droplets } from 'lucide-react'
import { storage, KEYS } from '../utils/storage'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const GOAL = { calories: 2400, protein: 180, carbs: 260, fat: 70 }
const FOODS = [
  {id:1,name:'Chicken Breast (6oz)',cal:280,p:52,c:0,f:6},{id:2,name:'White Rice (1 cup)',cal:206,p:4,c:45,f:0},
  {id:3,name:'Broccoli (1 cup)',cal:55,p:4,c:11,f:1},{id:4,name:'Eggs (2 whole)',cal:143,p:13,c:1,f:10},
  {id:5,name:'Oatmeal (½ cup dry)',cal:150,p:5,c:27,f:3},{id:6,name:'Greek Yogurt (1 cup)',cal:130,p:22,c:9,f:0},
  {id:7,name:'Banana',cal:105,p:1,c:27,f:0},{id:8,name:'Protein Shake',cal:160,p:30,c:6,f:3},
  {id:9,name:'Almonds (1oz)',cal:164,p:6,c:6,f:14},{id:10,name:'Sweet Potato (med)',cal:103,p:2,c:24,f:0},
  {id:11,name:'Steak (6oz)',cal:320,p:46,c:0,f:14},{id:12,name:'Salmon (6oz)',cal:280,p:38,c:0,f:13},
  {id:13,name:'Peanut Butter (2 tbsp)',cal:190,p:8,c:6,f:16},{id:14,name:'Whole Milk (1 cup)',cal:150,p:8,c:12,f:8},
]
const MEALS = [{id:'breakfast',label:'Breakfast',icon:'🌅'},{id:'lunch',label:'Lunch',icon:'☀️'},{id:'dinner',label:'Dinner',icon:'🌙'},{id:'snacks',label:'Snacks',icon:'🍎'}]

export default function CalorieTracker() {
  const today = new Date().toISOString().split('T')[0]
  const [log, setLog] = useState(() => { const saved = storage.get(KEYS.FOOD_LOG); return saved?.[today] || {breakfast:[],lunch:[],dinner:[],snacks:[]} })
  const [modal, setModal] = useState(null)
  const [query, setQuery] = useState('')

  function saveLog(newLog) { setLog(newLog); const all = storage.get(KEYS.FOOD_LOG)||{}; all[today]=newLog; storage.set(KEYS.FOOD_LOG,all) }
  function addFood(meal, food) { saveLog({...log, [meal]: [...log[meal], {...food, logged: new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}]}) }
  function removeFood(meal, idx) { saveLog({...log, [meal]: log[meal].filter((_,i)=>i!==idx)}) }

  const allFoods = Object.values(log).flat()
  const totals = { cal: allFoods.reduce((a,f)=>a+f.cal,0), p: allFoods.reduce((a,f)=>a+f.p,0), c: allFoods.reduce((a,f)=>a+f.c,0), f: allFoods.reduce((a,f)=>a+f.f,0) }
  const remaining = GOAL.calories - totals.cal
  const filtered = FOODS.filter(f => f.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <div>
      {modal && (
        <div style={{position:'fixed',inset:0,background:'rgba(8,8,16,.85)',backdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:20}} onClick={() => {setModal(null);setQuery('')}}>
          <div style={{background:'var(--vf-card)',border:'1px solid var(--vf-border)',borderRadius:20,width:'100%',maxWidth:460,padding:28,maxHeight:'80vh',display:'flex',flexDirection:'column'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}><h3 style={{margin:0}}>Add to {MEALS.find(m=>m.id===modal)?.label}</h3><button style={{background:'none',border:'none',cursor:'pointer',color:'var(--vf-muted)'}} onClick={()=>{setModal(null);setQuery('')}}><X size={20}/></button></div>
            <div style={{position:'relative',marginBottom:14}}><Search size={14} style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--vf-muted)'}}/><input className="vf-input" style={{paddingLeft:36}} placeholder="Search foods..." value={query} onChange={e=>setQuery(e.target.value)} autoFocus/></div>
            <div style={{overflowY:'auto',flex:1}}>
              {filtered.map(food => (
                <div key={food.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'11px 12px',borderRadius:10,cursor:'pointer',marginBottom:4,transition:'background .15s'}}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--vf-card2)'} onMouseLeave={e=>e.currentTarget.style.background='none'}
                  onClick={() => {addFood(modal,food);setModal(null);setQuery('')}}>
                  <div><div style={{fontSize:14,fontWeight:500}}>{food.name}</div><div style={{fontSize:11,color:'var(--vf-muted)'}}>P:{food.p}g C:{food.c}g F:{food.f}g</div></div>
                  <div style={{fontSize:16,fontWeight:800,color:'#39FF14'}}>{food.cal}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="anim-up" style={{marginBottom:32}}>
        <h1 className="font-display" style={{fontSize:48,margin:0}}>NUTRITION <span className="gradient-text">TRACKER</span></h1>
        <p style={{color:'var(--vf-muted)',marginTop:6}}>{new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</p>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 290px',gap:24,alignItems:'start'}}>
        <div>
          {MEALS.map(m => (
            <div key={m.id} className="glass-card" style={{padding:20,marginBottom:14}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <span style={{fontSize:22}}>{m.icon}</span>
                  <div><div style={{fontSize:15,fontWeight:700}}>{m.label}</div><div style={{fontSize:12,color:'var(--vf-muted)'}}>{log[m.id].reduce((a,f)=>a+f.cal,0)} kcal</div></div>
                </div>
                <button className="btn-ghost" style={{padding:'6px 12px',fontSize:12}} onClick={() => setModal(m.id)}><Plus size={13}/>Add</button>
              </div>
              {log[m.id].length === 0 ? (
                <div style={{padding:'16px',textAlign:'center',border:'1px dashed var(--vf-border)',borderRadius:10,color:'var(--vf-muted)',fontSize:13}}>Nothing logged yet</div>
              ) : log[m.id].map((food,i) => (
                <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 12px',borderRadius:8,marginBottom:4,transition:'background .15s'}}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.03)'} onMouseLeave={e=>e.currentTarget.style.background='none'}>
                  <div><div style={{fontSize:14}}>{food.name}</div><div style={{fontSize:11,color:'var(--vf-muted)'}}>{food.logged}</div></div>
                  <div style={{display:'flex',gap:16,alignItems:'center'}}>
                    <div style={{textAlign:'center'}}><div style={{fontSize:12,color:'#39FF14',fontWeight:700}}>{food.p}g</div><div style={{fontSize:10,color:'var(--vf-muted)'}}>P</div></div>
                    <div style={{textAlign:'center'}}><div style={{fontSize:12,color:'#00E5FF',fontWeight:700}}>{food.c}g</div><div style={{fontSize:10,color:'var(--vf-muted)'}}>C</div></div>
                    <div style={{textAlign:'center'}}><div style={{fontSize:12,color:'#FF6B35',fontWeight:700}}>{food.f}g</div><div style={{fontSize:10,color:'var(--vf-muted)'}}>F</div></div>
                    <div style={{textAlign:'center',minWidth:44}}><div style={{fontSize:15,fontWeight:800}}>{food.cal}</div><div style={{fontSize:10,color:'var(--vf-muted)'}}>kcal</div></div>
                    <button style={{background:'none',border:'none',cursor:'pointer',color:'var(--vf-muted)',padding:4,transition:'color .15s'}} onMouseEnter={e=>e.target.style.color='#FF6B35'} onMouseLeave={e=>e.target.style.color='var(--vf-muted)'} onClick={()=>removeFood(m.id,i)}><X size={14}/></button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:14,position:'sticky',top:0}}>
          <div className="glass-card" style={{padding:24,textAlign:'center'}}>
            <div style={{fontSize:12,color:'var(--vf-muted)',marginBottom:12,letterSpacing:'.5px'}}>TODAY'S CALORIES</div>
            <div style={{fontSize:48,fontWeight:900,lineHeight:1,color:remaining<0?'#FF6B35':'var(--vf-text)'}}>{totals.cal}</div>
            <div style={{fontSize:13,color:'var(--vf-muted)',marginBottom:8}}>of {GOAL.calories} goal</div>
            <div style={{fontSize:15,fontWeight:700,color:remaining>0?'#39FF14':'#FF6B35',marginBottom:16}}>{remaining>0?`${remaining} remaining`:`${Math.abs(remaining)} over goal`}</div>
            <div className="progress-track" style={{height:8}}><div className="progress-fill" style={{width:`${Math.min((totals.cal/GOAL.calories)*100,100)}%`,background:remaining<0?'#FF6B35':'#39FF14'}}/></div>
          </div>

          <div className="glass-card" style={{padding:20}}>
            <div style={{fontSize:13,fontWeight:700,marginBottom:14}}>Macros</div>
            {[{l:'Protein',v:totals.p,g:GOAL.protein,c:'#39FF14'},{l:'Carbs',v:totals.c,g:GOAL.carbs,c:'#00E5FF'},{l:'Fat',v:totals.f,g:GOAL.fat,c:'#FF6B35'}].map(m => (
              <div key={m.l} style={{marginBottom:12}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:5,fontSize:13}}><span style={{color:'var(--vf-muted)'}}>{m.l}</span><span style={{fontWeight:700,color:m.c}}>{m.v}g <span style={{color:'var(--vf-muted)',fontWeight:400}}>/ {m.g}g</span></span></div>
                <div className="progress-track" style={{height:5}}><div className="progress-fill" style={{width:`${Math.min((m.v/m.g)*100,100)}%`,background:m.c}}/></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
