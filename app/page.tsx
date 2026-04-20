"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import { DOMAINS, COUNTRIES, ROW_OPTIONS, FORMATS } from "./lib/constants";

type GenerationState = "idle" | "generating" | "done" | "error";

interface ParsedRow {
  [key: string]: string;
}

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [domain, setDomain] = useState("healthcare");
  const [country, setCountry] = useState("NG");
  const [rows, setRows] = useState(1000);
  const [format, setFormat] = useState("CSV");
  const [state, setState] = useState<GenerationState>("idle");
  const [rawOutput, setRawOutput] = useState("");
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [stats, setStats] = useState({ totalDatasets: 1247, totalRows: 48392810, countries: 15 });
  const [error, setError] = useState("");
  const outputRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const selectedDomain = DOMAINS.find(d => d.id === domain)!;
  const selectedCountry = COUNTRIES.find(c => c.code === country)!;

  useEffect(() => {
    fetch("/api/stats").then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  // Auto scroll output
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [rawOutput]);

  const parseCSV = useCallback((text: string) => {
    const lines = text.trim().split("\n").filter(l => l.trim());
    if (lines.length < 2) return;
    const hdrs = lines[0].split(",").map(h => h.trim().replace(/"/g, ""));
    setHeaders(hdrs);
    const dataRows = lines.slice(1).map(line => {
      const values = line.split(",").map(v => v.trim().replace(/"/g, ""));
      const obj: ParsedRow = {};
      hdrs.forEach((h, i) => { obj[h] = values[i] || ""; });
      return obj;
    });
    setParsedRows(dataRows);
    setRowCount(dataRows.length);
  }, []);

  const generate = async () => {
    if (!prompt.trim()) return;
    setState("generating");
    setRawOutput("");
    setParsedRows([]);
    setHeaders([]);
    setRowCount(0);
    setError("");

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, domain, country: selectedCountry.name, rows, format }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) throw new Error(await res.text());
      if (!res.body) throw new Error("No stream");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setRawOutput(accumulated);

        // Parse incrementally
        if (format === "CSV") {
          parseCSV(accumulated);
        } else if (format === "JSON" || format === "JSONL") {
          try {
            const lines = accumulated.split("\n").filter(l => l.trim().startsWith("{"));
            const parsed = lines.map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
            if (parsed.length > 0) {
              setHeaders(Object.keys(parsed[0]));
              setParsedRows(parsed as ParsedRow[]);
              setRowCount(parsed.length);
            }
          } catch (_) {}
        }
      }

      setState("done");
      setStats(prev => ({
        ...prev,
        totalDatasets: prev.totalDatasets + 1,
        totalRows: prev.totalRows + rows,
      }));
    } catch (e: unknown) {
      if ((e as Error).name === "AbortError") {
        setState("idle");
      } else {
        setError(e instanceof Error ? e.message : "Generation failed");
        setState("error");
      }
    }
  };

  const download = () => {
    const blob = new Blob([rawOutput], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `afrigen-${domain}-${country.toLowerCase()}-${Date.now()}.${format.toLowerCase()}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stop = () => {
    abortRef.current?.abort();
    setState("done");
  };

  const reset = () => {
    setState("idle");
    setRawOutput("");
    setParsedRows([]);
    setHeaders([]);
    setRowCount(0);
    setError("");
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />

      {/* Hero */}
      <div style={{
        background: "linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)",
        borderBottom: "1px solid var(--border)",
        padding: "48px 24px 40px",
      }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "var(--accent-light)", border: "1px solid var(--accent-mid)",
              borderRadius: 20, padding: "4px 14px", marginBottom: 20,
              fontSize: 12, color: "var(--accent)", fontWeight: 500,
            }}>
              🌍 Built for Africa
            </div>

            <h1 style={{
              fontSize: "clamp(28px, 5vw, 48px)",
              fontWeight: 700, color: "var(--text)",
              lineHeight: 1.15, marginBottom: 16,
              letterSpacing: "-0.02em",
            }}>
              Generate African synthetic data<br />
              <span style={{ color: "var(--accent)" }}>in seconds.</span>
            </h1>

            <p style={{
              fontSize: 18, color: "var(--text-muted)",
              maxWidth: 560, margin: "0 auto 32px",
              lineHeight: 1.7,
            }}>
              AI-powered synthetic datasets for healthcare, finance, and agriculture — 
              culturally accurate, statistically realistic, ready to train your models.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap" }}
          >
            {[
              { label: "Datasets Generated", value: stats.totalDatasets.toLocaleString() },
              { label: "Total Rows", value: `${(stats.totalRows / 1000000).toFixed(1)}M+` },
              { label: "African Countries", value: stats.countries.toString() },
              { label: "Domains", value: "3" },
            ].map(({ label, value }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text)" }}>{value}</div>
                <div style={{ fontSize: 12, color: "var(--text-dim)" }}>{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "340px 1fr",
          gap: 24,
          alignItems: "start",
        }}>

          {/* LEFT — Config panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            {/* Domain selector */}
            <div style={{
              background: "var(--bg)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)", padding: 16,
              boxShadow: "var(--shadow-sm)",
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 10, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Domain
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {DOMAINS.map(d => (
                  <button
                    key={d.id}
                    onClick={() => setDomain(d.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 12px", borderRadius: "var(--radius)",
                      border: `1px solid ${domain === d.id ? d.color : "var(--border)"}`,
                      background: domain === d.id ? d.light : "var(--bg)",
                      cursor: "pointer", transition: "all 0.15s", textAlign: "left",
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{d.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: domain === d.id ? d.color : "var(--text)" }}>
                        {d.name}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-dim)" }}>{d.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Country */}
            <div style={{
              background: "var(--bg)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)", padding: 16,
              boxShadow: "var(--shadow-sm)",
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 10, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Country
              </div>
              <select
                value={country}
                onChange={e => setCountry(e.target.value)}
                style={{
                  width: "100%", padding: "8px 12px",
                  border: "1px solid var(--border)", borderRadius: "var(--radius)",
                  fontSize: 14, color: "var(--text)", background: "var(--bg)",
                  cursor: "pointer", outline: "none",
                  fontFamily: "var(--sans)",
                }}
              >
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name} — {c.continent}
                  </option>
                ))}
              </select>
            </div>

            {/* Rows + Format */}
            <div style={{
              background: "var(--bg)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)", padding: 16,
              boxShadow: "var(--shadow-sm)",
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 10, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Rows & Format
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                {ROW_OPTIONS.map(r => (
                  <button
                    key={r}
                    onClick={() => setRows(r)}
                    style={{
                      padding: "5px 10px", borderRadius: 6, fontSize: 12, fontWeight: 500,
                      border: `1px solid ${rows === r ? "var(--accent)" : "var(--border)"}`,
                      background: rows === r ? "var(--accent-light)" : "var(--bg)",
                      color: rows === r ? "var(--accent)" : "var(--text-muted)",
                      cursor: "pointer", transition: "all 0.1s",
                    }}
                  >
                    {r.toLocaleString()}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {FORMATS.map(f => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    style={{
                      flex: 1, padding: "6px", borderRadius: 6, fontSize: 12, fontWeight: 600,
                      border: `1px solid ${format === f ? "var(--accent2)" : "var(--border)"}`,
                      background: format === f ? "var(--accent2-light)" : "var(--bg)",
                      color: format === f ? "var(--accent2)" : "var(--text-muted)",
                      cursor: "pointer", fontFamily: "var(--mono)",
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* RIGHT — Generator */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            {/* Prompt input */}
            <div style={{
              background: "var(--bg)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)", padding: 16,
              boxShadow: "var(--shadow-sm)",
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 10, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Describe your dataset
              </div>

              {/* Example prompts */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                {selectedDomain.examples.slice(0, 2).map(ex => (
                  <button
                    key={ex}
                    onClick={() => setPrompt(ex)}
                    style={{
                      padding: "4px 10px", borderRadius: 20, fontSize: 11,
                      border: "1px solid var(--border)", background: "var(--bg-secondary)",
                      color: "var(--text-muted)", cursor: "pointer",
                      transition: "all 0.1s",
                    }}
                  >
                    {ex}
                  </button>
                ))}
              </div>

              <div style={{ position: "relative" }}>
                <textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder={`e.g. ${selectedDomain.examples[0]}`}
                  rows={3}
                  style={{
                    width: "100%", padding: "12px 14px",
                    border: "1px solid var(--border)", borderRadius: "var(--radius)",
                    fontSize: 14, color: "var(--text)", background: "var(--bg)",
                    outline: "none", resize: "none", fontFamily: "var(--sans)",
                    lineHeight: 1.6, transition: "border-color 0.15s",
                  }}
                  onFocus={e => e.target.style.borderColor = "var(--accent)"}
                  onBlur={e => e.target.style.borderColor = "var(--border)"}
                  onKeyDown={e => { if (e.key === "Enter" && e.metaKey) generate(); }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
                <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
                  {selectedCountry.flag} {selectedCountry.name} · {rows.toLocaleString()} rows · {format}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {state === "generating" && (
                    <button
                      onClick={stop}
                      style={{
                        padding: "8px 16px", borderRadius: "var(--radius)",
                        border: "1px solid var(--danger)", background: "var(--danger-light)",
                        color: "var(--danger)", fontSize: 13, fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Stop
                    </button>
                  )}
                  {(state === "done" || state === "error") && (
                    <button
                      onClick={reset}
                      style={{
                        padding: "8px 16px", borderRadius: "var(--radius)",
                        border: "1px solid var(--border)", background: "var(--bg-secondary)",
                        color: "var(--text-muted)", fontSize: 13, fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Reset
                    </button>
                  )}
                  <button
                    onClick={generate}
                    disabled={!prompt.trim() || state === "generating"}
                    style={{
                      padding: "8px 20px", borderRadius: "var(--radius)",
                      border: "none",
                      background: !prompt.trim() || state === "generating"
                        ? "var(--border)" : "var(--accent)",
                      color: !prompt.trim() || state === "generating"
                        ? "var(--text-dim)" : "white",
                      fontSize: 13, fontWeight: 600,
                      cursor: !prompt.trim() || state === "generating" ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", gap: 6,
                      transition: "all 0.15s",
                    }}
                  >
                    {state === "generating" ? (
                      <>
                        <div style={{
                          width: 12, height: 12, borderRadius: "50%",
                          border: "2px solid rgba(255,255,255,0.3)",
                          borderTop: "2px solid white",
                          animation: "spin 0.7s linear infinite",
                        }} />
                        Generating...
                      </>
                    ) : "Generate ⌘↵"}
                  </button>
                </div>
              </div>
            </div>

            {/* Output area */}
            <AnimatePresence>
              {(state === "generating" || state === "done" || state === "error") && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    background: "var(--bg)", border: "1px solid var(--border)",
                    borderRadius: "var(--radius-lg)",
                    boxShadow: "var(--shadow-sm)",
                    overflow: "hidden",
                  }}
                >
                  {/* Output header */}
                  <div style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid var(--border)",
                    background: "var(--bg-secondary)",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: state === "generating" ? "var(--warn)"
                          : state === "done" ? "var(--accent)" : "var(--danger)",
                        animation: state === "generating" ? "pulse 1s ease-in-out infinite" : "none",
                      }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                        {state === "generating" ? "Generating..." : state === "done" ? "Complete" : "Error"}
                      </span>
                      {rowCount > 0 && (
                        <span style={{
                          fontSize: 11, color: "var(--accent)", fontWeight: 500,
                          background: "var(--accent-light)", padding: "2px 8px",
                          borderRadius: 20,
                        }}>
                          {rowCount.toLocaleString()} rows
                        </span>
                      )}
                    </div>
                    {state === "done" && rawOutput && (
                      <button
                        onClick={download}
                        style={{
                          display: "flex", alignItems: "center", gap: 6,
                          padding: "6px 14px", borderRadius: "var(--radius)",
                          border: "none", background: "var(--accent)",
                          color: "white", fontSize: 12, fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        ⬇ Download {format}
                      </button>
                    )}
                  </div>

                  {/* Table view */}
                  {parsedRows.length > 0 && headers.length > 0 ? (
                    <div style={{ overflowX: "auto", maxHeight: 420, overflowY: "auto" }} ref={outputRef}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                        <thead style={{ position: "sticky", top: 0, background: "var(--bg-tertiary)" }}>
                          <tr>
                            {headers.map(h => (
                              <th key={h} style={{
                                padding: "8px 12px", textAlign: "left",
                                fontWeight: 600, color: "var(--text-muted)",
                                borderBottom: "1px solid var(--border)",
                                whiteSpace: "nowrap", fontSize: 11,
                                letterSpacing: "0.04em", textTransform: "uppercase",
                              }}>
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {parsedRows.slice(0, 100).map((row, i) => (
                            <motion.tr
                              key={i}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.1 }}
                              style={{ borderBottom: "1px solid var(--border)" }}
                            >
                              {headers.map(h => (
                                <td key={h} style={{
                                  padding: "7px 12px",
                                  color: "var(--text)",
                                  whiteSpace: "nowrap",
                                  maxWidth: 180,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}>
                                  {row[h]}
                                </td>
                              ))}
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                      {parsedRows.length > 100 && (
                        <div style={{
                          padding: "10px 16px", textAlign: "center",
                          fontSize: 12, color: "var(--text-dim)",
                          borderTop: "1px solid var(--border)",
                          background: "var(--bg-secondary)",
                        }}>
                          Showing 100 of {parsedRows.length.toLocaleString()} rows — Download to see all
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Raw streaming text — ChatGPT style */
                    <div
                      ref={outputRef}
                      style={{
                        padding: 16, maxHeight: 420, overflowY: "auto",
                        fontFamily: "var(--mono)", fontSize: 12,
                        lineHeight: 1.7, color: "var(--text-muted)",
                        whiteSpace: "pre-wrap", wordBreak: "break-all",
                      }}
                    >
                      {rawOutput}
                      {state === "generating" && (
                        <span style={{
                          display: "inline-block", width: 8, height: 14,
                          background: "var(--accent)", marginLeft: 2,
                          animation: "blink 0.7s ease-in-out infinite",
                          verticalAlign: "text-bottom",
                        }} />
                      )}
                    </div>
                  )}

                  {/* Error */}
                  {state === "error" && (
                    <div style={{
                      padding: 16, color: "var(--danger)",
                      fontSize: 13, fontFamily: "var(--mono)",
                    }}>
                      ⚠ {error}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Empty state */}
            {state === "idle" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  background: "var(--bg-secondary)", border: "1px dashed var(--border-strong)",
                  borderRadius: "var(--radius-lg)", padding: 40,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>🌍</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>
                  Your dataset will appear here
                </div>
                <div style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6 }}>
                  Describe what you need, configure the options on the left,<br />
                  and hit Generate to create your African synthetic dataset.
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}