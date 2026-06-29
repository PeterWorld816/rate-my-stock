"use client";
import { useState, useEffect } from "react";
import { Result } from "@/app/page";
import { useLanguage, mbtiQuestions } from "@/lib/i18n";

interface SelectedAnswer { text: string; axis: "risk" | "style" | "sector" | "time"; trait: string; }
interface InvestorType {
  ticker: string; name: string; archetype: string;
  risk: "LOW" | "MID" | "HIGH"; emoji: string;
  extras: { ticker: string; name: string; emoji: string }[];
}

const INVESTOR_TYPES: Record<string, InvestorType> = {
  AGTR: { ticker: "TSLA",  name: "Tesla, Inc.",                         archetype: "혁신가 🚀",       risk: "HIGH", emoji: "🚀", extras: [{ ticker: "PLTR",  name: "Palantir Technologies",            emoji: "🔮" }, { ticker: "COIN",  name: "Coinbase Global",                  emoji: "🎰" }] },
  AGTP: { ticker: "NVDA",  name: "NVIDIA Corporation",                  archetype: "미래선구자 🤖",   risk: "HIGH", emoji: "🤖", extras: [{ ticker: "AMD",   name: "Advanced Micro Devices",           emoji: "🐉" }, { ticker: "AVGO",  name: "Broadcom Inc.",                    emoji: "⚡" }] },
  AGBR: { ticker: "PLTR",  name: "Palantir Technologies",               archetype: "반체제주의자 🔮", risk: "HIGH", emoji: "🔮", extras: [{ ticker: "TSLA",  name: "Tesla, Inc.",                      emoji: "🚀" }, { ticker: "MSTR",  name: "MicroStrategy",                   emoji: "₿" }] },
  AGBP: { ticker: "AMZN",  name: "Amazon.com, Inc.",                    archetype: "제국건설자 🌍",   risk: "HIGH", emoji: "📦", extras: [{ ticker: "META",  name: "Meta Platforms",                  emoji: "🦋" }, { ticker: "GOOG",  name: "Alphabet Inc.",                    emoji: "🧠" }] },
  AVTR: { ticker: "COIN",  name: "Coinbase Global, Inc.",               archetype: "코인데겐 🎰",     risk: "HIGH", emoji: "🎰", extras: [{ ticker: "MSTR",  name: "MicroStrategy",                   emoji: "₿" },  { ticker: "HOOD",  name: "Robinhood Markets",                emoji: "🦅" }] },
  AVTP: { ticker: "AMD",   name: "Advanced Micro Devices, Inc.",        archetype: "언더독챔피언 🐉", risk: "MID",  emoji: "🐉", extras: [{ ticker: "NVDA",  name: "NVIDIA Corporation",               emoji: "🤖" }, { ticker: "AVGO",  name: "Broadcom Inc.",                    emoji: "⚡" }] },
  AVBR: { ticker: "META",  name: "Meta Platforms, Inc.",                archetype: "변신의달인 🦋",   risk: "MID",  emoji: "🦋", extras: [{ ticker: "AMZN",  name: "Amazon.com, Inc.",                 emoji: "📦" }, { ticker: "SNAP",  name: "Snap Inc.",                        emoji: "👻" }] },
  AVBP: { ticker: "AAPL",  name: "Apple Inc.",                          archetype: "완벽주의자 🍎",   risk: "MID",  emoji: "🍎", extras: [{ ticker: "MSFT",  name: "Microsoft Corporation",           emoji: "💼" }, { ticker: "V",     name: "Visa Inc.",                        emoji: "💳" }] },
  SGTR: { ticker: "GOOG",  name: "Alphabet Inc. (Google)",              archetype: "데이터마법사 🧠", risk: "MID",  emoji: "🧠", extras: [{ ticker: "MSFT",  name: "Microsoft Corporation",           emoji: "💼" }, { ticker: "META",  name: "Meta Platforms",                  emoji: "🦋" }] },
  SGTP: { ticker: "MSFT",  name: "Microsoft Corporation",               archetype: "조용한성취자 💼", risk: "MID",  emoji: "💼", extras: [{ ticker: "GOOG",  name: "Alphabet Inc.",                    emoji: "🧠" }, { ticker: "CRM",   name: "Salesforce, Inc.",                 emoji: "☁️" }] },
  SGBR: { ticker: "SOFI",  name: "SoFi Technologies, Inc.",             archetype: "핀테크네이티브 📱", risk: "MID", emoji: "📱", extras: [{ ticker: "HOOD",  name: "Robinhood Markets",               emoji: "🦅" }, { ticker: "ABNB",  name: "Airbnb, Inc.",                     emoji: "🏠" }] },
  SGBP: { ticker: "SHOP",  name: "Shopify Inc.",                        archetype: "앙트레프레너 🛍️", risk: "MID",  emoji: "🛍️", extras: [{ ticker: "ABNB",  name: "Airbnb, Inc.",                     emoji: "🏠" }, { ticker: "UBER",  name: "Uber Technologies",                emoji: "🚗" }] },
  SVTR: { ticker: "JPM",   name: "JPMorgan Chase & Co.",                archetype: "월가귀족 🏛️",   risk: "LOW",  emoji: "🏛️", extras: [{ ticker: "V",     name: "Visa Inc.",                        emoji: "💳" }, { ticker: "MA",    name: "Mastercard Inc.",                  emoji: "💳" }] },
  SVTP: { ticker: "JEPI",  name: "JPMorgan Equity Premium Income ETF", archetype: "배당수집가 💰",   risk: "LOW",  emoji: "💰", extras: [{ ticker: "SCHD",  name: "Schwab US Dividend Equity ETF",   emoji: "🏦" }, { ticker: "VYM",   name: "Vanguard High Dividend Yield ETF", emoji: "🌱" }] },
  SVBR: { ticker: "SCHD",  name: "Schwab US Dividend Equity ETF",      archetype: "안정추구자 🏦",   risk: "LOW",  emoji: "🏦", extras: [{ ticker: "VYM",   name: "Vanguard High Dividend Yield ETF", emoji: "🌱" }, { ticker: "JEPI",  name: "JPMorgan Equity Premium Income ETF", emoji: "💰" }] },
  SVBP: { ticker: "BRK.B", name: "Berkshire Hathaway Inc. B",          archetype: "현자 🦉",         risk: "LOW",  emoji: "🦉", extras: [{ ticker: "VTI",   name: "Vanguard Total Market ETF",        emoji: "🌎" }, { ticker: "KO",    name: "Coca-Cola Company",                emoji: "🥤" }] },
};

function calculateCode(answers: SelectedAnswer[]): string {
  const riskA   = answers.filter(a => a.axis === "risk"   && a.trait === "A").length;
  const styleG  = answers.filter(a => a.axis === "style"  && a.trait === "G").length;
  const sectorT = answers.filter(a => a.axis === "sector" && a.trait === "T").length;
  const timeR   = answers.filter(a => a.axis === "time"   && a.trait === "R").length;
  return `${riskA >= 1 ? "A" : "S"}${styleG >= 1 ? "G" : "V"}${sectorT >= 1 ? "T" : "B"}${timeR >= 1 ? "R" : "P"}`;
}

const OPTION_LETTERS = ["A", "B", "C", "D"];
const CODE_EXPANSIONS: Record<string, string> = {
  A: "⚡ Aggressive", S: "🛡️ Stable",
  G: "🚀 Growth",    V: "💎 Value",
  T: "💻 Tech",      B: "🌐 Broad",
  R: "⚡ Reactive",  P: "🧘 Patient",
};

function OptionSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 0.85, 0.65, 0.45].map((op, i) => (
        <div key={i} className="touch-target rounded-2xl shimmer" style={{ opacity: op }} />
      ))}
    </div>
  );
}

export default function MbtiMode({
  onResult, onBack, loading, setLoading,
}: {
  onResult: (r: Result) => void;
  onBack: () => void;
  loading: boolean;
  setLoading: (b: boolean) => void;
}) {
  const { t, lang } = useLanguage();
  const questions = mbtiQuestions[lang] ?? mbtiQuestions.en ?? [];

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<SelectedAnswer[]>([]);
  const [revealCode, setRevealCode] = useState<string | null>(null);

  useEffect(() => {
    setStep(0);
    setAnswers([]);
    setRevealCode(null);
  }, [lang]);

  const AXIS_LABELS: Record<string, string> = {
    risk: t.mbtiAxisRisk,
    style: t.mbtiAxisStyle,
    sector: t.mbtiAxisSector,
    time: t.mbtiAxisTime,
  };

  const pick = async (option: { text: string; trait: string }) => {
    const q = questions[step];
    const newAnswers: SelectedAnswer[] = [...answers, { text: option.text, axis: q.axis, trait: option.trait }];

    if (step < questions.length - 1) {
      setAnswers(newAnswers);
      setStep(step + 1);
      return;
    }

    const code = calculateCode(newAnswers);
    const investorType = INVESTOR_TYPES[code] ?? INVESTOR_TYPES["SVBP"];
    setRevealCode(code);
    setLoading(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "mbti",
          answers: newAnswers.map(a => a.text),
          investorCode: code,
          archetype: investorType.archetype,
        }),
      });
      const data = await res.json();
      onResult({
        ticker: investorType.ticker,
        name: investorType.name,
        score: typeof data.score === "number" ? data.score : 85,
        reason: typeof data.reason === "string" ? data.reason : `Your ${investorType.archetype} energy is perfectly matched to ${investorType.ticker}.`,
        risk: investorType.risk,
        emoji: investorType.emoji,
        extras: investorType.extras,
        investorCode: code,
        archetype: investorType.archetype,
      });
    } catch {
      onResult({
        ticker: investorType.ticker,
        name: investorType.name,
        score: 85,
        reason: `Your ${investorType.archetype} energy is a perfect match for ${investorType.ticker}. You're built for this.`,
        risk: investorType.risk,
        emoji: investorType.emoji,
        extras: investorType.extras,
        investorCode: code,
        archetype: investorType.archetype,
      });
    } finally {
      setLoading(false);
    }
  };

  const axes: ("risk" | "style" | "sector" | "time")[] = ["risk", "style", "sector", "time"];
  const currentAxis = axes[Math.floor(step / 2)];
  const progress = (step / questions.length) * 100;

  // ── Type reveal screen (shown while API loads) ─────────────────────────────
  if (revealCode) {
    const investorType = INVESTOR_TYPES[revealCode] ?? INVESTOR_TYPES["SVBP"];
    return (
      <section className="px-4 sm:px-6 pb-safe max-w-xl mx-auto fade-up">
        <div className="rounded-3xl bg-white p-6 shadow-md text-center">
          <div
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-6"
            style={{ background: "#7C3AED18", color: "#7C3AED" }}
          >
            {t.mbtiRevealTitle}
          </div>

          <p className="text-sm text-[#6B7280] mb-4">{t.mbtiRevealSubtitle}</p>

          <div className="flex justify-center gap-2 mb-5">
            {revealCode.split("").map((letter, i) => (
              <div
                key={i}
                className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-white"
                style={{ background: "#7C3AED" }}
              >
                <span className="text-2xl font-display font-bold leading-none">{letter}</span>
                <span className="text-[8px] opacity-70 leading-none mt-0.5">
                  {["RISK", "STYLE", "SECTOR", "TIME"][i]}
                </span>
              </div>
            ))}
          </div>

          <p className="text-2xl font-bold mb-1" style={{ color: "#4C1D95" }}>{investorType.archetype}</p>
          <p className="text-sm text-[#6B7280] mb-2">
            {revealCode.split("").map(l => CODE_EXPANSIONS[l]?.split(" ")[1]).join(" · ")}
          </p>

          <p className="text-xs text-[#9CA3AF] mb-8">{t.mbtiRevealLoading}</p>

          <div className="space-y-3">
            {[1, 0.75, 0.5, 0.3].map((op, i) => (
              <div key={i} className="h-3 rounded-full shimmer" style={{ opacity: op }} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── Quiz ──────────────────────────────────────────────────────────────────
  return (
    <section className="px-4 sm:px-6 pb-safe max-w-xl mx-auto fade-up">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-[#6B7280] mb-6 touch-target">
        {t.mbtiBack}
      </button>

      <div className="rounded-3xl bg-white p-5 shadow-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: "#7C3AED18", color: "#7C3AED" }}
          >
            {t.mbtiChip}
          </div>
          <span className="text-xs font-bold tabular-nums" style={{ color: "#7C3AED" }}>
            {step + 1} / {questions.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full bg-[#F3F4F6] mb-4 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: "#7C3AED" }}
          />
        </div>

        {/* Axis tracker */}
        <div className="flex gap-1.5 mb-6">
          {axes.map((axis, i) => {
            const isDone   = Math.floor(step / 2) > i;
            const isActive = Math.floor(step / 2) === i;
            return (
              <div key={axis} className="flex-1">
                <div
                  className={`h-1 rounded-full mb-1 transition-all ${isDone ? "bg-[#7C3AED]" : isActive ? "bg-[#A855F7]" : "bg-[#F3F4F6]"}`}
                />
                <p
                  className={`text-[9px] font-semibold text-center transition-colors ${isActive || isDone ? "text-[#7C3AED]" : "text-[#C4B5FD]"}`}
                >
                  {AXIS_LABELS[axis]}
                </p>
              </div>
            );
          })}
        </div>

        <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: "#A855F7" }}>
          {AXIS_LABELS[currentAxis]}
        </p>

        <h2 className="font-display font-bold text-xl mb-6 leading-snug text-[#0D0D0D]">
          {questions[step]?.q}
        </h2>

        {loading ? (
          <OptionSkeleton />
        ) : (
          <div className="space-y-3">
            {questions[step]?.options.map((opt, i) => (
              <button
                key={opt.text}
                onClick={() => pick(opt)}
                className="w-full text-left rounded-2xl border border-[#E5E5E0] bg-[#F5F5F0] px-4 touch-target text-sm font-medium text-[#374151] hover:border-[#7C3AED] hover:bg-[#F5F3FF] transition-all card-hover flex items-center gap-3"
              >
                <span
                  className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: "#7C3AED18", color: "#7C3AED" }}
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
