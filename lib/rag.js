// Split text into ~800 character chunks that overlap a little.
export function chunkText(text, size = 800, overlap = 120) {
  const clean = text.replace(/\s+/g, " ").trim();
  const chunks = [];
  for (let i = 0; i < clean.length; i += size - overlap) {
    chunks.push(clean.slice(i, i + size));
    if (i + size >= clean.length) break;
  }
  return chunks;
}

function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

// Top-k chunks (with file, page and document type) closest to the question.
export function topChunks(questionVec, documents, k = 6) {
  const all = [];
  for (const doc of documents)
    for (const c of doc.chunks)
      all.push({ file: doc.name, type: doc.type || "verified_legal", page: c.page || 1, text: c.text, score: cosine(questionVec, c.embedding) });
  return all.sort((a, b) => b.score - a.score).slice(0, k);
}
