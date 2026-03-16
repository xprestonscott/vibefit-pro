// USDA FoodData Central API — 1 million+ foods, free
// Same database MyFitnessPal uses
const API_KEY = 'DEMO_KEY' // Free key — works immediately, 1000 req/day

export async function searchUSDA(query) {
  if (!query || query.length < 2) return []
  try {
    const res = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=25&api_key=${API_KEY}`
    )
    if (!res.ok) throw new Error('USDA API error')
    const data = await res.json()

    return (data.foods || []).map(food => {
      const nutrients = food.foodNutrients || []
      const get = (name) => {
        const n = nutrients.find(n =>
          n.nutrientName?.toLowerCase().includes(name.toLowerCase()) ||
          n.name?.toLowerCase().includes(name.toLowerCase())
        )
        return Math.round(n?.value || n?.amount || 0)
      }

      return {
        id:       `usda_${food.fdcId}`,
        name:     food.description,
        brand:    food.brandOwner || food.brandName || '',
        cal:      get('energy') || get('calorie'),
        p:        get('protein'),
        c:        get('carbohydrate'),
        f:        get('total fat') || get('fat'),
        fiber:    get('fiber'),
        serving:  food.servingSize ? `${food.servingSize}${food.servingSizeUnit || 'g'}` : '100g',
        servingG: food.servingSize || 100,
        category: 'USDA',
        source:   'usda',
      }
    }).filter(f => f.cal > 0 || f.p > 0)
  } catch(err) {
    console.error('USDA search error:', err)
    return []
  }
}

export async function getFoodDetails(fdcId) {
  try {
    const res = await fetch(
      `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${API_KEY}`
    )
    if (!res.ok) throw new Error('Not found')
    return await res.json()
  } catch(err) {
    return null
  }
}
