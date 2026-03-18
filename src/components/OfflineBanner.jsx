import { useState, useEffect } from 'react'
import { WifiOff, Wifi } from 'lucide-react'

export default function OfflineBanner() {
  const [offline, setOffline]       = useState(!navigator.onLine)
  const [showBack, setShowBack]     = useState(false)

  useEffect(() => {
    function handleOffline() { setOffline(true); setShowBack(false) }
    function handleOnline()  { setOffline(false); setShowBack(true); setTimeout(() => setShowBack(false), 3000) }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online',  handleOnline)
    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online',  handleOnline)
    }
  }, [])

  if (!offline && !showBack) return null

  return (
    <div style={{
      position:'fixed', top:0, left:0, right:0, zIndex:99999,
      background: offline ? '#FF6B35' : '#39FF14',
      color: offline ? '#fff' : '#080810',
      padding:'8px 16px',
      display:'flex', alignItems:'center', justifyContent:'center',
      gap:8, fontSize:13, fontWeight:700,
      transition:'all .3s',
    }}>
      {offline ? (
        <><WifiOff size={14}/> You're offline — some features may not work</>
      ) : (
        <><Wifi size={14}/> Back online!</>
      )}
    </div>
  )
}
