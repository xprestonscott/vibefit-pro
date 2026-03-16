// Calculate daily calorie goal using Mifflin-St Jeor equation
export function calculateCalories(profile) {
  const { weight, height, age, gender, activityLevel, goal } = profile

  // Convert to metric if needed
  const weightKg = parseFloat(weight) * 0.453592  // lbs to kg
  const heightCm = parseFloat(height) * 2.54       // inches to cm
  const ageYrs   = parseFloat(age) || 25

  if (!weightKg || !heightCm) return 2400

  // BMR
  let bmr
  if (gender === 'Female') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYrs - 161
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYrs + 5
  }

  // Activity multiplier
  const multipliers = {
    'Sedentary':         1.2,
    'Lightly Active':    1.375,
    'Moderately Active': 1.55,
    'Very Active':       1.725,
    'Extremely Active':  1.9,
  }
  const tdee = bmr * (multipliers[activityLevel] || 1.55)

  // Goal adjustment
  const adjustments = {
    'Lose Body Fat':     -500,
    'Lose Fat Slowly':   -250,
    'Maintain Weight':    0,
    'Build Muscle':       250,
    'Bulk':               500,
    'Improve Endurance':  0,
    'General Fitness':    0,
    'Active Recovery':   -100,
  }
  const adj = adjustments[goal] || 0

  return Math.round(tdee + adj)
}

// Calculate macros based on calories and goal
export function calculateMacros(calories, goal, weight) {
  const weightLbs = parseFloat(weight) || 180

  let protein, fat, carbs

  if (goal === 'Build Muscle' || goal === 'Bulk') {
    protein = Math.round(weightLbs * 1.0)    // 1g per lb
    fat     = Math.round(calories * 0.25 / 9)
    carbs   = Math.round((calories - protein * 4 - fat * 9) / 4)
  } else if (goal === 'Lose Body Fat' || goal === 'Lose Fat Slowly') {
    protein = Math.round(weightLbs * 1.1)    // higher protein to preserve muscle
    fat     = Math.round(calories * 0.30 / 9)
    carbs   = Math.round((calories - protein * 4 - fat * 9) / 4)
  } else {
    protein = Math.round(weightLbs * 0.8)
    fat     = Math.round(calories * 0.28 / 9)
    carbs   = Math.round((calories - protein * 4 - fat * 9) / 4)
  }

  return {
    calories,
    protein:  Math.max(protein, 50),
    carbs:    Math.max(carbs,   50),
    fat:      Math.max(fat,     30),
  }
}

const GOAL_KEY = 'vf_calorie_goal'
const MACRO_KEY = 'vf_macro_goals'

export function saveGoalToStorage(calories, macros) {
  localStorage.setItem(GOAL_KEY,  JSON.stringify(calories))
  localStorage.setItem(MACRO_KEY, JSON.stringify(macros))
}

export function getGoalFromStorage() {
  try {
    const cal  = JSON.parse(localStorage.getItem(GOAL_KEY))
    const mac  = JSON.parse(localStorage.getItem(MACRO_KEY))
    return { calories: cal || 2400, macros: mac || { protein:180, carbs:260, fat:70 } }
  } catch { return { calories:2400, macros:{ protein:180, carbs:260, fat:70 } } }
}
