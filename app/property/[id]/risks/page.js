"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useWs } from "@/components/Workspace";
import { bucketOf, BUCKET_BADGE } from "@/lib/types";

const TILES = [["high", "High risk", "!"], ["moderate", "Moderate concern", "◔"], ["clear", "Clear / verified", "✓"], ["missing", "Missing evidence", "…"]];

export default function Risks() {
  const { id, data, analyze, analyzing, error, setDraft } = useWs();
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(null);
  const { property, documents, analysis } = data;

  if (!analysis)
    return (
      <>
        <p className="eyebrow blue">Decision support · {property.name}</p>
        <h1>Property Risk Report</h1>
        <div className="card empty">
          <h3>{documents.length ? "No report yet" : "No documents yet"}</h3>
          <p className="muted">{documents.length ? "Generate the report from this property's documents." : "Upload documents to generate a risk report."}</p>
          {error && <p className="err">{error}</p>}
          {documents.length
            ? <button className="btn primary" onClick={analyze} disabled={analyzing}>{analyzing ? "Analysing documents…" : "Generate risk report"}</button>
            : <Link href={`/property/${id}/documents`} className="btn primary">Upload documents</Link>}
        </div>
      </>
    );

  const risks = analysis.risks.map((r) => ({ ...r, bucket: bucketOf(r) }));
  const count = (k) => risks.filter((r) => r.bucket === k).length;
  const shown = filter === "all" ? risks : risks.filter((r) => r.bucket === filter);

  function exportReport() {
    const body = risks.map((r) => `[${BUCKET_BADGE[r.bucket]}] ${r.title} (${r.category})\n${r.detail}\nSource: ${r.source || "none"}${r.page ? " p." + r.page : ""}\nNext step: ${r.action}\n`).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([`PROPERTY RISK REPORT - ${property.name}\n\n${body}`], { type: "text/plain" }));
    a.download = "risk-report.txt";
    a.click();
  }

  return (
    <>
      <div className="between top">
        <div>
          <p className="eyebrow blue">Decision support · {property.name}</p>
          <h1>Property Risk Report</h1>
          <p className="muted">Prepared from {analysis.docCount} indexed source{analysis.docCount === 1 ? "" : "s"} · {new Date(analysis.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="row">
          <button className="btn" onClick={exportReport}>Export report</button>
          <button className="btn primary" onClick={analyze} disabled={analyzing}>{analyzing ? "Analysing…" : "Regenerate"}</button>
        </div>
      </div>
      {error && <p className="err">{error}</p>}

      <div className="tiles">
        {TILES.map(([k, label, icon]) => (
          <button key={k} className={`tile ${k} ${filter === k ? "on" : ""}`} aria-pressed={filter === k} onClick={() => setFilter(filter === k ? "all" : k)}>
            <span className="ticon">{icon}</span><span className="tnum">{count(k)}</span><span>{label}</span>
          </button>
        ))}
      </div>

      <p className="eyebrow">Findings by evidence</p>
      <div className="between"><h2>{filter === "all" ? "What needs your attention" : TILES.find((t) => t[0] === filter)[1]}</h2>
        {filter !== "all" && <button className="link" onClick={() => setFilter("all")}>Show all</button>}</div>

      <div className="rgrid">
        {shown.map((r, i) => {
          const key = r.title + i, isOpen = open === key;
          return (
            <article key={key} className={`card rcard ${r.bucket}`}>
              <button className="rmain" onClick={() => setOpen(isOpen ? null : key)} aria-expanded={isOpen}>
                <span className="between"><span className="eyebrow">{r.category}</span><span className={`badge ${r.bucket}`}>{BUCKET_BADGE[r.bucket]}</span></span>
                <h4>{r.title}</h4>
                <p className="muted">{r.detail}</p>
                <span className="srcline">{r.source ? `📄 ${r.source}${r.page ? " · p." + r.page : ""}` : "No source available"}</span>
              </button>
              {isOpen && (
                <div className="ropen">
                  <p><strong>Next step:</strong> {r.action}</p>
                  <button className="btn" onClick={() => { setDraft(`Tell me more about: ${r.title}`); router.push(`/property/${id}/ask`); }}>Ask about this</button>
                </div>
              )}
            </article>
          );
        })}
        {shown.length === 0 && <p className="muted">Nothing in this group.</p>}
      </div>

      {analysis.nextSteps.length > 0 && (
        <div className="card note">
          <p className="eyebrow">Suggested next steps</p>
          <ol>{analysis.nextSteps.map((s, i) => <li key={i}>{s}</li>)}</ol>
        </div>
      )}
      <p className="muted small">Risk findings reflect the available evidence set, not a legal opinion. Missing information can change the assessment.</p>
    </>
  );
}
