"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useWs } from "@/components/Workspace";
import { typeOf } from "@/lib/types";

const SUGGESTED = [
  "Does this property have any outstanding liens?",
  "Is the title clear?",
  "Are there any zoning restrictions?",
  "Is this area at risk of flooding?",
  "What HOA or society fees are documented?",
];

function Answer({ text, onCite }) {
  return text.split(/(\[S\d+(?:\s*,\s*S\d+)*\])/g).map((part, i) => {
    const m = part.match(/^\[(S[\d\s,S]+)\]$/);
    if (!m) return <span key={i}>{part}</span>;
    return m[1].split(",").map((s, j) => {
      const n = parseInt(s.replace(/\D/g, ""), 10);
      return <button key={i + "-" + j} className="cite" onClick={() => onCite(n)}>{n}</button>;
    });
  });
}

export default function Ask() {
  const { id, data, reload, draft, setDraft } = useWs();
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState("");
  const [err, setErr] = useState("");
  const [active, setActive] = useState(null); // which assistant message's evidence is shown
  const [sel, setSel] = useState(null);       // which citation is highlighted
  const end = useRef(null);
  const { property, documents, messages } = data;

  useEffect(() => { if (draft) { setQ(draft); setDraft(""); } }, [draft, setDraft]);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length, pending]);

  const lastA = messages.map((m, i) => (m.role === "assistant" ? i : -1)).filter((i) => i >= 0).pop();
  const shownIdx = active ?? lastA;
  const evidence = shownIdx != null ? messages[shownIdx]?.sources || [] : [];

  async function send(text) {
    const question = (text ?? q).trim();
    if (!question || busy) return;
    setErr(""); setQ(""); setBusy(true); setPending(question); setActive(null); setSel(null);
    const res = await fetch("/api/chat", { method: "POST", body: JSON.stringify({ propertyId: id, question }) });
    if (!res.ok) setErr((await res.json()).error);
    await reload();
    setPending(""); setBusy(false);
  }

  if (!documents.length)
    return (
      <div className="card empty">
        <h3>Upload documents first</h3>
        <p className="muted">PropertyIQ answers only from this property's documents.</p>
        <Link href={`/property/${id}/documents`} className="btn primary">Upload documents</Link>
      </div>
    );

  return (
    <>
      <p className="eyebrow blue">Evidence-backed answers</p>
      <h1>Ask about {property.name}</h1>
      <p className="muted">Sources indexed · {documents.length}</p>

      <div className="askgrid">
        <div className="card chatcol">
          <div className="msgs">
            {messages.length === 0 && !pending && (
              <>
                <p className="eyebrow">Suggested questions</p>
                <div className="chips">{SUGGESTED.map((s) => <button key={s} className="chip" onClick={() => send(s)}>{s}</button>)}</div>
              </>
            )}
            {messages.map((m, i) =>
              m.role === "user" ? (
                <div key={m.id} className="bubble user">{m.content}</div>
              ) : (
                <div key={m.id} className={`answer ${i === shownIdx ? "current" : ""}`}>
                  <div className="between"><strong>PropertyIQ</strong><span className="eyebrow">{m.sources?.length || 0} sources cited</span></div>
                  <p><Answer text={m.content} onCite={(n) => { setActive(i); setSel(n); }} /></p>
                  <div className="between">
                    <button className="link" onClick={() => { setActive(i); setSel(null); }}>Show evidence</button>
                    <button className="link" onClick={() => navigator.clipboard?.writeText(m.content)}>Copy</button>
                  </div>
                </div>
              )
            )}
            {pending && <div className="bubble user">{pending}</div>}
            {busy && <div className="answer muted">Searching documents…</div>}
            <div ref={end} />
          </div>
          {err && <p className="err">{err}</p>}
          <form className="row" onSubmit={(e) => { e.preventDefault(); send(); }}>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask anything about this property..." disabled={busy} />
            <button className="btn primary" disabled={busy || !q.trim()}>Send</button>
          </form>
          {messages.length > 0 && (
            <div className="chips" style={{ marginTop: 10 }}>{SUGGESTED.slice(0, 3).map((s) => <button key={s} className="chip" onClick={() => send(s)} disabled={busy}>{s}</button>)}</div>
          )}
        </div>

        <aside className="evidence">
          <p className="eyebrow">Evidence · {evidence.length} passage{evidence.length === 1 ? "" : "s"}</p>
          {evidence.length === 0 && <p className="muted small">Ask a question, then select any citation to inspect the exact passage.</p>}
          {evidence.map((s) => {
            const t = typeOf(s.type);
            return (
              <div key={s.id} className={`card ev ${sel === s.id ? "sel" : ""}`}>
                <strong><span className="num">{s.id}</span> {s.file} · p.{s.page}</strong>
                <span className={`pill ${t.cls}`}>{t.label}</span>
                <p className="small quote">{s.text}</p>
                <button className="link" onClick={() => navigator.clipboard?.writeText(s.text)}>Copy passage</button>
              </div>
            );
          })}
          {evidence.length > 0 && <p className="muted small">Select any citation to inspect the exact passage.</p>}
        </aside>
      </div>
    </>
  );
}
