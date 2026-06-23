"use client";
import { Result } from "@/app/page";

const riskColors = {
  LOW: { bg: "#DCFCE7", text: "#166534" },
  MID: { bg: "#FEF9C3", text: "#854D0E" },
  HIGH: { bg: "#FEE2E2", text: "#991B1B" },
};

export default function ResultCard({ result, onReset }: { result: Result; onReset: () => void }) {
  const risk = riskColors[result.risk];

  const share = () => {
    const text = `I just got matched to $${result.ticker} (${result.score}/100) on Rate My Stock 📈\n\nFind your stock match → ratemystock.app`;
    if (navigator.share) {
      navigator.share({ title: "Rate My Stock", text });
    } else {
      navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    }
  };

  return (
    <section className="px-6 pb-24 max-w-md mx-auto fade-up">
      {/* Main result card */}
      <div className="rounded-3xl bg-[#0D0D0D] text-white p-8 mb-4 relative overflow-hidden shadow-2xl">
        {/* BG glow */}
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

          {/* Score ring */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative w-20 h-20">
              <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                <circle cx="40" cy="40" r="32" fill="none" stroke="#ffffff15" strokeWidth="6" />
                <circle cx="40" cy="40" r="32" fill="none" stroke="#00D084" strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 32 * result.score / 100} ${2 * Math.PI * 32}`} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display font-bold text-xl">{result.score}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Match Score</p>
              <span className="text-xs font-semibold px-2 py-1 rounded-full"
                style={{ background: risk.bg, color: risk.text }}>
                {result.risk} RISK
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
          {result.extras.map((e) => (
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

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={share}
          className="flex-1 rounded-2xl py-3.5 text-sm font-semibold text-white shadow-lg"
          style={{ background: "linear-gradient(135deg, #00D084, #7C3AED)" }}>
          Share Result 📤
        </button>
        <button onClick={onReset}
          className="rounded-2xl border border-[#E5E5E0] bg-white px-5 py-3.5 text-sm font-semibold text-[#374151]">
          Retry
        </button>
      </div>
    </section>
  );
}
