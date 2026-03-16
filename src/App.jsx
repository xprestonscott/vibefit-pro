import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import { storage, KEYS } from './utils/storage'
import { onAuthChange, getProfile, saveProfile, logOut } from './utils/auth'
import AuthPage    from './pages/AuthPage'
import Onboarding  from './pages/Onboarding'
import Dashboard   from './pages/Dashboard'
import WorkoutPlanner   from './pages/WorkoutPlanner'
import CalorieTracker   from './pages/CalorieTracker'
import Goals            from './pages/Goals'
import PhysiqueAnalysis from './pages/PhysiqueAnalysis'
import Social           from './pages/Social'
import Subscription     from './pages/Subscription'
import Settings         from './pages/Settings'

const PAGES = {
  dashboard: Dashboard, workout: WorkoutPlanner, calories: CalorieTracker,
  goals: Goals, physique: PhysiqueAnalysis, social: Social,
  subscription: Subscription, settings: Settings,
}

export default function App() {
  const [authState, setAuthState] = useState('loading') // loading | auth | onboarding | app
  const [firebaseUser, setFirebaseUser] = useState(null)
  const [userProfile, setUserProfile]   = useState(null)
  const [page, setPage]   = useState('dashboard')
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  // Listen for auth state — this is the key to staying logged in
  useEffect(() => {
    const unsub = onAuthChange(async (fbUser) => {
      if (!fbUser) {
        setAuthState('auth')
        setFirebaseUser(null)
        setUserProfile(null)
        return
      }
      setFirebaseUser(fbUser)
      // Load profile from Firestore
      const profile = await getProfile(fbUser.uid)
      if (!profile || !profile.onboarded) {
        setAuthState('onboarding')
        setUserProfile(profile || { name: fbUser.displayName || '', email: fbUser.email || '' })
      } else {
        setUserProfile(profile)
        setAuthState('app')
      }
    })
    return () => unsub()
  }, [])

  async function handleOnboardingComplete(data) {
    const profileData = {
      ...data,
      name:      data.name || firebaseUser?.displayName || '',
      email:     data.email || firebaseUser?.email || '',
      onboarded: true,
    }
    await saveProfile(firebaseUser.uid, profileData)
    storage.set(KEYS.USER, profileData)
    setUserProfile(profileData)
    setAuthState('app')
  }

  async function handleLogout() {
    await logOut()
    storage.clearAll()
    setAuthState('auth')
    setFirebaseUser(null)
    setUserProfile(null)
    setPage('dashboard')
  }

  // Loading spinner
  if (authState === 'loading') return (
    <div style={{ minHeight:'100vh', background:'var(--vf-bg)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20 }}>
      <div style={{ width:48, height:48, border:'3px solid var(--vf-border)', borderTopColor:'#39FF14', borderRadius:'50%', animation:'spin 1s linear infinite' }}/>
      <div className="font-display" style={{ fontSize:24, color:'var(--vf-muted)' }}>LOADING...</div>
    </div>
  )

  if (authState === 'auth') return <AuthPage onAuth={fbUser => { setFirebaseUser(fbUser); setAuthState('loading') }}/>

  if (authState === 'onboarding') return (
    <Onboarding
      prefillName=''
      prefillEmail={userProfile?.email || firebaseUser?.email || ''}
      onComplete={handleOnboardingComplete}
    />
  )

  const Page = PAGES[page] || Dashboard
  const marginLeft = isMobile ? 0 : 260
  const paddingTop = isMobile ? 56 : 0

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#080810' }}>
      <Sidebar currentPage={page} setCurrentPage={setPage} user={userProfile} onLogout={handleLogout}/>
      <main style={{ flex:1, marginLeft:isMobile?0:marginLeft, paddingTop, padding:isMobile?'68px 14px 80px':'36px 40px', overflowY:'auto', minHeight:'100vh', width:'100%', overflowX:'hidden' }}>
        <Page setCurrentPage={setPage} user={userProfile}/>
      </main>
    </div>
  )
}
