"use client";
import { useState, useRef } from "react";
import { Result } from "@/app/page";

const riskColors: Record<string, { bg: string; text: string }> = {
  LOW: { bg: "#DCFCE7", text: "#166534" },
  MID: { bg: "#FEF9C3", text: "#854D0E" },
  HIGH: { bg: "#FEE2E2", text: "#991B1B" },
};

const CODE_EXPANSIONS: Record<string, { label: string; desc: string }> = {
  A: { label: "A", desc: "Aggressive" },
  S: { label: "S", desc: "Stable" },
  G: { label: "G", desc: "Growth" },
  V: { label: "V", desc: "Value" },
  T: { label: "T", desc: "Tech" },
  B: { label: "B", desc: "Broad" },
  R: { label: "R", desc: "Reactive" },
  P: { label: "P", desc: "Patient" },
};

const AXIS_NAMES = ["Risk", "Style", "Sector", "Time"];

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  return (
    <div
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 fade-up"
      onAnimationEnd={onDone}
    >
      <div
        className="rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-xl whitespace-nowrap"
        style={{ background: "linear-gradient(135deg, #0D0D0D, #1F2937)" }}
      >
        {message}
      </div>
    </div>
  );
}

// Story card rendered off-screen for html2canvas capture
function StoryCard({
  cardRef,
  result,
}: {
  cardRef: React.RefObject<HTMLDivElement>;
  result: Result;
}) {
  const riskKey = (result.risk || "MID").toUpperCase();
  const risk = riskColors[riskKey] || riskColors["MID"];
  const circumference = 2 * Math.PI * 44;
  const strokeDash = circumference * ((result.score ?? 0) / 100);
  const reasonText =
    result.reason.length > 160
      ? result.reason.slice(0, 157) + "..."
      : result.reason;

  return (
    <div
      ref={cardRef}
      style={{
        position: "fixed",
        left: "-9999px",
        top: 0,
        width: "360px",
        height: "640px",
        background: "#0D0D0D",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Glow overlays */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 200px 200px at 20% 30%, rgba(0,208,132,0.18), transparent)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 180px 180px at 80% 70%, rgba(124,58,237,0.18), transparent)",
        pointerEvents: "none",
      }} />

      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "22px 24px 0",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{
            width: "24px", height: "24px", borderRadius: "6px",
            background: "linear-gradient(135deg, #00D084, #7C3AED)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "11px",
          }}>📈</div>
          <span style={{ color: "#00D084", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em" }}>
            RATE MY STOCK
          </span>
        </div>
        <span style={{
          color: "#6B7280", fontSize: "10px", fontWeight: 500,
          border: "1px solid #374151", borderRadius: "999px", padding: "2px 8px",
        }}>
          ratemystock.app
        </span>
      </div>

      {/* Main content */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", padding: "0 28px",
        marginTop: "-8px",
      }}>
        {/* Label */}
        <p style={{ color: "#6B7280", fontSize: "11px", letterSpacing: "0.12em", marginBottom: "10px", fontWeight: 500 }}>
          YOUR STOCK MATCH
        </p>

        {/* Emoji */}
        <div style={{ fontSize: "56px", lineHeight: 1, marginBottom: "10px" }}>
          {result.emoji}
        </div>

        {/* Ticker */}
        <p style={{
          color: "#00D084", fontSize: "48px", fontWeight: 800,
          letterSpacing: "-0.02em", lineHeight: 1, marginBottom: "6px",
        }}>
          ${result.ticker}
        </p>

        {/* Company name */}
        <p style={{ color: "#9CA3AF", fontSize: "13px", marginBottom: "22px", textAlign: "center" }}>
          {result.name}
        </p>

        {/* Score + Risk row */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "22px" }}>
          {/* Score ring */}
          <div style={{ position: "relative", width: "88px", height: "88px" }}>
            <svg viewBox="0 0 100 100" width="88" height="88" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
              <circle cx="50" cy="50" r="44" fill="none" stroke="#00D084" strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${strokeDash} ${circumference}`} />
            </svg>
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ color: "#fff", fontSize: "22px", fontWeight: 800, lineHeight: 1 }}>
                {result.score ?? 0}
              </span>
              <span style={{ color: "#6B7280", fontSize: "8px", fontWeight: 600, marginTop: "2px" }}>SCORE</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span style={{
              fontSize: "11px", fontWeight: 700, padding: "4px 12px",
              borderRadius: "999px", background: risk.bg, color: risk.text,
            }}>
              {riskKey} RISK
            </span>
            {result.archetype && (
              <span style={{ color: "#C4B5FD", fontSize: "12px", fontWeight: 600 }}>
                {result.archetype}
              </span>
            )}
            {result.celebrity && (
              <span style={{ color: "#FCD34D", fontSize: "12px", fontWeight: 600 }}>
                {result.celebrityEmoji} {result.celebrity?.split(" ").slice(-1)[0]} {result.celebrityMatch}% match
              </span>
            )}
          </div>
        </div>

        {/* Reason */}
        <div style={{
          background: "rgba(255,255,255,0.05)", borderRadius: "14px",
          padding: "14px 16px", marginBottom: "18px", width: "100%",
        }}>
          <p style={{
            color: "#D1D5DB", fontSize: "12px", lineHeight: "1.6",
            textAlign: "center",
          }}>
            "{reasonText}"
          </p>
        </div>

        {/* Also consider */}
        {result.extras && result.extras.length > 0 && (
          <div style={{ width: "100%", textAlign: "center" }}>
            <p style={{ color: "#6B7280", fontSize: "10px", letterSpacing: "0.1em", marginBottom: "8px", fontWeight: 600 }}>
              ALSO CONSIDER
            </p>
            <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
              {result.extras.filter(Boolean).slice(0, 2).map((e) => (
                <div key={e.ticker} style={{
                  background: "rgba(255,255,255,0.07)", borderRadius: "10px",
                  padding: "6px 14px", display: "flex", alignItems: "center", gap: "5px",
                }}>
                  <span style={{ fontSize: "14px" }}>{e.emoji}</span>
                  <span style={{ color: "#E5E7EB", fontSize: "12px", fontWeight: 700 }}>${e.ticker}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: "12px 24px 20px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        display: "flex", justifyContent: "center", alignItems: "center", gap: "6px",
      }}>
        <span style={{ color: "#4B5563", fontSize: "11px" }}>Find your match →</span>
        <span style={{ color: "#00D084", fontSize: "11px", fontWeight: 600 }}>ratemystock.app</span>
      </div>
    </div>
  );
}

export default function ResultCard({ result, onReset }: { result: Result; onReset: () => void }) {
  const riskKey = (result.risk || "MID").toUpperCase();
  const risk = riskColors[riskKey] || riskColors["MID"];
  const storyRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const share = () => {
    const text = `I just got matched to $${result.ticker} (${result.score}/100) on Rate My Stock 📈\n\nFind your stock match → ratemystock.app`;
    if (navigator.share) {
      navigator.share({ title: "Rate My Stock", text });
    } else {
      navigator.clipboard.writeText(text);
      showToast("📋 Copied to clipboard!");
    }
  };

  const shareKakao = () => {
    const text = `📈 나의 주식 매칭 결과!\n\n${result.emoji} $${result.ticker} — ${result.score}점 매칭\n"${result.reason.slice(0, 80)}..."\n\n👉 ratemystock.app 에서 내 주식 찾아봐!`;
    navigator.clipboard.writeText(text).then(() => {
      showToast("💛 클립보드 복사 완료! 카카오톡에 붙여넣기 하세요");
    }).catch(() => {
      showToast("💛 카카오톡에서 공유해보세요!");
    });
    // Try mobile deep link as well
    setTimeout(() => {
      window.location.href = `kakaotalk://send?text=${encodeURIComponent(text)}`;
    }, 300);
  };

  const saveAsImage = async () => {
    if (!storyRef.current || saving) return;
    setSaving(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(storyRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#0D0D0D",
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `ratemystock-${result.ticker}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      showToast("🖼️ 이미지 저장 완료! 인스타 스토리에 올려봐요");
    } catch (err) {
      console.error("html2canvas error:", err);
      showToast("⚠️ 저장 실패 — 다시 시도해주세요");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Hidden story card for html2canvas */}
      <StoryCard cardRef={storyRef} result={result} />

      {/* Toast */}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      <section className="px-6 pb-24 max-w-md mx-auto fade-up">

        {/* Celebrity match banner */}
        {result.celebrity && (
          <div className="rounded-2xl p-4 mb-4 relative overflow-hidden border"
            style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}>
            <div className="absolute top-0 left-0 right-0 h-0.5"
              style={{ background: "linear-gradient(90deg, #F59E0B, #D97706)" }} />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                  style={{ background: "#FEF3C7" }}>
                  {result.celebrityEmoji}
                </div>
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: "#D97706" }}>
                    🌟 Celebrity Match
                  </p>
                  <p className="font-bold text-sm text-[#0D0D0D]">{result.celebrity}</p>
                  <p className="text-xs" style={{ color: "#92400E" }}>
                    {result.celebrity === "Jim Cramer" ? "Inverse this at your own risk 😂" : "Your investor twin"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-display font-bold text-2xl" style={{ color: "#D97706" }}>
                  {result.celebrityMatch}%
                </p>
                <p className="text-[9px] text-[#92400E] font-medium">style match</p>
              </div>
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-[#FDE68A] overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${result.celebrityMatch ?? 0}%`, background: "linear-gradient(90deg, #F59E0B, #D97706)" }} />
            </div>
          </div>
        )}

        {/* MBTI Investor Type card */}
        {result.investorCode && (
          <div className="rounded-2xl p-5 mb-4 border" style={{ background: "#F5F3FF", borderColor: "#DDD6FE" }}>
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: "#7C3AED" }}>
              🧬 투자자 유형 코드
            </p>
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <div className="flex gap-1.5">
                {result.investorCode.split("").map((letter, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg font-display font-bold text-white shadow-sm"
                      style={{ background: "linear-gradient(135deg, #7C3AED, #A855F7)" }}>
                      {letter}
                    </div>
                    <span className="text-[8px] mt-0.5 font-medium" style={{ color: "#7C3AED" }}>
                      {AXIS_NAMES[i]}
                    </span>
                  </div>
                ))}
              </div>
              {result.archetype && (
                <p className="font-bold text-lg leading-tight" style={{ color: "#4C1D95" }}>
                  {result.archetype}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {result.investorCode.split("").map((letter) => (
                CODE_EXPANSIONS[letter] && (
                  <span key={letter} className="text-xs px-2.5 py-1 rounded-full font-semibold"
                    style={{ background: "#EDE9FE", color: "#6D28D9" }}>
                    {letter} · {CODE_EXPANSIONS[letter].desc}
                  </span>
                )
              ))}
            </div>
          </div>
        )}

        {/* Main result card */}
        <div className="rounded-3xl bg-[#0D0D0D] text-white p-8 mb-4 relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 opacity-20 pointer-events-none"
            style={{ background: "radial-gradient(circle at 30% 50%, #00D084, transparent 60%), radial-gradient(circle at 70% 30%, #7C3AED, transparent 60%)" }} />

          <div className="relative z-10">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Your Stock Match</p>

            <div className="flex items-end gap-3 mb-2">
              <span className="text-5xl font-display font-bold" style={{ color: "var(--green)" }}>
                ${result.ticker}
              </span>
              <span className="text-4xl mb-1">{result.emoji}</span>
            </div>

            <p className="text-gray-300 text-sm mb-6">{result.name}</p>

            <div className="flex items-center gap-4 mb-6">
              <div className="relative w-20 h-20">
                <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="#ffffff15" strokeWidth="6" />
                  <circle cx="40" cy="40" r="32" fill="none" stroke="#00D084" strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 32 * (result.score ?? 0) / 100} ${2 * Math.PI * 32}`} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-display font-bold text-xl">{result.score ?? 0}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Match Score</p>
                <span className="text-xs font-semibold px-2 py-1 rounded-full"
                  style={{ background: risk.bg, color: risk.text }}>
                  {riskKey} RISK
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed border-t border-white/10 pt-4">
              {result.reason}
            </p>
          </div>
        </div>

        {/* Also consider */}
        <div className="rounded-2xl bg-white border border-[#E5E5E0] p-5 mb-4 shadow-sm">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest mb-3">Also Consider</p>
          <div className="flex gap-3">
            {(result.extras || []).filter(Boolean).map((e) => (
              <div key={e.ticker} className="flex-1 rounded-2xl bg-[#FAFAF8] border border-[#E5E5E0] p-3 text-center">
                <div className="text-xl mb-1">{e.emoji}</div>
                <p className="font-display font-bold text-sm">${e.ticker}</p>
                <p className="text-[10px] text-[#6B7280]">{e.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-[10px] text-[#9CA3AF] text-center mb-5 leading-relaxed">
          ⚠️ This is for entertainment only. Not financial advice. Please do your own research before investing.
        </p>

        {/* Save as Image — full width */}
        <button
          onClick={saveAsImage}
          disabled={saving}
          className="w-full rounded-2xl py-3.5 text-sm font-semibold text-white mb-3 flex items-center justify-center gap-2 transition-opacity disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #0D9488, #0EA5E9)" }}
        >
          {saving ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              저장 중...
            </>
          ) : (
            <>
              <span>🖼️</span>
              Save as Image · 인스타 스토리용 (9:16)
            </>
          )}
        </button>

        {/* Share row */}
        <div className="flex gap-3">
          <button
            onClick={share}
            className="flex-1 rounded-2xl py-3.5 text-sm font-semibold text-white shadow-lg"
            style={{ background: "linear-gradient(135deg, #00D084, #7C3AED)" }}
          >
            Share 📤
          </button>

          <button
            onClick={shareKakao}
            className="flex-1 rounded-2xl py-3.5 text-sm font-semibold flex items-center justify-center gap-1.5 border border-[#E5E5E0] bg-white"
            style={{ color: "#3A1D1D" }}
          >
            <span className="text-base">💛</span>
            <span>카카오톡</span>
          </button>

          <button
            onClick={onReset}
            className="rounded-2xl border border-[#E5E5E0] bg-white px-5 py-3.5 text-sm font-semibold text-[#374151]"
          >
            Retry
          </button>
        </div>
      </section>
    </>
  );
}
