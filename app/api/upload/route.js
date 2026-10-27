import { load, save, newId } from "@/lib/db";
import { chunkText } from "@/lib/rag";
import { embed } from "@/lib/gemini";
import { DOC_TYPES } from "@/lib/types";

// Upload -> read text page by page -> chunk -> embed -> store.
export async function POST(req) {
  try {
    const form = await req.formData();
    const propertyId = form.get("propertyId");
    const file = form.get("file");
    const type = DOC_TYPES[form.get("type")] ? form.get("type") : "verified_legal";
    if (!propertyId || !file) return Response.json({ error: "Missing file" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    let pages = [];
    if (file.name.toLowerCase().endsWith(".pdf")) {
      try {
        const pdf = (await import("pdf-parse/lib/pdf-parse.js")).default;
        await pdf(buffer, {
          pagerender: async (pg) => {
            const tc = await pg.getTextContent();
            const t = tc.items.map((i) => i.str).join(" ");
            pages.push(t);
            return t;
          },
        });
      } catch {
        // Some PDFs ("bad XRef entry") break the old reader, so retry with a newer one.
        pages = [];
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.js");
        const doc = await (pdfjs.default || pdfjs).getDocument({ data: new Uint8Array(buffer), useSystemFonts: true }).promise;
        for (let n = 1; n <= doc.numPages; n++) {
          const tc = await (await doc.getPage(n)).getTextContent();
          pages.push(tc.items.map((i) => i.str).join(" "));
        }
      }
    } else {
      pages = [buffer.toString("utf8")];
    }
    if (!pages.some((p) => p.trim()))
      return Response.json({ error: `No readable text in ${file.name} (scanned PDFs are not supported).` }, { status: 400 });

    const pieces = [];
    pages.forEach((p, i) => chunkText(p).forEach((t) => pieces.push({ text: t, page: i + 1 })));
    const vectors = await embed(pieces.map((p) => p.text));

    const db = load();
    db.documents.push({
      id: newId(), propertyId, name: file.name, type, pages: pages.length, size: file.size, createdAt: Date.now(),
      chunks: pieces.map((p, i) => ({ text: p.text, page: p.page, embedding: vectors[i] })),
    });
    save(db);
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}