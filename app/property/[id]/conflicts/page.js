"use client";
import Link from "next/link";
import { useWs } from "@/components/Workspace";

const ref = (c) => `${c.source || "Unknown source"}${c.page ? " · Page " + c.page : ""}`;

export default function Conflicts() {
  const { id, data, analyze, analyzing, error } = useWs();
  const { analysis, documents } = data;

  return (
    <>
      <p className="eyebrow blue">Review before relying on a claim</p>
      <h1>Source conflicts</h1>
      <p className="muted">PropertyIQ does not silently choose between sources. When the evidence disagrees, both records stay visible so you can decide what to verify next.</p>
      {error && <p className="err">{error}</p>}

      {!analysis && (
        <div className="card empty">
          <h3>No analysis yet</h3>
          <p className="muted">Conflicts are found when the risk report is generated.</p>
          {documents.length
            ? <button className="btn primary" onClick={analyze} disabled={analyzing}>{analyzing ? "Analysing documents…" : "Generate risk report"}</button>
            : <Link href={`/property/${id}/documents`} className="btn primary">Upload documents</Link>}
        </div>
      )}
      {analysis && analysis.conflicts.length === 0 && (
        <div className="card empty"><h3>No conflicts found</h3><p className="muted">The available documents do not contradict each other. Upload more documents and regenerate the report to check again.</p></div>
      )}

      {analysis?.conflicts.map((c, i) => (
        <div key={i} className="card conflict">
          <h3>{c.title}</h3>
          <p className="muted">{c.summary}</p>
          <div className="vs">
            <div className="quotebox seller"><span className="pill seller">Seller claim</span><p>“{c.claim?.text}”</p><p className="muted small">{ref(c.claim || {})}</p></div>
            <span className="vslabel">VS</span>
            <div className="quotebox legal"><span className="pill legal">Verified record</span><p>“{c.record?.text}”</p><p className="muted small">{ref(c.record || {})}</p></div>
          </div>
          <p className="eyebrow">How PropertyIQ handles it</p>
          <p>The more authoritative record is preferred when sources disagree. {c.next}</p>
        </div>
      ))}
      {analysis && <Link href={`/property/${id}/documents`} className="btn">Open document vault</Link>}
    </>
  );
}
