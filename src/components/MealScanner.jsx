import { useState, useRef } from 'react'
import { Camera, X, Upload, Zap, Check, AlertCircle } from 'lucide-react'
import { analyzeMeal } from '../utils/ai'
import { getCurrentPlan } from '../utils/subscription'
import UpgradeModal from './UpgradeModal'

export default function MealScanner({ onFoodAdded, meal }) {
  const [show, setShow]       = useState(false)
  const [image, setImage]     = useState(null)
  const [preview, setPreview] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult]   = useState(null)
  const [error, setError]     = useState(null)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const fileRef = useRef()

  const plan = getCurrentPlan()
  const canScan = true // All plans can scan — upgrade modal shown inside if free

  function handleOpen() {
    if (!canScan) { setShowUpgrade(true); return }
    setShow(true)
  }

  function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setPreview(ev.target.result)
      // Extract base64
      const base64 = ev.target.result.split(',')[1]
      setImage({ base64, mimeType: file.type })
    }
    reader.readAsDataURL(file)
    setResult(null)
    setError(null)
  }

  async function handleAnalyze() {
    if (!image) return
    setAnalyzing(true)
    setError(null)
    try {
      const data = await analyzeMeal(image.base64, image.mimeType)
      setResult(data)
    } catch(err) {
      setError(err.message)
    } finally {
      setAnalyzing(false)
    }
  }

  function handleAdd() {
    if (!result) return
    onFoodAdded(meal, {
      id:   Date.now(),
      name: result.foodName,
      cal:  result.calories,
      p:    result.protein,
      c:    result.carbs,
      f:    result.fat,
      logged: new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}),
      aiScanned: true,
    })
    setShow(false)
    setImage(null)
    setPreview(null)
    setResult(null)
    setError(null)
  }

  function handleClose() {
    setShow(false)
    setImage(null)
    setPreview(null)
    setResult(null)
    setError(null)
  }

  return (
    <>
      {showUpgrade && <UpgradeModal feature="aiScansPerMonth" onClose={() => setShowUpgrade(false)}/>}

      <button className="btn-ghost" style={{padding:'6px 12px',fontSize:12}} onClick={handleOpen}>
        <Camera size={13}/> Scan
        {!canScan && <span style={{fontSize:9,background:'#FF6B35',color:'#fff',borderRadius:4,padding:'1px 4px',marginLeft:4}}>PRO</span>}
      </button>

      {show && (
        <div style={{position:'fixed',inset:0,background:'rgba(8,8,16,.9)',backdropFilter:'blur(12px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:2000,padding:20}}
          onClick={handleClose}>
          <div style={{background:'var(--vf-card)',border:'1px solid var(--vf-border)',borderRadius:24,width:'100%',maxWidth:480,padding:32}}
            onClick={e=>e.stopPropagation()}>

            {/* Header */}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
              <div>
                <h3 style={{margin:0,fontSize:20,display:'flex',alignItems:'center',gap:10}}>
                  <Camera size={20} style={{color:'#39FF14'}}/> AI Meal Scanner
                </h3>
                <div style={{fontSize:12,color:'var(--vf-muted)',marginTop:4}}>
                  Take or upload a photo — AI identifies calories & macros
                </div>
              </div>
              <button style={{background:'none',border:'none',cursor:'pointer',color:'var(--vf-muted)'}} onClick={handleClose}>
                <X size={20}/>
              </button>
            </div>

            {/* Upload zone */}
            {!preview ? (
              <div
                style={{border:'2px dashed var(--vf-border)',borderRadius:16,padding:'40px 20px',textAlign:'center',cursor:'pointer',transition:'all .2s',marginBottom:20}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(57,255,20,.5)';e.currentTarget.style.background='rgba(57,255,20,.03)'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--vf-border)';e.currentTarget.style.background='none'}}
                onClick={() => fileRef.current.click()}
              >
                <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{display:'none'}} onChange={handleFile}/>
                <div style={{fontSize:48,marginBottom:12}}>📸</div>
                <div style={{fontSize:16,fontWeight:700,marginBottom:6}}>Take or Upload Photo</div>
                <div style={{fontSize:13,color:'var(--vf-muted)',marginBottom:16}}>
                  Works with any food — plate, snack, drink, or packaged item
                </div>
                <div style={{display:'flex',gap:10,justifyContent:'center'}}>
                  <button className="btn-primary" style={{pointerEvents:'none',fontSize:13}}>
                    <Camera size={13}/> Take Photo
                  </button>
                  <button className="btn-ghost" style={{pointerEvents:'none',fontSize:13}}>
                    <Upload size={13}/> Upload
                  </button>
                </div>
              </div>
            ) : (
              <div style={{marginBottom:20}}>
                <div style={{position:'relative',marginBottom:12}}>
                  <img src={preview} style={{width:'100%',borderRadius:12,maxHeight:200,objectFit:'cover'}}/>
                  <button
                    style={{position:'absolute',top:8,right:8,background:'rgba(8,8,16,.8)',border:'none',borderRadius:'50%',width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'#fff'}}
                    onClick={() => {setPreview(null);setImage(null);setResult(null)}}>
                    <X size={14}/>
                  </button>
                </div>

                {!result && !analyzing && (
                  <button className="btn-primary" style={{width:'100%',justifyContent:'center',fontSize:14}} onClick={handleAnalyze}>
                    <Zap size={15}/> Analyze with AI
                  </button>
                )}

                {analyzing && (
                  <div style={{textAlign:'center',padding:'20px 0'}}>
                    <div style={{width:36,height:36,border:'3px solid var(--vf-border)',borderTopColor:'#39FF14',borderRadius:'50%',animation:'spin 1s linear infinite',margin:'0 auto 12px'}}/>
                    <div style={{fontSize:14,color:'var(--vf-muted)'}}>AI is analyzing your meal...</div>
                  </div>
                )}

                {error && (
                  <div style={{background:'rgba(255,107,53,.1)',border:'1px solid rgba(255,107,53,.3)',borderRadius:10,padding:'12px 14px',fontSize:13,color:'#FF6B35',display:'flex',gap:10,alignItems:'flex-start'}}>
                    <AlertCircle size={15} style={{flexShrink:0,marginTop:1}}/>
                    <div>{error}</div>
                  </div>
                )}

                {result && (
                  <div style={{background:'rgba(57,255,20,.06)',border:'1px solid rgba(57,255,20,.2)',borderRadius:14,padding:20}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
                      <div>
                        <div style={{fontSize:17,fontWeight:800,marginBottom:2}}>{result.foodName}</div>
                        <div style={{fontSize:12,color:'var(--vf-muted)'}}>{result.servingSize}</div>
                        {result.items?.length > 0 && (
                          <div style={{fontSize:11,color:'var(--vf-muted)',marginTop:4}}>
                            {result.items.join(' · ')}
                          </div>
                        )}
                      </div>
                      <div style={{textAlign:'right'}}>
                        <div style={{fontSize:28,fontWeight:900,color:'#39FF14',lineHeight:1}}>{result.calories}</div>
                        <div style={{fontSize:11,color:'var(--vf-muted)'}}>calories</div>
                      </div>
                    </div>

                    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:16}}>
                      {[
                        {l:'Protein',v:result.protein,c:'#39FF14',unit:'g'},
                        {l:'Carbs',  v:result.carbs,  c:'#00E5FF',unit:'g'},
                        {l:'Fat',    v:result.fat,     c:'#FF6B35',unit:'g'},
                      ].map(m => (
                        <div key={m.l} style={{background:'var(--vf-card2)',borderRadius:10,padding:'10px',textAlign:'center'}}>
                          <div style={{fontSize:20,fontWeight:800,color:m.c}}>{m.v}{m.unit}</div>
                          <div style={{fontSize:11,color:'var(--vf-muted)'}}>{m.l}</div>
                        </div>
                      ))}
                    </div>

                    {result.notes && (
                      <div style={{fontSize:12,color:'var(--vf-muted)',marginBottom:14,fontStyle:'italic'}}>
                        💡 {result.notes}
                      </div>
                    )}

                    <div style={{display:'flex',gap:8}}>
                      <span style={{fontSize:11,padding:'4px 10px',borderRadius:20,background:`rgba(57,255,20,.1)`,color:'#39FF14',border:'1px solid rgba(57,255,20,.2)'}}>
                        {result.confidence === 'high' ? '✓ High confidence' : result.confidence === 'medium' ? '~ Medium confidence' : '? Low confidence'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {result && (
              <div style={{display:'flex',gap:10,marginTop:16}}>
                <button className="btn-ghost" style={{flex:1,justifyContent:'center'}} onClick={() => {setPreview(null);setImage(null);setResult(null)}}>
                  Retake
                </button>
                <button className="btn-primary" style={{flex:2,justifyContent:'center'}} onClick={handleAdd}>
                  <Check size={14}/> Add to {meal} Log
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
