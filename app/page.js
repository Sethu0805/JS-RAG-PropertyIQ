"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const KINDS = ["Single-family home", "Apartment / condo", "Townhome", "Plot / land", "Other"];

export default function Home() {
  const [items, setItems] = useState(null);
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const [f, setF] = useState({ name: "", address: "", city: "", price: "", details: "", kind: KINDS[0] });
  const [error, setError] = useState("");

  const refresh = () => fetch("/api/properties").then((r) => r.json()).then(setItems);
  useEffect(() => { refresh(); }, []);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function create(e) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/properties", { method: "POST", body: JSON.stringify(f) });
    if (!res.ok) return setError((await res.json()).error);
    setF({ name: "", address: "", city: "", price: "", details: "", kind: KINDS[0] });
    setAdding(false);
    refresh();
  }

  const q = search.toLowerCase();
  const shown = (items || []).filter((p) => [p.name, p.address, p.city].join(" ").toLowerCase().includes(q));
  const shortKind = (kind = "Property") => kind === "Apartment / condo" ? "CONDO" : kind === "Single-family home" ? "SINGLE-FAMILY HOME" : kind.toUpperCase();

  return (
    <main className="home">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow blue">Evidence-led property intelligence</p>
          <h1>Understand a property<br /><span>before you buy..</span></h1>
          <p className="lead">PropertyIQ brings together listing claims, legal records and independent locality reports so you can make decisions with the evidence in view.</p>
        </div>
        <div className="standard">
          <p className="eyebrow">Our standard</p>
          <strong>No source, no claim.</strong>
          <span className="muted">Conflicts are surfaced. Unknowns stay unknown.</span>
          <div className="standard-rule" />
          <b>✓ &nbsp; Traceable answers, always</b>
        </div>
      </section>

      <div className="searchbar">
        <span className="search-icon">⌕</span>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by address, city or property name" aria-label="Search properties" />
        <button className="btn primary" onClick={() => document.querySelector(".cards")?.scrollIntoView({ behavior: "smooth", block: "start" })}>⌕ &nbsp; Search properties</button>
      </div>

      {adding && (
        <form className="card addform" onSubmit={create}>
          <h2>Add a property</h2>
          <div className="fields">
            <label>Property name *<input value={f.name} onChange={set("name")} placeholder="e.g. Flat 402, Maple Heights" required /></label>
            <label>Type<select value={f.kind} onChange={set("kind")}>{KINDS.map((k) => <option key={k}>{k}</option>)}</select></label>
            <label>Address<input value={f.address} onChange={set("address")} placeholder="Street, area, postal code" /></label>
            <label>City<input value={f.city} onChange={set("city")} /></label>
            <label>Asking price<input value={f.price} onChange={set("price")} placeholder="e.g. Rs. 85,00,000" /></label>
            <label>Key details<input value={f.details} onChange={set("details")} placeholder="e.g. 3 BHK · 1,150 sq ft" /></label>
          </div>
          {error && <p className="err">{error}</p>}
          <div className="row">
            <button className="btn primary" type="submit">Save property</button>
            <button className="btn" type="button" onClick={() => setAdding(false)}>Cancel</button>
          </div>
        </form>
      )}

      <section>
        <div className="section-heading">
          <div>
            <p className="eyebrow">Your property workspace</p>
            <h2>Recently viewed</h2>
          </div>
          <div className="section-actions">
            <span className="muted small">{items ? `${shown.length} propert${shown.length === 1 ? "y" : "ies"}` : "Loading…"}</span>
            <button className="link small" onClick={() => setAdding(true)}>+ Add property</button>
          </div>
        </div>
        {items && items.length === 0 && !adding && (
          <div className="card empty"><h3>No properties yet</h3><p className="muted">Add your first property, then upload its documents to see the risks.</p>
            <button className="btn primary" onClick={() => setAdding(true)}>+ Add property</button></div>
        )}
        <div className="cards">
          {shown.map((p) => (
            <Link key={p.id} href={`/property/${p.id}`} className="card pcard">
              <button
                className="pcard-delete"
                type="button"
                aria-label={`Delete ${p.name}`}
                title="Delete property"
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!window.confirm(`Delete "${p.name}" and all its documents?`)) return;
                  const res = await fetch(`/api/properties/${p.id}`, { method: "DELETE" });
                  if (res.ok) refresh();
                  else setError("Could not delete this property.");
                }}
              >
                ×
              </button>
              <div className="pimage">
                <span className="coverage"><i /> {p.docCount ? `${p.docCount} source${p.docCount === 1 ? "" : "s"} indexed` : "No sources yet"}</span>
                <span className="kind">{shortKind(p.kind)}</span>
                <span className="scene-sun" /><span className="scene-building building-one" /><span className="scene-building building-two" /><span className="scene-ground" />
              </div>
              <div className="pcopy">
                <p className="plocation">⌖ <span>{p.city || "Location not added"}</span></p>
                <h3>{p.name}</h3>
                <p className="paddress">{p.address || "No address added"}</p>
                <div className="pfoot">
                  <div>
                    {p.price && <p className="price">{p.price}</p>}
                    {p.details && <p className="pdetails">{p.details}</p>}
                  </div>
                  <span className="parrow" aria-hidden="true">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="steps">
        <div><p className="eyebrow blue">01 · Consolidate</p><strong>Bring every source into one view.</strong></div>
        <div><p className="eyebrow blue">02 · Understand</p><strong>Ask direct questions in plain language.</strong></div>
        <div><p className="eyebrow blue">03 · Verify</p><strong>Trace each answer back to the source.</strong></div>
      </section>
    </main>
  );
}
