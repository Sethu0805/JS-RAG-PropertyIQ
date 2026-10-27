import { load, save, newId } from "@/lib/db";
import { embed, generate } from "@/lib/gemini";
import { topChunks } from "@/lib/rag";
import { typeOf } from "@/lib/types";

const SYSTEM = `You are PropertyIQ, an evidence-led assistant that helps people check a property before buying.
Answer ONLY from the numbered excerpts below. Cite each fact like [S1] or [S1][S2].
Each excerpt is labelled with its authority: "Verified legal" documents are the most reliable, "Independent report" is next, "Seller claim" is the least reliable.
If a seller claim conflicts with a verified legal document, say so and treat the legal document as more reliable.
If the excerpts do not contain the answer, say "I couldn't find that in the uploaded documents." Do not guess.
Keep answers short and plain. This is a research aid, not legal or financial advice.`;

export async function POST(req) {
  try {
    const { propertyId, question } = await req.json();
    const db = load();
    const docs = db.documents.filter((d) => d.propertyId === propertyId);
    if (!docs.length) return Response.json({ error: "Upload a document first." }, { status: 400 });

    const [qVec] = await embed([question]);
    const hits = topChunks(qVec, docs, 6);
    const context = hits.map((h, i) => `[S${i + 1}] (${h.file}, page ${h.page}, ${typeOf(h.type).label})\n${h.text}`).join("\n\n");

    const history = db.messages.filter((m) => m.propertyId === propertyId).slice(-6);
    const turns = [
      ...history.map((m) => ({ role: m.role === "user" ? "user" : "model", text: m.content })),
      { role: "user", text: `Excerpts:\n${context}\n\nQuestion: ${question}` },
    ];
    const answer = await generate(SYSTEM, turns);

    const sources = hits.map((h, i) => ({ id: i + 1, file: h.file, page: h.page, type: h.type, text: h.text.slice(0, 600) }));
    const now = Date.now();
    db.messages.push({ id: newId(), propertyId, role: "user", content: question, time: now });
    db.messages.push({ id: newId(), propertyId, role: "assistant", content: answer, sources, time: now + 1 });
    save(db);
    return Response.json({ answer, sources });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
