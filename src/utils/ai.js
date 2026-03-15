async function callAI(messages, system = "", maxTokens = 2500) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": import.meta.env.VITE_ANTHROPIC_KEY, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
    body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: maxTokens, system, messages }),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.error?.message || `API error ${res.status} — add your key to .env`);
  }
  const data = await res.json();
  return data.content[0].text;
}

function extractJSON(text) {
  const block = text.match(/```json[\n\r]+([\s\S]*?)```/);
  if (block) return JSON.parse(block[1]);
  const brace = text.match(/{[\s\S]*}/);
  if (brace) return JSON.parse(brace[0]);
  throw new Error("Could not parse AI response — try again.");
}

export async function generateWorkoutPlan(user, config) {
  const { splitName, daysPerWeek, equipment, experience, splitDays } = config;
  const days = splitDays.slice(0, daysPerWeek);
  const sys = "You are a certified personal trainer. Respond with ONLY valid JSON. No markdown, no extra text.";
  const dayEntries = days.map((d, i) =>
    `"day${i + 1}": { "name": "${d}", "type": "Strength", "duration": 55, "exercises": [{"name":"Squat","muscle":"Quads","sets":4,"reps":"8-10","rest":"90s","notes":"Keep chest up"}], "warmup": "5 min cardio + dynamic stretch", "cooldown": "Static stretching 5 min" }`
  ).join(", ");
  const prompt = `Create a complete ${daysPerWeek}-day ${splitName} program.
Athlete: Name=${user.name}, Goal=${user.goal}, Experience=${experience}, Equipment=${equipment}
Days: ${days.join(" | ")}

Return ONLY this JSON with real exercises for every day:
{ "planName": "${splitName} Program", "split": "${splitName}", "daysPerWeek": ${daysPerWeek}, "workouts": { ${dayEntries} } }

Replace the placeholder exercises with 5-7 real exercises appropriate for ${experience} level and ${user.goal}. Every exercise needs: name, muscle, sets, reps, rest, notes.`;
  const text = await callAI([{ role: "user", content: prompt }], sys, 4000);
  return extractJSON(text);
}

export async function adjustWorkout(workout, request) {
  const sys = "You are a personal trainer. Modify workouts based on requests. Respond with ONLY valid JSON matching the exact same structure as the input.";
  const prompt = `Modify this workout: "${request}"

Current workout:
${JSON.stringify(workout, null, 2)}

Return the complete modified workout JSON only. No extra text.`;
  const text = await callAI([{ role: "user", content: prompt }], sys, 2000);
  return extractJSON(text);
}

export async function analyzePhysique(data) {
  const sys = "You are an elite physique coach. Respond with ONLY valid JSON. No markdown or extra text outside the JSON.";
  const prompt = `Analyze this athlete and provide a detailed physique assessment:

Age: ${data.age} | Gender: ${data.gender} | Height: ${data.height} | Weight: ${data.weight} lbs
Body Fat: ${data.bodyFat}% | Experience: ${data.experience} | Goal: ${data.goal}
Current lifts: ${data.lifts || "Not provided"} | Problem areas: ${data.problemAreas || "None"}
Notes: ${data.notes || "None"}

Return ONLY this JSON structure with specific, actionable content:
{
  "overallScore": 72,
  "bodyFatCategory": "Athletic",
  "summary": "2-3 sentence honest assessment of current physique and potential",
  "strengths": ["specific strength 1", "specific strength 2", "specific strength 3"],
  "improvements": ["specific improvement area 1", "specific improvement area 2", "specific improvement area 3"],
  "exerciseRecommendations": [
    {"name": "Exercise Name", "sets": "3x10", "reason": "why this helps their specific goal"},
    {"name": "Exercise 2", "sets": "4x8", "reason": "specific reason"},
    {"name": "Exercise 3", "sets": "3x12", "reason": "specific reason"},
    {"name": "Exercise 4", "sets": "3x15", "reason": "specific reason"}
  ],
  "nutritionTips": ["specific tip 1", "specific tip 2", "specific tip 3"],
  "timelineEstimate": "realistic timeline to achieve their goal"
}`;
  const text = await callAI([{ role: "user", content: prompt }], sys, 1500);
  return extractJSON(text);
}

export async function chatWithCoach(history, message) {
  const sys = "You are VibeFit Pro AI coach. Give concise (2-3 sentences), specific, actionable fitness advice. Be direct and encouraging.";
  return await callAI([...history, { role: "user", content: message }], sys, 400);
}
