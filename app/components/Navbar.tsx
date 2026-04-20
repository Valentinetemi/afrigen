"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: "/", label: "Generator" },
    { href: "/catalog", label: "Catalog" },
    { href: "/docs", label: "API Docs" },
  ];

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(255,255,255,0.9)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid var(--border)",
      padding: "0 24px",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        height: 60,
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, #16a34a, #0ea5e9)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16,
          }}>
            🌍
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", lineHeight: 1 }}>
              AfriGen
            </div>
            <div style={{ fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.05em" }}>
              African Data Infrastructure
            </div>
          </div>
        </Link>

        {/* Desktop links */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {links.map(link => (
            <Link key={link.href} href={link.href} style={{ textDecoration: "none" }}>
              <div style={{
                padding: "6px 14px", borderRadius: 6,
                fontSize: 14, fontWeight: 500,
                color: pathname === link.href ? "var(--accent)" : "var(--text-muted)",
                background: pathname === link.href ? "var(--accent-light)" : "transparent",
                transition: "all 0.15s",
              }}>
                {link.label}
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "var(--accent-light)",
            border: "1px solid var(--accent-mid)",
            borderRadius: 20, padding: "4px 12px",
            fontSize: 12, color: "var(--accent)", fontWeight: 500,
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "var(--accent)",
              animation: "pulse 2s ease-in-out infinite",
            }} />
            API Live
          </div>
        </div>
      </div>
    </nav>
  );
}
