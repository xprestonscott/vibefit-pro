import { useState, useEffect } from 'react'
import { Zap, Target, Flame, Droplets, TrendingUp, ArrowRight, CheckCircle, Calendar } from 'lucide-react'
import { storage, KEYS } from '../utils/storage'
import { getGoalFromStorage } from '../utils/calories'
import { getCurrentPlan, PLANS } from '../utils/subscription'

function StatCard({ icon, label, value, sub, color, onClick }) {
  return (
    <div className="stat-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default', transition:'all .2s' }}
      onMouseEnter={e => onClick && (e.currentTarget.style.borderColor = color)}
      onMouseLeave={e => onClick && (e.currentTarget.style.borderColor = 'var(--vf-border)')}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
        <div style={{ width:36, height:36, borderRadius:10, background:`${color}18`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          {icon}
        </div>
        {onClick && <ArrowRight size={14} style={{ color:'var(--vf-muted)' }}/>}
      </div>
      <div style={{ fontSize:28, fontWeight:900, color, lineHeight:1, marginBottom:4 }}>{value}</div>
      <div style={{ fontSize:13, fontWeight:600, marginBottom:2 }}>{label}</div>
      {sub && <div style={{ fontSize:11, color:'var(--vf-muted)' }}>{sub}</div>}
    </div>
  )
}

function ProgressRing({ value, max, size=60, color='#39FF14', label }) {
  const pct  = Math.min((value / max) * 100, 100)
  const r    = (size - 8) / 2
  const circ = 2 * Math.PI * r
  const dash = circ * (pct / 100)
  return (
    <div style={{ textAlign:'center' }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#252540" strokeWidth={6}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{ transition:'stroke-dasharray 1s ease' }}/>
      </svg>
      <div style={{ fontSize:11, color:'var(--vf-muted)', marginTop:4 }}>{label}</div>
    </div>
  )
}

export default function Dashboard({ setCurrentPage, user }) {
  const today    = new Date().toISOString().split('T')[0]
  const foodLog  = storage.get(KEYS.FOOD_LOG) || {}
  const todayLog = foodLog[today] || { breakfast:[], lunch:[], dinner:[], snacks:[] }
  const allFoods = Object.values(todayLog).flat()
  const { calories: calGoal, macros } = getGoalFromStorage()
  const plan     = getCurrentPlan()
  const planInfo = PLANS[plan]

  const totals = {
    cal: allFoods.reduce((a,f) => a+(f.cal||0), 0),
    p:   allFoods.reduce((a,f) => a+(f.p||0),   0),
    c:   allFoods.reduce((a,f) => a+(f.c||0),   0),
    f:   allFoods.reduce((a,f) => a+(f.f||0),   0),
  }

  const workout     = storage.get(KEYS.WORKOUT)
  const goals       = storage.get(KEYS.GOALS) || []
  const doneGoals   = goals.filter(g => g.completed).length
  const isMobile    = window.innerWidth < 768
  const firstName   = user?.name?.split(' ')[0] || 'Athlete'

  // Streak calculation
  const [streak, setStreak] = useState(0)
  useEffect(() => {
    let count = 0
    let date  = new Date()
    for (let i = 0; i < 30; i++) {
      const key   = date.toISOString().split('T')[0]
      const foods = foodLog[key] ? Object.values(foodLog[key]).flat() : []
      if (foods.length > 0) { count++; date.setDate(date.getDate() - 1) }
      else break
    }
    setStreak(count)
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const remaining = calGoal - totals.cal

  return (
    <div>
      {/* Header */}
      <div className="anim-up" style={{ marginBottom:24 }}>
        <div style={{ fontSize:13, color:'var(--vf-muted)', marginBottom:4 }}>
          {new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })}
        </div>
        <h1 className="font-display" style={{ fontSize:isMobile?32:52, margin:0, lineHeight:1.1 }}>
          {greeting}, <span className="gradient-text">{firstName}</span>
        </h1>
        {plan !== 'free' && (
          <span className="badge badge-green" style={{ marginTop:8, display:'inline-flex' }}>
            {planInfo?.icon} {planInfo?.name} Member
          </span>
        )}
      </div>

      {/* Today's calorie summary */}
      <div style={{ background:'linear-gradient(135deg,rgba(57,255,20,.08),rgba(0,229,255,.04))', border:'1px solid rgba(57,255,20,.2)', borderRadius:16, padding:'20px 24px', marginBottom:20, cursor:'pointer' }}
        onClick={() => setCurrentPage('calories')}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, flexWrap:'wrap', gap:10 }}>
          <div>
            <div style={{ fontSize:12, color:'var(--vf-muted)', marginBottom:4, letterSpacing:'.5px' }}>TODAY'S CALORIES</div>
            <div style={{ display:'flex', alignItems:'baseline', gap:8 }}>
              <span style={{ fontSize:isMobile?36:48, fontWeight:900, color: remaining<0?'#FF6B35':'#39FF14', lineHeight:1 }}>{totals.cal}</span>
              <span style={{ fontSize:14, color:'var(--vf-muted)' }}>/ {calGoal} kcal</span>
            </div>
            <div style={{ fontSize:13, color: remaining>0?'#39FF14':'#FF6B35', marginTop:4, fontWeight:600 }}>
              {remaining > 0 ? `${remaining} calories remaining` : `${Math.abs(remaining)} over goal`}
            </div>
          </div>
          <div style={{ display:'flex', gap:16, flexShrink:0 }}>
            <ProgressRing value={totals.p} max={macros?.protein||180} color="#39FF14" label="Protein"/>
            <ProgressRing value={totals.c} max={macros?.carbs||260}   color="#00E5FF" label="Carbs"/>
            <ProgressRing value={totals.f} max={macros?.fat||70}      color="#FF6B35" label="Fat"/>
          </div>
        </div>
        <div style={{ height:6, background:'rgba(37,37,64,.6)', borderRadius:3, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${Math.min((totals.cal/calGoal)*100,100)}%`, background: remaining<0?'#FF6B35':'linear-gradient(90deg,#39FF14,#00C851)', borderRadius:3, transition:'width 1s ease' }}/>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginTop:14 }}>
          {[{l:'Protein',v:totals.p,g:macros?.protein||180,c:'#39FF14'},{l:'Carbs',v:totals.c,g:macros?.carbs||260,c:'#00E5FF'},{l:'Fat',v:totals.f,g:macros?.fat||70,c:'#FF6B35'}].map(m=>(
            <div key={m.l} style={{ textAlign:'center', padding:'8px', background:'rgba(8,8,16,.4)', borderRadius:8 }}>
              <div style={{ fontSize:16, fontWeight:800, color:m.c }}>{m.v}g</div>
              <div style={{ fontSize:10, color:'var(--vf-muted)' }}>{m.l} / {m.g}g</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns: isMobile?'1fr 1fr':'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        <StatCard
          icon={<Flame size={18} style={{ color:'#FF6B35' }}/>}
          label="Day Streak"
          value={streak}
          sub={streak > 0 ? 'days logging food' : 'Start today!'}
          color="#FF6B35"
          onClick={() => setCurrentPage('calories')}
        />
        <StatCard
          icon={<Target size={18} style={{ color:'#8B5CF6' }}/>}
          label="Goals"
          value={`${doneGoals}/${goals.length}`}
          sub={goals.length > 0 ? 'completed' : 'Set a goal'}
          color="#8B5CF6"
          onClick={() => setCurrentPage('goals')}
        />
        <StatCard
          icon={<Zap size={18} style={{ color:'#39FF14' }}/>}
          label="Workout"
          value={workout ? 'Active' : 'None'}
          sub={workout ? workout.split?.name || 'Program ready' : 'Generate one'}
          color="#39FF14"
          onClick={() => setCurrentPage('workout')}
        />
        <StatCard
          icon={<TrendingUp size={18} style={{ color:'#00E5FF' }}/>}
          label="Plan"
          value={planInfo?.name || 'Free'}
          sub={plan === 'free' ? 'Upgrade for more' : 'Active'}
          color="#00E5FF"
          onClick={() => setCurrentPage('subscription')}
        />
      </div>

      {/* Quick actions */}
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:12, color:'var(--vf-muted)', fontWeight:600, letterSpacing:'.5px', marginBottom:12 }}>QUICK ACTIONS</div>
        <div style={{ display:'grid', gridTemplateColumns: isMobile?'1fr 1fr':'repeat(4,1fr)', gap:10 }}>
          {[
            { icon:'🤖', label:'Generate Workout', page:'workout', color:'#39FF14' },
            { icon:'🍎', label:'Log a Meal',       page:'calories', color:'#00E5FF' },
            { icon:'🎯', label:'View Goals',        page:'goals',   color:'#8B5CF6' },
            { icon:'📊', label:'AI Physique Scan',  page:'physique', color:'#FF6B35' },
          ].map(a => (
            <button key={a.page} onClick={() => setCurrentPage(a.page)}
              style={{ background:'#141422', border:`1px solid ${a.color}22`, borderRadius:14, padding:'16px 12px', cursor:'pointer', textAlign:'center', transition:'all .2s', display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor=a.color; e.currentTarget.style.background=`${a.color}08` }}
              onMouseLeave={e => { e.currentTarget.style.borderColor=`${a.color}22`; e.currentTarget.style.background='#141422' }}>
              <div style={{ fontSize:28 }}>{a.icon}</div>
              <div style={{ fontSize:12, fontWeight:600, color:'#F0F0FF' }}>{a.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Active workout */}
      {workout && (
        <div style={{ background:'#141422', border:'1px solid rgba(57,255,20,.2)', borderRadius:16, padding:20, marginBottom:20, cursor:'pointer' }}
          onClick={() => setCurrentPage('workout')}>
          <div style={{ fontSize:12, color:'var(--vf-muted)', fontWeight:600, letterSpacing:'.5px', marginBottom:10 }}>CURRENT PROGRAM</div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <div style={{ fontSize:18, fontWeight:800, marginBottom:4 }}>{workout.split?.name || 'Workout Program'}</div>
              <div style={{ fontSize:13, color:'var(--vf-muted)' }}>
                {workout.days?.length || 0} days · {workout.frequency || ''} · {workout.equipment || ''}
              </div>
            </div>
            <button className="btn-primary" style={{ fontSize:13, flexShrink:0 }} onClick={e => { e.stopPropagation(); setCurrentPage('workout') }}>
              View <ArrowRight size={14}/>
            </button>
          </div>
        </div>
      )}

      {/* Goals preview */}
      {goals.length > 0 && (
        <div style={{ background:'#141422', border:'1px solid #252540', borderRadius:16, padding:20, marginBottom:20 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <div style={{ fontSize:12, color:'var(--vf-muted)', fontWeight:600, letterSpacing:'.5px' }}>ACTIVE GOALS</div>
            <button className="btn-ghost" style={{ fontSize:12, padding:'5px 10px' }} onClick={() => setCurrentPage('goals')}>View All</button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {goals.filter(g => !g.completed).slice(0,3).map(goal => (
              <div key={goal.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', background:'#1C1C2E', borderRadius:10 }}>
                <div style={{ fontSize:20, flexShrink:0 }}>{goal.icon || '🎯'}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{goal.title}</div>
                  <div style={{ height:3, background:'#252540', borderRadius:2, marginTop:6, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${Math.min(((goal.current||0)/goal.target)*100,100)}%`, background:'#39FF14', borderRadius:2 }}/>
                  </div>
                </div>
                <div style={{ fontSize:11, color:'var(--vf-muted)', flexShrink:0 }}>
                  {goal.current||0}/{goal.target} {goal.unit}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state for new users */}
      {!workout && goals.length === 0 && allFoods.length === 0 && (
        <div style={{ background:'#141422', border:'2px dashed #252540', borderRadius:16, padding:32, textAlign:'center' }}>
          <div style={{ fontSize:48, marginBottom:16 }}>🚀</div>
          <h3 style={{ margin:'0 0 10px', fontSize:20 }}>Welcome to VibeFit Pro!</h3>
          <p style={{ color:'var(--vf-muted)', marginBottom:24, lineHeight:1.7 }}>
            Let's get started. Generate your first AI workout program or log your first meal.
          </p>
          <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
            <button className="btn-primary" onClick={() => setCurrentPage('workout')}>
              <Zap size={14}/> Generate Workout
            </button>
            <button className="btn-ghost" onClick={() => setCurrentPage('calories')}>
              🍎 Log a Meal
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
