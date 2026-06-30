"use client";
import { useState } from "react";
import { CoupleResult } from "@/app/page";

const questions = [
  {
    q: "You have $1,000 to invest right now. You:",
    options: [
      "All in on one high-conviction stock 🎯",
      "Split between 3-5 different plays",
      "ETF and done — keep it simple",
      "Wait for the perfect dip 📉",
    ],
  },
  {
    q: "Your stock drops -30% overnight. You:",
    options: [
      "Buy more — it's on sale 🛒",
      "Hold steady, no panic selling",
      "Sell half, manage the risk",
      "Exit completely. Cash is safe 🏃",
    ],
  },
  {
    q: "Your #1 investing goal is:",
    options: [
      "10x returns — get rich or trying 🚀",
      "Beat the market consistently",
      "Passive income via dividends 💸",
      "Protect what I already have",
    ],
  },
  {
    q: "Your vibe is closest to:",
    options: [
      "Crypto Twitter at 2am 🌙",
      "TechCrunch & earnings reports 💻",
      "CNBC & dividend reinvestment 📺",
      "Warren Buffett annual letters 📚",
    ],
  },
  {
    q: "Your investment horizon is:",
    options: [
      "Days to months ⚡",
      "1-2 years, medium term",
      "5-10 years, long game",
      "Set it and never check again 🧘",
    ],
  },
];

const OPTION_LETTERS = ["A", "B", "C", "D"];
const ACCENT = "#06B6D4";

const FALLBACK: CoupleResult = {
  person1: { ticker: "NVDA", name: "NVIDIA Corporation", emoji: "🤖", risk: "HIGH" },
  person2: { ticker: "SCHD", name: "Schwab US Dividend Equity ETF", emoji: "🏦", risk: "LOW" },
  compatibilityScore: 74,
  compatibilityLabel: "Yin & Yang 🌓",
  dynamicDesc: "The Rocket & The Banker",
  reason: "You two are investment opposites — and that's actually your superpower. One chases alpha, the other catches dividends. Together you're basically a hedge fund minus the fees.",
  recommendedSectors: [
    { name: "Technology ETFs", emoji: "💻" },
    { name: "Dividend Growth", emoji: "📈" },
    { name: "Healthcare Staples", emoji: "🏥" },
  ],
};

type Phase = "p1" | "handoff" | "p2" | "calculating";

// Unified skeleton
function OptionSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 0.85, 0.65, 0.45].map((op, i) => (
        <div key={i} className="touch-target rounded-2xl shimmer" style={{ opacity: op }} />
      ))}
    </div>
  );
}

export default function CoupleMode({
  onCoupleResult, onBack, setLoading,
}: {
  onCoupleResult: (r: CoupleResult) => void;
  onBack: () => void;
  setLoading: (b: boolean) => void;
}) {
  const [phase, setPhase] = useState<Phase>("p1");
  const [step, setStep] = useState(0);
  const [p1Answers, setP1Answers] = useState<string[]>([]);
  const [p2Answers, setP2Answers] = useState<string[]>([]);

  const progress = (step / questions.length) * 100;

  const submit = async (p1: string[], p2: string[]) => {
    setPhase("calculating");
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "couple", p1Answers: p1, p2Answers: p2 }),
      });
      const data = await res.json();
      onCoupleResult(data as CoupleResult);
    } catch {
      onCoupleResult(FALLBACK);
    } finally {
      setLoading(false);
    }
  };

  const pick = (answer: string) => {
    if (phase === "p1") {
      const next = [...p1Answers, answer];
      if (step < questions.length - 1) {
        setP1Answers(next);
        setStep(step + 1);
      } else {
        setP1Answers(next);
        setPhase("handoff");
        setStep(0);
      }
    } else if (phase === "p2") {
      const next = [...p2Answers, answer];
      if (step < questions.length - 1) {
        setP2Answers(next);
        setStep(step + 1);
      } else {
        submit(p1Answers, next);
      }
    }
  };

  // Handoff screen
  if (phase === "handoff") {
    return (
      <section className="px-4 sm:px-6 pb-safe max-w-xl mx-auto fade-up">
        <div className="rounded-3xl bg-white p-6 shadow-md text-center">
          <div className="text-6xl mb-4">🤝</div>
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-5"
            style={{ background: `${ACCENT}18`, color: ACCENT }}>
            Player 1 Done ✓
          </div>
          <h2 className="font-display font-bold text-2xl mb-2 text-[#0D0D0D]">
            Pass it to your friend!
          </h2>
          <p className="text-sm text-[#6B7280] mb-8 leading-relaxed">
            Great job Player 1 🎉<br />
            Hand the phone over — it&apos;s Player 2&apos;s turn.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => { setP2Answers([]); setPhase("p2"); setStep(0); }}
              className="w-full rounded-2xl touch-target text-sm font-bold text-white flex items-center justify-center"
              style={{ background: ACCENT }}>
              I&apos;m ready — start my quiz 🚀
            </button>
            <button onClick={onBack}
              className="w-full rounded-2xl border border-[#E5E5E0] bg-white touch-target text-sm font-medium text-[#6B7280] flex items-center justify-center">
              Cancel
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Calculating screen
  if (phase === "calculating") {
    return (
      <section className="px-4 sm:px-6 pb-safe max-w-xl mx-auto fade-up">
        <div className="rounded-3xl bg-white p-8 shadow-md text-center">
          <div className="text-5xl mb-4">🔬</div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: ACCENT }}>
            Calculating Chemistry
          </p>
          <h2 className="font-display font-bold text-xl mb-2 text-[#0D0D0D]">
            Analyzing your investment compatibility...
          </h2>
          <p className="text-sm text-[#6B7280] mb-8">This might get spicy 🌶️</p>
          <div className="space-y-3">
            {[1, 0.75, 0.5, 0.3].map((op, i) => (
              <div key={i} className="h-3 rounded-full shimmer" style={{ opacity: op }} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const isP1 = phase === "p1";

  return (
    <section className="px-4 sm:px-6 pb-safe max-w-xl mx-auto fade-up">
      {isP1 ? (
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-[#6B7280] mb-6 touch-target">
          ← Back
        </button>
      ) : (
        <div className="mb-6 h-6" />
      )}

      <div className="rounded-3xl bg-white p-5 shadow-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: `${ACCENT}18`, color: ACCENT }}>
              🤝 Friend Match
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
              style={{ background: isP1 ? "#9CA3AF" : ACCENT }}>
              {isP1 ? "Player 1" : "Player 2"}
            </span>
          </div>
          <span className="text-xs font-bold tabular-nums" style={{ color: ACCENT }}>
            {step + 1} / {questions.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full bg-[#F3F4F6] mb-4 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: ACCENT }} />
        </div>

        {/* Step dots */}
        <div className="flex items-center gap-1.5 mb-5">
          {questions.map((_, i) => (
            <div key={i} className="h-1 flex-1 rounded-full transition-all"
              style={{ background: i < step ? ACCENT : i === step ? ACCENT : "#F3F4F6", opacity: i === step ? 1 : i < step ? 0.5 : 1 }} />
          ))}
        </div>

        <h2 className="font-display font-bold text-xl mb-6 leading-snug text-[#0D0D0D]">
          {questions[step].q}
        </h2>

        <div className="space-y-3">
          {questions[step].options.map((opt, i) => (
            <button key={opt} onClick={() => pick(opt)}
              className="w-full text-left rounded-2xl border border-[#E5E5E0] bg-[#F5F5F0] px-4 touch-target text-sm font-medium text-[#374151] hover:border-[#06B6D4] hover:bg-[#ECFEFF] transition-all card-hover flex items-center gap-3">
              <span className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: `${ACCENT}18`, color: ACCENT }}>
                {OPTION_LETTERS[i]}
              </span>
              <span>{opt}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
