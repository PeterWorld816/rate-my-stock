"use client";
import { useState, useEffect } from "react";
import { Result } from "@/app/page";
import { useLanguage, celebData, type CelebQuestion, type CelebMeta } from "@/lib/i18n";

type CelebId = "elon" | "buffett" | "cathie" | "cramer";

interface Celebrity {
  id: CelebId;
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
  holdingsDisplay: string[];
  holdings: string[];
  extrasDisplay: string[];
}

const CELEBRITIES: Celebrity[] = [
  {
    id: "elon", name: "Elon Musk", emoji: "🚀",
    color: "#CC2936", bgColor: "#FFF1F0",
    holdingsDisplay: ["TSLA", "SpaceX", "X Corp"],
    holdings: ["TSLA", "PLTR", "COIN"], extrasDisplay: ["PLTR", "COIN"],
  },
  {
    id: "buffett", name: "Warren Buffett", emoji: "🦉",
    color: "#1A7741", bgColor: "#F0FDF4",
    holdingsDisplay: ["AAPL", "BRK.B", "KO", "AXP"],
    holdings: ["AAPL", "KO", "AXP", "BRK.B"], extrasDisplay: ["KO", "AXP"],
  },
  {
    id: "cathie", name: "Cathie Wood", emoji: "🔮",
    color: "#7C3AED", bgColor: "#F5F3FF",
    holdingsDisplay: ["TSLA", "COIN", "ROKU", "PATH"],
    holdings: ["TSLA", "COIN", "ROKU", "PATH"], extrasDisplay: ["COIN", "ROKU"],
  },
  {
    id: "cramer", name: "Jim Cramer", emoji: "📺",
    color: "#FF6B35", bgColor: "#FFF7ED",
    holdingsDisplay: ["JPM", "JNJ", "AAPL", "HON"],
    holdings: ["JPM", "JNJ", "HON", "GS"], extrasDisplay: ["JNJ", "GS"],
  },
];

const OPTION_LETTERS = ["A", "B", "C", "D"];
const MAX_SCORE = 9;

function calcMatch(answers: CelebQuestion["options"]): { celeb: Celebrity; pct: number } {
  const scores: Record<CelebId, number> = { elon: 0, buffett: 0, cathie: 0, cramer: 0 };
  for (const opt of answers) {
    for (const id of Object.keys(scores) as CelebId[]) scores[id] += opt.pts[id];
  }
  const winnerId = (Object.keys(scores) as CelebId[]).reduce((a, b) =>
    scores[a] >= scores[b] ? a : b
  );
  const pct = Math.round((scores[winnerId] / MAX_SCORE) * 100);
  return { celeb: CELEBRITIES.find(c => c.id === winnerId)!, pct };
}

function OptionSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 0.85, 0.65, 0.45].map((op, i) => (
        <div key={i} className="touch-target rounded-2xl shimmer" style={{ opacity: op }} />
      ))}
    </div>
  );
}

type Phase = "intro" | "quiz" | "matching";

export default function CelebrityMode({ onResult, onBack, loading, setLoading }: {
  onResult: (r: Result) => void;
  onBack: () => void;
  loading: boolean;
  setLoading: (b: boolean) => void;
}) {
  const { t, lang } = useLanguage();
  const locale = celebData[lang] ?? celebData.en!;
  const questions = locale.questions;

  const [phase, setPhase] = useState<Phase>("intro");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<CelebQuestion["options"]>([]);

  useEffect(() => {
    setPhase("intro");
    setStep(0);
    setAnswers([]);
  }, [lang]);

  const getMeta = (id: CelebId) =>
    (locale as unknown as Record<string, CelebMeta>)[id] ?? locale.elon;

  const progress = (step / questions.length) * 100;

  const pick = async (option: CelebQuestion["options"][number]) => {
    const newAnswers = [...answers, option];
    if (step < questions.length - 1) {
      setAnswers(newAnswers);
      setStep(step + 1);
      return;
    }
    const { celeb, pct } = calcMatch(newAnswers);
    setPhase("matching");
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "celebrity", celebrity: celeb.name, celebrityId: celeb.id,
          matchPct: pct, holdings: celeb.holdings, answers: newAnswers.map(a => a.text),
        }),
      });
      const data = await res.json();
      onResult({ ...data, celebrity: celeb.name, celebrityEmoji: celeb.emoji, celebrityMatch: pct });
    } catch {
      onResult({
        ticker: celeb.holdings[0], name: `${celeb.name}'s top pick`, score: pct,
        reason: `Like ${celeb.name}, you have a clear investment identity. The numbers don't lie — ${pct}% match.`,
        risk: celeb.id === "elon" || celeb.id === "cathie" ? "HIGH" : celeb.id === "cramer" ? "MID" : "LOW",
        emoji: celeb.emoji,
        extras: [
          { ticker: celeb.holdings[1] ?? "VTI", name: celeb.extrasDisplay[0] ?? "ETF", emoji: "📈" },
          { ticker: celeb.holdings[2] ?? "SPY", name: celeb.extrasDisplay[1] ?? "Index", emoji: "📊" },
        ],
        celebrity: celeb.name, celebrityEmoji: celeb.emoji, celebrityMatch: pct,
      });
    } finally {
      setLoading(false);
    }
  };

  // ── Matching / loading screen ─────────────────────────────────────────────
  if (phase === "matching") {
    return (
      <section className="px-4 sm:px-6 pb-safe max-w-xl mx-auto fade-up">
        <div className="rounded-3xl bg-white p-8 shadow-md text-center">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#F59E0B" }}>
            {t.celebMatchingLabel}
          </p>
          <h2 className="font-display font-bold text-xl mb-2 text-[#0D0D0D]">
            {t.celebMatchingTitle}
          </h2>
          <p className="text-sm text-[#6B7280] mb-8">{t.celebMatchingSubtitle}</p>
          <div className="space-y-3">
            {CELEBRITIES.map((c, i) => (
              <div key={c.id} className="flex items-center gap-3 text-left">
                <span className="text-lg w-7 text-center">{c.emoji}</span>
                <div className="flex-1 h-2.5 rounded-full bg-[#F3F4F6] overflow-hidden">
                  <div className="h-full rounded-full shimmer" style={{ width: `${60 + i * 10}%` }} />
                </div>
                <span className="text-xs text-[#9CA3AF] w-16 text-right">{c.name.split(" ")[0]}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── Quiz screen ───────────────────────────────────────────────────────────
  if (phase === "quiz") {
    return (
      <section className="px-4 sm:px-6 pb-safe max-w-xl mx-auto fade-up">
        <button
          onClick={() => { setPhase("intro"); setStep(0); setAnswers([]); }}
          className="flex items-center gap-2 text-sm text-[#6B7280] mb-6 touch-target"
        >
          ← {t.back}
        </button>

        <div className="rounded-3xl bg-white p-5 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: "#F59E0B18", color: "#D97706" }}
            >
              {t.celebChip}
            </div>
            <span className="text-xs font-bold tabular-nums" style={{ color: "#D97706" }}>
              {step + 1} / {questions.length}
            </span>
          </div>

          <div className="h-1.5 rounded-full bg-[#F3F4F6] mb-5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: "#F59E0B" }}
            />
          </div>

          {/* Celebrity avatar bar */}
          <div className="flex gap-2 mb-6">
            {CELEBRITIES.map(c => (
              <div key={c.id} className="flex-1 rounded-xl py-1.5 text-center text-base" style={{ background: c.bgColor }}>
                {c.emoji}
              </div>
            ))}
          </div>

          <h2 className="font-display font-bold text-xl mb-6 leading-snug text-[#0D0D0D]">
            {questions[step].q}
          </h2>

          {loading ? <OptionSkeleton /> : (
            <div className="space-y-3">
              {questions[step].options.map((opt, i) => (
                <button
                  key={opt.text}
                  onClick={() => pick(opt)}
                  className="w-full text-left rounded-2xl border border-[#E5E5E0] bg-[#F5F5F0] px-4 touch-target text-sm font-medium text-[#374151] hover:border-[#F59E0B] hover:bg-[#FFFBEB] transition-all card-hover flex items-center gap-3"
                >
                  <span
                    className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: "#F59E0B18", color: "#D97706" }}
                  >
                    {OPTION_LETTERS[i]}
                  </span>
                  <span>{opt.text}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  // ── Intro screen ──────────────────────────────────────────────────────────
  return (
    <section className="px-4 sm:px-6 pb-safe max-w-xl mx-auto fade-up">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-[#6B7280] mb-6 touch-target">
        ← {t.back}
      </button>

      <div className="rounded-3xl bg-white p-5 shadow-md">
        <div
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-4"
          style={{ background: "#F59E0B18", color: "#D97706" }}
        >
          {t.celebChip}
        </div>

        <h2 className="font-display font-bold text-2xl mb-1 text-[#0D0D0D]">
          {t.celebIntroTitle}
        </h2>
        <p className="text-sm text-[#6B7280] mb-6">{t.celebIntroSubtitle}</p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {CELEBRITIES.map(celeb => {
            const meta = getMeta(celeb.id);
            return (
              <div
                key={celeb.id}
                className="rounded-2xl p-4 relative overflow-hidden"
                style={{ background: celeb.bgColor, border: `1px solid ${celeb.color}30` }}
              >
                <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: celeb.color }} />
                <div className="text-2xl mb-2">{celeb.emoji}</div>
                <p className="font-bold text-sm text-[#0D0D0D] leading-tight mb-0.5">{celeb.name}</p>
                <p className="text-[10px] font-semibold mb-2" style={{ color: celeb.color }}>{meta.title}</p>
                <div className="flex flex-wrap gap-1">
                  {celeb.holdingsDisplay.slice(0, 3).map(ticker => (
                    <span
                      key={ticker}
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
                      style={{ background: celeb.color }}
                    >
                      {ticker}
                    </span>
                  ))}
                </div>
                <p className="text-[9px] text-[#9CA3AF] mt-2 italic leading-tight">
                  &ldquo;{meta.tagline}&rdquo;
                </p>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => setPhase("quiz")}
          className="w-full rounded-2xl touch-target text-sm font-bold text-white flex items-center justify-center"
          style={{ background: "#F59E0B" }}
        >
          {t.celebStartBtn}
        </button>
      </div>
    </section>
  );
}
