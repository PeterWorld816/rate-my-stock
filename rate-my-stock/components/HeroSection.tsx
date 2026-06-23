"use client";
import { useEffect, useState } from "react";

const tickers = ["AAPL", "NVDA", "TSLA", "AMZN", "META", "GOOG", "MSFT", "BRK", "JPM", "AMD"];

export default function HeroSection() {
  const [tickIdx, setTickIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTickIdx(i => (i + 1) % tickers.length), 1200);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative overflow-hidden px-6 pt-16 pb-10 text-center">
      {/* BG blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: "var(--green)" }} />
        <div className="absolute -bottom-10 -right-10 w-80 h-80 rounded-full opacity-15 blur-3xl"
          style={{ background: "var(--purple)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 rounded-full opacity-10 blur-3xl"
          style={{ background: "var(--pink)" }} />
      </div>

      {/* Badge */}
      <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E5E0] bg-white px-4 py-1.5 text-xs font-medium text-[#6B7280] mb-6 shadow-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-[#00D084] animate-pulse" />
        AI-Powered · Not Financial Advice 😅
      </div>

      {/* Headline */}
      <h1 className="font-display text-5xl sm:text-7xl font-800 tracking-tight leading-none mb-4" style={{ fontWeight: 800 }}>
        Rate My<br />
        <span className="relative inline-block">
          <span style={{
            background: "linear-gradient(135deg, var(--green), var(--purple))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            Stock
          </span>
        </span>
      </h1>

      {/* Subheadline */}
      <p className="text-lg text-[#6B7280] max-w-md mx-auto mb-8 leading-relaxed">
        Tell us about yourself. We&apos;ll tell you which stock matches your personality — because why not.
      </p>

      {/* Live ticker tape */}
      <div className="inline-flex items-center gap-3 rounded-2xl bg-[#0D0D0D] px-6 py-3 text-white">
        <span className="text-[#6B7280] text-sm">Your match might be</span>
        <span className="font-display font-bold text-xl transition-all duration-300"
          style={{ color: "var(--green)" }}>
          ${tickers[tickIdx]}
        </span>
        <span className="text-[#6B7280] text-xs">↑</span>
      </div>
    </section>
  );
}
