"use client";

import { useState } from "react";
import { useWs } from "@/components/Workspace";
import { DOC_TYPES, fmtSize } from "@/lib/types";

export default function Documents() {
  const { data, uploadFiles, uploading, removeDoc, changeType, error } = useWs();
  const [type, setType] = useState("verified_legal");
  const [drag, setDrag] = useState(false);
  const { property, documents } = data;

  const pick = (files) => files?.length && uploadFiles(files, type);

  return (
    <>
      <p className="eyebrow blue">Evidence library · {property.name}</p>
      <h1>Document vault</h1>
      <p className="muted">
        Keep the sources behind every answer organized, visible and easy to review.
      </p>

      <div className="card upload">
        <label className="field">
          What kind of document are you uploading?
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="seller_claim">
              Listing or seller document (seller claim)
            </option>
            <option value="verified_legal">
              Legal document: title, lien, zoning, HOA, agreement (verified legal)
            </option>
            <option value="independent_report">
              Locality or independent report
            </option>
          </select>
        </label>

        <label
          className={`drop ${drag ? "over" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            pick(e.dataTransfer.files);
          }}
        >
          <strong>{uploading || "Upload documents"}</strong>
          <span className="muted small">
            Drag and drop or browse · PDF, TXT, MD, CSV, JSON or HTML with selectable text
          </span>

          <input
            type="file"
            multiple
            hidden
            accept=".pdf,.txt,.md,.csv,.json,.html"
            disabled={!!uploading}
            onChange={(e) => {
              pick(e.target.files);
              e.target.value = "";
            }}
          />
        </label>

        {error && <p className="err">{error}</p>}
      </div>

      {documents.length === 0 && (
        <p className="muted">
          No documents yet. Upload the first one above.
        </p>
      )}

      {Object.entries(DOC_TYPES).map(([key, t]) => {
        const list = documents.filter((d) => d.type === key);

        if (!list.length) return null;

        return (
          <section key={key}>
            <div className="between">
              <h3 className="grp">{t.group}</h3>
              <span className="muted small">
                {list.length} source{list.length === 1 ? "" : "s"}
              </span>
            </div>

            {list.map((d) => (
              <div key={d.id} className="card docrow">
                <div>
                  <strong>{d.name}</strong>
                  <p className="muted small">
                    {d.pages} page{d.pages === 1 ? "" : "s"} · {fmtSize(d.size)}
                  </p>
                </div>

                <div className="row">
                  <select
                    className="typesel"
                    value={d.type}
                    onChange={(e) => changeType(d.id, e.target.value)}
                    aria-label="Document type"
                  >
                    {Object.entries(DOC_TYPES).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>

                  {d.createdAt > 0 && (
                    <span className="muted small">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </span>
                  )}

                  <span className="indexed">Indexed</span>

                  <button
                    className="link danger"
                    onClick={() => removeDoc(d.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </section>
        );
      })}
    </>
  );
}