"use client";
import { useState } from "react";
import HeroSection from "@/components/HeroSection";
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

export type Mode = "face" | "mbti" | "vibe" | "salary" | "couple" | "celebrity" | "career" | null;

export type Result = {
  ticker: string;
  name: string;
  score: number;
  reason: string;
  risk: "LOW" | "MID" | "HIGH";
  emoji: string;
  extras: { ticker: string; name: string; emoji: string }[];
  investorCode?: string;
  archetype?: string;
  celebrity?: string;
  celebrityEmoji?: string;
  celebrityMatch?: number;
};

export type CoupleResult = {
  person1: { ticker: string; name: string; emoji: string; risk: "LOW" | "MID" | "HIGH" };
  person2: { ticker: string; name: string; emoji: string; risk: "LOW" | "MID" | "HIGH" };
  compatibilityScore: number;
  compatibilityLabel: string;
  dynamicDesc: string;
  reason: string;
  recommendedSectors: { name: string; emoji: string }[];
};

export default function Home() {
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
    <main className="min-h-screen bg-[#FAFAF8] font-sans">
      <HeroSection />

      {!result && !coupleResult && !mode && (
        <ModeSelector onSelect={setMode} />
      )}

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

      {result && (
        <ResultCard result={result} onReset={reset} />
      )}
      {coupleResult && (
        <CoupleResultCard result={coupleResult} onReset={reset} />
      )}
    </main>
  );
}
