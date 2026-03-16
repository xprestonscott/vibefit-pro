import React from 'react'
import { useState } from 'react'
import { Key, Trash2, LogOut, User, Shield, Bell, Check, Flame } from 'lucide-react'
import { getGoalFromStorage, saveGoalToStorage, calculateCalories, calculateMacros } from '../utils/calories'
import { storage } from '../utils/storage'
import { logOut } from '../utils/auth'
import { deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth'
import { auth, db } from '../utils/firebase'
import { doc, deleteDoc } from 'firebase/firestore'

function CalorieGoalEditor({ user }) {
  const [goal, setGoal]   = React.useState(() => getGoalFromStorage())
  const [custom, setCustom] = React.useState(goal.calories)
  const [saved, setSaved] = React.useState(false)
  const [mode, setMode]   = React.useState('custom') // custom | recalculate

  function handleSave() {
    const macros = calculateMacros(Number(custom), user?.goal, user?.weight)
    saveGoalToStorage(Number(custom), macros)
    setGoal({ calories: Number(custom), macros })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleRecalculate() {
    if (!user?.weight || !user?.height) return
    const cal    = calculateCalories({ weight:user.weight, height:user.height, age:user.age, gender:user.gender, activityLevel:user.activity, goal:user.goal })
    const macros = calculateMacros(cal, user.goal, user.weight)
    saveGoalToStorage(cal, macros)
    setGoal({ calories: cal, macros })
    setCustom(cal)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:20}}>
        {[{l:'Calories',v:goal.calories,c:'#39FF14'},{l:'Protein',v:goal.macros?.protein+'g',c:'#39FF14'},{l:'Carbs',v:goal.macros?.carbs+'g',c:'#00E5FF'},{l:'Fat',v:goal.macros?.fat+'g',c:'#FF6B35'}].map(m=>(
          <div key={m.l} style={{background:'var(--vf-card2)',borderRadius:10,padding:'12px',textAlign:'center'}}>
            <div style={{fontSize:18,fontWeight:800,color:m.c}}>{m.v}</div>
            <div style={{fontSize:11,color:'var(--vf-muted)'}}>{m.l}/day</div>
          </div>
        ))}
      </div>

      <div style={{marginBottom:14}}>
        <label style={{fontSize:11,color:'var(--vf-muted)',fontWeight:600,letterSpacing:'.5px',display:'block',marginBottom:6}}>SET CUSTOM DAILY CALORIES</label>
        <div style={{display:'flex',gap:10}}>
          <input className="vf-input" type="number" value={custom} onChange={e=>setCustom(e.target.value)} style={{flex:1,fontSize:16,fontWeight:700}} placeholder="e.g. 2200"/>
          <button className={saved?'btn-primary':'btn-ghost'} style={{flexShrink:0,padding:'10px 18px'}} onClick={handleSave}>
            {saved?<><Check size={14}/>Saved!</>:<>Save</>}
          </button>
        </div>
        <div style={{fontSize:11,color:'var(--vf-muted)',marginTop:6}}>Macros will be recalculated automatically based on your goal</div>
      </div>

      <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
        {[1500,1800,2000,2200,2400,2600,2800,3000,3200,3500].map(cal=>(
          <button key={cal} onClick={()=>{setCustom(cal)}} style={{padding:'6px 12px',borderRadius:8,border:`1px solid ${Number(custom)===cal?'rgba(57,255,20,.4)':'var(--vf-border)'}`,background:Number(custom)===cal?'rgba(57,255,20,.08)':'var(--vf-card2)',color:Number(custom)===cal?'#39FF14':'var(--vf-muted)',cursor:'pointer',fontSize:12,fontWeight:600,transition:'all .15s'}}>
            {cal}
          </button>
        ))}
      </div>

      {user?.weight && user?.height && (
        <button className="btn-ghost" style={{marginTop:14,width:'100%',justifyContent:'center',fontSize:13}} onClick={handleRecalculate}>
          🔄 Recalculate from my body stats
        </button>
      )}
    </div>
  )
}

export default function Settings({ user, setCurrentPage }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showSignOutModal, setShowSignOutModal] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteError, setDeleteError] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSignOut() {
    await logOut()
    storage.clearAll()
    window.location.reload()
  }

  async function handleDeleteAccount() {
    if (!deletePassword) { setDeleteError('Please enter your password to confirm.'); return }
    setDeleting(true)
    setDeleteError(null)
    try {
      const fbUser = auth.currentUser
      // Re-authenticate first
      const credential = EmailAuthProvider.credential(fbUser.email, deletePassword)
      await reauthenticateWithCredential(fbUser, credential)
      // Delete Firestore data
      await deleteDoc(doc(db, 'users', fbUser.uid))
      // Delete Firebase Auth account
      await deleteUser(fbUser)
      // Clear local data
      storage.clearAll()
      window.location.reload()
    } catch(err) {
      const map = {
        'auth/wrong-password':     'Incorrect password. Please try again.',
        'auth/invalid-credential': 'Incorrect password. Please try again.',
        'auth/too-many-requests':  'Too many attempts. Please wait.',
      }
      setDeleteError(map[err.code] || 'Failed to delete account. Try again.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      {/* Sign out modal */}
      {showSignOutModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(8,8,16,.85)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20 }}
          onClick={() => setShowSignOutModal(false)}>
          <div style={{ background:'var(--vf-card)', border:'1px solid var(--vf-border)', borderRadius:20, width:'100%', maxWidth:400, padding:32, textAlign:'center' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ fontSize:48, marginBottom:16 }}>👋</div>
            <h3 style={{ margin:'0 0 10px', fontSize:20 }}>Sign Out?</h3>
            <p style={{ color:'var(--vf-muted)', fontSize:14, marginBottom:28 }}>
              You'll need to sign back in to access your workouts, goals, and progress.
            </p>
            <div style={{ display:'flex', gap:10 }}>
              <button className="btn-ghost" style={{ flex:1, justifyContent:'center' }} onClick={() => setShowSignOutModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" style={{ flex:1, justifyContent:'center' }} onClick={handleSignOut}>
                <LogOut size={14}/> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete account modal */}
      {showDeleteModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(8,8,16,.85)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20 }}
          onClick={() => { setShowDeleteModal(false); setDeletePassword(''); setDeleteError(null) }}>
          <div style={{ background:'var(--vf-card)', border:'1px solid rgba(255,107,53,.3)', borderRadius:20, width:'100%', maxWidth:420, padding:32 }}
            onClick={e => e.stopPropagation()}>
            <div style={{ fontSize:48, marginBottom:16, textAlign:'center' }}>⚠️</div>
            <h3 style={{ margin:'0 0 10px', fontSize:20, textAlign:'center' }}>Delete Account</h3>
            <p style={{ color:'var(--vf-muted)', fontSize:14, marginBottom:20, textAlign:'center', lineHeight:1.6 }}>
              This will permanently delete your account, workouts, goals, and all data. <strong style={{ color:'#FF6B35' }}>This cannot be undone.</strong>
            </p>

            <div style={{ background:'rgba(255,107,53,.06)', border:'1px solid rgba(255,107,53,.2)', borderRadius:10, padding:'12px 14px', marginBottom:20 }}>
              <div style={{ fontSize:12, color:'#FF6B35', fontWeight:600, marginBottom:4 }}>What will be deleted:</div>
              {['Your account & login','All workout programs','Goals & progress','Food logs','Friend connections','Profile data'].map(item => (
                <div key={item} style={{ fontSize:12, color:'var(--vf-muted)', padding:'2px 0' }}>✗ {item}</div>
              ))}
            </div>

            <div style={{ marginBottom:20 }}>
              <label style={{ fontSize:11, color:'var(--vf-muted)', fontWeight:600, letterSpacing:'.5px', display:'block', marginBottom:6 }}>
                ENTER YOUR PASSWORD TO CONFIRM
              </label>
              <input className="vf-input" type="password" placeholder="Your password" value={deletePassword}
                onChange={e => setDeletePassword(e.target.value)}/>
            </div>

            {deleteError && (
              <div style={{ padding:'10px 14px', background:'rgba(255,107,53,.1)', border:'1px solid rgba(255,107,53,.3)', borderRadius:8, fontSize:13, color:'#FF6B35', marginBottom:16 }}>
                {deleteError}
              </div>
            )}

            <div style={{ display:'flex', gap:10 }}>
              <button className="btn-ghost" style={{ flex:1, justifyContent:'center' }}
                onClick={() => { setShowDeleteModal(false); setDeletePassword(''); setDeleteError(null) }}>
                Cancel
              </button>
              <button className="btn-danger" style={{ flex:1, justifyContent:'center', background:'rgba(255,107,53,.15)', fontWeight:700 }}
                disabled={deleting} onClick={handleDeleteAccount}>
                {deleting ? (
                  <div style={{ width:16, height:16, border:'2px solid rgba(255,107,53,.3)', borderTopColor:'#FF6B35', borderRadius:'50%', animation:'spin 1s linear infinite' }}/>
                ) : (
                  <><Trash2 size={14}/> Delete Forever</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="anim-up" style={{ marginBottom:32 }}>
        <h1 className="font-display" style={{ fontSize:48, margin:0 }}>
          SETTINGS <span className="gradient-text">& PROFILE</span>
        </h1>
      </div>

      <div style={{ maxWidth:600, display:'flex', flexDirection:'column', gap:16 }}>

        {/* Profile info */}
        <div className="glass-card" style={{ padding:28 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
            <User size={18} style={{ color:'#39FF14' }}/>
            <h3 style={{ margin:0, fontSize:17 }}>Your Profile</h3>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {[
              { label:'NAME',       val: user?.name       || '—' },
              { label:'EMAIL',      val: user?.email      || '—' },
              { label:'GOAL',       val: user?.goal       || '—' },
              { label:'EXPERIENCE', val: user?.experience || '—' },
            ].map(f => (
              <div key={f.label}>
                <label style={{ fontSize:10, color:'var(--vf-muted)', fontWeight:600, letterSpacing:'.5px', display:'block', marginBottom:5 }}>{f.label}</label>
                <div style={{ padding:'10px 14px', background:'var(--vf-card2)', borderRadius:8, fontSize:14, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Calorie Goal */}
        <div className="glass-card" style={{padding:28}}>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
            <Flame size={18} style={{color:'#FF6B35'}}/>
            <h3 style={{margin:0,fontSize:17}}>Daily Calorie Goal</h3>
          </div>
          <CalorieGoalEditor user={user}/>
        </div>

        {/* API Key info */}
        <div className="glass-card" style={{ padding:28 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
            <Key size={18} style={{ color:'#39FF14' }}/>
            <h3 style={{ margin:0, fontSize:17 }}>Anthropic API Key</h3>
          </div>
          <p style={{ color:'var(--vf-muted)', fontSize:13, margin:'0 0 14px', lineHeight:1.6 }}>
            Your API key powers the AI features. It's stored in your <code style={{ background:'var(--vf-card2)', padding:'2px 6px', borderRadius:4, color:'#39FF14' }}>.env</code> file locally and in Netlify environment variables for the live site.
          </p>
          <div style={{ background:'var(--vf-card2)', borderRadius:10, padding:'14px 16px', fontSize:13, color:'var(--vf-muted)', border:'1px solid var(--vf-border)' }}>
            <div style={{ fontWeight:600, color:'var(--vf-text)', marginBottom:8 }}>To update your API key:</div>
            <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
              <div>1. Get a key at <span style={{ color:'#00E5FF' }}>console.anthropic.com</span></div>
              <div>2. Update <code style={{ color:'#39FF14' }}>.env</code> in your project folder</div>
              <div>3. Update Netlify environment variables</div>
              <div>4. Restart the dev server</div>
            </div>
          </div>
        </div>

        {/* Notifications placeholder */}
        <div className="glass-card" style={{ padding:28 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
            <Bell size={18} style={{ color:'#00E5FF' }}/>
            <h3 style={{ margin:0, fontSize:17 }}>Notifications</h3>
          </div>
          {[
            { label:'Workout reminders', sub:'Daily reminder to complete your workout', on:true },
            { label:'Goal milestones',   sub:'Alert when you hit a progress milestone',  on:true },
            { label:'Friend requests',   sub:'Notify when someone adds you',             on:true },
            { label:'Community posts',   sub:'Updates from your friends feed',           on:false },
          ].map((n, i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom: i < 3 ? '1px solid rgba(37,37,64,.5)' : 'none' }}>
              <div>
                <div style={{ fontSize:14, fontWeight:500 }}>{n.label}</div>
                <div style={{ fontSize:12, color:'var(--vf-muted)', marginTop:2 }}>{n.sub}</div>
              </div>
              <div style={{
                width:44, height:24, borderRadius:12, cursor:'pointer',
                background: n.on ? '#39FF14' : 'var(--vf-border)',
                position:'relative', transition:'background .2s', flexShrink:0,
              }}>
                <div style={{
                  width:18, height:18, borderRadius:'50%', background:'#fff',
                  position:'absolute', top:3, left: n.on ? 23 : 3,
                  transition:'left .2s', boxShadow:'0 1px 3px rgba(0,0,0,.3)',
                }}/>
              </div>
            </div>
          ))}
        </div>

        {/* Privacy */}
        <div className="glass-card" style={{ padding:28 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
            <Shield size={18} style={{ color:'#8B5CF6' }}/>
            <h3 style={{ margin:0, fontSize:17 }}>Privacy & Data</h3>
          </div>
          <div style={{ color:'var(--vf-muted)', fontSize:13, lineHeight:1.7, marginBottom:14 }}>
            Your workout data, physique photos, and personal information are stored securely in Firebase and never sold to third parties. Photos used for AI analysis are processed locally and never uploaded to our servers.
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {['🔒 256-bit encryption','🇺🇸 Data stored in US','📵 Never sold','🗑️ Delete anytime'].map(b => (
              <span key={b} className="badge badge-purple" style={{ fontSize:11 }}>{b}</span>
            ))}
          </div>
        </div>

        {/* Sign out */}
        <div className="glass-card" style={{ padding:28, border:'1px solid rgba(0,229,255,.15)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <div style={{ fontSize:16, fontWeight:700, marginBottom:4, display:'flex', alignItems:'center', gap:10 }}>
                <LogOut size={17} style={{ color:'#00E5FF' }}/> Sign Out
              </div>
              <div style={{ fontSize:13, color:'var(--vf-muted)' }}>
                Signed in as <strong style={{ color:'var(--vf-text)' }}>{user?.email || 'unknown'}</strong>
              </div>
            </div>
            <button className="btn-outline-cyan" style={{ flexShrink:0 }} onClick={() => setShowSignOutModal(true)}>
              <LogOut size={14}/> Sign Out
            </button>
          </div>
        </div>

        {/* Delete account */}
        <div className="glass-card" style={{ padding:28, border:'1px solid rgba(255,107,53,.2)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <div style={{ fontSize:16, fontWeight:700, marginBottom:4, color:'#FF6B35', display:'flex', alignItems:'center', gap:10 }}>
                <Trash2 size={17}/> Delete Account
              </div>
              <div style={{ fontSize:13, color:'var(--vf-muted)' }}>
                Permanently delete your account and all data. Cannot be undone.
              </div>
            </div>
            <button className="btn-danger" style={{ flexShrink:0 }} onClick={() => setShowDeleteModal(true)}>
              <Trash2 size={14}/> Delete
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
