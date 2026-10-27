"use client";
import Link from "next/link";
import { useWs } from "@/components/Workspace";
import { DOC_TYPES } from "@/lib/types";

export default function Overview() {
  const { id, data, analyze, analyzing, error } = useWs();
  const { property: p, documents, analysis } = data;
  const base = `/property/${id}`;

  return (
    <>
      <p className="crumb"><Link href="/">Properties</Link> / {p.name}</p>
      <div className="card hero2">
        <div>
          <p className="eyebrow blue">Property intelligence overview</p>
          <h1>{p.name}</h1>
          <p className="muted">{[p.address, p.city].filter(Boolean).join(", ") || "No address added"}</p>
          {p.price && <p className="price big">{p.price}</p>}
          {p.details && <p className="muted">{p.details}</p>}
          <div className="row" style={{ marginTop: 16 }}>
            <Link href={`${base}/ask`} className="btn primary">Ask PropertyIQ</Link>
            <Link href={`${base}/risks`} className="btn">Risk report</Link>
          </div>
        </div>
      </div>

      <p className="eyebrow sp">At a glance</p>
      <div className="between"><h2>Evidence summary</h2>{analysis && <Link href={`${base}/risks`} className="link">View full risk report →</Link>}</div>
      {error && <p className="err">{error}</p>}
      {analysis ? (
        <div className="glance">
          {analysis.glance.map((g) => (
            <div key={g.label} className="card gcard">
              <p className="muted small">{g.label}</p>
              <strong className={`tone ${g.tone || "missing"}`}>{g.value}</strong>
              <p className="muted small">{g.note}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="card empty">
          <h3>{documents.length ? "Ready to analyse" : "No documents yet"}</h3>
          <p className="muted">{documents.length ? "Generate the evidence summary and risk report from this property's documents." : "Upload the property's documents to get an evidence summary."}</p>
          {documents.length
            ? <button className="btn primary" onClick={analyze} disabled={analyzing}>{analyzing ? "Analysing documents…" : "Generate risk report"}</button>
            : <Link href={`${base}/documents`} className="btn primary">Upload documents</Link>}
        </div>
      )}

      <p className="eyebrow sp">Source coverage</p>
      <h2>Sources available</h2>
      <div className="glance three">
        {Object.entries(DOC_TYPES).map(([key, t]) => (
          <div key={key} className="card gcard">
            <p className="muted small">{t.group}</p>
            <strong>{documents.filter((d) => d.type === key).length} source{documents.filter((d) => d.type === key).length === 1 ? "" : "s"} indexed</strong>
            <span className={`pill ${t.cls}`}>{t.label}</span>
          </div>
        ))}
      </div>

      <div className="card note">
        <strong>Important context</strong>
        <p className="muted small">PropertyIQ summarizes available documents and does not provide legal or financial advice. Review source documents with your legal, financial or real-estate professional before making a decision.</p>
        <Link href={`${base}/documents`} className="link">Review documents →</Link>
      </div>
    </>
  );
}
