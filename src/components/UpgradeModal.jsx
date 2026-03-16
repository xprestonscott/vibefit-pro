import { X, Zap, Crown, ArrowRight } from 'lucide-react'
import { PLANS, checkout } from '../utils/subscription'

export default function UpgradeModal({ feature, onClose }) {
  const messages = {
    aiWorkoutsPerDay:    { title: "AI Workout Limit Reached", desc: "You've used your free AI workout generation for today. Upgrade to generate more personalized programs.", need: 'basic' },
    aiAdjustmentsPerDay: { title: "Unlock AI Adjustments", desc: "Real-time AI workout adjustments are a paid feature. Upgrade to tweak your workouts with AI instantly.", need: 'basic' },
    aiScansPerMonth:     { title: "Unlock AI Physique Analysis", desc: "AI-powered physique analysis is a premium feature. Upgrade to get detailed body composition insights.", need: 'basic' },
    maxGoals:            { title: "Goal Limit Reached", desc: "Free plan allows 3 goals. Upgrade to track unlimited goals and milestones.", need: 'basic' },
    customSplits:        { title: "Unlock Custom Splits", desc: "Advanced training splits like Arnold and Bro Split are premium features.", need: 'basic' },
    virtualCoaching:     { title: "Unlock Virtual Coaching", desc: "1-on-1 virtual coaching sessions are exclusive to Elite members.", need: 'elite' },
  }

  const msg     = messages[feature] || { title: 'Upgrade Required', desc: 'This feature requires a paid plan.', need: 'basic' }
  const needPlan = PLANS[msg.need]

  const suggestedPlans = ['basic', 'pro', 'elite'].map(id => PLANS[id])

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(8,8,16,.97)', backdropFilter:'blur(20px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:99999, padding:20 }}
      onClick={onClose}>
      <div style={{ background:'var(--vf-card)', border:'1px solid rgba(57,255,20,.3)', borderRadius:24, width:'100%', maxWidth:520, padding:36 }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
          <div>
            <div style={{ fontSize:36, marginBottom:10 }}>⚡</div>
            <h2 style={{ margin:0, fontSize:22 }}>{msg.title}</h2>
            <p style={{ color:'var(--vf-muted)', fontSize:14, marginTop:8, lineHeight:1.6, maxWidth:380 }}>{msg.desc}</p>
          </div>
          <button style={{ background:'none', border:'none', cursor:'pointer', color:'var(--vf-muted)', padding:4 }} onClick={onClose}>
            <X size={20}/>
          </button>
        </div>

        {/* Plan options */}
        <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
          {suggestedPlans.map(plan => (
            <div key={plan.id} style={{
              display:'flex', alignItems:'center', gap:14, padding:'14px 18px',
              background: plan.id === 'pro' ? 'rgba(57,255,20,.08)' : 'var(--vf-card2)',
              border: `1px solid ${plan.id === 'pro' ? 'rgba(57,255,20,.3)' : 'var(--vf-border)'}`,
              borderRadius:12, cursor:'pointer', transition:'all .2s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = plan.color}
              onMouseLeave={e => e.currentTarget.style.borderColor = plan.id === 'pro' ? 'rgba(57,255,20,.3)' : 'var(--vf-border)'}
              onClick={() => { checkout(plan.id); onClose() }}
            >
              <span style={{ fontSize:24 }}>{plan.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:15, fontWeight:700, color: plan.id === 'pro' ? '#39FF14' : 'var(--vf-text)' }}>
                  {plan.name}
                  {plan.id === 'pro' && <span style={{ marginLeft:8, fontSize:10, background:'#39FF14', color:'#080810', padding:'2px 8px', borderRadius:10, fontWeight:800 }}>POPULAR</span>}
                </div>
                <div style={{ fontSize:12, color:'var(--vf-muted)', marginTop:2 }}>
                  {plan.id === 'basic' && 'Unlimited goals · 4 AI scans/month · AI adjustments'}
                  {plan.id === 'pro'   && 'Unlimited everything · Priority support · Custom programs'}
                  {plan.id === 'elite' && 'All Pro features + Virtual coaching sessions'}
                </div>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <div style={{ fontSize:18, fontWeight:900, color: plan.color }}>${plan.price}</div>
                <div style={{ fontSize:10, color:'var(--vf-muted)' }}>/month</div>
              </div>
              <ArrowRight size={16} style={{ color:'var(--vf-muted)', flexShrink:0 }}/>
            </div>
          ))}
        </div>

        <div style={{ display:'flex', gap:10 }}>
          <button className="btn-ghost" style={{ flex:1, justifyContent:'center' }} onClick={onClose}>
            Maybe Later
          </button>
          <button className="btn-primary" style={{ flex:2, justifyContent:'center' }} onClick={() => { checkout('pro'); onClose() }}>
            <Zap size={14}/> Upgrade to Pro — $9.99/mo
          </button>
        </div>

        <div style={{ textAlign:'center', marginTop:14, fontSize:12, color:'var(--vf-muted)' }}>
          🔒 Secured by Stripe · Cancel anytime · 7-day free trial
        </div>
      </div>
    </div>
  )
}
