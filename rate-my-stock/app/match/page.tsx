"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mode, Result, CoupleResult } from "@/app/page";
import { useLanguage } from "@/lib/i18n";
import ModeSelector from "@/components/ModeSelector";
import FaceMode from "@/components/modes/FaceMode";
import MbtiMode from "@/components/modes/MbtiMode";
import VibeMode from "@/components/modes/VibeMode";
import SalaryMode from "@/components/modes/SalaryMode";
import CoupleMode from "@/components/modes/CoupleMode";
import CelebrityMode from "@/components/modes/CelebrityMode";
import CareerMode from "@/components/modes/CareerMode";
import CoupleResultCard from "@/components/CoupleResultCard";

export default function MatchPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [mode, setMode]               = useState<Mode>(null);
  const [coupleResult, setCoupleResult] = useState<CoupleResult | null>(null);
  const [loading, setLoading]         = useState(false);

  const handleResult = (r: Result) => {
    // Persist full result for the result page (same session only)
    try {
      sessionStorage.setItem("rms_share_result", JSON.stringify({ result: r, mode }));
    } catch {}

    // Build URL — only lightweight params for OG metadata + display
    const p = new URLSearchParams({
      t: r.ticker,
      n: r.name,
      s: String(r.score),
      r: r.risk,
      e: r.emoji,
      m: mode ?? "",
    });
    if (r.archetype)     p.set("arch",    r.archetype);
    if (r.investorCode)  p.set("code",    r.investorCode);
    if (r.celebrity)     p.set("celeb",   r.celebrity);
    if (r.celebrityMatch) p.set("cmatch", String(r.celebrityMatch));
    if (r.celebrityEmoji) p.set("celemoji", r.celebrityEmoji);

    router.push(`/match/result?${p.toString()}`);
  };

  const handleCoupleResult = (r: CoupleResult) => {
    setCoupleResult(r);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const reset = () => {
    setMode(null);
    setCoupleResult(null);
  };

  return (
    <main className="min-h-screen bg-[#F5F5F0] font-sans">
      {/* Page header — only shown when picking a mode */}
      {!mode && !coupleResult && (
        <div className="px-4 sm:px-6 pt-12 pb-4 max-w-[1200px] mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#6B7280] mb-5 touch-target">
            ← {t.goHome}
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-3 bg-[#00D08418] text-[#00D084]">
            ✨ AI {t.navMatch}
          </div>
          <h1 className="font-display font-bold text-3xl text-[#0D0D0D] mb-1">{t.matchTitle}</h1>
          <p className="text-sm text-[#6B7280]">{t.matchSubtitle}</p>
        </div>
      )}

      {/* Mode Selector */}
      {!coupleResult && !mode && (
        <ModeSelector onSelect={setMode} />
      )}

      {/* Mode Components */}
      {!coupleResult && mode === "face" && (
        <FaceMode onResult={handleResult} onBack={() => setMode(null)} loading={loading} setLoading={setLoading} />
      )}
      {!coupleResult && mode === "mbti" && (
        <MbtiMode onResult={handleResult} onBack={() => setMode(null)} loading={loading} setLoading={setLoading} />
      )}
      {!coupleResult && mode === "vibe" && (
        <VibeMode onResult={handleResult} onBack={() => setMode(null)} loading={loading} setLoading={setLoading} />
      )}
      {!coupleResult && mode === "salary" && (
        <SalaryMode onResult={handleResult} onBack={() => setMode(null)} loading={loading} setLoading={setLoading} />
      )}
      {!coupleResult && mode === "couple" && (
        <CoupleMode onCoupleResult={handleCoupleResult} onBack={() => setMode(null)} setLoading={setLoading} />
      )}
      {!coupleResult && mode === "celebrity" && (
        <CelebrityMode onResult={handleResult} onBack={() => setMode(null)} loading={loading} setLoading={setLoading} />
      )}
      {!coupleResult && mode === "career" && (
        <CareerMode onResult={handleResult} onBack={() => setMode(null)} loading={loading} setLoading={setLoading} />
      )}

      {/* Couple result stays inline (no shareable URL yet) */}
      {coupleResult && (
        <CoupleResultCard result={coupleResult} onReset={reset} />
      )}
    </main>
  );
}
