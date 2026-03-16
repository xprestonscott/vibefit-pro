
export const STRIPE_LINKS = {
  basic: "https://buy.stripe.com/00w4gAfZ83V09IH3cd6Na00",
  pro:   "https://buy.stripe.com/bJeaEYeV4crwcUT3cd6Na01",
  elite: "https://buy.stripe.com/6oUcN6bIS2QW6wv4gh6Na02",
}

export const PLANS = {
  free: {
    id: 'free', name: 'Free', price: 0, icon: '🌱', color: '#6B6B8A',
    limits: {
      aiWorkoutsPerDay:    1,
      aiAdjustmentsPerDay: 0,
      aiScansPerMonth:     0,
      maxGoals:            3,
      calorieTracking:     true,
      socialFeed:          true,
      friendSystem:        true,
      customSplits:        false,
      prioritySupport:     false,
      virtualCoaching:     false,
    }
  },
  basic: {
    id: 'basic', name: 'Basic', price: 4.99, icon: '⚡', color: '#00E5FF',
    limits: {
      aiWorkoutsPerDay:    3,
      aiAdjustmentsPerDay: 3,
      aiScansPerMonth:     4,
      maxGoals:            999,
      calorieTracking:     true,
      socialFeed:          true,
      friendSystem:        true,
      customSplits:        true,
      prioritySupport:     false,
      virtualCoaching:     false,
    }
  },
  pro: {
    id: 'pro', name: 'Pro', price: 9.99, icon: '🚀', color: '#39FF14',
    limits: {
      aiWorkoutsPerDay:    999,
      aiAdjustmentsPerDay: 999,
      aiScansPerMonth:     999,
      maxGoals:            999,
      calorieTracking:     true,
      socialFeed:          true,
      friendSystem:        true,
      customSplits:        true,
      prioritySupport:     true,
      virtualCoaching:     false,
    }
  },
  elite: {
    id: 'elite', name: 'Elite', price: 14.99, icon: '👑', color: '#FF6B35',
    limits: {
      aiWorkoutsPerDay:    999,
      aiAdjustmentsPerDay: 999,
      aiScansPerMonth:     999,
      maxGoals:            999,
      calorieTracking:     true,
      socialFeed:          true,
      friendSystem:        true,
      customSplits:        true,
      prioritySupport:     true,
      virtualCoaching:     true,
    }
  },
}

// Get current plan
export function getCurrentPlan() {
  return localStorage.getItem('vf_plan') || 'free'
}

// Set plan after payment
export function setPlan(planId) {
  localStorage.setItem('vf_plan', planId)
  localStorage.setItem('vf_plan_date', new Date().toISOString())
}

// Get plan limits
export function getPlanLimits() {
  return PLANS[getCurrentPlan()]?.limits || PLANS.free.limits
}

// Check specific feature
export function canUse(feature) {
  const limits = getPlanLimits()
  return !!limits[feature]
}

// Check numeric limit
export function getLimit(feature) {
  const limits = getPlanLimits()
  return limits[feature] ?? 0
}

// Check daily usage count
export function getDailyUsage(feature) {
  const today = new Date().toISOString().split('T')[0]
  const key   = `vf_usage_${feature}_${today}`
  return parseInt(localStorage.getItem(key) || '0')
}

// Increment daily usage
export function incrementUsage(feature) {
  const today = new Date().toISOString().split('T')[0]
  const key   = `vf_usage_${feature}_${today}`
  const count = getDailyUsage(feature) + 1
  localStorage.setItem(key, count)
  return count
}

// Check if user can do action (returns true/false)
export function checkLimit(feature) {
  const limit = getLimit(feature)
  if (limit === 999) return true       // unlimited
  if (limit === 0)   return false      // not allowed
  const used = getDailyUsage(feature)
  return used < limit
}

// Redirect to Stripe
export function checkout(planId, yearly = false) {
  const link = STRIPE_LINKS[planId]
  if (!link || link.includes('your_')) {
    alert('Payment links not configured yet. Add your Stripe links in subscription.js')
    return
  }
  const successUrl = encodeURIComponent(window.location.origin + '?plan=' + planId)
  window.location.href = link + '?success_url=' + successUrl
}
