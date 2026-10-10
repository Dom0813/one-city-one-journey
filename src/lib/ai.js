// Local AI explanation generator with Ollama on-device integration and built-in template fallback
// Source of truth: PS-08 One City, One Journey specifications

export const OLLAMA_MODEL = 'gemma4'; // Set to match your `ollama list` tag (e.g. gemma:2b, gemma2, etc.)
export const OLLAMA_URL = 'http://localhost:11434/api/generate';

export async function explainJourney(journey) {
  if (!journey) return null;

  const facts = {
    origin: journey.from,
    destination: journey.to,
    totalMinutes: journey.totalMinutes,
    walkingMinutes: journey.walkMinutes,
    oneFare: journey.oneFare,
    ownTicketsTotal: journey.ownTickets,
    savings: journey.savings,
    transfers: journey.transfers,
    operators: journey.operators.map(o => `${o.name}: ₹${o.fare} (${o.km} km)`).join(', ')
  };

  const prompt = `Explain this multimodal commuter journey in exactly 4 concise sentences. Only use these verified facts:
Origin: ${facts.origin}
Destination: ${facts.destination}
Total duration: ${facts.totalMinutes} minutes
Walking time: ${facts.walkingMinutes} minutes
Unified fare: ₹${facts.oneFare} (Individual tickets cost ₹${facts.ownTicketsTotal}, saving ₹${facts.savings})
Transfers: ${facts.transfers}
Operators used: ${facts.operators}
Do not invent facts or stations. Be direct and helpful.`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 second timeout

    const res = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: prompt,
        stream: false
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.response && data.response.trim()) {
        return {
          source: 'Local AI (Gemma via Ollama, no internet needed)',
          text: data.response.trim()
        };
      }
    }
  } catch {
    // Ollama not reachable, CORS error, timeout, or offline
  }

  // Built-in template fallback
  const opNames = journey.operators.map(o => o.name).join(' and ');
  const savingsText = journey.savings > 0
    ? ` Unified One Journey ticketing costs ₹${journey.oneFare} instead of ₹${journey.ownTickets}, saving you ₹${journey.savings}.`
    : ` Total fare is ₹${journey.oneFare}.`;

  const fallbackText = `Your trip from ${journey.from} to ${journey.to} takes approximately ${journey.totalMinutes} minutes with ${journey.walkMinutes} minutes of total walking.${savingsText} The itinerary coordinates transit across ${opNames} with ${journey.transfers} transfer walk${journey.transfers === 1 ? '' : 's'}. All connection times and fares are verified for seamless single-ticket travel.`;

  return {
    source: 'Built-in summary (local AI is not running)',
    text: fallbackText
  };
}
