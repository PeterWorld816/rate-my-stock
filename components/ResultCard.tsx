"use client";
import { useState, useRef } from "react";
import { Result, Mode } from "@/app/page";
import { useLanguage } from "@/lib/i18n";

const riskColors: Record<string, { bg: string; text: string }> = {
  LOW: { bg: "#DCFCE7", text: "#166534" },
  MID: { bg: "#FEF9C3", text: "#854D0E" },
  HIGH: { bg: "#FEE2E2", text: "#991B1B" },
};

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 fade-up" onAnimationEnd={onDone}>
      <div className="rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-xl whitespace-nowrap bg-[#0D0D0D]">
        {message}
      </div>
    </div>
  );
}

// Off-screen card rendered for html2canvas capture — matches the visible design
function StoryCard({
  cardRef,
  result,
  modeLabel,
}: {
  cardRef: React.RefObject<HTMLDivElement>;
  result: Result;
  modeLabel?: string | null;
}) {
  const riskKey = (result.risk || "MID").toUpperCase();
  const risk = riskColors[riskKey] || riskColors["MID"];
  const circumference = 2 * Math.PI * 44;
  const strokeDash = circumference * ((result.score ?? 0) / 100);
  const reasonText =
    result.reason.length > 150 ? result.reason.slice(0, 147) + "..." : result.reason;

  return (
    <div
      ref={cardRef}
      style={{
        position: "fixed",
        left: "-9999px",
        top: 0,
        width: "360px",
        height: "640px",
        borderRadius: "24px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Dark top section */}
      <div style={{
        background: "#0D0D0D",
        flex: "0 0 385px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px 28px 24px",
      }}>
        {/* Header row */}
        <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          {modeLabel ? (
            <span style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.08)", padding: "3px 10px", borderRadius: "999px" }}>
              {modeLabel}
            </span>
          ) : <span />}
          <span style={{ fontSize: "10px", fontWeight: 600, color: "#00C805" }}>ratemystock.app</span>
        </div>

        {/* Emoji */}
        <div style={{ fontSize: "50px", lineHeight: 1, marginBottom: "8px" }}>{result.emoji}</div>

        {/* Ticker */}
        <p style={{ color: "#00C805", fontSize: "54px", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1, marginBottom: "6px" }}>
          ${result.ticker}
        </p>

        {/* Name */}
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", marginBottom: "20px" }}>{result.name}</p>

        {/* Score ring + risk */}
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div style={{ position: "relative", width: "80px", height: "80px" }}>
            <svg viewBox="0 0 100 100" width="80" height="80" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="7" />
              <circle cx="50" cy="50" r="44" fill="none" stroke="#00C805" strokeWidth="7"
                strokeLinecap="round" strokeDasharray={`${strokeDash} ${circumference}`} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontSize: "22px", fontWeight: 800, lineHeight: 1 }}>{result.score ?? 0}</span>
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "7px", fontWeight: 700, letterSpacing: "0.1em", marginTop: "2px" }}>SCORE</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, padding: "4px 12px", borderRadius: "999px", background: risk.bg, color: risk.text }}>
              {riskKey} RISK
            </span>
            {result.archetype && (
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", fontWeight: 500 }}>{result.archetype}</span>
            )}
            {result.celebrity && (
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", fontWeight: 500 }}>
                {result.celebrityEmoji} {result.celebrity?.split(" ").pop()} {result.celebrityMatch}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* White bottom section */}
      <div style={{ background: "#FFFFFF", flex: 1, padding: "18px 28px 16px", display: "flex", flexDirection: "column" }}>
        <p style={{ fontSize: "12.5px", color: "#374151", lineHeight: 1.65, flex: 1 }}>{reasonText}</p>

        {result.extras && result.extras.filter(Boolean).length > 0 && (
          <div style={{ marginTop: "12px" }}>
            <p style={{ fontSize: "9px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.15em", marginBottom: "7px" }}>ALSO CONSIDER</p>
            <div style={{ display: "flex", gap: "6px" }}>
              {result.extras.filter(Boolean).slice(0, 3).map((e) => (
                <div key={e.ticker} style={{ background: "#F5F5F0", borderRadius: "999px", padding: "4px 12px", display: "flex", alignItems: "center", gap: "5px" }}>
                  <span style={{ fontSize: "13px" }}>{e.emoji}</span>
                  <span style={{ color: "#0D0D0D", fontSize: "11px", fontWeight: 700 }}>${e.ticker}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <p style={{ fontSize: "9px", color: "#D1D5DB", marginTop: "12px" }}>For entertainment only · Not financial advice</p>
      </div>
    </div>
  );
}

export default function ResultCard({
  result,
  onReset,
  mode,
}: {
  result: Result;
  onReset: () => void;
  mode?: Mode | null;
}) {
  const { t } = useLanguage();
  const riskKey = (result.risk || "MID").toUpperCase();
  const risk = riskColors[riskKey] || riskColors["MID"];
  const storyRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const circumference = 2 * Math.PI * 44;
  const strokeDash = circumference * ((result.score ?? 0) / 100);
  const modeLabels: Partial<Record<NonNullable<Mode>, string>> = {
    face: t.modeLabelFace, mbti: t.modeLabelMbti, vibe: t.modeLabelVibe,
    salary: t.modeLabelSalary, celebrity: t.modeLabelCeleb, career: t.modeLabelCareer,
  };
  const modeLabel = mode && modeLabels[mode] ? `${modeLabels[mode]} Result` : null;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const share = () => {
    const text = `I got matched to $${result.ticker} (${result.score}/100) on Rate My Stock 📈\nFind yours → ratemystock.app`;
    if (navigator.share) {
      navigator.share({ title: "Rate My Stock", text });
    } else {
      navigator.clipboard.writeText(text);
      showToast("📋 Copied to clipboard!");
    }
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
      showToast("🖼️ Saved! Perfect for Instagram Stories");
    } catch {
      showToast("⚠️ Save failed — please try again");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <StoryCard cardRef={storyRef} result={result} modeLabel={modeLabel} />
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      <section className="px-4 sm:px-6 pb-safe max-w-[480px] mx-auto fade-up">

        {/* Mode label */}
        {modeLabel && (
          <p className="text-center text-[11px] font-semibold text-[#6B7280] uppercase tracking-[0.18em] mb-5">
            {modeLabel}
          </p>
        )}

        {/* ── Main split card ────────────────────────────── */}
        <div className="rounded-3xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.18)] mb-4">

          {/* Dark top ~60% */}
          <div className="bg-[#0D0D0D] px-8 pt-8 pb-9 flex flex-col items-center">
            {/* Big emoji */}
            <div className="text-[64px] leading-none mb-3 select-none">{result.emoji}</div>

            {/* Ticker */}
            <h2
              className="font-display leading-none mb-2 text-center"
              style={{ fontWeight: 800, fontSize: "clamp(3rem,16vw,5rem)", color: "#00C805", letterSpacing: "-0.03em" }}
            >
              ${result.ticker}
            </h2>

            {/* Company name */}
            <p className="text-sm mb-7 text-center" style={{ color: "rgba(255,255,255,0.38)" }}>
              {result.name}
            </p>

            {/* Score ring + risk badge */}
            <div className="flex items-center gap-5">
              <div className="relative w-[88px] h-[88px] flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="7" />
                  <circle
                    cx="50" cy="50" r="44" fill="none"
                    stroke="#00C805" strokeWidth="7" strokeLinecap="round"
                    strokeDasharray={`${strokeDash} ${circumference}`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-white font-bold" style={{ fontSize: "24px", lineHeight: 1 }}>
                    {result.score ?? 0}
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "7px", fontWeight: 700, letterSpacing: "0.12em", marginTop: "3px" }}>
                    SCORE
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 items-start">
                <span
                  className="text-xs font-bold px-3 py-1.5 rounded-full"
                  style={{ background: risk.bg, color: risk.text }}
                >
                  {riskKey} RISK
                </span>
                {result.archetype && (
                  <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.48)" }}>
                    {result.archetype}
                  </span>
                )}
                {result.celebrity && (
                  <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.48)" }}>
                    {result.celebrityEmoji} {result.celebrity?.split(" ").pop()} {result.celebrityMatch}%
                  </span>
                )}
              </div>
            </div>

            {/* MBTI investor code chips */}
            {result.investorCode && (
              <div className="mt-5 flex gap-2">
                {result.investorCode.split("").map((letter, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: "rgba(0,200,5,0.16)" }}
                  >
                    {letter}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* White bottom ~40% */}
          <div className="bg-white px-8 pt-6 pb-6">
            <p className="text-sm text-[#374151] leading-relaxed mb-5">
              {result.reason}
            </p>

            {/* Also Consider — horizontal scroll pills */}
            {result.extras && result.extras.filter(Boolean).length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-[0.15em] mb-3">
                  {t.alsoConsider}
                </p>
                <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-8 px-8 pb-1">
                  {result.extras.filter(Boolean).map((e) => (
                    <div
                      key={e.ticker}
                      className="flex-shrink-0 flex items-center gap-1.5 rounded-full bg-[#F5F5F0] px-4 py-2"
                    >
                      <span className="text-base leading-none">{e.emoji}</span>
                      <span className="text-xs font-bold text-[#0D0D0D]">${e.ticker}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-[10px] text-[#9CA3AF] text-center mb-5">
          {t.resultDisclaimer}
        </p>

        {/* 3 action buttons */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={share}
            className="card-hover rounded-xl py-3.5 flex flex-col items-center justify-center gap-1 bg-[#0D0D0D] text-white"
          >
            <span className="text-base">↗</span>
            <span className="text-xs font-semibold">{t.resultShareBtn}</span>
          </button>

          <button
            onClick={saveAsImage}
            disabled={saving}
            className="card-hover rounded-xl py-3.5 flex flex-col items-center justify-center gap-1 text-white disabled:opacity-60"
            style={{ background: "#00C805" }}
          >
            {saving ? (
              <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span className="text-base">↓</span>
                <span className="text-xs font-semibold">{t.resultSaveBtn}</span>
              </>
            )}
          </button>

          <button
            onClick={onReset}
            className="card-hover rounded-xl py-3.5 flex flex-col items-center justify-center gap-1 bg-white shadow-sm border border-[#E5E5E0] text-[#0D0D0D]"
          >
            <span className="text-base">↩</span>
            <span className="text-xs font-semibold">{t.resultRetryBtn}</span>
          </button>
        </div>
      </section>
    </>
  );
}
