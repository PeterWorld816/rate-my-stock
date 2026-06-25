"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

// ── Stocks ───────────────────────────────────────────────────────────────────
const STOCKS = [
  { ticker: "NVDA", name: "NVIDIA",     emoji: "🤖", accent: "#76B900" },
  { ticker: "TSLA", name: "Tesla",      emoji: "⚡", accent: "#CC0000" },
  { ticker: "AAPL", name: "Apple",      emoji: "🍎", accent: "#555555" },
  { ticker: "META", name: "Meta",       emoji: "👍", accent: "#0082FB" },
  { ticker: "MSFT", name: "Microsoft",  emoji: "💻", accent: "#00A4EF" },
  { ticker: "SPY",  name: "S&P500 ETF", emoji: "📊", accent: "#00D084" },
  { ticker: "AMZN", name: "Amazon",     emoji: "📦", accent: "#FF9900" },
];

const PRESETS = [100, 500, 1_000, 5_000, 10_000];
const MIN = 100;
const MAX = 10_000;

// ── Mini chart ────────────────────────────────────────────────────────────────
function MiniChart({ closes, isUp }: { closes: number[]; isUp: boolean }) {
  const valid = closes.filter((c) => c != null && !isNaN(c) && c > 0);
  if (valid.length < 2) return null;

  const min = Math.min(...valid);
  const max = Math.max(...valid);
  const span = max - min || 1;
  const W = 320;
  const H = 72;
  const PAD = 4;

  const pts = valid.map((c, i) => ({
    x: PAD + (i / (valid.length - 1)) * (W - PAD * 2),
    y: H - PAD - ((c - min) / span) * (H - PAD * 2),
  }));

  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${W - PAD},${H} L${PAD},${H} Z`;
  const color = isUp ? "#00D084" : "#EF4444";
  const lastPt = pts[pts.length - 1];
  const firstPt = pts[0];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none" style={{ height: 72 }}>
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0.33, 0.66].map((f) => (
        <line key={f} x1={PAD} x2={W - PAD} y1={PAD + f * (H - PAD * 2)} y2={PAD + f * (H - PAD * 2)}
          stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
      ))}
      <path d={areaPath} fill="url(#chartGrad)" />
      <path d={linePath} stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* Start dot */}
      <circle cx={firstPt.x} cy={firstPt.y} r="3.5" fill="rgba(255,255,255,0.5)" />
      {/* End dot + pulse */}
      <circle cx={lastPt.x} cy={lastPt.y} r="5" fill={color} fillOpacity="0.25" />
      <circle cx={lastPt.x} cy={lastPt.y} r="3.5" fill={color} />
    </svg>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtUSD = (n: number, dec = 2) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: dec, maximumFractionDigits: dec });

const fmtCompact = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function getReaction(pct: number) {
  if (pct >= 150) return { emoji: "🚀", label: "로켓 발사!",     color: "#00D084" };
  if (pct >= 50)  return { emoji: "💰", label: "대박났어요!",    color: "#00D084" };
  if (pct >= 10)  return { emoji: "😊", label: "수익이 났어요!", color: "#00D084" };
  if (pct >= 0)   return { emoji: "🙂", label: "소소한 이익",    color: "#00D084" };
  if (pct >= -20) return { emoji: "😅", label: "조금 손해봤어요", color: "#F59E0B" };
  return                  { emoji: "😢", label: "많이 빠졌어요...", color: "#EF4444" };
}

// ── Types ─────────────────────────────────────────────────────────────────────
type StockCache = {
  ticker: string;
  buyPrice: number;
  currentPrice: number;
  closes: number[];
};

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SimulatorPage() {
  const [ticker, setTicker]         = useState("NVDA");
  const [amount, setAmount]         = useState(1_000);
  const [cache, setCache]           = useState<StockCache | null>(null);
  const [loading, setLoading]       = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [copied, setCopied]         = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false);

  const stock = STOCKS.find((s) => s.ticker === ticker)!;

  // ── Fetch on ticker change (after user hits "계산하기" or on mount)
  const fetchData = async (t: string) => {
    setLoading(true);
    setFetchError(false);
    try {
      const res = await fetch(`/api/stock?ticker=${encodeURIComponent(t)}&interval=1mo&range=1y`);
      const data = await res.json();
      if (data.error) throw new Error();

      const r = data?.chart?.result?.[0];
      if (!r) throw new Error();

      const rawCloses: (number | null)[] = r.indicators?.quote?.[0]?.close ?? [];
      const closes = rawCloses.filter((c): c is number => c != null && !isNaN(c) && c > 0);
      if (closes.length < 2) throw new Error();

      const buyPrice     = closes[0];
      const currentPrice = r.meta?.regularMarketPrice ?? closes[closes.length - 1];

      setCache({ ticker: t, buyPrice, currentPrice, closes });
      setHasCalculated(true);
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on mount for default ticker
  useEffect(() => { fetchData("NVDA"); }, []); // eslint-disable-line

  // ── Derived result (instant when slider moves) ──────────────────────────────
  const result = useMemo(() => {
    if (!cache) return null;
    const shares       = amount / cache.buyPrice;
    const currentValue = shares * cache.currentPrice;
    const profit       = currentValue - amount;
    const returnPct    = (profit / amount) * 100;
    return { shares, currentValue, profit, returnPct };
  }, [cache, amount]);

  const isUp = result ? result.returnPct >= 0 : true;
  const reaction = result ? getReaction(result.returnPct) : null;
  const sliderPct = ((amount - MIN) / (MAX - MIN)) * 100;

  // ── Share ──────────────────────────────────────────────────────────────────
  const handleShare = async () => {
    if (!result || !cache) return;
    const sign  = result.profit >= 0 ? "+" : "";
    const pct   = `${sign}${result.returnPct.toFixed(1)}%`;
    const text  = `${stock.emoji} ${cache.ticker}에 ${fmtCompact(amount)} 투자했으면 지금 ${fmtCompact(result.currentValue)}! (${pct}) 💰\n나도 해보기 → 주식 시뮬레이터`;

    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await (navigator as Navigator & { share(d: object): Promise<void> }).share({ title: "주식 시뮬레이터", text });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  const bankReturn = useMemo(() => amount * 1.05, [amount]);

  return (
    <>
      <style>{`
        input[type='range'].sim-slider {
          -webkit-appearance: none; appearance: none;
          width: 100%; height: 6px; border-radius: 3px; outline: none; cursor: pointer;
        }
        input[type='range'].sim-slider::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 28px; height: 28px; border-radius: 50%;
          background: #fff; border: 3px solid #00D084;
          box-shadow: 0 2px 10px rgba(0,208,132,0.45); cursor: pointer;
        }
        input[type='range'].sim-slider::-moz-range-thumb {
          width: 28px; height: 28px; border-radius: 50%;
          background: #fff; border: 3px solid #00D084;
          box-shadow: 0 2px 10px rgba(0,208,132,0.45); cursor: pointer; border-style: solid;
        }
        @keyframes fadeSlideUp {
          from { opacity:0; transform: translateY(16px); }
          to   { opacity:1; transform: translateY(0); }
        }
        .result-enter { animation: fadeSlideUp 0.45s ease both; }
      `}</style>

      <main className="min-h-screen bg-[#F5F5F0] font-sans">
        <div className="max-w-sm mx-auto px-4 pt-12 pb-8">

          {/* ── Header ── */}
          <div className="mb-7">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-3" style={{ background: "#F59E0B18", color: "#F59E0B" }}>
              💸 주식 시뮬레이터
            </div>
            <h1 className="font-display font-bold text-2xl text-[#0D0D0D] leading-tight mb-1">
              만약 1년 전에 샀다면?
            </h1>
            <p className="text-sm text-[#6B7280]">
              종목 선택 + 금액 → 지금 얼마인지 계산해드려요 🔮
            </p>
          </div>

          {/* ── Stock selector ── */}
          <div className="mb-6">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">
              종목 선택
            </p>
            <div className="grid grid-cols-4 gap-2">
              {STOCKS.map((s) => {
                const active = ticker === s.ticker;
                return (
                  <button
                    key={s.ticker}
                    onClick={() => { setTicker(s.ticker); fetchData(s.ticker); }}
                    className="flex flex-col items-center rounded-2xl py-3 px-1 transition-all border-2 text-center"
                    style={{
                      background: active ? "#0D0D0D" : "#FFFFFF",
                      borderColor: active ? "#0D0D0D" : "#E5E5E0",
                      transform: active ? "scale(1.05)" : "scale(1)",
                    }}
                  >
                    <span className="text-xl mb-0.5">{s.emoji}</span>
                    <span
                      className="text-[9px] font-bold leading-tight"
                      style={{ color: active ? "#FFFFFF" : "#374151" }}
                    >
                      {s.ticker}
                    </span>
                    <span
                      className="text-[8px] leading-tight mt-0.5"
                      style={{ color: active ? "#9CA3AF" : "#9CA3AF" }}
                    >
                      {s.name.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Amount selector ── */}
          <div className="rounded-2xl bg-white p-5 shadow-sm mb-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-4">
              투자 금액
            </p>

            {/* Current amount display */}
            <div className="flex items-baseline gap-1 mb-5">
              <span className="text-3xl font-display font-bold text-[#0D0D0D]">
                {fmtCompact(amount)}
              </span>
              <span className="text-sm text-[#9CA3AF]">투자</span>
            </div>

            {/* Slider */}
            <input
              type="range"
              className="sim-slider mb-4"
              min={MIN}
              max={MAX}
              step={100}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              style={{
                background: `linear-gradient(to right, #00D084 0%, #00D084 ${sliderPct}%, #E5E5E0 ${sliderPct}%, #E5E5E0 100%)`,
              }}
            />

            {/* Preset buttons */}
            <div className="flex gap-1.5 flex-wrap">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => setAmount(p)}
                  className="rounded-full px-2.5 py-1 text-[10px] font-bold border transition-all"
                  style={{
                    background: amount === p ? "#00D084" : "#F5F5F0",
                    borderColor: amount === p ? "#00D084" : "#E5E5E0",
                    color: amount === p ? "#ffffff" : "#374151",
                  }}
                >
                  {p >= 1000 ? `$${p / 1000}K` : `$${p}`}
                </button>
              ))}
            </div>
          </div>

          {/* ── Calculate button (shown before first result) ── */}
          {!hasCalculated && !loading && (
            <button
              onClick={() => fetchData(ticker)}
              className="w-full rounded-2xl touch-target text-sm font-bold text-white mb-4"
              style={{ background: "#F59E0B" }}
            >
              💰 계산하기
            </button>
          )}

          {/* ── Loading ── */}
          {loading && (
            <div className="rounded-3xl bg-[#0D0D0D] p-6 mb-4 flex flex-col items-center justify-center" style={{ minHeight: 200 }}>
              <div className="text-3xl mb-3 animate-spin">⏳</div>
              <p className="text-white/60 text-sm">
                {stock.ticker} 데이터 불러오는 중...
              </p>
            </div>
          )}

          {/* ── Error ── */}
          {fetchError && !loading && (
            <div className="rounded-3xl bg-white border border-red-200 p-6 mb-4 text-center">
              <div className="text-3xl mb-2">😵</div>
              <p className="text-sm font-semibold text-[#0D0D0D] mb-1">데이터를 불러오지 못했어요</p>
              <p className="text-xs text-[#6B7280] mb-4">잠시 후 다시 시도해주세요</p>
              <button
                onClick={() => fetchData(ticker)}
                className="rounded-2xl touch-target px-6 text-sm font-bold text-white"
                style={{ background: "#EF4444" }}
              >
                다시 시도
              </button>
            </div>
          )}

          {/* ── Result card ── */}
          {!loading && !fetchError && result && cache && (
            <div className="result-enter">
              {/* Dark main card */}
              <div className="rounded-3xl bg-[#0D0D0D] p-5 mb-3 shadow-xl overflow-hidden relative">

                {/* Glow accent */}
                <div
                  className="absolute -top-16 -right-16 w-40 h-40 rounded-full opacity-20 blur-2xl"
                  style={{ background: isUp ? "#00D084" : "#EF4444" }}
                />

                {/* Header */}
                <div className="flex items-center gap-2 mb-4 relative">
                  <span className="text-2xl">{stock.emoji}</span>
                  <div>
                    <p className="text-white font-bold text-base leading-tight">${cache.ticker}</p>
                    <p className="text-gray-400 text-xs">{fmtCompact(amount)} 투자 · 1년 전</p>
                  </div>
                  {reaction && (
                    <div className="ml-auto text-right">
                      <p className="text-2xl">{reaction.emoji}</p>
                      <p className="text-[10px] font-semibold" style={{ color: reaction.color }}>
                        {reaction.label}
                      </p>
                    </div>
                  )}
                </div>

                {/* Price comparison */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 rounded-xl p-2.5" style={{ background: "rgba(255,255,255,0.07)" }}>
                    <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-0.5">1년 전 주가</p>
                    <p className="text-white font-bold text-sm">{fmtUSD(cache.buyPrice)}</p>
                  </div>
                  <div className="text-gray-500 text-sm font-bold">→</div>
                  <div className="flex-1 rounded-xl p-2.5" style={{ background: isUp ? "#00D08420" : "#EF444420" }}>
                    <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-0.5">현재 주가</p>
                    <p className="font-bold text-sm" style={{ color: isUp ? "#00D084" : "#EF4444" }}>
                      {fmtUSD(cache.currentPrice)}
                    </p>
                  </div>
                </div>

                {/* Mini chart */}
                <div className="mb-4 -mx-1">
                  <MiniChart closes={cache.closes} isUp={isUp} />
                </div>

                {/* Result highlight */}
                <div
                  className="rounded-2xl p-4"
                  style={{ background: isUp ? "rgba(0,208,132,0.12)" : "rgba(239,68,68,0.12)" }}
                >
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-gray-400 text-[10px] uppercase tracking-widest mb-0.5">지금 내 자산</p>
                      <p
                        className="font-display font-bold text-3xl leading-none"
                        style={{ color: isUp ? "#00D084" : "#EF4444" }}
                      >
                        {fmtCompact(result.currentValue)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className="font-bold text-lg leading-none"
                        style={{ color: isUp ? "#00D084" : "#EF4444" }}
                      >
                        {isUp ? "+" : ""}{fmtCompact(result.profit)}
                      </p>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: isUp ? "#00D084" : "#EF4444" }}
                      >
                        ({isUp ? "+" : ""}{result.returnPct.toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detail stats */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: "구매 주식 수", value: `${result.shares.toFixed(3)}주` },
                  { label: "투자 원금", value: fmtCompact(amount) },
                  { label: "수익률", value: `${isUp ? "+" : ""}${result.returnPct.toFixed(1)}%`, highlight: true },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl bg-white p-3 text-center shadow-sm">
                    <p className="text-[9px] text-[#9CA3AF] uppercase tracking-widest mb-1">{s.label}</p>
                    <p
                      className="text-sm font-bold leading-tight"
                      style={{
                        color: s.highlight ? (isUp ? "#00D084" : "#EF4444") : "#0D0D0D",
                      }}
                    >
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Fun comparison */}
              <div className="rounded-2xl p-4 mb-4" style={{ background: "#7C3AED0D" }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "#7C3AED" }}>
                  📊 비교
                </p>
                <div className="space-y-2">
                  {[
                    {
                      label: `🏦 은행 예금(연 5%) 이었다면`,
                      value: fmtCompact(bankReturn),
                      diff: bankReturn - amount,
                      good: false,
                    },
                    {
                      label: `${stock.emoji} ${cache.ticker} 실제 결과`,
                      value: fmtCompact(result.currentValue),
                      diff: result.profit,
                      good: isUp,
                    },
                  ].map((c, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-xs text-[#374151]">{c.label}</span>
                      <div className="text-right">
                        <span className="text-xs font-bold" style={{ color: c.good ? "#00D084" : "#9CA3AF" }}>
                          {c.value}
                        </span>
                        <span className="text-[9px] ml-1" style={{ color: c.good ? "#00D084" : "#9CA3AF" }}>
                          ({c.diff >= 0 ? "+" : ""}{fmtCompact(c.diff)})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Share */}
              <button
                onClick={handleShare}
                className="w-full rounded-2xl touch-target text-sm font-bold text-white mb-3 flex items-center justify-center gap-2"
                style={{ background: "#0D0D0D" }}
              >
                {copied ? "✅ 클립보드에 복사됐어요!" : "📤 결과 공유하기"}
              </button>
            </div>
          )}

          {/* ── Footer CTA ── */}
          <Link
            href="/today"
            className="block w-full rounded-2xl border border-[#E5E5E0] bg-white touch-target flex items-center justify-center gap-2 text-sm font-medium text-[#374151]"
          >
            <span>📈</span>
            <span>이 주식 오늘 얼마야?</span>
            <span className="text-[#9CA3AF]">→</span>
          </Link>

          <p className="text-center text-[9px] text-[#9CA3AF] mt-4 leading-relaxed">
            ⚠️ 과거 수익률은 미래를 보장하지 않아요. 이 시뮬레이터는 교육 목적으로만 사용하세요.
          </p>
        </div>
      </main>
    </>
  );
}
