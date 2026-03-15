import { useState } from 'react'
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
  const [user, setUser] = useState(() => storage.get(KEYS.USER))
  const [page, setPage] = useState('dashboard')

  function handleOnboardingComplete(userData) {
    storage.set(KEYS.USER, userData)
    setUser(userData)
  }

  if (!user) return <Onboarding onComplete={handleOnboardingComplete} />

  const Page = PAGES[page] || Dashboard
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#080810' }}>
      <Sidebar currentPage={page} setCurrentPage={setPage} user={user} />
      <main style={{ flex: 1, marginLeft: 260, padding: '36px 40px', overflowY: 'auto', minHeight: '100vh' }}>
        <Page setCurrentPage={setPage} user={user} />
      </main>
    </div>
  )
}
