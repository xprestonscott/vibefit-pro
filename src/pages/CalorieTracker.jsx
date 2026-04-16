import { useState, useEffect, useRef } from 'react'
import { Plus, X, Search, ChevronDown, ChevronUp, Minus, Sparkles, Camera, Mic } from 'lucide-react'
import { getGoalFromStorage, saveGoalToStorage, calculateMacros } from '../utils/calories'
import { storage, KEYS } from '../utils/storage'
import { searchUSDA } from '../utils/usdaApi'
import { searchFoods } from '../utils/foodDatabase'
import MealScanner from '../components/MealScanner'

var MEALS = [
  { id: 'breakfast', label: 'Breakfast', icon: '\uD83C\uDF05' },
  { id: 'lunch',     label: 'Lunch',     icon: '\u2600\uFE0F' },
  { id: 'dinner',    label: 'Dinner',    icon: '\uD83C\uDF19' },
  { id: 'snacks',    label: 'Snacks',    icon: '\uD83C\uDF4E' },
]

function getGoal() {
  var g = getGoalFromStorage()
  return {
    calories: g.calories || 2400,
    protein:  (g.macros ? g.macros.protein : null) || 180,
    carbs:    (g.macros ? g.macros.carbs   : null) || 260,
    fat:      (g.macros ? g.macros.fat     : null) || 70,
  }
}

function getRecent() {
  try { return JSON.parse(localStorage.getItem('vf_recent_v3') || '[]') } catch(e) { return [] }
}

function addToRecent(food) {
  var list = getRecent().filter(function(f) { return f.name !== food.name }).slice(0, 29)
  list.unshift(Object.assign({}, food, { usedAt: Date.now() }))
  localStorage.setItem('vf_recent_v3', JSON.stringify(list))
}

function getSuggestions(goal, remaining) {
  var all = [
    { name: 'Greek Yogurt 1 cup', cal: 130, p: 22, c: 9,  f: 0,  reason: 'High protein boost' },
    { name: 'Chicken Breast 6oz', cal: 280, p: 52, c: 0,  f: 6,  reason: 'Lean muscle fuel' },
    { name: 'Banana',             cal: 105, p: 1,  c: 27, f: 0,  reason: 'Quick energy carbs' },
    { name: 'Almonds 1oz',        cal: 164, p: 6,  c: 6,  f: 14, reason: 'Healthy fats' },
    { name: 'Oatmeal 1 cup',      cal: 166, p: 6,  c: 28, f: 4,  reason: 'Steady energy' },
    { name: 'Eggs 2 large',       cal: 144, p: 12, c: 1,  f: 10, reason: 'Complete protein' },
    { name: 'Protein Shake',      cal: 120, p: 25, c: 3,  f: 2,  reason: 'Hit your protein goal' },
    { name: 'Brown Rice 1 cup',   cal: 216, p: 5,  c: 45, f: 2,  reason: 'Complex carbs' },
  ]
  return all.filter(function(f) {
    if (remaining.cal < 100 && f.cal > 200) return false
    return true
  }).slice(0, 3)
}

function FoodModal(props) {
  var activeMeal   = props.activeMeal
  var onAdd        = props.onAdd
  var onClose      = props.onClose

  var tabState     = useState(activeMeal || 'breakfast')
  var activeTab    = tabState[0]
  var setActiveTab = tabState[1]

  var queryState   = useState('')
  var query        = queryState[0]
  var setQuery     = queryState[1]

  var resultsState = useState([])
  var results      = resultsState[0]
  var setResults   = resultsState[1]

  var loadingState = useState(false)
  var loading      = loadingState[0]
  var setLoading   = loadingState[1]

  var selectedState = useState(null)
  var selected      = selectedState[0]
  var setSelected   = selectedState[1]

  var servingsState = useState('1')
  var servings      = servingsState[0]
  var setServings   = servingsState[1]

  var unitState     = useState('serving')
  var unit          = unitState[0]
  var setUnit       = unitState[1]

  var viewState     = useState('search')
  var view          = viewState[0]
  var setView       = viewState[1]

  var aiTextState   = useState('')
  var aiText        = aiTextState[0]
  var setAiText     = aiTextState[1]

  var aiLoadState   = useState(false)
  var aiLoading     = aiLoadState[0]
  var setAiLoading  = aiLoadState[1]

  var aiResultState = useState([])
  var aiResults     = aiResultState[0]
  var setAiResults  = aiResultState[1]

  var feedbackState = useState(null)
  var feedback      = feedbackState[0]
  var setFeedback   = feedbackState[1]

  var inputRef      = useRef()
  var debounceRef   = useRef()
  var recent        = getRecent()
  var mult          = parseFloat(servings) || 1

  useEffect(function() {
    setTimeout(function() {
      if (inputRef.current) inputRef.current.focus()
    }, 150)
  }, [])

  useEffect(function() {
    if (query.length < 2) {
      setResults([])
      return
    }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(function() {
      setLoading(true)
      var local = searchFoods(query)
      setResults(local)
      searchUSDA(query).then(function(usda) {
        var merged = local.slice()
        usda.forEach(function(u) {
          if (!merged.find(function(l) { return l.name.toLowerCase() === u.name.toLowerCase() })) {
            merged.push(u)
          }
        })
        setResults(merged.slice(0, 40))
        setLoading(false)
      }).catch(function() {
        setLoading(false)
      })
    }, 400)
    return function() { clearTimeout(debounceRef.current) }
  }, [query])

  function handleSelect(food) {
    setSelected(food)
    setUnit(food.serving || 'serving')
    setServings('1')
  }

  function handleAdd(foodToAdd) {
    var f = foodToAdd || selected
    if (!f) return
    var m = mult
    var entry = {
      id:          Date.now() + Math.random(),
      name:        f.name + (f.brand ? ' (' + f.brand + ')' : ''),
      cal:         Math.round((f.cal || 0) * m),
      p:           Math.round((f.p   || 0) * m),
      c:           Math.round((f.c   || 0) * m),
      f:           Math.round((f.f   || 0) * m),
      servings:    m,
      servingUnit: unit,
      logged:      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    addToRecent(f)
    onAdd(activeTab, entry)
    setFeedback('+' + entry.cal + ' kcal added to ' + MEALS.find(function(x) { return x.id === activeTab }).label)
    setTimeout(function() { setFeedback(null) }, 2500)
    setSelected(null)
    setQuery('')
    setResults([])
    setServings('1')
    if (inputRef.current) inputRef.current.focus()
  }

  function handleAIParse() {
    if (!aiText.trim()) return
    setAiLoading(true)
    fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 800,
        system: 'Parse food descriptions into JSON. Return ONLY a JSON array, no markdown.',
        messages: [{
          role: 'user',
          content: 'Parse this into foods with nutrition: "' + aiText + '". Return: [{"name":"...","calories":0,"protein":0,"carbs":0,"fat":0}]'
        }]
      })
    }).then(function(r) { return r.json() }).then(function(data) {
      var text  = data.content[0].text
      var clean = text.replace(/```json|```/g, '').trim()
      var parsed = JSON.parse(clean)
      setAiResults(Array.isArray(parsed) ? parsed : [parsed])
      setAiLoading(false)
    }).catch(function() {
      setAiLoading(false)
    })
  }

  function handleAddAllAI() {
    aiResults.forEach(function(food) {
      onAdd(activeTab, {
        id:      Date.now() + Math.random(),
        name:    food.name,
        cal:     Number(food.calories) || 0,
        p:       Number(food.protein)  || 0,
        c:       Number(food.carbs)    || 0,
        f:       Number(food.fat)      || 0,
        logged:  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        aiParsed: true,
      })
    })
    setAiResults([])
    setAiText('')
    setView('search')
  }

  var display = query.length >= 2 ? results : recent.slice(0, 12)
  var mealObj = MEALS.find(function(m) { return m.id === activeTab })
  var mealLabel = mealObj ? mealObj.label : activeTab

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(8,8,16,.97)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'flex-end' }}
      onClick={onClose}
    >
      <div
        style={{ background: '#0D0D1A', borderRadius: '24px 24px 0 0', width: '100%', maxHeight: '94vh', display: 'flex', flexDirection: 'column', border: '1px solid #1E1E35', borderBottom: 'none', overflow: 'hidden', boxShadow: '0 -8px 40px rgba(0,0,0,.6)' }}
        onClick={function(e) { e.stopPropagation() }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 0' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#2A2A45', cursor: 'pointer' }} onClick={onClose}/>
        </div>

        {feedback && (
          <div style={{ margin: '8px 20px 0', padding: '10px 16px', background: 'rgba(57,255,20,.12)', border: '1px solid rgba(57,255,20,.3)', borderRadius: 10, fontSize: 13, color: '#39FF14', fontWeight: 600, textAlign: 'center', animation: 'fadeIn .3s ease' }}>
            {feedback}
          </div>
        )}

        <div style={{ padding: '12px 20px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>Log Food</div>
            <button onClick={onClose} style={{ background: '#1A1A2E', border: '1px solid #252540', borderRadius: 10, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6B6B8A' }}>
              <X size={16}/>
            </button>
          </div>

          <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto', paddingBottom: 2 }}>
            {MEALS.map(function(m) {
              var active = activeTab === m.id
              return (
                <button
                  key={m.id}
                  onClick={function() { setActiveTab(m.id) }}
                  style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 20, border: '1px solid ' + (active ? 'rgba(57,255,20,.5)' : '#252540'), background: active ? 'rgba(57,255,20,.1)' : 'transparent', color: active ? '#39FF14' : '#6B6B8A', cursor: 'pointer', fontSize: 13, fontWeight: active ? 700 : 400, whiteSpace: 'nowrap', transition: 'all .2s' }}
                >
                  <span>{m.icon}</span> {m.label}
                </button>
              )
            })}
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {[
              { id: 'search',  icon: '🔍', label: 'Search' },
              { id: 'ai',      icon: '✨', label: 'AI Parse' },
              { id: 'recent',  icon: '🕐', label: 'Recent' },
            ].map(function(v) {
              return (
                <button
                  key={v.id}
                  onClick={function() { setView(v.id) }}
                  style={{ flex: 1, padding: '8px', borderRadius: 10, border: '1px solid ' + (view === v.id ? 'rgba(57,255,20,.4)' : '#252540'), background: view === v.id ? 'rgba(57,255,20,.08)' : '#141422', color: view === v.id ? '#39FF14' : '#6B6B8A', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
                >
                  {v.icon} {v.label}
                </button>
              )
            })}
          </div>

          {view === 'search' && (
            <div style={{ position: 'relative', marginBottom: 10 }}>
              <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#6B6B8A', pointerEvents: 'none' }}/>
              {loading && (
                <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, border: '2px solid #252540', borderTopColor: '#39FF14', borderRadius: '50%', animation: 'spin 1s linear infinite' }}/>
              )}
              {query.length > 0 && (
                <button
                  onClick={function() { setQuery(''); setResults([]); if (inputRef.current) inputRef.current.focus() }}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: '#252540', border: 'none', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6B6B8A' }}
                >
                  <X size={11}/>
                </button>
              )}
              <input
                ref={inputRef}
                className="vf-input"
                style={{ paddingLeft: 42, paddingRight: 40, fontSize: 15 }}
                placeholder="Search any food — chicken, oreo, big mac..."
                value={query}
                onChange={function(e) { setQuery(e.target.value) }}
              />
            </div>
          )}

          {view === 'search' && query.length === 0 && (
            <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 8 }}>
              {['Chicken', 'Rice', 'Eggs', 'Shake', 'Oatmeal', 'Banana', 'Steak', 'Pizza', 'Big Mac', 'Oreo'].map(function(q) {
                return (
                  <button
                    key={q}
                    onClick={function() { setQuery(q) }}
                    style={{ flexShrink: 0, fontSize: 11, padding: '4px 10px', borderRadius: 20, border: '1px solid #252540', background: '#141422', color: '#6B6B8A', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    onMouseEnter={function(e) { e.currentTarget.style.borderColor = '#39FF14'; e.currentTarget.style.color = '#39FF14' }}
                    onMouseLeave={function(e) { e.currentTarget.style.borderColor = '#252540'; e.currentTarget.style.color = '#6B6B8A' }}
                  >
                    {q}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 20px' }}>
          {view === 'ai' && (
            <div style={{ paddingTop: 8 }}>
              <div style={{ fontSize: 13, color: '#6B6B8A', marginBottom: 10 }}>
                Describe your meal and AI will log everything instantly
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                {['2 eggs and toast', 'Big Mac with fries', 'Protein shake and banana'].map(function(ex) {
                  return (
                    <button
                      key={ex}
                      onClick={function() { setAiText(ex) }}
                      style={{ flexShrink: 0, fontSize: 11, padding: '4px 10px', borderRadius: 20, border: '1px solid #252540', background: '#141422', color: '#6B6B8A', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      {ex}
                    </button>
                  )
                })}
              </div>
              <textarea
                className="vf-input"
                style={{ width: '100%', minHeight: 70, resize: 'vertical', fontSize: 14, lineHeight: 1.6, marginBottom: 10 }}
                placeholder="e.g. 2 scrambled eggs with avocado toast and a protein shake"
                value={aiText}
                onChange={function(e) { setAiText(e.target.value) }}
              />
              {!aiResults.length && (
                <button
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', fontSize: 14, padding: '12px', background: 'linear-gradient(135deg,#8B5CF6,#6D28D9)' }}
                  disabled={!aiText.trim() || aiLoading}
                  onClick={handleAIParse}
                >
                  {aiLoading ? 'Analyzing...' : '✨ Parse with AI'}
                </button>
              )}
              {aiResults.length > 0 && (
                <div>
                  {aiResults.map(function(food, i) {
                    return (
                      <div key={i} style={{ background: 'rgba(139,92,246,.08)', border: '1px solid rgba(139,92,246,.2)', borderRadius: 12, padding: '12px 14px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>{food.name}</div>
                          <div style={{ fontSize: 11, color: '#6B6B8A' }}>P:{food.protein}g C:{food.carbs}g F:{food.fat}g</div>
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#8B5CF6' }}>{food.calories}</div>
                      </div>
                    )
                  })}
                  <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                    <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={function() { setAiResults([]); setAiText('') }}>
                      Retry
                    </button>
                    <button
                      className="btn-primary"
                      style={{ flex: 2, justifyContent: 'center', background: 'linear-gradient(135deg,#8B5CF6,#6D28D9)' }}
                      onClick={handleAddAllAI}
                    >
                      Add All to {mealLabel}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {(view === 'search' || view === 'recent') && (
            <div>
              {view === 'recent' && recent.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px 0', color: '#6B6B8A' }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>&#128269;</div>
                  <div style={{ fontSize: 14 }}>No recent foods yet</div>
                  <div style={{ fontSize: 12, marginTop: 6 }}>Foods you log will appear here</div>
                </div>
              )}

              {view === 'search' && query.length === 0 && recent.length === 0 && (
                <div style={{ textAlign: 'center', padding: '24px 0', color: '#6B6B8A' }}>
                  <div style={{ fontSize: 14 }}>Search for any food above</div>
                </div>
              )}

              {view === 'search' && query.length >= 2 && results.length === 0 && !loading && (
                <div style={{ textAlign: 'center', padding: '24px 0', color: '#6B6B8A', fontSize: 13 }}>
                  No results for "{query}"
                </div>
              )}

              {display.map(function(food, i) {
                var isSel = selected && selected.name === food.name
                return (
                  <div
                    key={food.id || i}
                    style={{ display: 'flex', alignItems: 'center', padding: '11px 12px', borderRadius: 12, cursor: 'pointer', background: isSel ? 'rgba(57,255,20,.08)' : 'transparent', border: '1px solid ' + (isSel ? 'rgba(57,255,20,.3)' : 'transparent'), marginBottom: 3, transition: 'all .15s' }}
                    onMouseEnter={function(e) { if (!isSel) e.currentTarget.style.background = '#141422' }}
                    onMouseLeave={function(e) { if (!isSel) e.currentTarget.style.background = 'transparent' }}
                    onClick={function() { handleSelect(food) }}
                  >
                    <div style={{ flex: 1, minWidth: 0, paddingRight: 10 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: isSel ? '#39FF14' : '#F0F0FF' }}>
                        {food.name}
                      </div>
                      <div style={{ fontSize: 11, color: '#6B6B8A', marginTop: 2 }}>
                        {food.brand && <span style={{ color: '#00E5FF', marginRight: 6 }}>{food.brand}</span>}
                        P:{food.p}g C:{food.c}g F:{food.f}g
                        {food.serving && <span style={{ marginLeft: 6 }}>· {food.serving}</span>}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: isSel ? '#39FF14' : '#F0F0FF' }}>{food.cal}</div>
                      <div style={{ fontSize: 9, color: '#6B6B8A' }}>kcal</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div style={{ padding: '12px 20px 28px', borderTop: '1px solid #1E1E35', flexShrink: 0, background: '#080810' }}>
          {selected ? (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#F0F0FF' }}>
                {selected.name}
              </div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 10, color: '#6B6B8A', fontWeight: 600, letterSpacing: '.5px', display: 'block', marginBottom: 4 }}>SERVINGS</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={function() { setServings(function(s) { return String(Math.max(0.25, parseFloat(s) - 0.25)) }) }}
                      style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #252540', background: '#141422', color: '#F0F0FF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                    >
                      <Minus size={14}/>
                    </button>
                    <input
                      type="number"
                      className="vf-input"
                      style={{ flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 800, padding: '8px' }}
                      value={servings}
                      min="0.25"
                      step="0.25"
                      onChange={function(e) { setServings(e.target.value) }}
                    />
                    <button
                      onClick={function() { setServings(function(s) { return String(parseFloat(s) + 0.25) }) }}
                      style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(57,255,20,.3)', background: 'rgba(57,255,20,.08)', color: '#39FF14', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                    >
                      <Plus size={14}/>
                    </button>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 10, color: '#6B6B8A', fontWeight: 600, letterSpacing: '.5px', display: 'block', marginBottom: 4 }}>UNIT</label>
                  <input
                    type="text"
                    className="vf-input"
                    value={unit}
                    onChange={function(e) { setUnit(e.target.value) }}
                    placeholder="serving, cup, oz..."
                    style={{ fontSize: 13 }}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 12 }}>
                {[
                  { l: 'Cal',    v: Math.round((selected.cal || 0) * mult),   c: '#39FF14' },
                  { l: 'Protein',v: Math.round((selected.p   || 0) * mult) + 'g', c: '#39FF14' },
                  { l: 'Carbs',  v: Math.round((selected.c   || 0) * mult) + 'g', c: '#00E5FF' },
                  { l: 'Fat',    v: Math.round((selected.f   || 0) * mult) + 'g', c: '#FF6B35' },
                ].map(function(m) {
                  return (
                    <div key={m.l} style={{ background: '#141422', borderRadius: 10, padding: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: m.c }}>{m.v}</div>
                      <div style={{ fontSize: 9, color: '#6B6B8A' }}>{m.l}</div>
                    </div>
                  )
                })}
              </div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                {[0.5, 1, 1.5, 2, 3].map(function(s) {
                  var active = parseFloat(servings) === s
                  return (
                    <button
                      key={s}
                      onClick={function() { setServings(String(s)) }}
                      style={{ flex: 1, padding: '6px', borderRadius: 20, fontSize: 12, border: '1px solid ' + (active ? 'rgba(57,255,20,.4)' : '#252540'), background: active ? 'rgba(57,255,20,.08)' : '#141422', color: active ? '#39FF14' : '#6B6B8A', cursor: 'pointer' }}
                    >
                      {s}x
                    </button>
                  )
                })}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={function() { setSelected(null) }}>
                  Back
                </button>
                <button
                  className="btn-primary"
                  style={{ flex: 2, justifyContent: 'center', fontSize: 14, padding: '13px' }}
                  onClick={function() { handleAdd(null) }}
                >
                  <Plus size={14}/> Add to {mealLabel}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 10 }}>
              <MealScanner meal={activeTab} onFoodAdded={onAdd}/>
              <button
                className="btn-ghost"
                style={{ flex: 1, justifyContent: 'center', fontSize: 13 }}
                onClick={onClose}
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CalorieTracker() {
  var today = new Date().toISOString().split('T')[0]

  var logState    = useState(function() {
    var s = storage.get(KEYS.FOOD_LOG)
    return (s && s[today]) || { breakfast: [], lunch: [], dinner: [], snacks: [] }
  })
  var log    = logState[0]
  var setLog = logState[1]

  var modalState  = useState(null)
  var modal    = modalState[0]
  var setModal = modalState[1]

  var showLogState = useState(false)
  var showLog    = showLogState[0]
  var setShowLog = showLogState[1]

  var showGoalState = useState(false)
  var showGoalEditor    = showGoalState[0]
  var setShowGoalEditor = showGoalState[1]

  var customCalState = useState(function() { return getGoalFromStorage().calories })
  var customCal    = customCalState[0]
  var setCustomCal = customCalState[1]

  var goalSavedState = useState(false)
  var goalSaved    = goalSavedState[0]
  var setGoalSaved = goalSavedState[1]

  var mobileState = useState(window.innerWidth < 768)
  var isMobile    = mobileState[0]
  var setIsMobile = mobileState[1]

  useEffect(function() {
    function fn() { setIsMobile(window.innerWidth < 768) }
    window.addEventListener('resize', fn)
    return function() { window.removeEventListener('resize', fn) }
  }, [])

  function saveLog(newLog) {
    setLog(newLog)
    var all = storage.get(KEYS.FOOD_LOG) || {}
    all[today] = newLog
    storage.set(KEYS.FOOD_LOG, all)
  }

  function addFood(meal, food) {
    if (!meal || !food) return
    var newLog = {
      breakfast: log.breakfast.slice(),
      lunch:     log.lunch.slice(),
      dinner:    log.dinner.slice(),
      snacks:    log.snacks.slice(),
    }
    newLog[meal] = newLog[meal].concat([food])
    saveLog(newLog)
  }

  function removeFood(meal, idx) {
    var newLog = {
      breakfast: log.breakfast.slice(),
      lunch:     log.lunch.slice(),
      dinner:    log.dinner.slice(),
      snacks:    log.snacks.slice(),
    }
    newLog[meal] = newLog[meal].filter(function(_, i) { return i !== idx })
    saveLog(newLog)
  }

  function saveGoalFn(cal) {
    var macros = calculateMacros(Number(cal), null, null)
    saveGoalToStorage(Number(cal), macros)
    setCustomCal(cal)
    setGoalSaved(true)
    setTimeout(function() { setGoalSaved(false) }, 2000)
  }

  function clearDay() {
    if (window.confirm('Clear all food logged today?')) {
      saveLog({ breakfast: [], lunch: [], dinner: [], snacks: [] })
    }
  }

  var GOAL      = getGoal()
  var allFoods  = log.breakfast.concat(log.lunch, log.dinner, log.snacks)
  var totalCal  = allFoods.reduce(function(a, f) { return a + (f.cal || 0) }, 0)
  var totalP    = allFoods.reduce(function(a, f) { return a + (f.p   || 0) }, 0)
  var totalC    = allFoods.reduce(function(a, f) { return a + (f.c   || 0) }, 0)
  var totalF    = allFoods.reduce(function(a, f) { return a + (f.f   || 0) }, 0)
  var remaining = GOAL.calories - totalCal

  return (
    <div>
      {modal !== null && (
        <FoodModal
          activeMeal={modal}
          onAdd={addFood}
          onClose={function() { setModal(null) }}
        />
      )}

      <div className="anim-up" style={{ marginBottom: 20 }}>
        <h1 className="font-display" style={{ fontSize: isMobile ? 36 : 48, margin: 0 }}>
          NUTRITION <span className="gradient-text">TRACKER</span>
        </h1>
        <p style={{ color: '#6B6B8A', marginTop: 6, fontSize: 13 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {showGoalEditor && (
        <div style={{ background: '#141422', border: '1px solid rgba(57,255,20,.2)', borderRadius: 14, padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Daily Calorie Goal</div>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B6B8A' }} onClick={function() { setShowGoalEditor(false) }}>
              <X size={16}/>
            </button>
          </div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <input
              type="number"
              className="vf-input"
              value={customCal}
              onChange={function(e) { setCustomCal(e.target.value) }}
              style={{ flex: 1, fontSize: 18, fontWeight: 800, textAlign: 'center' }}
              placeholder="e.g. 2200"
            />
            <button
              className={goalSaved ? 'btn-primary' : 'btn-ghost'}
              style={{ padding: '10px 20px', flexShrink: 0 }}
              onClick={function() { saveGoalFn(customCal) }}
            >
              {goalSaved ? 'Saved!' : 'Save'}
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {[1500, 1800, 2000, 2200, 2400, 2600, 2800, 3000, 3200, 3500].map(function(c) {
              return (
                <button
                  key={c}
                  onClick={function() { setCustomCal(c) }}
                  style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid ' + (Number(customCal) === c ? 'rgba(57,255,20,.4)' : '#252540'), background: Number(customCal) === c ? 'rgba(57,255,20,.08)' : '#141422', color: Number(customCal) === c ? '#39FF14' : '#6B6B8A', cursor: 'pointer', fontSize: 12 }}
                >
                  {c}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div style={{ background: '#141422', border: '1px solid #252540', borderRadius: 14, padding: '18px 20px', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <span style={{ fontSize: isMobile ? 32 : 42, fontWeight: 900, color: remaining < 0 ? '#FF6B35' : '#F0F0FF' }}>{totalCal}</span>
            <span style={{ fontSize: 13, color: '#6B6B8A', marginLeft: 6 }}>/ {GOAL.calories} kcal</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: remaining > 0 ? '#39FF14' : '#FF6B35' }}>
              {remaining > 0 ? remaining + ' left' : Math.abs(remaining) + ' over'}
            </div>
            <button className="btn-ghost" style={{ fontSize: 11, padding: '5px 10px' }} onClick={function() { setShowGoalEditor(function(v) { return !v }) }}>
              Edit Goal
            </button>
          </div>
        </div>
        <div style={{ height: 8, background: '#252540', borderRadius: 4, overflow: 'hidden', marginBottom: 14 }}>
          <div style={{ height: '100%', width: Math.min((totalCal / GOAL.calories) * 100, 100) + '%', background: remaining < 0 ? '#FF6B35' : 'linear-gradient(90deg,#39FF14,#00C851)', borderRadius: 4, transition: 'width 1s ease' }}/>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
          {[
            { l: 'Protein', v: totalP, g: GOAL.protein, c: '#39FF14' },
            { l: 'Carbs',   v: totalC, g: GOAL.carbs,   c: '#00E5FF' },
            { l: 'Fat',     v: totalF, g: GOAL.fat,      c: '#FF6B35' },
          ].map(function(m) {
            return (
              <div key={m.l} style={{ textAlign: 'center', padding: '10px', background: '#1C1C2E', borderRadius: 10 }}>
                <div style={{ fontSize: isMobile ? 16 : 18, fontWeight: 800, color: m.c }}>{m.v}g</div>
                <div style={{ fontSize: 10, color: '#6B6B8A' }}>{m.l} / {m.g}g</div>
                <div style={{ height: 3, background: '#252540', borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: Math.min((m.v / m.g) * 100, 100) + '%', background: m.c, borderRadius: 2 }}/>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {allFoods.length > 0 && (
        <div style={{ background: '#141422', border: '1px solid #252540', borderRadius: 14, marginBottom: 16, overflow: 'hidden' }}>
          <button
            style={{ width: '100%', padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#F0F0FF' }}
            onClick={function() { setShowLog(function(v) { return !v }) }}
          >
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Today's Full Log</div>
              <div style={{ fontSize: 11, color: '#6B6B8A' }}>{allFoods.length} items · {totalCal} kcal</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={function(e) { e.stopPropagation(); clearDay() }}
                style={{ background: 'rgba(255,107,53,.1)', border: '1px solid rgba(255,107,53,.3)', borderRadius: 6, padding: '4px 10px', color: '#FF6B35', cursor: 'pointer', fontSize: 11 }}
              >
                Clear
              </button>
              {showLog
                ? <ChevronUp size={16} style={{ color: '#6B6B8A' }}/>
                : <ChevronDown size={16} style={{ color: '#6B6B8A' }}/>
              }
            </div>
          </button>
          {showLog && (
            <div style={{ borderTop: '1px solid #252540', maxHeight: 360, overflowY: 'auto' }}>
              {MEALS.map(function(m) {
                var foods = log[m.id]
                if (!foods || foods.length === 0) return null
                return (
                  <div key={m.id}>
                    <div style={{ padding: '8px 16px', background: 'rgba(37,37,64,.4)', fontSize: 11, color: '#6B6B8A', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                      <span>{m.icon} {m.label.toUpperCase()}</span>
                      <span>{foods.reduce(function(a, f) { return a + (f.cal || 0) }, 0)} kcal</span>
                    </div>
                    {foods.map(function(food, i) {
                      return (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid rgba(37,37,64,.4)' }}>
                          <div style={{ flex: 1, minWidth: 0, paddingRight: 10 }}>
                            <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{food.name}</div>
                            <div style={{ fontSize: 10, color: '#6B6B8A' }}>{food.logged}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 800 }}>{food.cal}</div>
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B6B8A', padding: 4 }} onClick={function() { removeFood(m.id, i) }}>
                              <X size={13}/>
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {MEALS.map(function(m) {
          var mealFoods = log[m.id] || []
          var mealCal   = mealFoods.reduce(function(a, f) { return a + (f.cal || 0) }, 0)
          return (
            <div key={m.id} style={{ background: '#141422', border: '1px solid #252540', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: mealFoods.length > 0 ? '1px solid #252540' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{m.icon}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{m.label}</div>
                    <div style={{ fontSize: 11, color: '#6B6B8A' }}>{mealCal} kcal · {mealFoods.length} items</div>
                  </div>
                </div>
                <button
                  className="btn-primary"
                  style={{ padding: '8px 16px', fontSize: 13 }}
                  onClick={function() { setModal(m.id) }}
                >
                  <Plus size={14}/> Add Food
                </button>
              </div>
              {mealFoods.length === 0 && (
                <div style={{ padding: '14px', textAlign: 'center', color: '#6B6B8A', fontSize: 13 }}>
                  Nothing logged yet
                </div>
              )}
              {mealFoods.map(function(food, i) {
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: i < mealFoods.length - 1 ? '1px solid rgba(37,37,64,.4)' : 'none' }}>
                    <div style={{ flex: 1, minWidth: 0, paddingRight: 10 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{food.name}</div>
                      <div style={{ fontSize: 10, color: '#6B6B8A', marginTop: 1 }}>{food.logged}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
                      {!isMobile && (
                        <div style={{ display: 'flex', gap: 10 }}>
                          <div style={{ textAlign: 'center' }}><div style={{ fontSize: 11, color: '#39FF14', fontWeight: 700 }}>{food.p}g</div><div style={{ fontSize: 9, color: '#6B6B8A' }}>P</div></div>
                          <div style={{ textAlign: 'center' }}><div style={{ fontSize: 11, color: '#00E5FF', fontWeight: 700 }}>{food.c}g</div><div style={{ fontSize: 9, color: '#6B6B8A' }}>C</div></div>
                          <div style={{ textAlign: 'center' }}><div style={{ fontSize: 11, color: '#FF6B35', fontWeight: 700 }}>{food.f}g</div><div style={{ fontSize: 9, color: '#6B6B8A' }}>F</div></div>
                        </div>
                      )}
                      <div style={{ textAlign: 'center', minWidth: 40 }}>
                        <div style={{ fontSize: 15, fontWeight: 800 }}>{food.cal}</div>
                        <div style={{ fontSize: 9, color: '#6B6B8A' }}>kcal</div>
                      </div>
                      <button
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B6B8A', padding: 4 }}
                        onMouseEnter={function(e) { e.currentTarget.style.color = '#FF6B35' }}
                        onMouseLeave={function(e) { e.currentTarget.style.color = '#6B6B8A' }}
                        onClick={function() { removeFood(m.id, i) }}
                      >
                        <X size={14}/>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
