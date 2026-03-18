// Push notification helpers

export function requestNotificationPermission() {
  if (!('Notification' in window)) return Promise.resolve('denied')
  if (Notification.permission === 'granted') return Promise.resolve('granted')
  return Notification.requestPermission()
}

export function sendNotification(title, body, icon = '/icon-192.png') {
  if (Notification.permission !== 'granted') return
  new Notification(title, { body, icon, badge: '/icon-192.png' })
}

export function scheduleDailyReminders() {
  // Check every hour if reminders should be sent
  const now   = new Date()
  const hour  = now.getHours()
  const today = now.toISOString().split('T')[0]

  const mealLogged     = localStorage.getItem(`vf_meal_reminded_${today}`)
  const workoutReminded = localStorage.getItem(`vf_workout_reminded_${today}`)

  // Meal reminder at 12pm if nothing logged
  if (hour >= 12 && hour < 13 && !mealLogged) {
    const log = JSON.parse(localStorage.getItem('vf_food_log') || '{}')
    const todayFoods = log[today] ? Object.values(log[today]).flat() : []
    if (todayFoods.length === 0) {
      sendNotification('Time to log lunch! 🍎', 'Track your meals to hit your calorie goal today.')
      localStorage.setItem(`vf_meal_reminded_${today}`, '1')
    }
  }

  // Workout reminder at 5pm
  if (hour >= 17 && hour < 18 && !workoutReminded) {
    sendNotification("Workout time! 💪", "Your program is ready. Let's get it done!")
    localStorage.setItem(`vf_workout_reminded_${today}`, '1')
  }

  // Evening reminder at 8pm if calories not logged
  if (hour >= 20 && hour < 21) {
    const log = JSON.parse(localStorage.getItem('vf_food_log') || '{}')
    const todayFoods = log[today] ? Object.values(log[today]).flat() : []
    const totalCal   = todayFoods.reduce((a,f) => a+(f.cal||0), 0)
    if (totalCal < 500) {
      sendNotification('Don't forget to log dinner! 🌙', 'Keep your streak alive by tracking your meals.')
    }
  }
}
