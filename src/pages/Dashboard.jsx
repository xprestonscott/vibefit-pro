import { useState, useEffect } from 'react'
import { Dumbbell, Plus, Zap, TrendingUp, Target } from 'lucide-react'
import { storage, KEYS } from '../utils/storage'

export default function Dashboard({ setCurrentPage, user }) {
  const plan   = storage.get(KEYS.WORKOUTS)
  const goals  = storage.get(KEYS.GOALS) || []
  const streak = storage.get(KEYS.STREAK) || 0
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const todayName = dayNames[new Date().getDay()]
  const todayWorkout = plan ? (() => {
    const days = Object.values(plan.workouts)
    const idx  = new Date().getDay()
    return days[idx % days.length]
  })() : null

  if (!plan) return (
    <div>
      <div className="anim-up" style={{ marginBottom: 28 }}>
        <div style={{ color:'var(--vf-muted)', fontSize:13, marginBottom:6 }}>{todayName} · Welcome</div>
        <h1 className="font-display page-title" style={{ fontSize:48, lineHeight:1, margin:0 }}>
          HEY, <span className="gradient-text">{(user?.name||'ATHLETE').toUpperCase()} 👋</span>
        </h1>
        <p style={{ color:'var(--vf-muted)', marginTop:8, fontSize:15 }}>Let's build your AI-powered program.</p>
      </div>

      <div className="grid-3" style={{ marginBottom:28 }}>
        {[
          { icon:'🏋️', title:'Build Your Program', desc:'Choose a split and let AI generate personalized workouts', btn:'Build Now', page:'workout', color:'#39FF14' },
          { icon:'🥗', title:'Track Nutrition', desc:'Log meals, track macros, hit your calorie goals', btn:'Start Logging', page:'calories', color:'#00E5FF' },
          { icon:'🎯', title:'Set Goals', desc:'Define SMART goals and track your progress', btn:'Add Goal', page:'goals', color:'#FF6B35' },
        ].map(c => (
          <div key={c.title} style={{ background:'var(--vf-card)', border:`1px solid ${c.color}20`, borderRadius:16, padding:isMobile?18:28, display:'flex', flexDirection:'column', gap:14, transition:'all .25s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor=`${c.color}40`}
            onMouseLeave={e => e.currentTarget.style.borderColor=`${c.color}20`}>
            <div style={{ fontSize:isMobile?32:40 }}>{c.icon}</div>
            <div>
              <div style={{ fontSize:isMobile?15:17, fontWeight:700, marginBottom:5 }}>{c.title}</div>
              <div style={{ fontSize:13, color:'var(--vf-muted)', lineHeight:1.6 }}>{c.desc}</div>
            </div>
            <button className="btn-primary" style={{ marginTop:'auto', justifyContent:'center', background:`linear-gradient(135deg,${c.color},${c.color}CC)` }} onClick={() => setCurrentPage(c.page)}>
              {c.btn}
            </button>
          </div>
        ))}
      </div>

      <div style={{ background:'linear-gradient(135deg,rgba(57,255,20,.08),rgba(0,229,255,.05))', border:'1px solid rgba(57,255,20,.2)', borderRadius:16, padding:isMobile?'20px 18px':'28px 32px', display:'flex', flexDirection:isMobile?'column':'row', alignItems:isMobile?'flex-start':'center', gap:16 }}>
        <div style={{ fontSize:40 }}>⚡</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:isMobile?15:18, fontWeight:800, marginBottom:6 }}>Your AI fitness coach is ready</div>
          <div style={{ color:'var(--vf-muted)', fontSize:13, lineHeight:1.6 }}>VibeFit Pro uses AI to generate custom workout programs, adjust exercises in real-time, and analyze your physique.</div>
        </div>
        <button className="btn-primary" style={{ flexShrink:0, padding:'12px 24px', fontSize:14, width:isMobile?'100%':'auto', justifyContent:'center' }} onClick={() => setCurrentPage('workout')}>
          <Zap size={15}/> Build My Program
        </button>
      </div>
    </div>
  )

  return (
    <div>
      <div className="anim-up page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <div style={{ color:'var(--vf-muted)', fontSize:13, marginBottom:6 }}>{todayName} · {new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</div>
          <h1 className="font-display page-title" style={{ fontSize:isMobile?32:48, lineHeight:1, margin:0 }}>
            WELCOME BACK, <span className="gradient-text">{(user?.name||'ATHLETE').toUpperCase()}</span>
          </h1>
          {streak > 0 && <p style={{ marginTop:6, fontSize:14, color:'var(--vf-muted)' }}>🔥 <span style={{ color:'#FF6B35', fontWeight:700 }}>{streak}-day streak</span> — keep it going!</p>}
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <button className="btn-ghost" style={{ fontSize:13 }} onClick={() => setCurrentPage('calories')}><Plus size={14}/>Log Meal</button>
          <button className="btn-primary" style={{ fontSize:13 }} onClick={() => setCurrentPage('workout')}><Dumbbell size={14}/>Workout</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom:20 }}>
        {[
          { label:'Day Streak',    val:streak||0,          icon:'🔥', color:'#FF6B35' },
          { label:'Active Goals',  val:goals.length,        icon:'🎯', color:'#39FF14' },
          { label:'Program',       val:plan.daysPerWeek+'d/wk', icon:'🏋️', color:'#00E5FF' },
          { label:'Split',         val:plan.split?.split('/')[0]?.trim()||'Custom', icon:'📋', color:'#8B5CF6' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ textAlign:'center' }}>
            <div style={{ fontSize:isMobile?22:28, marginBottom:6 }}>{s.icon}</div>
            <div style={{ fontSize:isMobile?18:22, fontWeight:800, color:s.color }}>{s.val}</div>
            <div style={{ fontSize:11, color:'var(--vf-muted)', marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid-main">
        {/* Today's workout */}
        <div className="glass-card" style={{ padding:isMobile?16:24 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:8 }}>
            <div>
              <h3 style={{ margin:0, fontSize:16, fontWeight:700 }}>Today's Workout</h3>
              <div style={{ color:'var(--vf-muted)', fontSize:12, marginTop:2 }}>{todayName}</div>
            </div>
            <button className="btn-ghost" style={{ fontSize:12, padding:'6px 12px' }} onClick={() => setCurrentPage('workout')}>
              Full Plan <TrendingUp size={12}/>
            </button>
          </div>
          {todayWorkout ? (
            <div>
              <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
                <span className="badge badge-green">{todayWorkout.name}</span>
                <span className="badge badge-cyan">{todayWorkout.duration} min</span>
                <span className="badge badge-amber">{todayWorkout.exercises?.length} exercises</span>
              </div>
              {todayWorkout.exercises?.slice(0,isMobile?3:4).map((ex,i) => (
                <div key={i} className="exercise-row">
                  <div style={{ width:26, height:26, borderRadius:7, background:'var(--vf-card2)', border:'1px solid var(--vf-border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, flexShrink:0 }}>{i+1}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{ex.name}</div>
                    <div style={{ fontSize:11, color:'var(--vf-muted)' }}>{ex.muscle} · {ex.sets}×{ex.reps}</div>
                  </div>
                </div>
              ))}
              {todayWorkout.exercises?.length > (isMobile?3:4) && (
                <div style={{ textAlign:'center', padding:'10px', color:'var(--vf-muted)', fontSize:12 }}>
                  +{todayWorkout.exercises.length-(isMobile?3:4)} more exercises
                </div>
              )}
              <button className="btn-primary" style={{ marginTop:14, width:'100%', justifyContent:'center' }} onClick={() => setCurrentPage('workout')}>
                <Zap size={14}/> Open Full Workout
              </button>
            </div>
          ) : (
            <div style={{ textAlign:'center', padding:'28px 0' }}>
              <div style={{ fontSize:36, marginBottom:10 }}>🧘</div>
              <div style={{ fontWeight:600, marginBottom:4 }}>Rest Day</div>
              <div style={{ color:'var(--vf-muted)', fontSize:13 }}>Recovery is where growth happens.</div>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {/* Goals */}
          <div className="glass-card" style={{ padding:isMobile?16:22 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <h3 style={{ margin:0, fontSize:15, fontWeight:700 }}>Active Goals</h3>
              <button className="btn-ghost" style={{ padding:'5px 10px', fontSize:12 }} onClick={() => setCurrentPage('goals')}>Manage</button>
            </div>
            {goals.length === 0 ? (
              <div style={{ textAlign:'center', padding:'16px 0' }}>
                <div style={{ fontSize:28, marginBottom:8 }}>🎯</div>
                <div style={{ fontSize:12, color:'var(--vf-muted)', marginBottom:12 }}>No goals set yet</div>
                <button className="btn-ghost" style={{ fontSize:12, justifyContent:'center', width:'100%' }} onClick={() => setCurrentPage('goals')}><Plus size={12}/>Add Goal</button>
              </div>
            ) : goals.slice(0,3).map((g,i) => (
              <div key={i} style={{ marginBottom:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4, fontSize:13 }}>
                  <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'70%' }}>{g.title}</span>
                  <span style={{ color:'#39FF14', fontWeight:700, flexShrink:0 }}>{Math.round((g.current/g.target)*100)}%</span>
                </div>
                <div className="progress-track" style={{ height:5 }}><div className="progress-fill" style={{ width:`${Math.min((g.current/g.target)*100,100)}%`, background:'#39FF14' }}/></div>
              </div>
            ))}
          </div>

          {/* AI Physique */}
          <div style={{ background:'linear-gradient(135deg,rgba(139,92,246,.1),rgba(57,255,20,.06))', border:'1px solid rgba(139,92,246,.25)', borderRadius:14, padding:isMobile?16:20 }}>
            <div style={{ display:'flex', gap:10, marginBottom:10 }}>
              <Zap size={15} style={{ color:'#8B5CF6', flexShrink:0 }}/>
              <span style={{ fontSize:12, fontWeight:700, color:'#8B5CF6' }}>AI PHYSIQUE ANALYSIS</span>
            </div>
            <div style={{ fontSize:12, color:'var(--vf-muted)', lineHeight:1.6, marginBottom:12 }}>
              Get an AI-powered breakdown of your physique, muscle balance, and improvement plan.
            </div>
            <button className="btn-ghost" style={{ width:'100%', justifyContent:'center', fontSize:12, borderColor:'rgba(139,92,246,.4)', color:'#8B5CF6' }} onClick={() => setCurrentPage('physique')}>
              Run Analysis →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
