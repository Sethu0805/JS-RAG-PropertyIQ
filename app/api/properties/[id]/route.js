import { load, save } from "@/lib/db";
import { DOC_TYPES } from "@/lib/types";

export async function GET(_req, { params }) {
  const db = load();
  const property = db.properties.find((p) => p.id === params.id);
  if (!property) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({
    property,
    documents: db.documents.filter((d) => d.propertyId === params.id).map((d) => ({
      id: d.id, name: d.name, type: d.type || "verified_legal", pages: d.pages || 1, size: d.size || 0, createdAt: d.createdAt || 0,
    })),
    messages: db.messages.filter((m) => m.propertyId === params.id),
    analysis: db.analysis?.[params.id] || null,
  });
}

export async function DELETE(req, { params }) {
  const docId = new URL(req.url).searchParams.get("doc");
  const db = load();
  if (docId) db.documents = db.documents.filter((d) => d.id !== docId);
  else {
    db.properties = db.properties.filter((p) => p.id !== params.id);
    db.documents = db.documents.filter((d) => d.propertyId !== params.id);
    db.messages = db.messages.filter((m) => m.propertyId !== params.id);
    if (db.analysis) delete db.analysis[params.id];
  }
  save(db);
  return Response.json({ ok: true });
}
// Change a document's type (seller claim / verified legal / independent report)
export async function PATCH(req, { params }) {
  const { docId, type } = await req.json();
  const db = load();
  const doc = db.documents.find((d) => d.id === docId && d.propertyId === params.id);
  if (!doc || !DOC_TYPES[type]) return Response.json({ error: "Document not found" }, { status: 400 });
  doc.type = type;
  if (db.analysis) delete db.analysis[params.id]; // old report used the old type, so regenerate it
  save(db);
  return Response.json({ ok: true });
}
