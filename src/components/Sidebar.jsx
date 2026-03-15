import { LayoutDashboard,Dumbbell,Apple,Target,Scan,Users,CreditCard,Settings,Zap,ChevronRight,Bell,LogOut } from 'lucide-react'
import { storage, KEYS } from '../utils/storage'

const NAV = [
  {id:'dashboard',label:'Dashboard',icon:LayoutDashboard},
  {id:'workout',label:'Workout Plan',icon:Dumbbell},
  {id:'calories',label:'Nutrition',icon:Apple},
  {id:'goals',label:'Goals',icon:Target},
  {id:'physique',label:'AI Physique',icon:Scan},
  {id:'social',label:'Community',icon:Users},
]

export default function Sidebar({ currentPage, setCurrentPage, user }) {
  const streak = storage.get(KEYS.STREAK) || 0
  const plan = storage.get(KEYS.WORKOUTS)

  return (
    <aside className="sidebar">
      <div style={{padding:'28px 20px 20px'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:36,height:36,background:'linear-gradient(135deg,#39FF14,#00C851)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>⚡</div>
          <div>
            <div className="font-display" style={{fontSize:22,lineHeight:1}}>VIBEFIT <span style={{color:'#39FF14'}}>PRO</span></div>
            <div style={{fontSize:10,color:'var(--vf-muted)',marginTop:2}}>AI FITNESS PLATFORM</div>
          </div>
        </div>
      </div>

      {streak > 0 ? (
        <div style={{margin:'0 12px 16px',background:'rgba(57,255,20,.08)',border:'1px solid rgba(57,255,20,.2)',borderRadius:12,padding:'12px 14px',display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:22}}>🔥</span>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:'#39FF14'}}>{streak}-Day Streak!</div>
            <div style={{fontSize:11,color:'var(--vf-muted)'}}>Keep it going</div>
          </div>
        </div>
      ) : (
        <div style={{margin:'0 12px 16px',background:'var(--vf-card)',border:'1px solid var(--vf-border)',borderRadius:12,padding:'12px 14px',display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:22}}>🎯</span>
          <div>
            <div style={{fontSize:13,fontWeight:600}}>Start your streak today</div>
            <div style={{fontSize:11,color:'var(--vf-muted)'}}>Complete a workout to begin</div>
          </div>
        </div>
      )}

      {plan && (
        <div style={{margin:'0 12px 16px',background:'var(--vf-card)',border:'1px solid var(--vf-border)',borderRadius:10,padding:'10px 14px'}}>
          <div style={{fontSize:10,color:'var(--vf-muted)',letterSpacing:'1px',marginBottom:4}}>ACTIVE PROGRAM</div>
          <div style={{fontSize:13,fontWeight:600,color:'var(--vf-text)'}}>{plan.planName}</div>
          <div style={{fontSize:11,color:'var(--vf-muted)'}}>{plan.daysPerWeek} days/week · {plan.split}</div>
        </div>
      )}

      <nav style={{flex:1}}>
        <div style={{fontSize:10,color:'var(--vf-muted)',letterSpacing:'1px',padding:'4px 22px 8px',fontWeight:600}}>MENU</div>
        {NAV.map(({id,label,icon:Icon}) => (
          <div key={id} className={`sidebar-item ${currentPage===id?'active':''}`} onClick={() => setCurrentPage(id)}>
            <Icon size={17}/><span style={{flex:1}}>{label}</span>
            {currentPage===id && <ChevronRight size={14} style={{opacity:.5}}/>}
          </div>
        ))}
        <div style={{margin:'12px',borderTop:'1px solid var(--vf-border)'}}/>
        <div className={`sidebar-item ${currentPage==='subscription'?'active':''}`}
          onClick={() => setCurrentPage('subscription')}
          style={{background:'rgba(57,255,20,.06)',border:'1px solid rgba(57,255,20,.2)',color:'#39FF14',margin:'2px 10px'}}>
          <Zap size={17} style={{color:'#39FF14'}}/><span style={{flex:1,fontWeight:600}}>Upgrade Pro</span>
          <span className="badge badge-green" style={{fontSize:10}}>PRO</span>
        </div>
        <div className={`sidebar-item ${currentPage==='settings'?'active':''}`} onClick={() => setCurrentPage('settings')}>
          <Settings size={17}/><span style={{flex:1}}>Settings</span>
        </div>
      </nav>

      <div style={{margin:'12px',background:'var(--vf-card)',border:'1px solid var(--vf-border)',borderRadius:12,padding:'14px'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:38,height:38,borderRadius:10,background:'linear-gradient(135deg,var(--vf-bg2),var(--vf-card2))',border:'1px solid var(--vf-border)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>
            {user?.name?.[0]?.toUpperCase() || '🏋️'}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:14,fontWeight:600}}>{user?.name || 'Athlete'}</div>
            <div style={{fontSize:11,color:'var(--vf-muted)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.goal || 'No goal set'}</div>
          </div>
        </div>
        <button className="btn-danger" style={{marginTop:10,width:'100%',justifyContent:'center',fontSize:12,padding:'7px'}}
          onClick={() => { storage.clearAll(); window.location.reload() }}>
          <LogOut size={13}/> Reset & Start Over
        </button>
      </div>
    </aside>
  )
}
