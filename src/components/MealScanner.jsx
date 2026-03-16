import { useState, useRef } from 'react'
import { Camera, X, Zap, Check, AlertCircle, Upload } from 'lucide-react'
import { analyzeMeal } from '../utils/ai'
import { getCurrentPlan } from '../utils/subscription'
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

  const plan     = getCurrentPlan()
  const canScan  = ['basic','pro','elite'].includes(plan)

  function handleOpen() {
    if (!canScan) { setShowUpgrade(true); return }
    setOpen(true)
  }

  function handleClose() {
    setOpen(false)
    setPreview(null)
    setImageData(null)
    setResult(null)
    setError(null)
    setAnalyzing(false)
  }

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setResult(null)
    setError(null)
    const reader = new FileReader()
    reader.onload = ev => {
      const dataUrl = ev.target.result
      setPreview(dataUrl)
      setImageData({ base64: dataUrl.split(',')[1], mimeType: file.type })
    }
    reader.readAsDataURL(file)
  }

  async function handleAnalyze() {
    if (!imageData) return
    setAnalyzing(true)
    setError(null)
    try {
      const data = await analyzeMeal(imageData.base64, imageData.mimeType)
      setResult(data)
    } catch(err) {
      setError(err.message || 'Could not analyze image. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  function handleAdd() {
    if (!result) return
    onFoodAdded(meal, {
      id:        Date.now(),
      name:      result.foodName,
      cal:       Number(result.calories)  || 0,
      p:         Number(result.protein)   || 0,
      c:         Number(result.carbs)     || 0,
      f:         Number(result.fat)       || 0,
      logged:    new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
      aiScanned: true,
    })
    handleClose()
  }

  return (
    <>
      {showUpgrade && (
        <UpgradeModal feature="aiScansPerMonth" onClose={() => setShowUpgrade(false)}/>
      )}

      {/* Scan button */}
      <button
        className="btn-ghost"
        style={{padding:'7px 14px', fontSize:13, display:'flex', alignItems:'center', gap:6}}
        onClick={handleOpen}
      >
        <Camera size={14}/>
        Scan
        {!canScan && (
          <span style={{fontSize:9, background:'#FF6B35', color:'#fff', borderRadius:4, padding:'1px 5px', marginLeft:2}}>
            PRO
          </span>
        )}
      </button>

      {/* Modal */}
      {open && (
        <div style={{
          position:'fixed', inset:0,
          background:'rgba(8,8,16,.92)', backdropFilter:'blur(12px)',
          display:'flex', alignItems:'center', justifyContent:'center',
          zIndex:2000, padding:16,
        }} onClick={handleClose}>
          <div style={{
            background:'var(--vf-card)', border:'1px solid var(--vf-border)',
            borderRadius:20, width:'100%', maxWidth:440,
            overflow:'hidden',
          }} onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{
              display:'flex', justifyContent:'space-between', alignItems:'center',
              padding:'18px 20px', borderBottom:'1px solid var(--vf-border)',
            }}>
              <div style={{display:'flex', alignItems:'center', gap:10}}>
                <div style={{width:34, height:34, borderRadius:10, background:'rgba(57,255,20,.12)', border:'1px solid rgba(57,255,20,.2)', display:'flex', alignItems:'center', justifyContent:'center'}}>
                  <Camera size={16} style={{color:'#39FF14'}}/>
                </div>
                <div>
                  <div style={{fontSize:15, fontWeight:700}}>AI Meal Scanner</div>
                  <div style={{fontSize:11, color:'var(--vf-muted)'}}>Photo → instant calories & macros</div>
                </div>
              </div>
              <button onClick={handleClose} style={{background:'none', border:'none', cursor:'pointer', color:'var(--vf-muted)', padding:6, borderRadius:8, display:'flex'}}>
                <X size={18}/>
              </button>
            </div>

            <div style={{padding:20}}>
              {/* Upload area */}
              {!preview ? (
                <div
                  style={{
                    border:'2px dashed var(--vf-border)', borderRadius:14,
                    padding:'32px 20px', textAlign:'center', cursor:'pointer',
                    transition:'all .2s', marginBottom:16,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(57,255,20,.5)'; e.currentTarget.style.background='rgba(57,255,20,.03)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='var(--vf-border)'; e.currentTarget.style.background='none' }}
                  onClick={() => fileRef.current?.click()}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    style={{display:'none'}}
                    onChange={handleFile}
                  />
                  <div style={{fontSize:40, marginBottom:10}}>📸</div>
                  <div style={{fontSize:15, fontWeight:700, marginBottom:6}}>Take or Upload a Photo</div>
                  <div style={{fontSize:13, color:'var(--vf-muted)', marginBottom:16}}>
                    Works with any food — meals, snacks, drinks
                  </div>
                  <button className="btn-primary" style={{pointerEvents:'none', fontSize:13}}>
                    <Upload size={13}/> Choose Photo
                  </button>
                </div>
              ) : (
                <div style={{marginBottom:16}}>
                  {/* Image preview */}
                  <div style={{position:'relative', marginBottom:12}}>
                    <img
                      src={preview}
                      alt="Food"
                      style={{width:'100%', borderRadius:12, maxHeight:220, objectFit:'cover', display:'block'}}
                    />
                    <button
                      onClick={() => { setPreview(null); setImageData(null); setResult(null); setError(null) }}
                      style={{
                        position:'absolute', top:8, right:8,
                        background:'rgba(8,8,16,.8)', border:'none', borderRadius:20,
                        width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center',
                        cursor:'pointer', color:'#fff',
                      }}
                    >
                      <X size={14}/>
                    </button>
                  </div>

                  {/* Analyze button */}
                  {!result && !analyzing && (
                    <button
                      className="btn-primary"
                      style={{width:'100%', justifyContent:'center', fontSize:14, padding:'12px'}}
                      onClick={handleAnalyze}
                    >
                      <Zap size={15}/> Analyze with AI
                    </button>
                  )}

                  {/* Analyzing state */}
                  {analyzing && (
                    <div style={{textAlign:'center', padding:'16px 0'}}>
                      <div style={{width:32, height:32, border:'3px solid var(--vf-border)', borderTopColor:'#39FF14', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto 10px'}}/>
                      <div style={{fontSize:13, color:'var(--vf-muted)'}}>AI analyzing your meal...</div>
                    </div>
                  )}

                  {/* Error */}
                  {error && (
                    <div style={{background:'rgba(255,107,53,.1)', border:'1px solid rgba(255,107,53,.3)', borderRadius:10, padding:'12px', display:'flex', gap:10, alignItems:'flex-start'}}>
                      <AlertCircle size={15} style={{color:'#FF6B35', flexShrink:0, marginTop:1}}/>
                      <div style={{fontSize:13, color:'#FF6B35'}}>{error}</div>
                    </div>
                  )}

                  {/* Result */}
                  {result && (
                    <div style={{background:'rgba(57,255,20,.06)', border:'1px solid rgba(57,255,20,.2)', borderRadius:14, padding:16}}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14}}>
                        <div style={{flex:1, paddingRight:10}}>
                          <div style={{fontSize:16, fontWeight:800, marginBottom:3}}>{result.foodName}</div>
                          <div style={{fontSize:12, color:'var(--vf-muted)'}}>{result.servingSize}</div>
                        </div>
                        <div style={{textAlign:'right', flexShrink:0}}>
                          <div style={{fontSize:26, fontWeight:900, color:'#39FF14', lineHeight:1}}>{result.calories}</div>
                          <div style={{fontSize:10, color:'var(--vf-muted)'}}>calories</div>
                        </div>
                      </div>

                      <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:16}}>
                        {[
                          {l:'Protein', v:result.protein, c:'#39FF14'},
                          {l:'Carbs',   v:result.carbs,   c:'#00E5FF'},
                          {l:'Fat',     v:result.fat,     c:'#FF6B35'},
                        ].map(m => (
                          <div key={m.l} style={{background:'var(--vf-card2)', borderRadius:10, padding:'10px', textAlign:'center'}}>
                            <div style={{fontSize:18, fontWeight:800, color:m.c}}>{m.v}g</div>
                            <div style={{fontSize:10, color:'var(--vf-muted)'}}>{m.l}</div>
                          </div>
                        ))}
                      </div>

                      {result.notes && (
                        <div style={{fontSize:12, color:'var(--vf-muted)', marginBottom:14, fontStyle:'italic'}}>
                          💡 {result.notes}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Footer buttons */}
              <div style={{display:'flex', gap:10}}>
                <button
                  className="btn-ghost"
                  style={{flex:1, justifyContent:'center'}}
                  onClick={handleClose}
                >
                  Cancel
                </button>
                {result && (
                  <button
                    className="btn-primary"
                    style={{flex:2, justifyContent:'center', fontSize:14}}
                    onClick={handleAdd}
                  >
                    <Check size={14}/> Add to {meal}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
