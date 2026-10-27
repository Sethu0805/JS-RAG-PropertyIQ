import { load, save, newId } from "@/lib/db";

export async function GET() {
  const db = load();
  return Response.json(db.properties.map((p) => ({ ...p, docCount: db.documents.filter((d) => d.propertyId === p.id).length })));
}

export async function POST(req) {
  const b = await req.json();
  if (!b.name?.trim()) return Response.json({ error: "Property name is required" }, { status: 400 });
  const db = load();
  const clean = (v) => String(v || "").trim();
  const property = { id: newId(), name: clean(b.name), address: clean(b.address), city: clean(b.city), price: clean(b.price), details: clean(b.details), kind: clean(b.kind), createdAt: Date.now() };
  db.properties.push(property);
  save(db);
  return Response.json(property);
}
