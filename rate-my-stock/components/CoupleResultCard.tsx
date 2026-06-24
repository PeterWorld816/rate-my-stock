"use client";
import { CoupleResult } from "@/app/page";

const riskColors: Record<string, { bg: string; text: string }> = {
  LOW:  { bg: "#DCFCE7", text: "#166534" },
  MID:  { bg: "#FEF9C3", text: "#854D0E" },
  HIGH: { bg: "#FEE2E2", text: "#991B1B" },
};

function scoreColor(score: number) {
  if (score >= 90) return "#00D084";
  if (score >= 80) return "#A855F7";
  if (score >= 70) return "#06B6D4";
  return "#F59E0B";
}

function PersonCard({
  person,
  label,
}: {
  person: CoupleResult["person1"];
  label: string;
}) {
  const risk = riskColors[(person.risk ?? "MID").toUpperCase()] ?? riskColors["MID"];
  return (
    <div className="flex-1 rounded-2xl bg-white/10 border border-white/15 p-4 flex flex-col items-center text-center">
      <p className="text-[9px] font-semibold uppercase tracking-widest text-gray-400 mb-2">{label}</p>
      <div className="text-3xl mb-2">{person.emoji}</div>
      <p className="font-display font-bold text-xl" style={{ color: "#00D084" }}>
        ${person.ticker}
      </p>
      <p className="text-xs text-gray-400 mb-3 leading-tight">{person.name}</p>
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
        style={{ background: risk.bg, color: risk.text }}>
        {person.risk} RISK
      </span>
    </div>
  );
}

export default function CoupleResultCard({
  result,
  onReset,
}: {
  result: CoupleResult;
  onReset: () => void;
}) {
  const barColor = scoreColor(result.compatibilityScore);

  const share = () => {
    const text = `My friend and I got matched to $${result.person1.ticker} & $${result.person2.ticker} on Rate My Stock 🤝\n\nPortfolio Compatibility: ${result.compatibilityScore}% — "${result.compatibilityLabel}"\n\nFind your stock match → ratemystock.app`;
    if (navigator.share) {
      navigator.share({ title: "Friend Match — Rate My Stock", text });
    } else {
      navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    }
  };

  return (
    <section className="px-6 pb-24 max-w-md mx-auto fade-up">

      {/* Main dark card */}
      <div className="rounded-3xl bg-[#0D0D0D] text-white p-6 mb-4 relative overflow-hidden shadow-2xl">
        {/* BG glow */}
        <div className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle at 20% 50%, #06B6D4, transparent 55%), radial-gradient(circle at 80% 30%, #7C3AED, transparent 55%)" }} />

        <div className="relative z-10">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-4">🤝 Friend Match Result</p>

          {/* Two stock cards side by side */}
          <div className="flex gap-3 mb-5">
            <PersonCard person={result.person1} label="Player 1" />
            <div className="flex flex-col items-center justify-center px-1">
              <div className="text-xl mb-1">💑</div>
              <div className="w-px flex-1 bg-white/10" />
            </div>
            <PersonCard person={result.person2} label="Player 2" />
          </div>

          {/* Compatibility score */}
          <div className="bg-white/5 rounded-2xl p-4 mb-4 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-400">포트폴리오 궁합</p>
              <span className="font-display font-bold text-2xl" style={{ color: barColor }}>
                {result.compatibilityScore}%
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-white/10 overflow-hidden mb-2">
              <div className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${result.compatibilityScore}%`,
                  background: `linear-gradient(90deg, ${barColor}, #A855F7)`,
                }} />
            </div>
            <p className="text-sm font-semibold text-center" style={{ color: barColor }}>
              {result.compatibilityLabel}
            </p>
          </div>

          {/* Dynamic duo name */}
          <p className="text-center text-lg font-bold text-white mb-3">
            &ldquo;{result.dynamicDesc}&rdquo;
          </p>

          {/* Reason */}
          <p className="text-sm text-gray-300 leading-relaxed border-t border-white/10 pt-4">
            {result.reason}
          </p>
        </div>
      </div>

      {/* Recommended sectors */}
      <div className="rounded-2xl bg-white border border-[#E5E5E0] p-5 mb-4 shadow-sm">
        <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest mb-3">
          함께 투자하면 좋은 섹터
        </p>
        <div className="flex gap-2">
          {result.recommendedSectors.slice(0, 3).map((s) => (
            <div key={s.name}
              className="flex-1 rounded-xl bg-[#FAFAF8] border border-[#E5E5E0] p-3 text-center">
              <div className="text-xl mb-1">{s.emoji}</div>
              <p className="text-[10px] font-semibold text-[#374151] leading-tight">{s.name}</p>
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
          style={{ background: "linear-gradient(135deg, #06B6D4, #7C3AED)" }}>
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
