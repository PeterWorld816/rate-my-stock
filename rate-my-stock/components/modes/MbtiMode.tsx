"use client";
import { useState } from "react";
import { Result } from "@/app/page";

interface QuizOption { text: string; trait: string; }
interface Question { axis: "risk" | "style" | "sector" | "time"; q: string; options: QuizOption[]; }
interface SelectedAnswer { text: string; axis: "risk" | "style" | "sector" | "time"; trait: string; }
interface InvestorType {
  ticker: string; name: string; archetype: string;
  risk: "LOW" | "MID" | "HIGH"; emoji: string;
  extras: { ticker: string; name: string; emoji: string }[];
}

const questions: Question[] = [
  {
    axis: "risk",
    q: "Your portfolio crashes -40% overnight. What's your move?",
    options: [
      { text: "Load up — biggest sale of the year 🛒", trait: "A" },
      { text: "Hold firm. I knew it was volatile, staying in", trait: "A" },
      { text: "Sell half to lock in some cash", trait: "S" },
      { text: "Full exit. Capital preservation first 👑", trait: "S" },
    ],
  },
  {
    axis: "risk",
    q: "A friend whispers: 'This pre-IPO startup is going 100x.' You:",
    options: [
      { text: "Wire 20% of my savings immediately 🔥", trait: "A" },
      { text: "Throw in $500 to have skin in the game", trait: "A" },
      { text: "Ask for the pitch deck. Maybe after research", trait: "S" },
      { text: "Hard pass. If it's that good, it'll be public soon", trait: "S" },
    ],
  },
  {
    axis: "style",
    q: "What's your investing endgame?",
    options: [
      { text: "10x in 5 years. Early retirement locked 🏖️", trait: "G" },
      { text: "Beat the S&P 500 every single year", trait: "G" },
      { text: "Steady 8-10% returns + dividends reinvested", trait: "V" },
      { text: "Generate passive income and protect wealth 💸", trait: "V" },
    ],
  },
  {
    axis: "style",
    q: "When analyzing a stock, you look at first:",
    options: [
      { text: "Total addressable market + growth rate 📈", trait: "G" },
      { text: "Revenue trajectory and user/customer growth", trait: "G" },
      { text: "P/E ratio, dividend yield, free cash flow", trait: "V" },
      { text: "Debt levels, profit margins, and competitive moat", trait: "V" },
    ],
  },
  {
    axis: "sector",
    q: "Which headline makes your heart race?",
    options: [
      { text: "AI chip demand hits all-time high 🤖", trait: "T" },
      { text: "Quantum computing breakthrough announced", trait: "T" },
      { text: "Consumer spending beats all forecasts 🛍️", trait: "B" },
      { text: "Fed rate cut sparks a real estate boom", trait: "B" },
    ],
  },
  {
    axis: "sector",
    q: "Your dream portfolio looks like:",
    options: [
      { text: "FAANG + semiconductors + AI pure plays 💻", trait: "T" },
      { text: "Cybersecurity, cloud, and chip designers", trait: "T" },
      { text: "Mix of tech, finance, healthcare, and energy 🌐", trait: "B" },
      { text: "Global ETFs, bonds, REITs, and dividend stocks", trait: "B" },
    ],
  },
  {
    axis: "time",
    q: "How do you make investment decisions?",
    options: [
      { text: "News + gut feeling. Speed is alpha ⚡", trait: "R" },
      { text: "Twitter/Reddit sentiment + chart patterns", trait: "R" },
      { text: "6+ months of deep research before I commit 📚", trait: "P" },
      { text: "Set it and forget it. Rebalance once a year", trait: "P" },
    ],
  },
  {
    axis: "time",
    q: "What's your investment time horizon?",
    options: [
      { text: "Under 1 year — I need to see returns now 💰", trait: "R" },
      { text: "1-3 years. Medium-term momentum plays", trait: "R" },
      { text: "5-10 years. Let compounding work its magic", trait: "P" },
      { text: "15+ years. Planting trees for my kids 🌳", trait: "P" },
    ],
  },
];

const INVESTOR_TYPES: Record<string, InvestorType> = {
  AGTR: { ticker: "TSLA",  name: "Tesla, Inc.",                          archetype: "혁신가 🚀",       risk: "HIGH", emoji: "🚀", extras: [{ ticker: "PLTR",  name: "Palantir Technologies",          emoji: "🔮" }, { ticker: "COIN",  name: "Coinbase Global",                emoji: "🎰" }] },
  AGTP: { ticker: "NVDA",  name: "NVIDIA Corporation",                   archetype: "미래선구자 🤖",   risk: "HIGH", emoji: "🤖", extras: [{ ticker: "AMD",   name: "Advanced Micro Devices",         emoji: "🐉" }, { ticker: "AVGO",  name: "Broadcom Inc.",                  emoji: "⚡" }] },
  AGBR: { ticker: "PLTR",  name: "Palantir Technologies",                archetype: "반체제주의자 🔮", risk: "HIGH", emoji: "🔮", extras: [{ ticker: "TSLA",  name: "Tesla, Inc.",                    emoji: "🚀" }, { ticker: "MSTR",  name: "MicroStrategy",                 emoji: "₿" }] },
  AGBP: { ticker: "AMZN",  name: "Amazon.com, Inc.",                     archetype: "제국건설자 🌍",   risk: "HIGH", emoji: "📦", extras: [{ ticker: "META",  name: "Meta Platforms",                emoji: "🦋" }, { ticker: "GOOG",  name: "Alphabet Inc.",                  emoji: "🧠" }] },
  AVTR: { ticker: "COIN",  name: "Coinbase Global, Inc.",                archetype: "코인데겐 🎰",     risk: "HIGH", emoji: "🎰", extras: [{ ticker: "MSTR",  name: "MicroStrategy",                 emoji: "₿" },  { ticker: "HOOD",  name: "Robinhood Markets",              emoji: "🦅" }] },
  AVTP: { ticker: "AMD",   name: "Advanced Micro Devices, Inc.",         archetype: "언더독챔피언 🐉", risk: "MID",  emoji: "🐉", extras: [{ ticker: "NVDA",  name: "NVIDIA Corporation",             emoji: "🤖" }, { ticker: "AVGO",  name: "Broadcom Inc.",                  emoji: "⚡" }] },
  AVBR: { ticker: "META",  name: "Meta Platforms, Inc.",                 archetype: "변신의달인 🦋",   risk: "MID",  emoji: "🦋", extras: [{ ticker: "AMZN",  name: "Amazon.com, Inc.",               emoji: "📦" }, { ticker: "SNAP",  name: "Snap Inc.",                      emoji: "👻" }] },
  AVBP: { ticker: "AAPL",  name: "Apple Inc.",                           archetype: "완벽주의자 🍎",   risk: "MID",  emoji: "🍎", extras: [{ ticker: "MSFT",  name: "Microsoft Corporation",         emoji: "💼" }, { ticker: "V",     name: "Visa Inc.",                      emoji: "💳" }] },
  SGTR: { ticker: "GOOG",  name: "Alphabet Inc. (Google)",               archetype: "데이터마법사 🧠", risk: "MID",  emoji: "🧠", extras: [{ ticker: "MSFT",  name: "Microsoft Corporation",         emoji: "💼" }, { ticker: "META",  name: "Meta Platforms",                emoji: "🦋" }] },
  SGTP: { ticker: "MSFT",  name: "Microsoft Corporation",                archetype: "조용한성취자 💼", risk: "MID",  emoji: "💼", extras: [{ ticker: "GOOG",  name: "Alphabet Inc.",                  emoji: "🧠" }, { ticker: "CRM",   name: "Salesforce, Inc.",               emoji: "☁️" }] },
  SGBR: { ticker: "SOFI",  name: "SoFi Technologies, Inc.",              archetype: "핀테크네이티브 📱", risk: "MID", emoji: "📱", extras: [{ ticker: "HOOD",  name: "Robinhood Markets",             emoji: "🦅" }, { ticker: "ABNB",  name: "Airbnb, Inc.",                   emoji: "🏠" }] },
  SGBP: { ticker: "SHOP",  name: "Shopify Inc.",                         archetype: "앙트레프레너 🛍️", risk: "MID",  emoji: "🛍️", extras: [{ ticker: "ABNB",  name: "Airbnb, Inc.",                   emoji: "🏠" }, { ticker: "UBER",  name: "Uber Technologies",              emoji: "🚗" }] },
  SVTR: { ticker: "JPM",   name: "JPMorgan Chase & Co.",                 archetype: "월가귀족 🏛️",   risk: "LOW",  emoji: "🏛️", extras: [{ ticker: "V",     name: "Visa Inc.",                      emoji: "💳" }, { ticker: "MA",    name: "Mastercard Inc.",                emoji: "💳" }] },
  SVTP: { ticker: "JEPI",  name: "JPMorgan Equity Premium Income ETF",  archetype: "배당수집가 💰",   risk: "LOW",  emoji: "💰", extras: [{ ticker: "SCHD",  name: "Schwab US Dividend Equity ETF", emoji: "🏦" }, { ticker: "VYM",   name: "Vanguard High Dividend Yield ETF", emoji: "🌱" }] },
  SVBR: { ticker: "SCHD",  name: "Schwab US Dividend Equity ETF",       archetype: "안정추구자 🏦",   risk: "LOW",  emoji: "🏦", extras: [{ ticker: "VYM",   name: "Vanguard High Dividend Yield ETF", emoji: "🌱" }, { ticker: "JEPI",  name: "JPMorgan Equity Premium Income ETF", emoji: "💰" }] },
  SVBP: { ticker: "BRK.B", name: "Berkshire Hathaway Inc. B",           archetype: "현자 🦉",         risk: "LOW",  emoji: "🦉", extras: [{ ticker: "VTI",   name: "Vanguard Total Market ETF",      emoji: "🌎" }, { ticker: "KO",    name: "Coca-Cola Company",              emoji: "🥤" }] },
};

function calculateCode(answers: SelectedAnswer[]): string {
  const riskA   = answers.filter(a => a.axis === "risk"   && a.trait === "A").length;
  const styleG  = answers.filter(a => a.axis === "style"  && a.trait === "G").length;
  const sectorT = answers.filter(a => a.axis === "sector" && a.trait === "T").length;
  const timeR   = answers.filter(a => a.axis === "time"   && a.trait === "R").length;
  return `${riskA >= 1 ? "A" : "S"}${styleG >= 1 ? "G" : "V"}${sectorT >= 1 ? "T" : "B"}${timeR >= 1 ? "R" : "P"}`;
}

const OPTION_LETTERS = ["A", "B", "C", "D"];
const AXIS_LABELS: Record<string, string> = {
  risk: "위험성향", style: "투자목표", sector: "섹터선호", time: "투자기간",
};
const CODE_EXPANSIONS: Record<string, string> = {
  A: "⚡ Aggressive", S: "🛡️ Stable",
  G: "🚀 Growth",    V: "💎 Value",
  T: "💻 Tech",      B: "🌐 Broad",
  R: "⚡ Reactive",  P: "🧘 Patient",
};

// Unified skeleton for quiz options
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
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<SelectedAnswer[]>([]);
  const [revealCode, setRevealCode] = useState<string | null>(null);

  const pick = async (option: QuizOption) => {
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

  // Type reveal screen while API loads
  if (revealCode) {
    const investorType = INVESTOR_TYPES[revealCode] ?? INVESTOR_TYPES["SVBP"];
    return (
      <section className="px-4 sm:px-6 pb-safe max-w-xl mx-auto fade-up">
        <div className="rounded-3xl bg-white p-6 shadow-md text-center">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-6"
            style={{ background: "#7C3AED18", color: "#7C3AED" }}>
            🧬 분석 완료
          </div>

          <p className="text-sm text-[#6B7280] mb-4">당신의 투자자 유형은</p>

          <div className="flex justify-center gap-2 mb-5">
            {revealCode.split("").map((letter, i) => (
              <div key={i} className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-white"
                style={{ background: "#7C3AED" }}>
                <span className="text-2xl font-display font-bold leading-none">{letter}</span>
                <span className="text-[8px] opacity-70 leading-none mt-0.5">{["RISK", "STYLE", "SECTOR", "TIME"][i]}</span>
              </div>
            ))}
          </div>

          <p className="text-2xl font-bold mb-1" style={{ color: "#4C1D95" }}>{investorType.archetype}</p>
          <p className="text-sm text-[#6B7280] mb-2">
            {revealCode.split("").map(l => CODE_EXPANSIONS[l]?.split(" ")[1]).join(" · ")}
          </p>

          <p className="text-xs text-[#9CA3AF] mb-8">Finding your perfect stock match...</p>

          <div className="space-y-3">
            {[1, 0.75, 0.5, 0.3].map((op, i) => (
              <div key={i} className="h-3 rounded-full shimmer" style={{ opacity: op }} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 sm:px-6 pb-safe max-w-xl mx-auto fade-up">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-[#6B7280] mb-6 touch-target">
        ← Back
      </button>

      <div className="rounded-3xl bg-white p-5 shadow-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: "#7C3AED18", color: "#7C3AED" }}>
            🧬 주식 MBTI
          </div>
          <span className="text-xs font-bold tabular-nums" style={{ color: "#7C3AED" }}>
            {step + 1} / {questions.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full bg-[#F3F4F6] mb-4 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: "#7C3AED" }} />
        </div>

        {/* Axis tracker */}
        <div className="flex gap-1.5 mb-6">
          {axes.map((axis, i) => {
            const isDone   = Math.floor(step / 2) > i;
            const isActive = Math.floor(step / 2) === i;
            return (
              <div key={axis} className="flex-1">
                <div className={`h-1 rounded-full mb-1 transition-all ${isDone ? "bg-[#7C3AED]" : isActive ? "bg-[#A855F7]" : "bg-[#F3F4F6]"}`} />
                <p className={`text-[9px] font-semibold text-center transition-colors ${isActive || isDone ? "text-[#7C3AED]" : "text-[#C4B5FD]"}`}>
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
          {questions[step].q}
        </h2>

        {loading ? (
          <OptionSkeleton />
        ) : (
          <div className="space-y-3">
            {questions[step].options.map((opt, i) => (
              <button key={opt.text} onClick={() => pick(opt)}
                className="w-full text-left rounded-2xl border border-[#E5E5E0] bg-[#F5F5F0] px-4 touch-target text-sm font-medium text-[#374151] hover:border-[#7C3AED] hover:bg-[#F5F3FF] transition-all card-hover flex items-center gap-3">
                <span className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: "#7C3AED18", color: "#7C3AED" }}>
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
