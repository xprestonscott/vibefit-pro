import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import { storage, KEYS } from './utils/storage'
import Dashboard from './pages/Dashboard'
import WorkoutPlanner from './pages/WorkoutPlanner'
import CalorieTracker from './pages/CalorieTracker'
import Goals from './pages/Goals'
import PhysiqueAnalysis from './pages/PhysiqueAnalysis'
import Social from './pages/Social'
import Subscription from './pages/Subscription'
import Settings from './pages/Settings'
import Onboarding from './pages/Onboarding'

const PAGES = {
  dashboard: Dashboard, workout: WorkoutPlanner, calories: CalorieTracker,
  goals: Goals, physique: PhysiqueAnalysis, social: Social,
  subscription: Subscription, settings: Settings,
}

export default function App() {
  const [user, setUser]   = useState(() => storage.get(KEYS.USER))
  const [page, setPage]   = useState('dashboard')
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  function handleOnboardingComplete(userData) {
    storage.set(KEYS.USER, userData)
    setUser(userData)
  }

  if (!user) return <Onboarding onComplete={handleOnboardingComplete} />

  const Page = PAGES[page] || Dashboard

  // Calculate margin based on sidebar state
  const marginLeft = isMobile ? 0 : (sidebarCollapsed ? 68 : 260)
  const paddingTop = isMobile ? 56 : 0

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#080810' }}>
      <Sidebar
        currentPage={page}
        setCurrentPage={setPage}
        user={user}
        onCollapse={setSidebarCollapsed}
      />
      <main style={{
        flex: 1,
        marginLeft,
        paddingTop,
        padding: isMobile ? '72px 16px 24px' : `36px 40px`,
        overflowY: 'auto',
        minHeight: '100vh',
        transition: 'margin-left .25s ease',
      }}>
        <Page setCurrentPage={setPage} user={user} />
      </main>
    </div>
  )
}
