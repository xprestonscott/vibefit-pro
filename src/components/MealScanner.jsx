import { useState, useRef } from 'react'
import { Camera, X, Zap, Check, AlertCircle, Upload } from 'lucide-react'
import { analyzeMeal } from '../utils/ai'
import { getCurrentPlan, checkLimit, incrementUsage, getLimit, getDailyUsage } from '../utils/subscription'
import UpgradeModal from './UpgradeModal'

export default function MealScanner({ meal, onFoodAdded }) {
  const [open, setOpen]           = useState(false)
  const [preview, setPreview]     = useState(null)
  const [imageData, setImageData] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult]       = useState(null)
  const [error, setError]         = useState(null)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const fileRef = useRef()

  const plan       = getCurrentPlan()
  const SCAN_KEY   = 'vf_meal_scans_' + new Date().toISOString().slice(0,7)
  const scansUsed  = parseInt(localStorage.getItem(SCAN_KEY) || '0')
  const scanLimit  = plan === 'free' ? 3 : plan === 'basic' ? 4 : 999
  const scansLeft  = Math.max(0, scanLimit - scansUsed)
  const canScan    = true

  function handleOpen() {
    if (scansLeft <= 0) { setShowUpgrade(true); return }
    setOpen(true)
  }

  function reset() {
    setPreview(null); setImageData(null)
    setResult(null);  setError(null)
    setAnalyzing(false)
  }

  function handleClose() { reset(); setOpen(false) }

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    reset()
    const reader = new FileReader()
    reader.onload = ev => {
      setPreview(ev.target.result)
      setImageData({ base64: ev.target.result.split(',')[1], mimeType: file.type })
    }
    reader.readAsDataURL(file)
  }

  async function handleAnalyze() {
    if (!imageData) return
    setAnalyzing(true); setError(null)
    try {
      setResult(await analyzeMeal(imageData.base64, imageData.mimeType))
    } catch(err) {
      setError(err.message || 'Could not analyze. Try again.')
    } finally { setAnalyzing(false) }
  }

  function handleAdd() {
    if (!result) return
    onFoodAdded(meal, {
      id: Date.now(), name: result.foodName,
      cal: Number(result.calories)||0, p: Number(result.protein)||0,
      c: Number(result.carbs)||0, f: Number(result.fat)||0,
      logged: new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),
      aiScanned: true,
    })
    handleClose()
  }

  return (
    <>
      {showUpgrade && <UpgradeModal feature="aiScansPerMonth" onClose={() => setShowUpgrade(false)}/>}

      <button className="btn-ghost" style={{padding:'7px 12px',fontSize:13}} onClick={handleOpen}>
        <Camera size={14}/> Scan
  {plan === 'free' && scansLeft > 0 && <span style={{fontSize:9,background:'rgba(57,255,20,.2)',color:'#39FF14',borderRadius:4,padding:'1px 4px',marginLeft:2}}>{scansLeft} left</span>}
        {plan === 'free' && scansLeft <= 0 && <span style={{fontSize:9,background:'rgba(255,107,53,.2)',color:'#FF6B35',borderRadius:4,padding:'1px 4px',marginLeft:2}}>Upgrade</span>}
        {plan !== 'free' && <span style={{fontSize:9,background:'rgba(57,255,20,.2)',color:'#39FF14',borderRadius:4,padding:'1px 4px',marginLeft:2}}>PRO</span>}
      </button>

      {open && (
        <div style={{
          position:'fixed', inset:0, zIndex:99999,
          background:'rgba(8,8,16,.95)', backdropFilter:'blur(16px)',
          display:'flex', alignItems:'center', justifyContent:'center',
          padding:'20px',
        }} onClick={handleClose}>
          <div style={{
            background:'#141422', border:'1px solid #252540',
            borderRadius:20, width:'100%', maxWidth:420,
            maxHeight:'90vh', overflowY:'auto',
            boxShadow:'0 24px 80px rgba(0,0,0,.6)',
          }} onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{padding:'20px 20px 16px', borderBottom:'1px solid #252540', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div style={{display:'flex', alignItems:'center', gap:10}}>
                <div style={{width:36,height:36,borderRadius:10,background:'rgba(57,255,20,.12)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <Camera size={17} style={{color:'#39FF14'}}/>
                </div>
                <div>
                  <div style={{fontSize:15,fontWeight:700}}>AI Meal Scanner</div>
                  <div style={{fontSize:11,color:'#6B6B8A'}}>Photo → calories & macros instantly</div>
                </div>
              </div>
              <button onClick={handleClose} style={{background:'#1C1C2E',border:'1px solid #252540',borderRadius:8,width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'#6B6B8A'}}>
                <X size={16}/>
              </button>
            </div>

            <div style={{padding:20}}>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{display:'none'}} onChange={handleFile}/>

              {/* Step 1: Upload */}
              {!preview && (
                <>
                  <div style={{border:'2px dashed #252540',borderRadius:14,padding:'28px 20px',textAlign:'center',cursor:'pointer',marginBottom:16,transition:'all .2s'}}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(57,255,20,.4)';e.currentTarget.style.background='rgba(57,255,20,.03)'}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor='#252540';e.currentTarget.style.background='none'}}
                    onClick={() => fileRef.current?.click()}>
                    <div style={{fontSize:36,marginBottom:10}}>📷</div>
                    <div style={{fontSize:15,fontWeight:700,marginBottom:6,color:'#F0F0FF'}}>Take or Upload a Photo</div>
                    <div style={{fontSize:13,color:'#6B6B8A',marginBottom:16}}>Works with any food, drink, or snack</div>
                    <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'linear-gradient(135deg,#39FF14,#00C851)',color:'#080810',fontWeight:700,fontSize:13,padding:'10px 20px',borderRadius:8}}>
                      <Upload size={14}/> Choose Photo
                    </div>
                  </div>
                  <button className="btn-ghost" style={{width:'100%',justifyContent:'center'}} onClick={handleClose}>Cancel</button>
                </>
              )}

              {/* Step 2: Preview + Analyze */}
              {preview && !result && (
                <>
                  <div style={{position:'relative',marginBottom:14}}>
                    <img src={preview} style={{width:'100%',borderRadius:12,maxHeight:200,objectFit:'cover',display:'block'}}/>
                    <button onClick={reset} style={{position:'absolute',top:8,right:8,background:'rgba(8,8,16,.85)',border:'none',borderRadius:20,width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'#fff'}}>
                      <X size={14}/>
                    </button>
                  </div>

                  {analyzing ? (
                    <div style={{textAlign:'center',padding:'20px 0',marginBottom:14}}>
                      <div style={{width:36,height:36,border:'3px solid #252540',borderTopColor:'#39FF14',borderRadius:'50%',animation:'spin 1s linear infinite',margin:'0 auto 12px'}}/>
                      <div style={{fontSize:14,color:'#6B6B8A'}}>Analyzing your meal...</div>
                    </div>
                  ) : error ? (
                    <div style={{background:'rgba(255,107,53,.1)',border:'1px solid rgba(255,107,53,.3)',borderRadius:10,padding:'12px 14px',marginBottom:14,display:'flex',gap:10}}>
                      <AlertCircle size={15} style={{color:'#FF6B35',flexShrink:0,marginTop:1}}/>
                      <div style={{fontSize:13,color:'#FF6B35'}}>{error}</div>
                    </div>
                  ) : null}

                  <div style={{display:'flex',gap:10}}>
                    <button className="btn-ghost" style={{flex:1,justifyContent:'center'}} onClick={handleClose}>Cancel</button>
                    {!analyzing && (
                      <button className="btn-primary" style={{flex:2,justifyContent:'center',fontSize:14}} onClick={handleAnalyze}>
                        <Zap size={14}/> Analyze with AI
                      </button>
                    )}
                  </div>
                </>
              )}

              {/* Step 3: Results */}
              {result && (
                <>
                  <div style={{background:'rgba(57,255,20,.06)',border:'1px solid rgba(57,255,20,.2)',borderRadius:14,padding:18,marginBottom:16}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
                      <div style={{flex:1,paddingRight:10}}>
                        <div style={{fontSize:17,fontWeight:800,color:'#F0F0FF',marginBottom:3}}>{result.foodName}</div>
                        <div style={{fontSize:12,color:'#6B6B8A'}}>{result.servingSize}</div>
                      </div>
                      <div style={{textAlign:'right',flexShrink:0}}>
                        <div style={{fontSize:30,fontWeight:900,color:'#39FF14',lineHeight:1}}>{result.calories}</div>
                        <div style={{fontSize:10,color:'#6B6B8A'}}>calories</div>
                      </div>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
                      {[{l:'Protein',v:result.protein,c:'#39FF14'},{l:'Carbs',v:result.carbs,c:'#00E5FF'},{l:'Fat',v:result.fat,c:'#FF6B35'}].map(m=>(
                        <div key={m.l} style={{background:'#1C1C2E',borderRadius:10,padding:'10px',textAlign:'center'}}>
                          <div style={{fontSize:20,fontWeight:800,color:m.c}}>{m.v}g</div>
                          <div style={{fontSize:10,color:'#6B6B8A'}}>{m.l}</div>
                        </div>
                      ))}
                    </div>
                    {result.notes && <div style={{fontSize:12,color:'#6B6B8A',marginTop:10,fontStyle:'italic'}}>💡 {result.notes}</div>}
                  </div>

                  <div style={{display:'flex',gap:10}}>
                    <button className="btn-ghost" style={{flex:1,justifyContent:'center'}} onClick={reset}>
                      Retake
                    </button>
                    <button className="btn-primary" style={{flex:2,justifyContent:'center',fontSize:14,padding:'12px'}} onClick={handleAdd}>
                      <Check size={15}/> Add to {meal.charAt(0).toUpperCase()+meal.slice(1)}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
