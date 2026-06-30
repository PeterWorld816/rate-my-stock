"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toPng } from "html-to-image";
import { Result, Mode } from "@/app/page";
import { useLanguage } from "@/lib/i18n";

// ── Static data ───────────────────────────────────────────────────────────────

const RISK_COLORS = {
  LOW:  { bg: "#DCFCE7", text: "#166534" },
  MID:  { bg: "#FEF9C3", text: "#854D0E" },
  HIGH: { bg: "#FEE2E2", text: "#991B1B" },
};

const MODE_LABEL: Record<string, string> = {
  face:      "Face Read",
  mbti:      "Stock MBTI",
  vibe:      "Today's Vibe",
  salary:    "Personality Quiz",
  celebrity: "Celebrity Match",
  career:    "Career Match",
};

const MODE_TAGS: Record<string, string[]> = {
  face:      ["#RateMyStock", "#FaceRead", "#AI주식"],
  mbti:      ["#RateMyStock", "#StockMBTI", "#MBTI"],
  vibe:      ["#RateMyStock", "#투자바이브", "#오늘의주식"],
  salary:    ["#RateMyStock", "#성격테스트", "#주식타입"],
  celebrity: ["#RateMyStock", "#셀럽매칭", "#투자스타일"],
  career:    ["#RateMyStock", "#직업테스트", "#주식추천"],
};

// ── Types ─────────────────────────────────────────────────────────────────────

// (params now read directly from URL via useSearchParams inside ResultContent)

// ── Share Card (capture target) ───────────────────────────────────────────────

function ShareCard({
  cardRef,
  ticker, name, emoji, score, risk, mode, facePhoto,
}: {
  cardRef: React.RefObject<HTMLDivElement>;
  ticker: string; name: string; emoji: string;
  score: number; risk: "LOW" | "MID" | "HIGH"; mode: string;
  facePhoto?: string | null;
}) {
  const rc   = RISK_COLORS[risk] ?? RISK_COLORS.MID;
  const tags = MODE_TAGS[mode] ?? ["#RateMyStock", "#주식타입"];
  const modeLabel = MODE_LABEL[mode] ?? "AI Match";

  return (
    <div
      ref={cardRef}
      style={{
        width: "360px", height: "450px",
        background: "linear-gradient(160deg, #0D0D0D 0%, #131313 100%)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        position: "relative", overflow: "hidden", borderRadius: "24px",
        flexShrink: 0,
      }}
    >
      {/* Green glow */}
      <div style={{
        position: "absolute", width: "300px", height: "300px",
        top: "90px", left: "30px",
        background: "radial-gradient(circle, rgba(0,200,5,0.1) 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none",
      }} />

      {/* Top bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        padding: "18px 20px", display: "flex",
        justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{
          fontSize: "10px", fontWeight: 700, color: "#00C805",
          background: "rgba(0,200,5,0.12)", padding: "4px 10px",
          borderRadius: "999px", letterSpacing: "0.12em", textTransform: "uppercase",
        }}>
          {modeLabel}
        </span>
        <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.28)", fontWeight: 600 }}>
          ratemystock.app
        </span>
      </div>

      {/* Center content */}
      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", paddingBottom: "52px", gap: 0,
      }}>
        {facePhoto ? (
          <div style={{
            width: "88px", height: "88px", borderRadius: "50%",
            overflow: "hidden", marginBottom: "14px",
            border: "3px solid #00C805",
            boxShadow: "0 0 0 4px rgba(0,200,5,0.15)",
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={facePhoto} alt="profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        ) : (
          <div style={{ fontSize: "64px", lineHeight: 1, marginBottom: "14px" }}>{emoji}</div>
        )}

        <div style={{
          color: "#00C805", fontSize: "56px", fontWeight: 900,
          letterSpacing: "-0.03em", lineHeight: 1, marginBottom: "8px",
        }}>
          ${ticker}
        </div>

        <div style={{
          color: "rgba(255,255,255,0.35)", fontSize: "13px", marginBottom: "22px",
        }}>
          {name}
        </div>

        {/* Score + Risk */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "26px" }}>
          <div style={{
            background: "rgba(0,200,5,0.12)", borderRadius: "999px",
            padding: "8px 20px", display: "flex", alignItems: "center", gap: "4px",
          }}>
            <span style={{ color: "#00C805", fontSize: "22px", fontWeight: 800 }}>{score}</span>
            <span style={{ color: "rgba(0,200,5,0.5)", fontSize: "14px", fontWeight: 700 }}>/100</span>
          </div>
          <div style={{
            background: rc.bg, borderRadius: "999px",
            padding: "8px 16px", display: "flex", alignItems: "center",
          }}>
            <span style={{ color: rc.text, fontSize: "12px", fontWeight: 700 }}>{risk} RISK</span>
          </div>
        </div>

        {/* Tagline */}
        <div style={{
          color: "rgba(255,255,255,0.45)", fontSize: "13px",
          textAlign: "center", lineHeight: 1.55, marginBottom: "18px",
          padding: "0 24px",
        }}>
          AI가 분석한 나의 주식 타입 🎯
        </div>

        {/* Hashtags */}
        <div style={{
          display: "flex", flexWrap: "wrap", gap: "6px",
          justifyContent: "center", padding: "0 28px",
        }}>
          {tags.map((tag) => (
            <span key={tag} style={{
              color: "rgba(255,255,255,0.25)", fontSize: "11px", fontWeight: 600,
            }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "12px 20px", display: "flex", justifyContent: "center",
      }}>
        <span style={{
          color: "rgba(255,255,255,0.18)", fontSize: "11px",
          fontWeight: 600, letterSpacing: "0.1em",
        }}>
          ratemystock.app
        </span>
      </div>
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 fade-up" onAnimationEnd={onDone}>
      <div className="rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-xl whitespace-nowrap bg-[#0D0D0D]">
        {message}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

function ResultContent() {
  const sp = useSearchParams();
  const { t, lang } = useLanguage();
  const [stored, setStored]     = useState<{ result: Result; mode: Mode } | null>(null);
  const [facePhoto, setFacePhoto] = useState<string | null>(null);
  const cardRef                 = useRef<HTMLDivElement>(null);
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState<string | null>(null);

  const ticker   = sp.get("t") ?? "";
  const name     = sp.get("n") ?? "";
  const score    = Number(sp.get("s") ?? 0);
  const risk     = ((sp.get("r") ?? "MID").toUpperCase()) as "LOW" | "MID" | "HIGH";
  const emoji    = sp.get("e") ?? "📈";
  const mode     = sp.get("m") ?? "";
  const arch     = sp.get("arch") ?? "";
  const celeb    = sp.get("celeb") ?? "";
  const cmatch   = sp.get("cmatch") ?? "";
  const celemoji = sp.get("celemoji") ?? "";

  const isKo = lang === "ko";

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("rms_share_result");
      if (raw) setStored(JSON.parse(raw));
      if (mode === "face") {
        const photo = sessionStorage.getItem("rms_face_photo");
        if (photo) setFacePhoto(photo);
      }
    } catch {}
  }, [mode]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const handleShare = async () => {
    const url  = typeof window !== "undefined" ? window.location.href : "";
    const text = isKo
      ? `AI가 나를 $${ticker} 타입으로 분석했어! 점수 ${score}/100 🎯\nRate My Stock에서 내 주식 타입 찾기 →`
      : `AI matched me to $${ticker}! Score ${score}/100 🎯\nFind your stock type on Rate My Stock →`;

    if (navigator.share) {
      try {
        await navigator.share({ title: `${emoji} $${ticker} 타입 · Rate My Stock`, text, url });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(url);
      showToast(isKo ? "📋 링크 복사됨!" : "📋 Link copied!");
    } catch {
      showToast("⚠️ " + (isKo ? "공유 실패" : "Share failed"));
    }
  };

  const handleSave = async () => {
    if (!cardRef.current || saving) return;
    setSaving(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 3,
        width: 360,
        height: 450,
        // Override borderRadius so the full 1080×1920 area is opaque
        style: { borderRadius: "0px" },
        backgroundColor: "#0D0D0D",
      });
      const a    = document.createElement("a");
      a.download = `ratemystock-${ticker}.png`;
      a.href     = dataUrl;
      a.click();
      showToast(isKo ? "🖼️ 저장됨! 인스타 스토리에 올려봐요 ✨" : "🖼️ Saved! Perfect for Instagram Stories");
    } catch {
      showToast("⚠️ " + (isKo ? "저장 실패. 다시 시도해주세요." : "Save failed. Please try again."));
    } finally {
      setSaving(false);
    }
  };

  const fullResult = stored?.result;
  const rc         = RISK_COLORS[risk] ?? RISK_COLORS.MID;

  return (
    <main className="min-h-screen bg-[#F5F5F0] font-sans">
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      <div className="max-w-sm md:max-w-3xl mx-auto px-4 pt-8 pb-safe">

        {/* Back nav */}
        <Link href="/match" className="inline-flex items-center gap-2 text-sm text-[#6B7280] mb-6 touch-target">
          ← {isKo ? "다시 매칭하기" : "Try Again"}
        </Link>

        {/* ── Desktop: side-by-side wrapper ── */}
        <div className="flex flex-col md:flex-row md:items-start md:gap-6 mb-5">

          {/* Left: Share Card */}
          <div className="flex justify-center md:justify-start md:flex-shrink-0 mb-5 md:mb-0">
            <div className="shadow-[0_12px_48px_rgba(0,0,0,0.35)] rounded-3xl overflow-hidden">
              <ShareCard
                cardRef={cardRef}
                ticker={ticker} name={name} emoji={emoji}
                score={score} risk={risk} mode={mode}
                facePhoto={facePhoto}
              />
            </div>
          </div>

          {/* Right: Full result (only when arriving from the match flow) */}
          {fullResult && (
            <div className="flex-1 rounded-3xl overflow-hidden shadow-sm border border-[#E5E5E0] fade-up self-stretch">
              {/* Dark top */}
              <div className="bg-[#0D0D0D] px-6 pt-6 pb-6">
                {facePhoto && (
                  <div className="flex justify-center mb-4">
                    <div
                      className="w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden"
                      style={{ border: "3px solid #00C805", boxShadow: "0 0 0 4px rgba(0,200,5,0.15)" }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={facePhoto} alt="profile" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p
                      className="font-bold leading-none mb-1"
                      style={{ color: "#00C805", fontSize: "clamp(2rem, 12vw, 3rem)", letterSpacing: "-0.03em" }}
                    >
                      ${ticker}
                    </p>
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.38)" }}>{name}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className="text-xs font-bold px-3 py-1.5 rounded-full"
                      style={{ background: rc.bg, color: rc.text }}
                    >
                      {risk} RISK
                    </span>
                    <span className="font-bold text-3xl text-[#00C805]">
                      {score}<span className="text-base text-[#9CA3AF]">/100</span>
                    </span>
                  </div>
                </div>
                {(arch || fullResult.archetype) && (
                  <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {arch || fullResult.archetype}
                  </p>
                )}
                {celeb && (
                  <p className="text-xs font-medium mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {celemoji} {celeb} {cmatch ? `${cmatch}%` : ""}
                  </p>
                )}
              </div>

              {/* White bottom */}
              <div className="bg-white px-6 py-5">
                <p className="text-sm md:text-base text-[#374151] leading-relaxed mb-4">{fullResult.reason}</p>

                {fullResult.extras && fullResult.extras.filter(Boolean).length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-[0.15em] mb-2">
                      {t.alsoConsider}
                    </p>
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-6 px-6 pb-1">
                      {fullResult.extras.filter(Boolean).map((ex) => (
                        <div
                          key={ex.ticker}
                          className="flex-shrink-0 flex items-center gap-1.5 bg-[#F5F5F0] rounded-full px-4 py-2"
                        >
                          <span className="text-base leading-none">{ex.emoji}</span>
                          <span className="text-xs font-bold text-[#0D0D0D]">${ex.ticker}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Action buttons (centered below both cards) ── */}
        <div className="grid grid-cols-2 gap-3 mb-5 md:max-w-xs md:mx-auto">
          <button
            onClick={handleShare}
            className="card-hover rounded-xl py-4 flex flex-col items-center justify-center gap-1 bg-[#0D0D0D] text-white"
          >
            <span className="text-xl">↗</span>
            <span className="text-xs font-semibold">{isKo ? "공유하기" : "Share"}</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="card-hover rounded-xl py-4 flex flex-col items-center justify-center gap-1 text-white disabled:opacity-60"
            style={{ background: "#00C805" }}
          >
            {saving ? (
              <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span className="text-xl">↓</span>
                <span className="text-xs font-semibold">{isKo ? "이미지 저장" : "Save Image"}</span>
              </>
            )}
          </button>
        </div>

        {/* Disclaimer */}
        <p className="text-[10px] text-[#9CA3AF] text-center mb-5">{t.resultDisclaimer}</p>

        {/* Navigation */}
        <div className="grid grid-cols-2 gap-3 pb-4 md:max-w-xs md:mx-auto">
          <Link
            href="/match"
            className="card-hover rounded-xl py-3.5 text-center text-xs font-semibold bg-white shadow-sm border border-[#E5E5E0] text-[#0D0D0D]"
          >
            ↩ {isKo ? "다시 매칭" : "Try Again"}
          </Link>
          <Link
            href="/"
            className="card-hover rounded-xl py-3.5 text-center text-xs font-semibold bg-white shadow-sm border border-[#E5E5E0] text-[#0D0D0D]"
          >
            🏠 {t.goHome}
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function ResultClient() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F5F0]" />}>
      <ResultContent />
    </Suspense>
  );
}
