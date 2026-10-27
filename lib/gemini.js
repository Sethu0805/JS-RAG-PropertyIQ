// Talks to the Gemini REST API. Two jobs: turn text into numbers (embed) and write answers (generate).
const BASE = "https://generativelanguage.googleapis.com/v1beta";
const headers = () => ({ "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY });

export async function embed(texts) {
  const out = [];
  for (let i = 0; i < texts.length; i += 50) {
    const batch = texts.slice(i, i + 50);
    const res = await fetch(`${BASE}/models/gemini-embedding-001:batchEmbedContents`, {
      method: "POST", headers: headers(),
      body: JSON.stringify({ requests: batch.map((t) => ({ model: "models/gemini-embedding-001", content: { parts: [{ text: t }] }, outputDimensionality: 768 })) }),
    });
    if (!res.ok) throw new Error("Gemini embedding failed: " + (await res.text()));
    out.push(...(await res.json()).embeddings.map((e) => e.values));
  }
  return out;
}

// Retries when Gemini is busy (503/429), then tries a backup model.
export async function generate(system, turns, options = {}) {
  const models = [process.env.GEMINI_MODEL || "gemini-3.8-flash", process.env.GEMINI_FALLBACK_MODEL || "gemini-3.5-flash-lite"];
  let last = "";
  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 30000);
      let res;
      try {
        res = await fetch(`${BASE}/models/${model}:generateContent`, {
          method: "POST", headers: headers(), signal: controller.signal,
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: system }] },
            contents: turns.map((t) => ({ role: t.role, parts: [{ text: t.text }] })),
            ...(options.responseMimeType
              ? { generationConfig: { responseMimeType: options.responseMimeType, temperature: 0.1, maxOutputTokens: 4096 } }
              : {}),
          }),
        });
      } catch (error) {
        if (error.name === "AbortError") {
          last = `${model} timed out after ${options.timeoutMs || 30000}ms`;
          break;
        }
        throw error;
      } finally {
        clearTimeout(timeout);
      }
      if (res.ok) {
        const data = await res.json();
        return (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join("").trim();
      }
      last = await res.text();
      if (res.status !== 503 && res.status !== 429) throw new Error("Gemini generate failed: " + last);
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
    }
  }
  throw new Error("Gemini is busy right now. Please try again in a minute. " + last);
}
