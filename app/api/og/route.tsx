import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const RISK: Record<string, { bg: string; fg: string }> = {
  LOW:  { bg: "#DCFCE7", fg: "#166534" },
  MID:  { bg: "#FEF9C3", fg: "#854D0E" },
  HIGH: { bg: "#FEE2E2", fg: "#991B1B" },
};

const MODE_LABEL: Record<string, string> = {
  face:      "Face Read",
  mbti:      "Stock MBTI",
  vibe:      "Today's Vibe",
  salary:    "Personality Quiz",
  celebrity: "Celebrity Match",
  career:    "Career Match",
};

export async function GET(req: NextRequest) {
  const p  = new URL(req.url).searchParams;
  const t  = p.get("t") ?? "STOCK";
  const n  = p.get("n") ?? "";
  const s  = p.get("s") ?? "0";
  const rk = (p.get("r") ?? "MID").toUpperCase();
  const e  = p.get("e") ?? "📈";
  const m  = p.get("m") ?? "";

  const risk  = RISK[rk] ?? RISK.MID;
  const label = MODE_LABEL[m] ?? "AI Match";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px", height: "630px", background: "#0D0D0D",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        {/* Subtle radial glow */}
        <div style={{
          position: "absolute", width: "600px", height: "600px",
          top: "15px", left: "300px",
          background: "radial-gradient(circle, rgba(0,200,5,0.08) 0%, transparent 65%)",
          borderRadius: "50%", display: "flex",
        }} />

        {/* Mode chip — top left */}
        <div style={{
          position: "absolute", top: 42, left: 56, display: "flex",
          background: "rgba(0,200,5,0.15)", borderRadius: 999,
          padding: "6px 18px", color: "#00C805",
          fontSize: 15, fontWeight: 700, letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}>
          {label}
        </div>

        {/* Domain — top right */}
        <div style={{
          position: "absolute", top: 42, right: 56, display: "flex",
          color: "#00C805", fontSize: 16, fontWeight: 700, letterSpacing: "0.05em",
        }}>
          ratemystock.app
        </div>

        {/* Emoji */}
        <div style={{ fontSize: 88, lineHeight: 1, marginBottom: 20, display: "flex" }}>
          {e}
        </div>

        {/* Ticker */}
        <div style={{
          color: "#00C805", fontSize: 100, fontWeight: 900,
          letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 12, display: "flex",
        }}>
          ${t}
        </div>

        {/* Company name */}
        {n && (
          <div style={{
            color: "rgba(255,255,255,0.38)", fontSize: 26, marginBottom: 36, display: "flex",
          }}>
            {n}
          </div>
        )}

        {/* Score + Risk pills */}
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{
            background: "rgba(0,200,5,0.12)", borderRadius: 999,
            padding: "12px 32px", display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ color: "#00C805", fontSize: 34, fontWeight: 800 }}>{s}</span>
            <span style={{ color: "rgba(0,200,5,0.45)", fontSize: 24, fontWeight: 700 }}>/100</span>
          </div>
          <div style={{
            background: risk.bg, borderRadius: 999,
            padding: "12px 28px", display: "flex",
          }}>
            <span style={{ color: risk.fg, fontSize: 22, fontWeight: 700 }}>{rk} RISK</span>
          </div>
        </div>

        {/* Footer tagline */}
        <div style={{
          position: "absolute", bottom: 36, display: "flex",
          color: "rgba(255,255,255,0.16)", fontSize: 16, letterSpacing: "0.03em",
        }}>
          AI가 분석한 나의 주식 타입 · Rate My Stock
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
