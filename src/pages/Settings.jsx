import { useState } from 'react'
import { Key, Trash2, RefreshCw, Check } from 'lucide-react'
import { storage } from '../utils/storage'

export default function Settings({ user }) {
  const [saved, setSaved] = useState(false)

  function handleReset() {
    if (window.confirm('Reset ALL data? This clears your program, logs, and profile.')) {
      storage.clearAll()
      window.location.reload()
    }
  }

  return (
    <div>
      <div className="anim-up" style={{marginBottom:32}}>
        <h1 className="font-display" style={{fontSize:48,margin:0}}>SETTINGS <span className="gradient-text">& PROFILE</span></h1>
      </div>

      <div style={{maxWidth:600,display:'flex',flexDirection:'column',gap:20}}>
        <div className="glass-card" style={{padding:28}}>
          <h3 style={{margin:'0 0 20px',fontSize:17}}>Your Profile</h3>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <div><label style={{fontSize:11,color:'var(--vf-muted)',fontWeight:600,letterSpacing:'.5px',display:'block',marginBottom:6}}>NAME</label><div style={{padding:'10px 14px',background:'var(--vf-card2)',borderRadius:8,fontSize:14}}>{user?.name||'—'}</div></div>
            <div><label style={{fontSize:11,color:'var(--vf-muted)',fontWeight:600,letterSpacing:'.5px',display:'block',marginBottom:6}}>EMAIL</label><div style={{padding:'10px 14px',background:'var(--vf-card2)',borderRadius:8,fontSize:14}}>{user?.email||'—'}</div></div>
            <div><label style={{fontSize:11,color:'var(--vf-muted)',fontWeight:600,letterSpacing:'.5px',display:'block',marginBottom:6}}>GOAL</label><div style={{padding:'10px 14px',background:'var(--vf-card2)',borderRadius:8,fontSize:14}}>{user?.goal||'—'}</div></div>
            <div><label style={{fontSize:11,color:'var(--vf-muted)',fontWeight:600,letterSpacing:'.5px',display:'block',marginBottom:6}}>EXPERIENCE</label><div style={{padding:'10px 14px',background:'var(--vf-card2)',borderRadius:8,fontSize:14}}>{user?.experience||'—'}</div></div>
          </div>
        </div>

        <div className="glass-card" style={{padding:28}}>
          <h3 style={{margin:'0 0 8px',fontSize:17,display:'flex',gap:10,alignItems:'center'}}><Key size={17} style={{color:'#39FF14'}}/>Anthropic API Key</h3>
          <p style={{color:'var(--vf-muted)',fontSize:13,margin:'0 0 16px',lineHeight:1.6}}>
            Your API key is stored in the <code style={{background:'var(--vf-card2)',padding:'2px 6px',borderRadius:4,color:'#39FF14'}}>.env</code> file in your project root as <code style={{background:'var(--vf-card2)',padding:'2px 6px',borderRadius:4,color:'#39FF14'}}>VITE_ANTHROPIC_KEY</code>.
            Never share this key or commit it to git.
          </p>
          <div style={{background:'var(--vf-card2)',borderRadius:10,padding:'14px 16px',fontSize:13,color:'var(--vf-muted)',border:'1px solid var(--vf-border)'}}>
            <div style={{marginBottom:6,fontWeight:600,color:'var(--vf-text)'}}>How to set your API key:</div>
            <div>1. Get your key at <span style={{color:'#00E5FF'}}>console.anthropic.com</span></div>
            <div>2. Create a file named <code style={{color:'#39FF14'}}>.env</code> in your vibefit-pro folder</div>
            <div>3. Add this line: <code style={{color:'#39FF14'}}>VITE_ANTHROPIC_KEY=sk-ant-your-key-here</code></div>
            <div>4. Restart the dev server with <code style={{color:'#39FF14'}}>npm run dev</code></div>
          </div>
        </div>

        <div className="glass-card" style={{padding:28,border:'1px solid rgba(255,107,53,.2)'}}>
          <h3 style={{margin:'0 0 8px',fontSize:17,color:'#FF6B35',display:'flex',gap:10,alignItems:'center'}}><Trash2 size={17}/>Reset All Data</h3>
          <p style={{color:'var(--vf-muted)',fontSize:13,margin:'0 0 16px'}}>This will delete your profile, workout program, nutrition logs, and goals. You'll start fresh from the onboarding screen.</p>
          <button className="btn-danger" onClick={handleReset}><Trash2 size={14}/>Reset Everything & Start Over</button>
        </div>
      </div>
    </div>
  )
}
