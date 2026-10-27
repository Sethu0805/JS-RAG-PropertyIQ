// Shared by server and browser code.
export const DOC_TYPES = {
  seller_claim: { label: "Seller claim", group: "Listing & seller claims", cls: "seller" },
  verified_legal: { label: "Verified legal", group: "Legal documents", cls: "legal" },
  independent_report: { label: "Independent report", group: "Locality & independent reports", cls: "indep" },
};
export const typeOf = (t) => DOC_TYPES[t] || DOC_TYPES.verified_legal;

export function fmtSize(b = 0) {
  return b > 1048576 ? (b / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(b / 1024)) + " KB";
}

// risk -> one of: high | moderate | clear | missing
export function bucketOf(r) {
  const s = String(r.severity).toLowerCase();
  if (s === "missing" || /missing/i.test(r.category || "")) return "missing";
  return s === "high" ? "high" : s === "medium" ? "moderate" : "clear";
}
export const BUCKET_BADGE = { high: "High", moderate: "Medium", clear: "Low", missing: "Missing" };
