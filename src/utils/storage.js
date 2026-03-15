export const KEYS = {
  USER: 'vf_user', WORKOUTS: 'vf_workouts', STREAK: 'vf_streak',
  LAST_DATE: 'vf_last_date', FOOD_LOG: 'vf_food_log', GOALS: 'vf_goals',
}
export const storage = {
  get: (key) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null } catch { return null } },
  set: (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)) } catch {} },
  remove: (key) => localStorage.removeItem(key),
  clearAll: () => Object.values({USER:'vf_user',WORKOUTS:'vf_workouts',STREAK:'vf_streak',LAST_DATE:'vf_last_date',FOOD_LOG:'vf_food_log',GOALS:'vf_goals'}).forEach(k => localStorage.removeItem(k)),
}
