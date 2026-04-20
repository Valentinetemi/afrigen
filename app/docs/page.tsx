"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";

const CODE_EXAMPLES: Record<string, string> = {
  curl: `curl -X POST https://afrigen.vercel.app/api/generate \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "1000 malaria patient records from Kano State",
    "domain": "healthcare",
    "country": "Nigeria",
    "rows": 1000,
    "format": "CSV"
  }'`,
  python: `import requests

response = requests.post(
    "https://afrigen.vercel.app/api/generate",
    json={
        "prompt": "1000 malaria patient records from Kano State",
        "domain": "healthcare",
        "country": "Nigeria",
        "rows": 1000,
        "format": "CSV"
    },
    stream=True
)

for chunk in response.iter_content(chunk_size=None):
    print(chunk.decode(), end="", flush=True)`,
  javascript: `const response = await fetch("https://afrigen.vercel.app/api/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    prompt: "1000 malaria patient records from Kano State",
    domain: "healthcare",
    country: "Nigeria",
    rows: 1000,
    format: "CSV"
  })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  process.stdout.write(decoder.decode(value));
}`,
};

export default function DocsPage() {
  const [lang, setLang] = useState("curl");

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px", display: "grid", gridTemplateColumns: "220px 1fr", gap: 40, alignItems: "start" }}>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ position: "sticky", top: 80 }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-dim)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
            Getting Started
          </div>
          {["Introduction", "Authentication", "Rate Limits"].map(item => (
            <div key={item} style={{ padding: "6px 10px", fontSize: 13, color: "var(--text-muted)", cursor: "pointer", borderRadius: 6 }}>
              {item}
            </div>
          ))}
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-dim)", letterSpacing: "0.08em", textTransform: "uppercase", margin: "16px 0 8px" }}>
            Endpoints
          </div>
          {[
            { method: "POST", path: "/api/generate" },
            { method: "GET", path: "/api/stats" },
          ].map(ep => (
            <div key={ep.path} style={{ padding: "6px 10px", fontSize: 13, cursor: "pointer", borderRadius: 6, display: "flex", alignItems: "center", gap: 6, color: "var(--accent)" }}>
              <span style={{ fontSize: 10, fontWeight: 700, background: "var(--accent-light)", color: "var(--accent)", padding: "1px 5px", borderRadius: 3, fontFamily: "var(--mono)" }}>
                {ep.method}
              </span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 12 }}>{ep.path}</span>
            </div>
          ))}
        </motion.div>

        {/* Main docs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: "flex", flexDirection: "column", gap: 40 }}
        >
          {/* Intro */}
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--accent-light)", border: "1px solid var(--accent-mid)", borderRadius: 20, padding: "4px 14px", marginBottom: 16, fontSize: 12, color: "var(--accent)", fontWeight: 500 }}>
              🌍 AfriGen API v1
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 700, color: "var(--text)", marginBottom: 12, letterSpacing: "-0.02em" }}>
              API Reference
            </h1>
            <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.7, maxWidth: 600 }}>
              The AfriGen API lets you programmatically generate culturally accurate African synthetic datasets. 
              Stream thousands of rows directly into your ML pipeline, data warehouse, or application.
            </p>
          </div>

          {/* Base URL */}
          <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Base URL</div>
            <code style={{ fontFamily: "var(--mono)", fontSize: 14, color: "var(--accent2)", background: "var(--accent2-light)", padding: "6px 12px", borderRadius: 6, display: "inline-block" }}>
              https://afrigen.vercel.app
            </code>
          </div>

          {/* POST /api/generate */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 700, background: "#dcfce7", color: "#16a34a", padding: "3px 8px", borderRadius: 4, fontFamily: "var(--mono)" }}>
                POST
              </span>
              <code style={{ fontFamily: "var(--mono)", fontSize: 16, fontWeight: 600, color: "var(--text)" }}>
                /api/generate
              </code>
            </div>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 20, lineHeight: 1.7 }}>
              Generate a synthetic African dataset. This endpoint streams the response — data starts flowing immediately, row by row.
            </p>

            {/* Request body */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 12 }}>Request Body</div>
              <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
                {[
                  { param: "prompt", type: "string", required: true, desc: "Natural language description of the dataset you want" },
                  { param: "domain", type: "string", required: true, desc: "One of: healthcare, finance, agriculture" },
                  { param: "country", type: "string", required: true, desc: "Country name e.g. Nigeria, Kenya, Ghana" },
                  { param: "rows", type: "number", required: true, desc: "Number of rows to generate (max 1000 per request)" },
                  { param: "format", type: "string", required: false, desc: "Output format: CSV, JSON, or JSONL. Defaults to CSV" },
                ].map((p, i) => (
                  <div key={p.param} style={{
                    padding: "12px 16px",
                    borderBottom: i < 4 ? "1px solid var(--border)" : "none",
                    display: "grid", gridTemplateColumns: "140px 80px 1fr",
                    gap: 12, alignItems: "center",
                    background: i % 2 === 0 ? "var(--bg)" : "var(--bg-secondary)",
                  }}>
                    <code style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--accent2)" }}>{p.param}</code>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--mono)" }}>{p.type}</span>
                      {p.required && <span style={{ fontSize: 10, color: "var(--danger)", fontWeight: 600 }}>required</span>}
                    </div>
                    <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{p.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Code examples */}
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
              <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
                {Object.keys(CODE_EXAMPLES).map(l => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    style={{
                      padding: "10px 16px", fontSize: 12, fontWeight: 600,
                      fontFamily: "var(--mono)",
                      background: lang === l ? "var(--bg)" : "transparent",
                      border: "none", borderBottom: lang === l ? "2px solid var(--accent)" : "2px solid transparent",
                      color: lang === l ? "var(--accent)" : "var(--text-dim)",
                      cursor: "pointer", transition: "all 0.1s",
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <pre style={{
                padding: 20, margin: 0,
                fontFamily: "var(--mono)", fontSize: 12,
                color: "var(--text)", lineHeight: 1.7,
                overflowX: "auto", background: "var(--bg)",
              }}>
                {CODE_EXAMPLES[lang]}
              </pre>
            </div>
          </div>

          {/* Rate limits */}
          <div style={{ background: "var(--warn-light)", border: "1px solid #fcd34d", borderRadius: "var(--radius-lg)", padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#92400e", marginBottom: 6 }}>
              ⚠ Rate Limits
            </div>
            <p style={{ fontSize: 13, color: "#78350f", lineHeight: 1.6 }}>
              The API currently supports up to 60 requests per minute. Maximum 1,000 rows per request. 
              For bulk generation of 50,000+ rows, make multiple requests and concatenate the results.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
