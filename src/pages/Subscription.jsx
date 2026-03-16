import { useState, useEffect } from 'react'
import { Check, X, Zap, Crown, Star, Shield, Lock, ExternalLink, CheckCircle } from 'lucide-react'
import { PLANS, getCurrentPlan, setPlan, checkout } from '../utils/subscription'

const FEATURE_LABELS = {
  aiWorkoutsPerDay:    'AI Workout Generation',
  aiAdjustmentsPerDay: 'AI Workout Adjustments',
  aiScansPerMonth:     'AI Physique Scans',
  maxGoals:            'Goal Tracking',
  calorieTracking:     'Calorie & Macro Tracking',
  socialFeed:          'Social Feed & Friends',
  friendSystem:        'Friend System',
  customSplits:        'Custom Training Splits',
  prioritySupport:     'Priority Support',
  virtualCoaching:     'Virtual Coaching Sessions',
}

export default function Subscription() {
  const [annual, setAnnual]           = useState(false)
  const [currentPlan, setCurrentPlan] = useState(() => getCurrentPlan())
  const [success, setSuccess]         = useState(false)
  const [successPlan, setSuccessPlan] = useState(null)

  // Only show success if coming back from Stripe
  useEffect(() => {
    const params     = new URLSearchParams(window.location.search)
    const plan       = params.get('plan')
    const fromStripe = sessionStorage.getItem('going_to_stripe') === 'true'

    if (plan && PLANS[plan] && fromStripe) {
      setPlan(plan)
      setCurrentPlan(plan)
      setSuccessPlan(PLANS[plan])
      setSuccess(true)
      sessionStorage.removeItem('going_to_stripe')
    }

    // Always clean the URL
    if (plan) {
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  function handleCheckout(planId) {
    sessionStorage.setItem('going_to_stripe', 'true')
    checkout(planId, annual)
  }

  const planList = Object.values(PLANS)

  return (
    <div>
      {/* Success banner */}
      {success && successPlan && (
        <div style={{background:'linear-gradient(135deg,rgba(57,255,20,.15),rgba(0,229,255,.08))',border:'1px solid rgba(57,255,20,.4)',borderRadius:16,padding:'20px 28px',marginBottom:32,display:'flex',alignItems:'center',gap:16}}>
          <CheckCircle size={32} style={{color:'#39FF14',flexShrink:0}}/>
          <div>
            <div style={{fontSize:18,fontWeight:800,marginBottom:4}}>🎉 Payment successful! Welcome to {successPlan.name}!</div>
            <div style={{color:'var(--vf-muted)',fontSize:14}}>All your new features are now unlocked.</div>
          </div>
        </div>
      )}

      <div className="anim-up" style={{textAlign:'center',marginBottom:48}}>
        <span className="badge badge-green" style={{fontSize:12,padding:'6px 16px',marginBottom:16,display:'inline-flex'}}>
          <Star size={11}/>Launch Pricing
        </span>
        <h1 className="font-display" style={{fontSize:56,margin:'0 0 12px'}}>
          CHOOSE YOUR <span className="gradient-text">PLAN</span>
        </h1>
        <p style={{color:'var(--vf-muted)',fontSize:16,maxWidth:500,margin:'0 auto 32px'}}>
          All plans include full access to AI workouts, friends, and the community.
        </p>

        {/* Annual toggle */}
        <div style={{display:'inline-flex',alignItems:'center',gap:12,background:'var(--vf-card)',border:'1px solid var(--vf-border)',borderRadius:40,padding:'8px 20px'}}>
          <span style={{fontSize:14,color:annual?'var(--vf-muted)':'var(--vf-text)',fontWeight:annual?400:700}}>Monthly</span>
          <button style={{width:48,height:26,borderRadius:13,border:'none',cursor:'pointer',background:annual?'#39FF14':'var(--vf-card2)',position:'relative',transition:'background .2s'}} onClick={() => setAnnual(a=>!a)}>
            <div style={{width:20,height:20,borderRadius:'50%',background:'#fff',position:'absolute',top:3,left:annual?25:3,transition:'left .2s',boxShadow:'0 1px 4px rgba(0,0,0,.3)'}}/>
          </button>
          <span style={{fontSize:14,color:annual?'var(--vf-text)':'var(--vf-muted)',fontWeight:annual?700:400}}>
            Annual <span style={{color:'#39FF14',fontSize:12}}>Save 15%</span>
          </span>
        </div>
      </div>

      {/* Plan cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:48,alignItems:'start'}}>
        {planList.map(plan => {
          const isCurrent = currentPlan === plan.id
          const price = annual && plan.yearlyPrice
            ? (plan.yearlyPrice / 12).toFixed(2)
            : plan.price

          return (
            <div key={plan.id} style={{
              background: isCurrent ? `${plan.color}10` : 'var(--vf-card)',
              border: `1px solid ${isCurrent ? plan.color : plan.id==='pro' ? 'rgba(57,255,20,.3)' : 'var(--vf-border)'}`,
              borderRadius:20, padding:'28px 24px',
              display:'flex', flexDirection:'column',
              position:'relative', overflow:'hidden',
              transition:'all .3s',
            }}>
              {plan.id === 'pro' && (
                <div style={{position:'absolute',top:0,left:'50%',transform:'translateX(-50%)',background:'#39FF14',color:'#080810',borderRadius:'0 0 10px 10px',padding:'4px 14px',fontSize:10,fontWeight:800,letterSpacing:'1px',whiteSpace:'nowrap'}}>
                  MOST POPULAR
                </div>
              )}
              {isCurrent && (
                <div style={{position:'absolute',top:12,right:12}}>
                  <span className="badge badge-green" style={{fontSize:10}}>✓ Active</span>
                </div>
              )}

              <div style={{marginBottom:20,marginTop:plan.id==='pro'?16:0}}>
                <div style={{fontSize:32,marginBottom:10}}>{plan.icon}</div>
                <div style={{fontSize:19,fontWeight:800,marginBottom:4}}>{plan.name}</div>
              </div>

              <div style={{marginBottom:24}}>
                {plan.price === 0 ? (
                  <div>
                    <span style={{fontSize:36,fontWeight:900}}>Free</span>
                    <div style={{fontSize:12,color:'var(--vf-muted)',marginTop:4}}>Forever</div>
                  </div>
                ) : (
                  <div>
                    <div style={{display:'flex',alignItems:'flex-end',gap:4}}>
                      <span style={{fontSize:36,fontWeight:900,color:plan.color}}>${price}</span>
                      <span style={{fontSize:13,color:'var(--vf-muted)',marginBottom:6}}>/mo</span>
                    </div>
                    {annual && plan.yearlyPrice && (
                      <div style={{fontSize:11,color:plan.color,marginTop:4}}>
                        Billed ${plan.yearlyPrice}/yr
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Features */}
              <div style={{flex:1,marginBottom:24}}>
                {Object.entries(plan.limits).map(([key, val]) => (
                  <div key={key} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 0',borderBottom:'1px solid rgba(37,37,64,.4)'}}>
                    {val === false || val === 0 ? (
                      <X size={13} style={{color:'var(--vf-border)',flexShrink:0}}/>
                    ) : (
                      <Check size={13} style={{color:plan.color,flexShrink:0}}/>
                    )}
                    <span style={{fontSize:12,color:val===false||val===0?'var(--vf-muted)':'var(--vf-text)'}}>
                      {key === 'aiWorkoutsPerDay'    ? val===999?'Unlimited AI workouts':`${val} AI workout/day` :
                       key === 'aiAdjustmentsPerDay' ? val===999?'Unlimited AI adjustments':`${val} adjustments/day` :
                       key === 'aiScansPerMonth'     ? val===999?'Unlimited physique scans':`${val} scans/month` :
                       key === 'maxGoals'            ? val===999?'Unlimited goals':`Max ${val} goals` :
                       FEATURE_LABELS[key] || key}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              {isCurrent ? (
                <button className="btn-ghost" style={{width:'100%',justifyContent:'center',borderColor:plan.color,color:plan.color,cursor:'default'}}>
                  <CheckCircle size={14}/> Current Plan
                </button>
              ) : plan.price === 0 ? (
                <button className="btn-ghost" style={{width:'100%',justifyContent:'center'}}
                  onClick={() => { setPlan('free'); setCurrentPlan('free') }}>
                  Downgrade to Free
                </button>
              ) : (
                <button
                  className={plan.id==='pro'?'btn-primary':'btn-ghost'}
                  style={{width:'100%',justifyContent:'center',
                    ...(plan.id!=='pro'?{borderColor:plan.color,color:plan.color}:{})
                  }}
                  onClick={() => handleCheckout(plan.id)}
                >
                  {plan.id==='elite'?<Crown size={14}/>:<Zap size={14}/>}
                  Upgrade · ${price}/mo
                  <ExternalLink size={12} style={{opacity:.6}}/>
                </button>
              )}
            </div>
          )
        })}
      </div>


      {/* Embedded Stripe Checkout */}
      <div style={{marginBottom:48}}>
        <h2 className="font-display" style={{fontSize:36,textAlign:'center',marginBottom:8}}>
          SUBSCRIBE <span className="gradient-text">NOW</span>
        </h2>
        <p style={{color:'var(--vf-muted)',textAlign:'center',marginBottom:28,fontSize:14}}>
          Secured by Stripe · Cancel anytime · Receipt via email
        </p>
        <stripe-pricing-table
          pricing-table-id="prctbl_1TBQD1ItlMiRy2bQ12ijUlbe"
          publishable-key="pk_live_51T6y6AItlMiRy2bQeSgF3YGUpyeRkDBNDwbbOVDP2XNM02sDXo2Ix4B5lLCOrwsbwdiJNC0uQg7uwRWIZOi9i1Uy00Woujy3zV">
        </stripe-pricing-table>
      </div>
      {/* Trust badges */}
      <div style={{display:'flex',justifyContent:'center',gap:32,flexWrap:'wrap',color:'var(--vf-muted)',fontSize:13}}>
        {['🔒 Secured by Stripe','💳 All major cards','🔄 Cancel anytime','📧 Receipt via email','🇺🇸 Made in Oklahoma'].map(t => (
          <span key={t}>{t}</span>
        ))}
      </div>
    </div>
  )
}
