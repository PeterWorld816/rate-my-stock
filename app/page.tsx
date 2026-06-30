"use client";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import { useGamification } from "@/lib/useGamification";

// ── Shared types ──────────────────────────────────────────────────────────────
export type Mode =
  | "face" | "mbti" | "vibe" | "salary" | "couple" | "celebrity" | "career"
  | null;

export type Result = {
  ticker: string;
  name: string;
  score: number;
  reason: string;
  risk: "LOW" | "MID" | "HIGH";
  emoji: string;
  extras: { ticker: string; name: string; emoji: string }[];
  investorCode?: string;
  archetype?: string;
  celebrity?: string;
  celebrityEmoji?: string;
  celebrityMatch?: number;
};

export type CoupleResult = {
  person1: { ticker: string; name: string; emoji: string; risk: "LOW" | "MID" | "HIGH" };
  person2: { ticker: string; name: string; emoji: string; risk: "LOW" | "MID" | "HIGH" };
  compatibilityScore: number;
  compatibilityLabel: string;
  dynamicDesc: string;
  reason: string;
  recommendedSectors: { name: string; emoji: string }[];
};
// ─────────────────────────────────────────────────────────────────────────────

export default function Home() {
  const { t } = useLanguage();
  const { stats } = useGamification();

  return (
    <main className="min-h-screen bg-[#F5F5F0] font-sans">

      {/* ── Hero ── */}
      <section className="px-5 pt-14 pb-5 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#0D0D0D] px-4 py-1.5 text-xs font-semibold text-white mb-5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00C805] animate-pulse" />
          {t.freeBadge}
        </div>

        <h1
          className="font-display leading-tight mb-3"
          style={{ fontWeight: 800, fontSize: "clamp(28px, 8vw, 48px)" }}
        >
          {t.appTitle}<br />
          <span style={{ color: "#00C805" }}>{t.appSubtitle} 📈</span>
        </h1>

        <p className="text-sm md:text-base text-[#6B7280]">{t.tagline}</p>
      </section>

      {/* ── Gamification Card (강조) ── */}
      <section className="px-4 pb-4 max-w-2xl md:max-w-3xl mx-auto">
        <div className="rounded-3xl bg-white shadow-sm border border-[#E5E5E0] overflow-hidden">
          <div className="grid grid-cols-3 divide-x divide-[#E5E5E0]">
            {[
              { icon: "🔥", value: `${stats.streak}${t.day}`, label: t.streak },
              { icon: "⚡", value: String(stats.xp), label: t.xp },
              { icon: "🏆", value: `Lv.${stats.level}`, label: t.level },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center gap-2 py-6">
                <span className="text-4xl">{stat.icon}</span>
                <p className="text-lg md:text-xl font-bold text-[#0D0D0D] leading-none">{stat.value}</p>
                <p className="text-xs text-[#9CA3AF] leading-none">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section Cards ── */}
      <section className="px-4 pb-6 space-y-4 max-w-2xl md:max-w-3xl mx-auto">

        {/* 오늘의 주식 */}
        <Link href="/today" className="block">
          <div className="rounded-3xl bg-white p-5 shadow-sm border border-[#E5E5E0] card-hover">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mb-2 bg-[#00C80518] text-[#00C805]">
                  📅 {t.dailyUpdate}
                </span>
                <h2 className="font-display font-bold text-xl md:text-2xl text-[#0D0D0D]">{t.todayStock}</h2>
                <p className="text-sm text-[#6B7280]">{t.todayDesc}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ background: "#00C80512" }}>
                📈
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              {[{ t: "NVDA", c: "+2.3%", up: true }, { t: "AAPL", c: "+1.1%", up: true }, { t: "TSLA", c: "-0.8%", up: false }].map((s) => (
                <div key={s.t} className="flex-1 rounded-xl py-2 px-2.5 text-center"
                  style={{ background: s.up ? "#00C80512" : "#FEE2E212" }}>
                  <p className="text-xs font-bold text-[#0D0D0D]">{s.t}</p>
                  <p className="text-[10px] font-semibold" style={{ color: s.up ? "#00C805" : "#991B1B" }}>{s.c}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-[#9CA3AF]">
                {t.todayPick} <span className="font-semibold text-[#0D0D0D]">NVIDIA</span>
              </p>
              <span className="text-xs font-semibold" style={{ color: "#00C805" }}>{t.viewAnalysis}</span>
            </div>
          </div>
        </Link>

        {/* 주식 퀴즈 */}
        <Link href="/quiz" className="block">
          <div className="rounded-3xl bg-white p-5 shadow-sm border border-[#E5E5E0] card-hover">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mb-2 bg-[#7C3AED18] text-[#7C3AED]">
                  🎮 {t.quizCount}
                </span>
                <h2 className="font-display font-bold text-xl md:text-2xl text-[#0D0D0D]">{t.stockQuiz}</h2>
                <p className="text-sm text-[#6B7280]">{t.quizDesc}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ background: "#7C3AED12" }}>
                🧠
              </div>
            </div>

            <div className="rounded-xl p-3 mb-4" style={{ background: "#7C3AED0C" }}>
              <p className="text-[10px] font-semibold mb-1" style={{ color: "#7C3AED" }}>{t.quizPreview}</p>
              <p className="text-sm font-medium text-[#0D0D0D]">
                &ldquo;{t.quizSampleQ}&rdquo; ⭕❌
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-20 rounded-full bg-[#E5E5E0]" />
                <p className="text-[10px] text-[#9CA3AF]">0 / 5</p>
              </div>
              <span className="text-xs font-semibold" style={{ color: "#7C3AED" }}>{t.startQuiz}</span>
            </div>
          </div>
        </Link>

        {/* 시뮬레이터 */}
        <Link href="/simulator" className="block">
          <div className="rounded-3xl bg-white p-5 shadow-sm border border-[#E5E5E0] card-hover">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mb-2 bg-[#F59E0B18] text-[#F59E0B]">
                  🚧 {t.comingSoon}
                </span>
                <h2 className="font-display font-bold text-xl md:text-2xl text-[#0D0D0D]">{t.simulator}</h2>
                <p className="text-sm text-[#6B7280]">{t.investAmount} · {t.investPeriod} · {t.calculate}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ background: "#F59E0B12" }}>
                💼
              </div>
            </div>

            <div className="rounded-xl p-3 mb-4" style={{ background: "#F59E0B0C" }}>
              <p className="text-[10px] text-[#9CA3AF] mb-0.5">{t.myVirtualAsset}</p>
              <p className="text-lg font-display font-bold text-[#0D0D0D]">₩10,000,000</p>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#F59E0B18", color: "#F59E0B" }}>
                {t.launching}
              </span>
              <span className="text-xs font-semibold" style={{ color: "#F59E0B" }}>{t.findNow}</span>
            </div>
          </div>
        </Link>

        {/* AI Match 카드 */}
        <Link href="/match" className="block">
          <div className="rounded-3xl bg-white p-5 shadow-sm border border-[#E5E5E0] card-hover">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mb-2 bg-[#00C80518] text-[#00C805]">
                  ✨ {t.navMatch}
                </span>
                <h2 className="font-display font-bold text-xl md:text-2xl text-[#0D0D0D]">{t.matchTitle}</h2>
                <p className="text-sm text-[#6B7280]">{t.matchSubtitle}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ background: "#00C80512" }}>
                🤳
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {[t.chipFace, t.modeCardSalaryTitle, t.modeCardCoupleTitle].map((chip) => (
                <span key={chip} className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#F3F4F6] text-[#6B7280]">
                  {chip}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#00C80518] text-[#00C805]">
                {t.modeCardFaceTag}
              </span>
              <span className="text-xs font-semibold" style={{ color: "#00C805" }}>{t.findNow}</span>
            </div>
          </div>
        </Link>

      </section>
    </main>
  );
}
