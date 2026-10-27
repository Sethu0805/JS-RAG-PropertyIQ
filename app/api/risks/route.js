import { load, save } from "@/lib/db";
import { generate } from "@/lib/gemini";
import { typeOf } from "@/lib/types";

const SYSTEM = `You are a property due-diligence analyst. Using ONLY the documents given, produce a JSON object. Return ONLY the JSON, no other text.
Each document is labelled with its type: seller_claim (least reliable), verified_legal (most reliable), independent_report. Page markers look like [p.2].
Shape:
{
 "glance": [ {"label":"Title status","value":"2-4 words","note":"one sentence","tone":"high|moderate|clear|missing"}, ... ],
 "risks": [ {"title":"...","category":"Legal|Financial|Locality|Society|Agreement|Missing information","severity":"High|Medium|Low|Missing","detail":"1-2 sentences with figures","source":"document file name","page":1,"action":"suggested next step"} ],
 "conflicts": [ {"title":"...","summary":"one sentence","claim":{"text":"short exact quote","source":"file name","page":1},"record":{"text":"short exact quote","source":"file name","page":1},"next":"what the buyer should do"} ],
 "nextSteps": ["3 to 5 short actions, most important first"]
}
"glance" must contain exactly these 6 labels in order: "Title status", "Liens & dues", "Zoning & approvals", "HOA / society", "Flood & environment", "Locality". If the documents say nothing about one, use value "Not documented", tone "missing".
Severity: High = serious problem; Medium = needs attention (every seller-claim conflict is at least Medium); Low = checked in a document and fine, never a problem or discrepancy; Missing = important information absent from the documents.
Rules: never invent facts or numbers; every next step must be supported by a document; do not repeat the same fact in several risks; "source" must be the exact file name; "conflicts" are every place a seller_claim document disagrees with a legal or independent document, including title, dues, maintenance, parking and flooding (empty array if none); also check any sale agreement for buyer-side risks (non-refundable token, deadlines, fees, brokerage), and note society rules, utilities and noise; add Missing items for absent key documents such as an occupancy certificate or approved plan; sort risks High first.`;

function parseJsonResponse(raw) {
  const candidates = [
    raw.trim(),
    raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)?.[1]?.trim(),
  ].filter(Boolean);

  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start >= 0 && end > start) candidates.push(raw.slice(start, end + 1));

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      // Try the next known response shape; malformed model output is handled below.
    }
  }
  throw new Error("The analysis service returned an invalid report. Please try again.");
}

export async function POST(req) {
  try {
    const { propertyId } = await req.json();
    const db = load();
    const property = db.properties.find((p) => p.id === propertyId);
    if (!property) return Response.json({ error: "Property not found." }, { status: 404 });
    const docs = db.documents.filter((d) => d.propertyId === propertyId);
    if (!docs.length) return Response.json({ error: "Upload a document first." }, { status: 400 });

    const text = docs
      .map((d) => `=== FILE: ${d.name} | TYPE: ${d.type || "verified_legal"} (${typeOf(d.type).label}) ===\n` + (d.chunks || []).map((c) => `[p.${c.page || 1}] ${c.text}`).join("\n"))
      .join("\n\n")
      .slice(0, 30000);

    const raw = await generate(SYSTEM, [{ role: "user", text }], { responseMimeType: "application/json", timeoutMs: 25000 });
    const parsed = parseJsonResponse(raw);
    const analysis = {
      glance: Array.isArray(parsed.glance) ? parsed.glance : [],
      risks: Array.isArray(parsed.risks) ? parsed.risks : [],
      conflicts: Array.isArray(parsed.conflicts) ? parsed.conflicts : [],
      nextSteps: Array.isArray(parsed.nextSteps) ? parsed.nextSteps : [],
      docCount: docs.length,
      createdAt: Date.now(),
    };
    db.analysis = db.analysis || {};
    db.analysis[propertyId] = analysis;
    save(db);
    return Response.json(analysis);
  } catch (e) {
    return Response.json({ error: "Could not build report: " + e.message }, { status: 500 });
  }
}
