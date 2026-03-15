import { useState } from 'react'
import { Check, X, Zap, Crown, Star, Shield, CreditCard, Lock } from 'lucide-react'

const PLANS = [
  {id:'free',name:'Free',price:0,color:'var(--vf-muted)',icon:'🌱',tagline:'Get started',current:true,features:[{t:'Basic workout planner',y:true},{t:'Up to 3 goals',y:true},{t:'Manual calorie logging',y:true},{t:'Ad-free experience',y:false},{t:'AI workout generation',y:false},{t:'AI physique analysis',y:false}],cta:'Current Plan'},
  {id:'basic',name:'Basic',price:4.99,color:'#00E5FF',icon:'⚡',tagline:'Core features',features:[{t:'Everything in Free',y:true},{t:'Ad-free',y:true},{t:'Unlimited goals',y:true},{t:'1 AI physique scan/week',y:true},{t:'AI workout generation',y:true},{t:'Virtual coaching',y:false}],cta:'Go Basic'},
  {id:'pro',name:'Pro',price:9.99,color:'#39FF14',icon:'🚀',tagline:'Full AI power',featured:true,badge:'MOST POPULAR',features:[{t:'Everything in Basic',y:true},{t:'Unlimited AI scans',y:true},{t:'Advanced physique insights',y:true},{t:'Custom AI workout plans',y:true},{t:'Premium buddy matching',y:true},{t:'Virtual coaching',y:false}],cta:'Go Pro'},
  {id:'elite',name:'Elite',price:14.99,altPrice:119.99,color:'#FF6B35',icon:'👑',tagline:'Coaching included',badge:'BEST VALUE',features:[{t:'Everything in Pro',y:true},{t:'Virtual coaching sessions',y:true},{t:'Apple Health sync',y:true},{t:'Garmin / Whoop sync',y:true},{t:'Early feature access',y:true},{t:'1-on-1 form reviews',y:true}],cta:'Go Elite'},
]

export default function Subscription() {
  const [annual, setAnnual] = useState(false)
  const [checkout, setCheckout] = useState(null)
  const [done, setDone] = useState(false)
  const [card, setCard] = useState('')
  const [processing, setProcessing] = useState(false)

  function handlePay() { setProcessing(true); setTimeout(() => { setProcessing(false); setDone(true) }, 2000) }

  return (
    <div>
      {checkout && !done && (
        <div style={{position:'fixed',inset:0,background:'rgba(8,8,16,.9)',backdropFilter:'blur(12px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:20}} onClick={() => {setCheckout(null);setDone(false)}}>
          <div style={{background:'var(--vf-card)',border:'1px solid var(--vf-border)',borderRadius:24,maxWidth:420,width:'100%',padding:36}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:24}}><div><h3 style={{margin:0}}>Upgrade to {checkout.name}</h3><div style={{fontSize:13,color:'var(--vf-muted)',marginTop:4}}>${checkout.price}/month · Cancel anytime</div></div><span style={{fontSize:28}}>{checkout.icon}</span></div>
            <div style={{marginBottom:14}}><label style={{fontSize:11,color:'var(--vf-muted)',fontWeight:600,letterSpacing:'.5px',display:'block',marginBottom:6}}>CARD NUMBER</label><div style={{position:'relative'}}><input className="vf-input" placeholder="1234 5678 9012 3456" value={card} onChange={e=>setCard(e.target.value)} style={{paddingRight:44}}/><CreditCard size={15} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',color:'var(--vf-muted)'}}/></div></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:24}}>
              <div><label style={{fontSize:11,color:'var(--vf-muted)',fontWeight:600,letterSpacing:'.5px',display:'block',marginBottom:6}}>EXPIRY</label><input className="vf-input" placeholder="MM/YY"/></div>
              <div><label style={{fontSize:11,color:'var(--vf-muted)',fontWeight:600,letterSpacing:'.5px',display:'block',marginBottom:6}}>CVV</label><input className="vf-input" placeholder="•••" type="password"/></div>
            </div>
            <div style={{display:'flex',gap:10}}>
              <button className="btn-ghost" style={{flex:1,justifyContent:'center'}} onClick={() => setCheckout(null)}>Cancel</button>
              <button className="btn-primary" style={{flex:2,justifyContent:'center'}} disabled={processing} onClick={handlePay}>
                {processing ? <div style={{width:16,height:16,border:'2px solid rgba(8,8,16,.3)',borderTopColor:'#080810',borderRadius:'50%',animation:'spin 1s linear infinite'}}/> : <><Lock size={13}/>Pay ${checkout.price}/mo</>}
              </button>
            </div>
            <div style={{textAlign:'center',marginTop:14,fontSize:12,color:'var(--vf-muted)',display:'flex',gap:8,justifyContent:'center',alignItems:'center'}}><Shield size={12}/>256-bit SSL · Powered by Stripe</div>
          </div>
        </div>
      )}
      {checkout && done && (
        <div style={{position:'fixed',inset:0,background:'rgba(8,8,16,.9)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}} onClick={() => {setCheckout(null);setDone(false)}}>
          <div style={{background:'var(--vf-card)',border:'1px solid var(--vf-border)',borderRadius:24,maxWidth:380,width:'100%',padding:48,textAlign:'center'}}>
            <div style={{width:80,height:80,borderRadius:'50%',background:'linear-gradient(135deg,#39FF14,#00C851)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:36,margin:'0 auto 24px',boxShadow:'0 0 30px rgba(57,255,20,.4)'}}>✓</div>
            <h2 style={{margin:'0 0 12px'}}>Welcome to {checkout?.name}! 🎉</h2>
            <p style={{color:'var(--vf-muted)',marginBottom:28}}>All {checkout?.name} features are now unlocked.</p>
            <button className="btn-primary" style={{width:'100%',justifyContent:'center'}} onClick={() => {setCheckout(null);setDone(false)}}>Start Using {checkout?.name}</button>
          </div>
        </div>
      )}

      <div className="anim-up" style={{textAlign:'center',marginBottom:48}}>
        <span className="badge badge-green" style={{fontSize:12,padding:'6px 16px',marginBottom:16,display:'inline-flex'}}><Star size={11}/>Launch Pricing</span>
        <h1 className="font-display" style={{fontSize:56,margin:'0 0 12px'}}>CHOOSE YOUR <span className="gradient-text">PLAN</span></h1>
        <p style={{color:'var(--vf-muted)',fontSize:16,maxWidth:480,margin:'0 auto 32px'}}>7-day free trial on all paid plans. Cancel anytime.</p>
        <div style={{display:'inline-flex',alignItems:'center',gap:12,background:'var(--vf-card)',border:'1px solid var(--vf-border)',borderRadius:40,padding:'8px 20px'}}>
          <span style={{fontSize:14,color:annual?'var(--vf-muted)':'var(--vf-text)',fontWeight:annual?400:700}}>Monthly</span>
          <button style={{width:48,height:26,borderRadius:13,border:'none',cursor:'pointer',background:annual?'#39FF14':'var(--vf-card2)',position:'relative',transition:'background .2s'}} onClick={() => setAnnual(a=>!a)}>
            <div style={{width:20,height:20,borderRadius:'50%',background:'#fff',position:'absolute',top:3,left:annual?25:3,transition:'left .2s',boxShadow:'0 1px 4px rgba(0,0,0,.3)'}}/>
          </button>
          <span style={{fontSize:14,color:annual?'var(--vf-text)':'var(--vf-muted)',fontWeight:annual?700:400}}>Annual <span style={{color:'#39FF14',fontSize:12}}>Save 15%</span></span>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14}}>
        {PLANS.map(p => {
          const price = annual && p.altPrice ? (p.altPrice/12).toFixed(2) : p.price
          return (
            <div key={p.id} className={`plan-card${p.featured?' featured':''}`} style={{borderColor:p.featured?`${p.color}40`:undefined}}>
              {p.badge && <div style={{position:'absolute',top:-12,left:'50%',transform:'translateX(-50%)',background:p.featured?p.color:'var(--vf-card2)',color:p.featured?'#080810':p.color,borderRadius:20,padding:'4px 14px',fontSize:10,fontWeight:800,letterSpacing:'1px',whiteSpace:'nowrap',border:`1px solid ${p.color}40`}}>{p.badge}</div>}
              <div style={{marginBottom:18}}><div style={{fontSize:28,marginBottom:8}}>{p.icon}</div><div style={{fontSize:17,fontWeight:800,marginBottom:3}}>{p.name}</div><div style={{fontSize:12,color:'var(--vf-muted)'}}>{p.tagline}</div></div>
              <div style={{marginBottom:20}}>{p.price===0?<div style={{fontSize:32,fontWeight:900}}>Free</div>:<div style={{display:'flex',alignItems:'flex-end',gap:3}}><div style={{fontSize:32,fontWeight:900,color:p.color}}>${price}</div><div style={{fontSize:12,color:'var(--vf-muted)',marginBottom:4}}>/mo</div></div>}
                {annual&&p.altPrice&&<div style={{fontSize:10,color:p.color,marginTop:3}}>Billed ${p.altPrice}/yr</div>}
              </div>
              <div style={{flex:1,marginBottom:20}}>
                {p.features.map((f,i) => (<div key={i} style={{display:'flex',gap:8,padding:'6px 0',borderBottom:i<p.features.length-1?'1px solid rgba(37,37,64,.4)':'none',alignItems:'center'}}>{f.y?<Check size={13} style={{color:p.color,flexShrink:0}}/>:<X size={13} style={{color:'var(--vf-border)',flexShrink:0}}/>}<span style={{fontSize:12,color:f.y?'var(--vf-text)':'var(--vf-muted)'}}>{f.t}</span></div>))}
              </div>
              {p.current?<button className="btn-ghost" style={{width:'100%',justifyContent:'center'}}><Check size={13}/>Current Plan</button>:
                <button className={p.featured?'btn-primary':'btn-ghost'} style={{width:'100%',justifyContent:'center',borderColor:!p.featured?p.color:undefined,color:!p.featured?p.color:undefined}} onClick={() => setCheckout(p)}>
                  {p.id==='elite'?<Crown size={13}/>:<Zap size={13}/>}{p.cta}
                </button>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
