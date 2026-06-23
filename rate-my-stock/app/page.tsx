"use client";
import { useState } from "react";
import HeroSection from "@/components/HeroSection";
import ModeSelector from "@/components/ModeSelector";
import FaceMode from "@/components/modes/FaceMode";
import MbtiMode from "@/components/modes/MbtiMode";
import VibeMode from "@/components/modes/VibeMode";
import SalaryMode from "@/components/modes/SalaryMode";
import ResultCard from "@/components/ResultCard";

export type Mode = "face" | "mbti" | "vibe" | "salary" | null;
export type Result = {
  ticker: string;
  name: string;
  score: number;
  reason: string;
  risk: "LOW" | "MID" | "HIGH";
  emoji: string;
  extras: { ticker: string; name: string; emoji: string }[];
};

export default function Home() {
  const [mode, setMode] = useState<Mode>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  const handleResult = (r: Result) => {
    setResult(r);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const reset = () => {
    setMode(null);
    setResult(null);
  };

  return (
    <main className="min-h-screen bg-[#FAFAF8] font-sans">
      <HeroSection />

      {!result && !mode && (
        <ModeSelector onSelect={setMode} />
      )}

      {!result && mode === "face" && (
        <FaceMode onResult={handleResult} onBack={() => setMode(null)} loading={loading} setLoading={setLoading} />
      )}
      {!result && mode === "mbti" && (
        <MbtiMode onResult={handleResult} onBack={() => setMode(null)} loading={loading} setLoading={setLoading} />
      )}
      {!result && mode === "vibe" && (
        <VibeMode onResult={handleResult} onBack={() => setMode(null)} loading={loading} setLoading={setLoading} />
      )}
      {!result && mode === "salary" && (
        <SalaryMode onResult={handleResult} onBack={() => setMode(null)} loading={loading} setLoading={setLoading} />
      )}

      {result && (
        <ResultCard result={result} onReset={reset} />
      )}
    </main>
  );
}
