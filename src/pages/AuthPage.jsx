import { useState } from 'react'
import { Eye, EyeOff, ArrowRight, Zap, Chrome } from 'lucide-react'
import { signUp, signIn, signInWithGoogle } from '../utils/auth'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../utils/firebase'

export default function AuthPage({ onAuth }) {
  const [mode, setMode]         = useState('login') // login | signup
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  function friendlyError(code) {
    const map = {
      'auth/email-already-in-use':    'An account with this email already exists.',
      'auth/invalid-email':           'Please enter a valid email address.',
      'auth/weak-password':           'Password must be at least 6 characters.',
      'auth/user-not-found':          'No account found with this email.',
      'auth/wrong-password':          'Incorrect password. Try again.',
      'auth/invalid-credential':      'Incorrect email or password.',
      'auth/too-many-requests':       'Too many attempts. Please wait a moment.',
      'auth/popup-closed-by-user':    'Google sign-in was cancelled.',
    }
    return map[code] || 'Something went wrong. Please try again.'
  }

  async function handleSubmit() {
    if (!email || !password) { setError('Please fill in all fields.'); return }
    if (mode === 'signup' && !name) { setError('Please enter your name.'); return }
    setLoading(true)
    setError(null)
    try {
      let firebaseUser
      if (mode === 'signup') {
        firebaseUser = await signUp(email, password, name)
      } else {
        firebaseUser = await signIn(email, password)
      }
      onAuth(firebaseUser)
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setLoading(true)
    setError(null)
    try {
      const firebaseUser = await signInWithGoogle()
      onAuth(firebaseUser)
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  async function handleReset() {
    if (!email) { setError('Enter your email first, then click Forgot Password.'); return }
    try {
      await sendPasswordResetEmail(auth, email)
      setError(null)
      alert('Password reset email sent! Check your inbox.')
    } catch(err) {
      setError('Could not send reset email. Check your email address.')
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--vf-bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, position: 'relative', overflow: 'hidden',
    }}>
      {/* Background orbs */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none' }}>
        <div style={{ position:'absolute', top:'10%', left:'10%', width:500, height:500, background:'radial-gradient(circle,rgba(57,255,20,.05) 0%,transparent 70%)', borderRadius:'50%' }}/>
        <div style={{ position:'absolute', bottom:'10%', right:'10%', width:400, height:400, background:'radial-gradient(circle,rgba(0,229,255,.04) 0%,transparent 70%)', borderRadius:'50%' }}/>
      </div>

      <div className="anim-up" style={{ width:'100%', maxWidth:420, position:'relative' }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <div style={{ width:56, height:56, background:'linear-gradient(135deg,#39FF14,#00C851)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, margin:'0 auto 16px', boxShadow:'0 0 30px rgba(57,255,20,.3)' }}>⚡</div>
          <div className="font-display" style={{ fontSize:36, lineHeight:1, marginBottom:6 }}>
            VIBEFIT <span className="gradient-text">PRO</span>
          </div>
          <div style={{ color:'var(--vf-muted)', fontSize:14 }}>
            {mode === 'login' ? 'Welcome back! Sign in to continue.' : 'Create your account and start training.'}
          </div>
        </div>

        {/* Card */}
        <div className="glass-card" style={{ padding:32 }}>

          {/* Mode toggle */}
          <div style={{ display:'flex', background:'var(--vf-bg2)', borderRadius:10, padding:4, marginBottom:24, border:'1px solid var(--vf-border)' }}>
            {['login','signup'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(null) }}
                style={{
                  flex:1, padding:'9px', borderRadius:8, border:'none', cursor:'pointer',
                  background: mode===m ? 'var(--vf-card2)' : 'transparent',
                  color: mode===m ? 'var(--vf-text)' : 'var(--vf-muted)',
                  fontFamily:'Outfit,sans-serif', fontSize:14, fontWeight:mode===m?700:400,
                  transition:'all .2s',
                  boxShadow: mode===m ? '0 2px 8px rgba(0,0,0,.3)' : 'none',
                }}>
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Google button */}
          <button onClick={handleGoogle} disabled={loading}
            style={{
              width:'100%', padding:'11px', borderRadius:10,
              background:'var(--vf-card2)', border:'1px solid var(--vf-border)',
              color:'var(--vf-text)', fontFamily:'Outfit,sans-serif', fontSize:14, fontWeight:600,
              cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10,
              marginBottom:20, transition:'all .2s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor='rgba(57,255,20,.3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor='var(--vf-border)'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
            <div style={{ flex:1, height:1, background:'var(--vf-border)' }}/>
            <span style={{ fontSize:12, color:'var(--vf-muted)' }}>or</span>
            <div style={{ flex:1, height:1, background:'var(--vf-border)' }}/>
          </div>

          {/* Fields */}
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {mode === 'signup' && (
              <div>
                <label style={{ fontSize:11, color:'var(--vf-muted)', fontWeight:600, letterSpacing:'.5px', display:'block', marginBottom:6 }}>YOUR NAME</label>
                <input className="vf-input" placeholder="Preston" value={name} onChange={e => setName(e.target.value)}/>
              </div>
            )}
            <div>
              <label style={{ fontSize:11, color:'var(--vf-muted)', fontWeight:600, letterSpacing:'.5px', display:'block', marginBottom:6 }}>EMAIL</label>
              <input className="vf-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key==='Enter' && handleSubmit()}/>
            </div>
            <div>
              <label style={{ fontSize:11, color:'var(--vf-muted)', fontWeight:600, letterSpacing:'.5px', display:'block', marginBottom:6 }}>PASSWORD</label>
              <div style={{ position:'relative' }}>
                <input className="vf-input" type={showPass?'text':'password'} placeholder={mode==='signup'?'Min 6 characters':'Your password'} value={password} onChange={e => setPassword(e.target.value)}
                  style={{ paddingRight:42 }} onKeyDown={e => e.key==='Enter' && handleSubmit()}/>
                <button onClick={() => setShowPass(s => !s)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--vf-muted)', padding:4 }}>
                  {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>
            {mode === 'login' && (
              <div style={{ textAlign:'right', marginTop:6 }}>
                <span style={{ fontSize:12, color:'#00E5FF', cursor:'pointer' }} onClick={handleReset}>
                  Forgot password?
                </span>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div style={{ marginTop:14, padding:'10px 14px', background:'rgba(255,107,53,.1)', border:'1px solid rgba(255,107,53,.3)', borderRadius:8, fontSize:13, color:'#FF6B35' }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button className="btn-primary" style={{ marginTop:20, width:'100%', justifyContent:'center', padding:13, fontSize:15 }}
            disabled={loading} onClick={handleSubmit}>
            {loading ? (
              <div style={{ width:18, height:18, border:'2px solid rgba(8,8,16,.3)', borderTopColor:'#080810', borderRadius:'50%', animation:'spin 1s linear infinite' }}/>
            ) : mode === 'login' ? (
              <>Sign In <ArrowRight size={17}/></>
            ) : (
              <>Create Account <ArrowRight size={17}/></>
            )}
          </button>

          {mode === 'login' && (
            <div style={{ textAlign:'center', marginTop:16, fontSize:13, color:'var(--vf-muted)' }}>
              Don't have an account?{' '}
              <span style={{ color:'#39FF14', cursor:'pointer', fontWeight:600 }} onClick={() => { setMode('signup'); setError(null) }}>
                Sign up free
              </span>
            </div>
          )}
          {mode === 'signup' && (
            <div style={{ textAlign:'center', marginTop:16, fontSize:13, color:'var(--vf-muted)' }}>
              Already have an account?{' '}
              <span style={{ color:'#39FF14', cursor:'pointer', fontWeight:600 }} onClick={() => { setMode('login'); setError(null) }}>
                Sign in
              </span>
            </div>
          )}
        </div>

        <div style={{ textAlign:'center', marginTop:20, fontSize:12, color:'var(--vf-muted)' }}>
          🔒 Secured by Firebase · Your data is private
        </div>
      </div>
    </div>
  )
}
