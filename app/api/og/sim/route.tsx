import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import Logo from "@/components/Logo";

export const runtime = "edge";

const GREEN = "#22c55e";
const RED   = "#ef4444";

function fmtMoney(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

// Bigger swings need a smaller font so "+2,450.0%" still fits on the card.
function pctFontSize(display: string): number {
  if (display.length <= 6)  return 200;
  if (display.length <= 9)  return 150;
  if (display.length <= 12) return 115;
  return 90;
}

export async function GET(req: NextRequest) {
  const p = new URL(req.url).searchParams;

  const stock     = p.get("stock") ?? "STOCK";
  const emoji     = p.get("emoji") ?? "📈";
  const returnPct = Number(p.get("returnPct") ?? "0");
  const amount    = Number(p.get("amount") ?? "0");
  const principal = Number(p.get("principal") ?? "0");
  const period    = p.get("period") ?? "";
  const bankParam = p.get("bankReturn");
  const bankReturn = bankParam !== null && bankParam !== "" ? Number(bankParam) : null;

  const isPositive  = returnPct >= 0;
  const color       = isPositive ? GREEN : RED;
  const pctDisplay  = `${isPositive ? "+" : ""}${returnPct.toFixed(1)}%`;
  const bankDisplay = bankReturn !== null ? `${bankReturn >= 0 ? "+" : ""}${bankReturn.toFixed(1)}%` : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px", height: "630px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "flex-start",
          paddingTop: "56px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        {/* Glow tinted to the result */}
        <div style={{
          position: "absolute", width: "700px", height: "700px",
          top: "-120px", left: "250px",
          background: `radial-gradient(circle, ${isPositive ? "rgba(34,197,94,0.16)" : "rgba(239,68,68,0.16)"} 0%, transparent 65%)`,
          borderRadius: "50%", display: "flex",
        }} />

        {/* Top: emoji + ticker */}
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 4 }}>
          <div style={{ fontSize: 96, lineHeight: 1, display: "flex" }}>{emoji}</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{
              color: "rgba(255,255,255,0.4)", fontSize: 18, fontWeight: 700,
              letterSpacing: "0.14em", textTransform: "uppercase", display: "flex",
            }}>
              Stock Simulator
            </div>
            <div style={{
              color: "#fff", fontSize: 52, fontWeight: 900,
              letterSpacing: "-0.03em", lineHeight: 1.1, display: "flex",
            }}>
              ${stock}
            </div>
          </div>
        </div>

        {/* Center: huge return % */}
        <div style={{
          color, fontSize: pctFontSize(pctDisplay), fontWeight: 900,
          letterSpacing: "-0.04em", lineHeight: 1, marginTop: 4, marginBottom: 16, display: "flex",
        }}>
          {pctDisplay}
        </div>

        {/* Principal -> final amount */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 34, fontWeight: 700, display: "flex" }}>
            {fmtMoney(principal)}
          </div>
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 30, fontWeight: 700, display: "flex" }}>
            →
          </div>
          <div style={{ color: "#fff", fontSize: 42, fontWeight: 900, display: "flex" }}>
            {fmtMoney(amount)}
          </div>
          {period && (
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 22, fontWeight: 600, marginLeft: 6, display: "flex" }}>
              · {period}
            </div>
          )}
        </div>

        {/* Bank deposit comparison — only when provided */}
        {bankDisplay && (
          <div style={{
            display: "flex", alignItems: "center", gap: 10, marginTop: 22,
            background: "rgba(255,255,255,0.07)", borderRadius: 999, padding: "10px 28px",
          }}>
            <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 20, fontWeight: 600, display: "flex" }}>
              🏦 은행예금이었으면 {bankDisplay}였는데
            </div>
          </div>
        )}

        {/* Footer brand */}
        <div style={{
          position: "absolute", bottom: 36, display: "flex",
          alignItems: "center", gap: 12,
        }}>
          <Logo size={28} />
          <div style={{ color: "#00C805", fontSize: 21, fontWeight: 700, letterSpacing: "0.03em", display: "flex" }}>
            rate-my-stock.vercel.app
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
