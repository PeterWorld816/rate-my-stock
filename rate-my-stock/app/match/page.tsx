"use client";
import { useState } from "react";
import Link from "next/link";
import { Mode, Result, CoupleResult } from "@/app/page";
import ModeSelector from "@/components/ModeSelector";
import FaceMode from "@/components/modes/FaceMode";
import MbtiMode from "@/components/modes/MbtiMode";
import VibeMode from "@/components/modes/VibeMode";
import SalaryMode from "@/components/modes/SalaryMode";
import CoupleMode from "@/components/modes/CoupleMode";
import CelebrityMode from "@/components/modes/CelebrityMode";
import CareerMode from "@/components/modes/CareerMode";
import ResultCard from "@/components/ResultCard";
import CoupleResultCard from "@/components/CoupleResultCard";

export default function MatchPage() {
  const [mode, setMode] = useState<Mode>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [coupleResult, setCoupleResult] = useState<CoupleResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleResult = (r: Result) => {
    setResult(r);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCoupleResult = (r: CoupleResult) => {
    setCoupleResult(r);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const reset = () => {
    setMode(null);
    setResult(null);
    setCoupleResult(null);
  };

  return (
    <main className="min-h-screen bg-[#F5F5F0] font-sans">
      {/* Page header — only shown when picking a mode */}
      {!mode && !result && !coupleResult && (
        <div className="px-4 sm:px-6 pt-12 pb-4 max-w-[1200px] mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#6B7280] mb-5 touch-target">
            ← 홈으로
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-3 bg-[#00D08418] text-[#00D084]">
            ✨ AI 매칭
          </div>
          <h1 className="font-display font-bold text-3xl text-[#0D0D0D] mb-1">나는 무슨 주식?</h1>
          <p className="text-sm text-[#6B7280]">내 성격 DNA와 딱 맞는 주식을 찾아보세요</p>
        </div>
      )}

      {/* Mode Selector */}
      {!result && !coupleResult && !mode && (
        <ModeSelector onSelect={setMode} />
      )}

      {/* Mode Components */}
      {!result && !coupleResult && mode === "face" && (
        <FaceMode onResult={handleResult} onBack={() => setMode(null)} loading={loading} setLoading={setLoading} />
      )}
      {!result && !coupleResult && mode === "mbti" && (
        <MbtiMode onResult={handleResult} onBack={() => setMode(null)} loading={loading} setLoading={setLoading} />
      )}
      {!result && !coupleResult && mode === "vibe" && (
        <VibeMode onResult={handleResult} onBack={() => setMode(null)} loading={loading} setLoading={setLoading} />
      )}
      {!result && !coupleResult && mode === "salary" && (
        <SalaryMode onResult={handleResult} onBack={() => setMode(null)} loading={loading} setLoading={setLoading} />
      )}
      {!result && !coupleResult && mode === "couple" && (
        <CoupleMode onCoupleResult={handleCoupleResult} onBack={() => setMode(null)} setLoading={setLoading} />
      )}
      {!result && !coupleResult && mode === "celebrity" && (
        <CelebrityMode onResult={handleResult} onBack={() => setMode(null)} loading={loading} setLoading={setLoading} />
      )}
      {!result && !coupleResult && mode === "career" && (
        <CareerMode onResult={handleResult} onBack={() => setMode(null)} loading={loading} setLoading={setLoading} />
      )}

      {/* Results */}
      {result && (
        <ResultCard result={result} onReset={reset} mode={mode} />
      )}
      {coupleResult && (
        <CoupleResultCard result={coupleResult} onReset={reset} />
      )}
    </main>
  );
}
