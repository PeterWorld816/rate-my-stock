"use client";
import Link from "next/link";

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
  return (
    <main className="min-h-screen bg-[#F5F5F0] font-sans">

      {/* ── Hero ── */}
      <section className="px-5 pt-14 pb-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#0D0D0D] px-4 py-1.5 text-xs font-semibold text-white mb-5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00D084] animate-pulse" />
          무료 주식 교육
        </div>

        <h1
          className="font-display leading-tight mb-3"
          style={{ fontWeight: 800, fontSize: "clamp(2rem, 7vw, 3.5rem)" }}
        >
          주식, 이제<br />
          <span style={{ color: "#00D084" }}>재밌게 배우자 📈</span>
        </h1>

        <p className="text-sm text-[#6B7280] mb-6">
          하루 5분 · 게임처럼 · 완전 무료
        </p>

        {/* Gamification bar */}
        <div className="inline-flex items-center gap-0 rounded-2xl bg-white shadow-sm overflow-hidden">
          {[
            { icon: "🔥", value: "3일", label: "스트릭" },
            { icon: "⚡", value: "420", label: "XP" },
            { icon: "🏆", label: "실버", value: "Lv.4" },
          ].map((stat, i) => (
            <div key={i} className="flex items-center gap-2 px-4 py-3">
              {i > 0 && <div className="w-px h-6 bg-[#E5E5E0] -ml-2 mr-2" />}
              <span className="text-lg">{stat.icon}</span>
              <div className="text-left">
                <p className="text-xs font-bold text-[#0D0D0D] leading-none">{stat.value}</p>
                <p className="text-[9px] text-[#9CA3AF] leading-none mt-0.5">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section Cards ── */}
      <section className="px-4 pb-6 space-y-4 max-w-2xl mx-auto">

        {/* 오늘의 주식 */}
        <Link href="/today" className="block">
          <div className="rounded-3xl bg-white p-5 shadow-md card-hover">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mb-2 bg-[#00D08418] text-[#00D084]">
                  📅 매일 업데이트
                </span>
                <h2 className="font-display font-bold text-xl text-[#0D0D0D]">오늘의 주식</h2>
                <p className="text-sm text-[#6B7280]">오늘 주목할 종목 + 핵심 개념</p>
              </div>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ background: "#00D08412" }}>
                📈
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              {[{ t: "NVDA", c: "+2.3%", up: true }, { t: "AAPL", c: "+1.1%", up: true }, { t: "TSLA", c: "-0.8%", up: false }].map((s) => (
                <div key={s.t} className="flex-1 rounded-xl py-2 px-2.5 text-center"
                  style={{ background: s.up ? "#00D08412" : "#FEE2E212" }}>
                  <p className="text-xs font-bold text-[#0D0D0D]">{s.t}</p>
                  <p className="text-[10px] font-semibold" style={{ color: s.up ? "#00D084" : "#991B1B" }}>{s.c}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-[#9CA3AF]">
                오늘의 픽: <span className="font-semibold text-[#0D0D0D]">NVIDIA</span>
              </p>
              <span className="text-xs font-semibold" style={{ color: "#00D084" }}>분석 보기 →</span>
            </div>
          </div>
        </Link>

        {/* 주식 퀴즈 */}
        <Link href="/quiz" className="block">
          <div className="rounded-3xl bg-white p-5 shadow-md card-hover">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mb-2 bg-[#7C3AED18] text-[#7C3AED]">
                  🎮 오늘 5문제
                </span>
                <h2 className="font-display font-bold text-xl text-[#0D0D0D]">주식 퀴즈</h2>
                <p className="text-sm text-[#6B7280]">OX 퀴즈로 개념 완벽 마스터</p>
              </div>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ background: "#7C3AED12" }}>
                🧠
              </div>
            </div>

            <div className="rounded-xl p-3 mb-4" style={{ background: "#7C3AED0C" }}>
              <p className="text-[10px] font-semibold mb-1" style={{ color: "#7C3AED" }}>오늘의 미리보기</p>
              <p className="text-sm font-medium text-[#0D0D0D]">
                &ldquo;P/E 비율이 낮을수록 저평가된 주식이다?&rdquo; ⭕❌
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-20 rounded-full bg-[#E5E5E0]" />
                <p className="text-[10px] text-[#9CA3AF]">0 / 5</p>
              </div>
              <span className="text-xs font-semibold" style={{ color: "#7C3AED" }}>시작하기 →</span>
            </div>
          </div>
        </Link>

        {/* 시뮬레이터 */}
        <Link href="/simulator" className="block">
          <div className="rounded-3xl bg-white p-5 shadow-md card-hover">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mb-2 bg-[#F59E0B18] text-[#F59E0B]">
                  🚧 준비 중
                </span>
                <h2 className="font-display font-bold text-xl text-[#0D0D0D]">시뮬레이터</h2>
                <p className="text-sm text-[#6B7280]">₩10,000,000으로 가상 투자 연습</p>
              </div>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ background: "#F59E0B12" }}>
                💼
              </div>
            </div>

            <div className="rounded-xl p-3 mb-4" style={{ background: "#F59E0B0C" }}>
              <p className="text-[10px] text-[#9CA3AF] mb-0.5">내 가상 자산</p>
              <p className="text-lg font-display font-bold text-[#0D0D0D]">₩10,000,000</p>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#F59E0B18", color: "#F59E0B" }}>
                출시 예정
              </span>
              <span className="text-xs font-semibold" style={{ color: "#F59E0B" }}>알림 신청 →</span>
            </div>
          </div>
        </Link>

        {/* 나는 무슨 주식? */}
        <Link href="/match" className="block">
          <div className="rounded-3xl bg-[#0D0D0D] p-5 shadow-md card-hover text-white">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mb-2 bg-[#00D08430] text-[#00D084]">
                  ✨ AI 매칭
                </span>
                <h2 className="font-display font-bold text-xl text-white">나는 무슨 주식?</h2>
                <p className="text-sm text-gray-400">내 성격 = 내 주식 DNA 찾기</p>
              </div>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl bg-white/10">
                🔮
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {["🤳 얼굴 분석", "🧠 MBTI", "💼 직업", "⭐ 셀럽"].map((m) => (
                <span key={m} className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/10 text-gray-300">
                  {m}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">7가지 AI 매칭 방법</p>
              <span className="text-xs font-semibold" style={{ color: "#00D084" }}>지금 알아보기 →</span>
            </div>
          </div>
        </Link>

      </section>
    </main>
  );
}
