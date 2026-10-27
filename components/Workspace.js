"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Ctx = createContext(null);

export const useWs = () => useContext(Ctx);

export default function Workspace({ id, children }) {
  const pathname = usePathname();

  const [data, setData] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploading, setUploading] = useState("");
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");

  const reload = useCallback(async () => {
    const res = await fetch(`/api/properties/${id}`);
    setData(res.ok ? await res.json() : { missing: true });
  }, [id]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function analyze() {
    setError("");
    setAnalyzing(true);

    try {
      const res = await fetch("/api/risks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId: id }),
      });

      const d = await res.json().catch(() => ({ error: "The risk report service returned an invalid response." }));

      if (!res.ok) {
        setError(d.error || "Could not build the risk report.");
      } else {
        await reload();
      }
    } catch (e) {
      setError(e.message || "Could not connect to the risk report service.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function uploadFiles(files, type) {
    setError("");

    const list = Array.from(files);

    for (let i = 0; i < list.length; i++) {
      setUploading(
        `Reading ${list[i].name} (${i + 1} of ${list.length})…`
      );

      const form = new FormData();

      form.append("propertyId", id);
      form.append("file", list[i]);
      form.append("type", type);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        setError((await res.json()).error);
      }

      await reload();
    }

    setUploading("");
  }

  async function removeDoc(docId) {
    await fetch(`/api/properties/${id}?doc=${docId}`, {
      method: "DELETE",
    });

    await reload();
  }

  async function changeType(docId, type) {
    const res = await fetch(`/api/properties/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        docId,
        type,
      }),
    });

    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Failed to change document type.");
      return;
    }

    await reload();
  }

  if (!data) {
    return <p className="muted pad">Loading…</p>;
  }

  if (data.missing) {
    return (
      <p className="muted pad">
        Property not found. <Link href="/">Back to properties</Link>
      </p>
    );
  }

  const { property, documents, analysis } = data;

  const base = `/property/${id}`;

  const nav = [
    ["Overview", base, "▦"],
    ["Ask PropertyIQ", `${base}/ask`, "✦"],
    ["Risk report", `${base}/risks`, "⛨"],
    [
      "Source conflicts",
      `${base}/conflicts`,
      "△",
      analysis?.conflicts?.length || 0,
    ],
    ["Documents", `${base}/documents`, "▤", documents.length],
  ];

  return (
    <Ctx.Provider
      value={{
        id,
        data,
        reload,
        analyze,
        analyzing,
        uploadFiles,
        uploading,
        removeDoc,
        changeType,
        error,
        setError,
        draft,
        setDraft,
      }}
    >
      <div className="ws">
        <aside className="side">
          <p className="eyebrow">Property workspace</p>

          <h3>{property.name}</h3>

          <p className="muted small">
            {[property.address, property.city]
              .filter(Boolean)
              .join(", ") || "No address added"}
          </p>

          <nav>
            {nav.map(([label, href, icon, n]) => (
              <Link
                key={href}
                href={href}
                className={pathname === href ? "on" : ""}
              >
                <span className="ico">{icon}</span>
                {label}

                {n > 0 && (
                  <span
                    className={`count ${
                      label === "Source conflicts" ? "warn" : ""
                    }`}
                  >
                    {n}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <div className="evbox">
            <strong>✓ Evidence first</strong>

            <p className="muted small">
              Every factual answer is linked to a source and its authority
              level.
            </p>

            <p className="legend">
              <i className="dot legal" /> Verified legal
            </p>

            <p className="legend">
              <i className="dot indep" /> Independent report
            </p>

            <p className="legend">
              <i className="dot seller" /> Seller claim
            </p>
          </div>
        </aside>

        <section className="content">{children}</section>
      </div>
    </Ctx.Provider>
  );
}