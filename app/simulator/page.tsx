"use client";
import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/i18n";

// ── Default stocks ────────────────────────────────────────────────────────────
const DEFAULT_STOCKS = [
  { ticker: "NVDA", name: "NVIDIA",     emoji: "🤖", accent: "#76B900" },
  { ticker: "TSLA", name: "Tesla",      emoji: "⚡", accent: "#CC0000" },
  { ticker: "AAPL", name: "Apple",      emoji: "🍎", accent: "#555555" },
  { ticker: "META", name: "Meta",       emoji: "👍", accent: "#0082FB" },
  { ticker: "MSFT", name: "Microsoft",  emoji: "💻", accent: "#00A4EF" },
  { ticker: "SPY",  name: "S&P500 ETF", emoji: "📊", accent: "#00C805" },
  { ticker: "AMZN", name: "Amazon",     emoji: "📦", accent: "#FF9900" },
];

const PRESETS = [100, 500, 1_000, 5_000, 10_000];
const MIN = 100;
const MAX = 10_000;

const PERIOD_RANGES = ["1y", "3y", "5y", "10y"] as const;
type PeriodRange = (typeof PERIOD_RANGES)[number];

const PERIOD_META: Record<PeriodRange, { interval: string; years: number }> = {
  "1y":  { interval: "1mo",  years: 1  },
  "3y":  { interval: "1mo",  years: 3  },
  "5y":  { interval: "1mo",  years: 5  },
  "10y": { interval: "3mo",  years: 10 },
};

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
  const color = isUp ? "#00C805" : "#EF4444";
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
      {[0.33, 0.66].map((f) => (
        <line key={f} x1={PAD} x2={W - PAD} y1={PAD + f * (H - PAD * 2)} y2={PAD + f * (H - PAD * 2)}
          stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
      ))}
      <path d={areaPath} fill="url(#chartGrad)" />
      <path d={linePath} stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={firstPt.x} cy={firstPt.y} r="3.5" fill="rgba(255,255,255,0.5)" />
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

// ── Types ─────────────────────────────────────────────────────────────────────
type StockCache = {
  ticker: string;
  buyPrice: number;
  currentPrice: number;
  closes: number[];
};

// ── Page ──────────────────────────────────────────────────────────────────────
function SimulatorContent() {
  const searchParams  = useSearchParams();
  const paramTicker   = searchParams.get("ticker");
  const paramEmoji    = searchParams.get("emoji") ?? "📈";
  const paramName     = searchParams.get("name") ?? paramTicker ?? "Stock";

  const allStocks = useMemo(() => {
    if (!paramTicker) return DEFAULT_STOCKS;
    if (DEFAULT_STOCKS.some((s) => s.ticker === paramTicker)) return DEFAULT_STOCKS;
    return [
      { ticker: paramTicker, name: paramName, emoji: paramEmoji, accent: "#00C805" },
      ...DEFAULT_STOCKS,
    ];
  }, [paramTicker, paramEmoji, paramName]);

  const initialTicker = paramTicker ?? "NVDA";

  const { t } = useLanguage();
  const [ticker, setTicker]               = useState(initialTicker);
  const [amount, setAmount]               = useState(1_000);
  const [period, setPeriod]               = useState<PeriodRange>("1y");
  const [cache, setCache]                 = useState<StockCache | null>(null);
  const [loading, setLoading]             = useState(false);
  const [fetchError, setFetchError]       = useState(false);
  const [copied, setCopied]               = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false);

  const stock        = allStocks.find((s) => s.ticker === ticker)!;
  const periodLabel  = (r: PeriodRange) =>
    ({ "1y": t.period1y, "3y": t.period3y, "5y": t.period5y, "10y": t.period10y }[r]);
  const activeMeta   = PERIOD_META[period];

  function getReaction(pct: number) {
    if (pct >= 150) return { emoji: "🚀", label: t.reactionRocket,  color: "#00C805" };
    if (pct >= 50)  return { emoji: "💰", label: t.reactionBig,     color: "#00C805" };
    if (pct >= 10)  return { emoji: "😊", label: t.reactionProfit,  color: "#00C805" };
    if (pct >= 0)   return { emoji: "🙂", label: t.reactionSmall,   color: "#00C805" };
    if (pct >= -20) return { emoji: "😅", label: t.reactionLoss,    color: "#F59E0B" };
    return                  { emoji: "😢", label: t.reactionBigLoss, color: "#EF4444" };
  }

  const fetchData = async (tkr: string, r: PeriodRange = period) => {
    setLoading(true);
    setFetchError(false);
    const meta = PERIOD_META[r];
    try {
      const res  = await fetch(`/api/stock?ticker=${encodeURIComponent(tkr)}&interval=${meta.interval}&range=${r}`);
      const data = await res.json();
      if (data.error) throw new Error();

      const closes: number[] = data.closes ?? [];
      if (closes.length < 2) throw new Error();

      const buyPrice     = (data.buyPrice as number) || closes[0];
      const currentPrice = (data.price   as number) || closes[closes.length - 1];

      setCache({ ticker: tkr, buyPrice, currentPrice, closes });
      setHasCalculated(true);
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchData(initialTicker, "1y"); }, []);

  const result = useMemo(() => {
    if (!cache) return null;
    const shares       = amount / cache.buyPrice;
    const currentValue = shares * cache.currentPrice;
    const profit       = currentValue - amount;
    const returnPct    = (profit / amount) * 100;
    return { shares, currentValue, profit, returnPct };
  }, [cache, amount]);

  const isUp     = result ? result.returnPct >= 0 : true;
  const reaction = result ? getReaction(result.returnPct) : null;
  const sliderPct = ((amount - MIN) / (MAX - MIN)) * 100;

  const handleShare = async () => {
    if (!result || !cache) return;
    const sign = result.profit >= 0 ? "+" : "";
    const pct  = `${sign}${result.returnPct.toFixed(1)}%`;
    const text = t.simShareFmt
      .replace("{emoji}", stock.emoji)
      .replace("{ticker}", cache.ticker)
      .replace("{amount}", fmtCompact(amount))
      .replace("{period}", periodLabel(period))
      .replace("{value}", fmtCompact(result.currentValue))
      .replace("{pct}", pct);
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try { await (navigator as Navigator & { share(d: object): Promise<void> }).share({ title: t.simulator, text }); return; } catch {}
    }
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch {}
  };

  const bankReturn = useMemo(
    () => amount * Math.pow(1.05, activeMeta.years),
    [amount, activeMeta.years]
  );

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
          background: #fff; border: 3px solid #00C805;
          box-shadow: 0 2px 10px rgba(0,200,5,0.45); cursor: pointer;
        }
        input[type='range'].sim-slider::-moz-range-thumb {
          width: 28px; height: 28px; border-radius: 50%;
          background: #fff; border: 3px solid #00C805;
          box-shadow: 0 2px 10px rgba(0,200,5,0.45); cursor: pointer; border-style: solid;
        }
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .result-enter { animation: fadeSlideUp 0.45s ease both; }
      `}</style>

      <main className="min-h-screen bg-[#F5F5F0] font-sans">
        <div className="max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto px-4 pt-12 pb-8">

          {/* ── Header ── */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-3" style={{ background: "#F59E0B18", color: "#F59E0B" }}>
              💸 {t.simulator}
            </div>
            <h1 className="font-display font-bold text-2xl md:text-3xl lg:text-4xl text-[#0D0D0D] leading-tight mb-1">
              {t.simulatorTitle.replace("{period}", periodLabel(period))}
            </h1>
            <p className="text-sm md:text-base text-[#6B7280]">
              {t.stockSelect} · {t.investPeriod} · {t.investAmount} 🔮
            </p>
          </div>

          {/* ── Stock selector ── */}
          <div className="mb-5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">{t.stockSelect}</p>
            <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
              {allStocks.map((s) => {
                const active = ticker === s.ticker;
                return (
                  <button
                    key={s.ticker}
                    onClick={() => { setTicker(s.ticker); fetchData(s.ticker, period); }}
                    className="flex flex-col items-center rounded-xl py-3 px-1 transition-all border-2 text-center"
                    style={{
                      background: active ? "#0D0D0D" : "#FFFFFF",
                      borderColor: active ? "#0D0D0D" : "#E5E5E0",
                      transform: active ? "scale(1.05)" : "scale(1)",
                    }}
                  >
                    <span className="text-xl mb-0.5">{s.emoji}</span>
                    <span className="text-[9px] font-bold leading-tight" style={{ color: active ? "#FFFFFF" : "#374151" }}>
                      {s.ticker}
                    </span>
                    <span className="text-[8px] leading-tight mt-0.5 text-[#9CA3AF]">
                      {s.name.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Period selector ── */}
          <div className="mb-5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">{t.investPeriod}</p>
            <div className="flex gap-2">
              {PERIOD_RANGES.map((r) => {
                const active = period === r;
                return (
                  <button
                    key={r}
                    onClick={() => { setPeriod(r); fetchData(ticker, r); }}
                    className="flex-1 rounded-xl py-2.5 text-sm font-bold transition-all border-2 active:scale-95"
                    style={{
                      background:   active ? "#0D0D0D" : "#FFFFFF",
                      borderColor:  active ? "#0D0D0D" : "#E5E5E0",
                      color:        active ? "#FFFFFF" : "#374151",
                    }}
                  >
                    {periodLabel(r)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Amount selector ── */}
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-[#E5E5E0] mb-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-4">{t.investAmount}</p>
            <div className="flex items-baseline gap-1 mb-5">
              <span className="text-3xl md:text-4xl font-display font-bold text-[#0D0D0D]">{fmtCompact(amount)}</span>
              <span className="text-sm text-[#9CA3AF]">{t.invested}</span>
            </div>
            <input
              type="range" className="sim-slider mb-4"
              min={MIN} max={MAX} step={100} value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              style={{ background: `linear-gradient(to right, #00C805 0%, #00C805 ${sliderPct}%, #E5E5E0 ${sliderPct}%, #E5E5E0 100%)` }}
            />
            <div className="flex gap-1.5 flex-wrap">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => setAmount(p)}
                  className="rounded-full px-2.5 py-1 text-[10px] font-bold border transition-all"
                  style={{
                    background:  amount === p ? "#00C805" : "#F5F5F0",
                    borderColor: amount === p ? "#00C805" : "#E5E5E0",
                    color:       amount === p ? "#ffffff" : "#374151",
                  }}
                >
                  {p >= 1000 ? `$${p / 1000}K` : `$${p}`}
                </button>
              ))}
            </div>
          </div>

          {/* ── Calculate button ── */}
          {!hasCalculated && !loading && (
            <button
              onClick={() => fetchData(ticker)}
              className="w-full rounded-xl touch-target text-sm font-bold text-white mb-4"
              style={{ background: "#F59E0B" }}
            >
              💰 {t.calculate}
            </button>
          )}

          {/* ── Loading ── */}
          {loading && (
            <div className="rounded-3xl bg-[#0D0D0D] p-6 mb-4 flex flex-col items-center justify-center" style={{ minHeight: 200 }}>
              <div className="text-3xl mb-3 animate-spin">⏳</div>
              <p className="text-white/60 text-sm">{stock.ticker} {periodLabel(period)} {t.loadError}...</p>
            </div>
          )}

          {/* ── Error ── */}
          {fetchError && !loading && (
            <div className="rounded-3xl bg-white border border-red-200 p-6 mb-4 text-center">
              <div className="text-3xl mb-2">😵</div>
              <p className="text-sm font-semibold text-[#0D0D0D] mb-1">{t.loadError}</p>
              <p className="text-xs text-[#6B7280] mb-4">{t.loadErrorSub}</p>
              <button
                onClick={() => fetchData(ticker)}
                className="rounded-xl touch-target px-6 text-sm font-bold text-white"
                style={{ background: "#EF4444" }}
              >
                {t.retryBtn}
              </button>
            </div>
          )}

          {/* ── Result card ── */}
          {!loading && !fetchError && result && cache && (
            <div className="result-enter">
              <div className="rounded-3xl bg-[#0D0D0D] p-5 mb-3 shadow-xl overflow-hidden relative">
                <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full opacity-20 blur-2xl" style={{ background: isUp ? "#00C805" : "#EF4444" }} />
                <div className="flex items-center gap-2 mb-4 relative">
                  <span className="text-2xl">{stock.emoji}</span>
                  <div>
                    <p className="text-white font-bold text-base md:text-xl leading-tight">${cache.ticker}</p>
                    <p className="text-gray-400 text-xs">{fmtCompact(amount)} {t.invested} · {periodLabel(period)}</p>
                  </div>
                  {reaction && (
                    <div className="ml-auto text-right">
                      <p className="text-2xl">{reaction.emoji}</p>
                      <p className="text-[10px] font-semibold" style={{ color: reaction.color }}>{reaction.label}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 rounded-xl p-2.5" style={{ background: "rgba(255,255,255,0.07)" }}>
                    <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-0.5">
                      {t.buyPriceAgo.replace("{period}", periodLabel(period))}
                    </p>
                    <p className="text-white font-bold text-sm">{fmtUSD(cache.buyPrice)}</p>
                  </div>
                  <div className="text-gray-500 text-sm font-bold">→</div>
                  <div className="flex-1 rounded-xl p-2.5" style={{ background: isUp ? "#00C80520" : "#EF444420" }}>
                    <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-0.5">{t.currentPrice}</p>
                    <p className="font-bold text-sm" style={{ color: isUp ? "#00C805" : "#EF4444" }}>{fmtUSD(cache.currentPrice)}</p>
                  </div>
                </div>
                <div className="mb-4 -mx-1">
                  <MiniChart closes={cache.closes} isUp={isUp} />
                </div>
                <div className="rounded-2xl p-4" style={{ background: isUp ? "rgba(0,200,5,0.12)" : "rgba(239,68,68,0.12)" }}>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-gray-400 text-[10px] uppercase tracking-widest mb-0.5">{t.resultText}</p>
                      <p className="font-display font-bold text-3xl md:text-4xl leading-none" style={{ color: isUp ? "#00C805" : "#EF4444" }}>
                        {fmtCompact(result.currentValue)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg leading-none" style={{ color: isUp ? "#00C805" : "#EF4444" }}>
                        {isUp ? "+" : ""}{fmtCompact(result.profit)}
                      </p>
                      <p className="text-sm font-semibold" style={{ color: isUp ? "#00C805" : "#EF4444" }}>
                        ({isUp ? "+" : ""}{result.returnPct.toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: t.sharesOwned, value: `${result.shares.toFixed(3)}` },
                  { label: t.principal,   value: fmtCompact(amount) },
                  { label: t.returnRate,  value: `${isUp ? "+" : ""}${result.returnPct.toFixed(1)}%`, highlight: true },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl bg-white p-3 text-center shadow-sm border border-[#E5E5E0]">
                    <p className="text-[9px] text-[#9CA3AF] uppercase tracking-widest mb-1">{s.label}</p>
                    <p className="text-sm font-bold leading-tight" style={{ color: s.highlight ? (isUp ? "#00C805" : "#EF4444") : "#0D0D0D" }}>
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl p-4 mb-4" style={{ background: "#7C3AED0D" }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "#7C3AED" }}>📊 {t.comparison}</p>
                <div className="space-y-2">
                  {[
                    {
                      label: t.bankDeposit.replace("{period}", periodLabel(period)),
                      value: fmtCompact(bankReturn),
                      diff:  bankReturn - amount,
                      good:  false,
                    },
                    {
                      label: `${stock.emoji} ${cache.ticker} ${t.stockActual}`,
                      value: fmtCompact(result.currentValue),
                      diff:  result.profit,
                      good:  isUp,
                    },
                  ].map((c, i) => (
                    <div key={i} className="flex items-center justify-between gap-2">
                      <span className="text-xs text-[#374151]">{c.label}</span>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold" style={{ color: c.good ? "#00C805" : "#9CA3AF" }}>{c.value}</span>
                        <span className="text-[9px] ml-1" style={{ color: c.good ? "#00C805" : "#9CA3AF" }}>
                          ({c.diff >= 0 ? "+" : ""}{fmtCompact(c.diff)})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleShare}
                className="w-full rounded-xl touch-target text-sm font-bold text-white mb-3 flex items-center justify-center gap-2"
                style={{ background: "#0D0D0D" }}
              >
                {copied ? t.copied : t.shareResult}
              </button>
            </div>
          )}

          {/* ── Footer CTA ── */}
          <Link
            href="/today"
            className="block w-full rounded-xl border border-[#E5E5E0] bg-white touch-target flex items-center justify-center gap-2 text-sm font-medium text-[#374151]"
          >
            <span>📈</span><span>{t.checkTodayPrice}</span><span className="text-[#9CA3AF]">→</span>
          </Link>

          <p className="text-center text-[9px] text-[#9CA3AF] mt-4 leading-relaxed">
            {t.disclaimer}
          </p>
        </div>
      </main>
    </>
  );
}

export default function SimulatorPage() {
  return (
    <Suspense>
      <SimulatorContent />
    </Suspense>
  );
}
