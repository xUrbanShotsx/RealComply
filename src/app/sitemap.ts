import type { MetadataRoute } from "next";

const BASE = "https://realcomply.com.au";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/signup`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/real-estate-compliance-software`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/features/cpd-tracking`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/features/trust-accounting`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/features/audit-readiness`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/features/policy-management`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/compliance/nsw`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/compliance/vic`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/compliance/qld`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/compliance/wa`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/compliance/sa`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];
}
