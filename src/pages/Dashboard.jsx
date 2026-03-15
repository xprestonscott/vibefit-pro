import { useState } from 'react'
import { Dumbbell, Plus, Zap, Target, TrendingUp } from 'lucide-react'
import { storage, KEYS } from '../utils/storage'

export default function Dashboard({ setCurrentPage, user }) {
  const plan = storage.get(KEYS.WORKOUTS)
  const goals = storage.get(KEYS.GOALS) || []
  const streak = storage.get(KEYS.STREAK) || 0

  const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const todayIdx = new Date().getDay()
  const todayName = dayNames[todayIdx]

  const todayWorkout = plan ? (() => {
    const days = Object.values(plan.workouts)
    const dayOfWeek = todayIdx === 0 ? 6 : todayIdx - 1
    return days[dayOfWeek % days.length]
  })() : null

  if (!plan) return (
    <div>
      <div className="anim-up" style={{marginBottom:40}}>
        <div style={{color:'var(--vf-muted)',fontSize:14,marginBottom:8}}>{todayName} · Welcome to VibeFit Pro</div>
        <h1 className="font-display" style={{fontSize:56,lineHeight:1,margin:0}}>
          HEY, <span className="gradient-text">{(user?.name||'ATHLETE').toUpperCase()}</span> 👋
        </h1>
        <p style={{color:'var(--vf-muted)',marginTop:10,fontSize:16}}>Let's build your AI-powered program to get started.</p>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16,marginBottom:40}}>
        {[{icon:'🏋️',title:'Build Your Program',desc:'Choose a split and let AI generate personalized workouts',btn:'Build Now',page:'workout',color:'#39FF14'},
          {icon:'🥗',title:'Track Nutrition',desc:'Log meals, track macros, and hit your calorie goals',btn:'Start Logging',page:'calories',color:'#00E5FF'},
          {icon:'🎯',title:'Set Goals',desc:'Define SMART goals and track your progress over time',btn:'Add Goal',page:'goals',color:'#FF6B35'}].map(c => (
          <div key={c.title} style={{background:'var(--vf-card)',border:`1px solid ${c.color}20`,borderRadius:16,padding:28,display:'flex',flexDirection:'column',gap:16,transition:'all .25s'}}
            onMouseEnter={e => e.currentTarget.style.borderColor=`${c.color}40`}
            onMouseLeave={e => e.currentTarget.style.borderColor=`${c.color}20`}>
            <div style={{fontSize:40}}>{c.icon}</div>
            <div>
              <div style={{fontSize:17,fontWeight:700,marginBottom:6}}>{c.title}</div>
              <div style={{fontSize:13,color:'var(--vf-muted)',lineHeight:1.6}}>{c.desc}</div>
            </div>
            <button className="btn-primary" style={{marginTop:'auto',justifyContent:'center',background:`linear-gradient(135deg, ${c.color}, ${c.color}CC)`}} onClick={() => setCurrentPage(c.page)}>
              {c.btn}
            </button>
          </div>
        ))}
      </div>

      <div style={{background:'linear-gradient(135deg,rgba(57,255,20,.08),rgba(0,229,255,.05))',border:'1px solid rgba(57,255,20,.2)',borderRadius:16,padding:'28px 32px',display:'flex',alignItems:'center',gap:24}}>
        <div style={{fontSize:48}}>⚡</div>
        <div style={{flex:1}}>
          <div style={{fontSize:18,fontWeight:800,marginBottom:6}}>Your AI fitness coach is ready</div>
          <div style={{color:'var(--vf-muted)',fontSize:14,lineHeight:1.6}}>
            VibeFit Pro uses AI to generate custom workout programs, adjust exercises in real-time, and analyze your physique.
            Start by building your program — it takes about 30 seconds.
          </div>
        </div>
        <button className="btn-primary" style={{flexShrink:0,padding:'14px 28px',fontSize:15}} onClick={() => setCurrentPage('workout')}>
          <Zap size={16}/> Build My Program
        </button>
      </div>
    </div>
  )

  return (
    <div>
      <div className="anim-up" style={{marginBottom:32}}>
        <div style={{color:'var(--vf-muted)',fontSize:14,marginBottom:8}}>{todayName} · {new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</div>
        <h1 className="font-display" style={{fontSize:48,lineHeight:1,margin:0}}>
          WELCOME BACK, <span className="gradient-text">{(user?.name||'ATHLETE').toUpperCase()}</span>
        </h1>
        {streak > 0 && <p style={{marginTop:8,fontSize:15,color:'var(--vf-muted)'}}>You're on a <span style={{color:'#FF6B35',fontWeight:700}}>🔥 {streak}-day streak</span> — keep it going!</p>}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:28}}>
        {[{label:'Day Streak',val:streak||0,icon:'🔥',color:'#FF6B35'},{label:'Active Goals',val:goals.length,icon:'🎯',color:'#39FF14'},{label:'Program',val:plan.daysPerWeek+'d/wk',icon:'🏋️',color:'#00E5FF'},{label:'Split',val:plan.split?.split('/')[0]?.trim()||'Custom',icon:'📋',color:'#8B5CF6'}].map(s => (
          <div key={s.label} className="stat-card" style={{textAlign:'center'}}>
            <div style={{fontSize:28,marginBottom:8}}>{s.icon}</div>
            <div style={{fontSize:24,fontWeight:800,color:s.color}}>{s.val}</div>
            <div style={{fontSize:13,color:'var(--vf-muted)'}}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 340px',gap:20}}>
        <div className="glass-card" style={{padding:24}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
            <div>
              <h3 style={{margin:0,fontSize:18,fontWeight:700}}>Today's Workout</h3>
              <div style={{color:'var(--vf-muted)',fontSize:13,marginTop:2}}>{todayName}</div>
            </div>
            <button className="btn-ghost" style={{fontSize:13}} onClick={() => setCurrentPage('workout')}>Full Plan <TrendingUp size={13}/></button>
          </div>
          {todayWorkout ? (
            <div>
              <div style={{display:'flex',gap:10,marginBottom:16}}>
                <span className="badge badge-green">{todayWorkout.name}</span>
                <span className="badge badge-cyan">{todayWorkout.duration} min</span>
                <span className="badge badge-amber">{todayWorkout.exercises?.length} exercises</span>
              </div>
              {todayWorkout.exercises?.slice(0,4).map((ex,i) => (
                <div key={i} className="exercise-row">
                  <div style={{width:28,height:28,borderRadius:8,background:'var(--vf-card2)',border:'1px solid var(--vf-border)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,flexShrink:0}}>{i+1}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:600}}>{ex.name}</div>
                    <div style={{fontSize:12,color:'var(--vf-muted)'}}>{ex.muscle} · {ex.sets}×{ex.reps}</div>
                  </div>
                </div>
              ))}
              {todayWorkout.exercises?.length > 4 && <div style={{textAlign:'center',padding:'12px',color:'var(--vf-muted)',fontSize:13}}>+{todayWorkout.exercises.length-4} more exercises</div>}
              <button className="btn-primary" style={{marginTop:16,width:'100%',justifyContent:'center'}} onClick={() => setCurrentPage('workout')}>
                <Zap size={15}/> Open Full Workout
              </button>
            </div>
          ) : (
            <div style={{textAlign:'center',padding:32}}>
              <div style={{fontSize:40,marginBottom:12}}>🧘</div>
              <div style={{fontWeight:600,marginBottom:6}}>Rest Day</div>
              <div style={{color:'var(--vf-muted)',fontSize:13}}>Recovery is where growth happens. Take it easy today.</div>
            </div>
          )}
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <div className="glass-card" style={{padding:24}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <h3 style={{margin:0,fontSize:15,fontWeight:700}}>Active Goals</h3>
              <button className="btn-ghost" style={{padding:'5px 10px',fontSize:12}} onClick={() => setCurrentPage('goals')}>Manage</button>
            </div>
            {goals.length === 0 ? (
              <div style={{textAlign:'center',padding:'20px 0'}}>
                <div style={{fontSize:32,marginBottom:10}}>🎯</div>
                <div style={{fontSize:13,color:'var(--vf-muted)',marginBottom:14}}>No goals set yet</div>
                <button className="btn-ghost" style={{fontSize:12,justifyContent:'center',width:'100%'}} onClick={() => setCurrentPage('goals')}><Plus size={13}/>Add First Goal</button>
              </div>
            ) : goals.slice(0,3).map((g,i) => (
              <div key={i} style={{marginBottom:14}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:5,fontSize:13}}>
                  <span>{g.title}</span>
                  <span style={{color:'#39FF14',fontWeight:700}}>{Math.round((g.current/g.target)*100)}%</span>
                </div>
                <div className="progress-track" style={{height:5}}><div className="progress-fill" style={{width:`${Math.min((g.current/g.target)*100,100)}%`,background:'#39FF14'}}/></div>
              </div>
            ))}
          </div>

          <div style={{background:'linear-gradient(135deg,rgba(139,92,246,.1),rgba(57,255,20,.06))',border:'1px solid rgba(139,92,246,.25)',borderRadius:14,padding:20}}>
            <div style={{display:'flex',gap:10,marginBottom:12}}>
              <Zap size={16} style={{color:'#8B5CF6',flexShrink:0}}/>
              <span style={{fontSize:13,fontWeight:700,color:'#8B5CF6'}}>AI PHYSIQUE ANALYSIS</span>
            </div>
            <div style={{fontSize:13,color:'var(--vf-muted)',lineHeight:1.6,marginBottom:14}}>
              Get an AI-powered breakdown of your physique — muscle balance, posture, and targeted improvement recommendations.
            </div>
            <button className="btn-ghost" style={{width:'100%',justifyContent:'center',fontSize:13,borderColor:'rgba(139,92,246,.4)',color:'#8B5CF6'}} onClick={() => setCurrentPage('physique')}>
              Run Analysis →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
