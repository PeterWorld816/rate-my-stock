"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import { QUIZ_POOL, DifficultyQ, getText } from "@/lib/quizData";
import { loadStats, applyXP } from "@/lib/gamification";
import { useGamification } from "@/lib/useGamification";
import { triggerPerfectConfetti, triggerLevelUpConfetti } from "@/lib/confetti";

const TOTAL = 5;
const XP_PER_Q = 20;
const STORAGE_KEY = "rms_solved_ids";

// ── localStorage helpers ───────────────────────────────────────────────────────
function getSolvedSet(): Set<string | number> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set<string | number>(raw ? (JSON.parse(raw) as (string | number)[]) : []);
  } catch {
    return new Set();
  }
}

function saveSolvedIds(ids: (string | number)[]) {
  try {
    const solved = getSolvedSet();
    ids.forEach((id) => solved.add(id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(solved)));
  } catch {}
}

// ── Level-based pool (used for remaining count on result screen) ──────────
function getLevelPool(level: number): DifficultyQ[] {
  if (level >= 7) return QUIZ_POOL.filter((q) => q.difficulty === 2 || q.difficulty === 3);
  if (level >= 4) return QUIZ_POOL.filter((q) => q.difficulty === 1 || q.difficulty === 2);
  return QUIZ_POOL.filter((q) => q.difficulty === 1);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type PickResult =
  | { allDone: true }
  | { allDone: false; questions: DifficultyQ[]; level: number };

// Lv 1-3: difficulty 1 only
// Lv 4-6: difficulty 1 & 2, 2:1 ratio → 3 diff-1 + 2 diff-2
// Lv 7+:  difficulty 2 & 3, 1:2 ratio → 2 diff-2 + 3 diff-3
function pickQuestions(level: number): PickResult {
  const solved = getSolvedSet();
  const byDiff = (d: number) =>
    shuffle(QUIZ_POOL.filter((q) => q.difficulty === d && !solved.has(q.id)));

  if (level >= 7) {
    const d2 = byDiff(2);
    const d3 = byDiff(3);
    if (d2.length + d3.length === 0) return { allDone: true };
    const picked = [...d2.slice(0, 2), ...d3.slice(0, 3)];
    if (picked.length < TOTAL)
      picked.push(...shuffle([...d2.slice(2), ...d3.slice(3)]).slice(0, TOTAL - picked.length));
    return { allDone: false, questions: shuffle(picked).slice(0, TOTAL), level };
  }

  if (level >= 4) {
    const d1 = byDiff(1);
    const d2 = byDiff(2);
    if (d1.length + d2.length === 0) return { allDone: true };
    const picked = [...d1.slice(0, 3), ...d2.slice(0, 2)];
    if (picked.length < TOTAL)
      picked.push(...shuffle([...d1.slice(3), ...d2.slice(2)]).slice(0, TOTAL - picked.length));
    return { allDone: false, questions: shuffle(picked).slice(0, TOTAL), level };
  }

  const d1 = byDiff(1);
  if (d1.length === 0) return { allDone: true };
  return { allDone: false, questions: d1.slice(0, TOTAL), level };
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function QuizPage() {
  const { t, lang } = useLanguage();
  const { stats } = useGamification();
  const statsRef = useRef(stats);
  statsRef.current = stats;

  const [questions, setQuestions] = useState<DifficultyQ[]>([]);
  const [allSolved, setAllSolved] = useState(false);
  const [ready, setReady] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);

  const [phase, setPhase] = useState<"quiz" | "result">("quiz");
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [copied, setCopied] = useState(false);
  const [leveledUp, setLeveledUp] = useState<number | null>(null);
  const [xpEarned, setXpEarned] = useState(0);
  const [comboCount, setComboCount] = useState(0);

  const loadQuiz = useCallback(() => {
    const result = pickQuestions(statsRef.current.level);
    if (result.allDone) {
      setAllSolved(true);
    } else {
      setCurrentLevel(result.level);
      setQuestions(result.questions);
      setAllSolved(false);
      setPhase("quiz");
      setCurrent(0);
      setSelected(null);
      setScore(0);
      setAnswers([]);
      setLeveledUp(null);
      setXpEarned(0);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    loadQuiz();
  }, [loadQuiz]);

  // Fire confetti the instant a perfect (5/5) result screen appears.
  useEffect(() => {
    if (phase === "result" && questions.length > 0 && score === questions.length) {
      triggerPerfectConfetti();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (!ready) {
    return (
      <main className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
        <div className="text-[#9CA3AF] text-sm">Loading…</div>
      </main>
    );
  }

  // ── All-done screen ──────────────────────────────────────────────────────────
  if (allSolved) {
    return (
      <main className="min-h-screen bg-[#F5F5F0] font-sans flex items-center justify-center">
        <div className="px-4 w-full max-w-sm sm:max-w-lg md:max-w-xl py-8">
          <div className="rounded-3xl bg-white shadow-sm border border-[#E5E5E0] p-8 text-center fade-up">
            <div className="text-7xl mb-4">🎓</div>
            <h2 className="font-display font-bold text-2xl mb-2 text-[#0D0D0D]">
              모두 완료!
            </h2>
            <p className="text-sm text-[#6B7280] mb-8">
              새 문제 업데이트 예정이에요 📬
            </p>
            <Link
              href="/"
              className="block w-full rounded-xl border border-[#E5E5E0] bg-white touch-target flex items-center justify-center text-sm font-medium text-[#6B7280]"
            >
              {t.goHome}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const sessionTotal = questions.length;
  const q = questions[current];
  if (!q) return null;

  const isCorrect = selected !== null ? selected === q.answer : null;
  const revealed = selected !== null;

  const pick = (choice: boolean) => {
    if (revealed) return;
    setSelected(choice);
    const correct = choice === q.answer;
    if (correct) {
      setScore((s) => s + 1);
      setComboCount((c) => c + 1);
    } else {
      setComboCount(0);
    }
    setAnswers((a) => [...a, correct]);
  };

  const next = () => {
    if (current < sessionTotal - 1) {
      setCurrent((c) => c + 1);
      setSelected(null);
    } else {
      saveSolvedIds(questions.map((qItem) => qItem.id));
      const isPerfect = score === sessionTotal;
      const earned = score * XP_PER_Q * (isPerfect ? 2 : 1);
      setXpEarned(earned);
      const prevLevel = loadStats().level;
      const updated = applyXP(earned);
      if (updated.level > prevLevel) {
        setLeveledUp(updated.level);
        triggerLevelUpConfetti();
      }
      setPhase("result");
    }
  };

  const restart = () => loadQuiz();

  const handleShare = async () => {
    const stats = loadStats();
    const url = "https://rate-my-stock.vercel.app/quiz";
    const emojis = answers.map((a) => (a ? "⭕" : "❌")).join("");

    let text: string;
    if (score === sessionTotal) {
      text = `퀴즈 만점! 🏆 나 주식 좀 아는 편\n${emojis}\n나도 도전해봐 → ${url}`;
    } else if (score <= 1) {
      text = `${sessionTotal}개 중 ${score}개... 💀 주식 공부 필요해!\n${emojis}\n→ ${url}`;
    } else {
      text = `Rate My Stock 퀴즈 ${sessionTotal}개 중 ${score}개 맞췄어! 🎯\nLv.${stats.level} | +${xpEarned} XP\n${emojis}\n나도 도전해봐 → ${url}`;
    }

    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await (navigator as Navigator & { share: (d: object) => Promise<void> }).share({
          title: "Rate My Stock 퀴즈",
          text,
        });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const progress = ((current + (revealed ? 1 : 0)) / sessionTotal) * 100;

  // ── Result screen ────────────────────────────────────────────────────────────
  if (phase === "result") {
    const pct = score / sessionTotal;
    const isPerfect = score === sessionTotal;
    const grade =
      pct >= 0.8
        ? { emoji: "🏆", msg: t.gradePerfectMsg, sub: t.gradePerfectSub, color: "#00C805" }
        : pct >= 0.6
        ? { emoji: "⭐", msg: t.gradeGoodMsg, sub: t.gradeGoodSub, color: "#F59E0B" }
        : { emoji: "📚", msg: t.gradeRetryMsg, sub: t.gradeRetrySub, color: "#7C3AED" };

    const newStats = loadStats();
    const newSolved = getSolvedSet();
    const remaining = getLevelPool(newStats.level).filter((qItem) => !newSolved.has(qItem.id)).length;

    return (
      <>
        <style>{`
          @keyframes comboPop { 0%{transform:scale(0.5);opacity:0} 60%{transform:scale(1.15);opacity:1} 100%{transform:scale(1);opacity:1} }
          .anim-combo { animation: comboPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        `}</style>
        <main className="min-h-screen bg-[#F5F5F0] font-sans flex items-center justify-center">
          <div className="px-4 w-full max-w-sm sm:max-w-lg md:max-w-xl py-8">
            <div className="rounded-3xl bg-white shadow-sm border border-[#E5E5E0] p-8 text-center fade-up">
              <div className="text-7xl mb-4">{grade.emoji}</div>
              <h2 className="font-display font-bold text-2xl md:text-3xl mb-1 text-[#0D0D0D]">{grade.msg}</h2>
              <p className="text-sm md:text-base text-[#6B7280] mb-6">{grade.sub}</p>

              {isPerfect && (
                <div
                  className="anim-combo inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 mb-4 text-sm font-bold text-white"
                  style={{ background: "#F59E0B" }}
                >
                  🏆 PERFECT!
                </div>
              )}

              {/* Score */}
              <div className="rounded-2xl p-5 mb-5" style={{ background: `${grade.color}12` }}>
                <p className="text-4xl md:text-5xl font-display font-bold mb-1" style={{ color: grade.color }}>
                  {score} <span className="text-xl text-[#9CA3AF]">/ {sessionTotal}</span>
                </p>
                <p className="text-xs font-semibold" style={{ color: grade.color }}>{t.score}</p>
              </div>

              {/* Answer dots */}
              <div className="flex justify-center gap-2 mb-5">
                {answers.map((a, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ background: a ? "#00C80518" : "#FEE2E2", color: a ? "#00C805" : "#EF4444" }}
                  >
                    {a ? "⭕" : "❌"}
                  </div>
                ))}
              </div>

              {/* Level Up */}
              {leveledUp && (
                <div className="rounded-2xl p-3 mb-3 text-center" style={{ background: "#7C3AED18" }}>
                  <p className="text-lg font-display font-bold" style={{ color: "#7C3AED" }}>
                    🎉 Level Up! Lv.{leveledUp}
                  </p>
                </div>
              )}

              {/* XP */}
              <div className="rounded-2xl p-3 mb-4" style={{ background: "#00C80512" }}>
                <p className="text-xs font-semibold mb-0.5" style={{ color: "#00C805" }}>{t.xpEarned}</p>
                <p className="text-2xl font-display font-bold text-[#0D0D0D]">+{xpEarned} XP ⚡</p>
              </div>

              <button
                onClick={handleShare}
                className="w-full rounded-xl touch-target text-sm font-bold text-white mb-3 flex items-center justify-center gap-2"
                style={{ background: "#0D0D0D" }}
              >
                {copied ? "✅ 복사됐어요!" : "친구한테 자랑하기 📤"}
              </button>
              <button
                onClick={restart}
                className="w-full rounded-xl touch-target text-sm font-bold text-white mb-3"
                style={{ background: "#7C3AED" }}
              >
                {remaining > 0 ? `다음 ${Math.min(TOTAL, remaining)}문제 풀기` : t.retry}
              </button>
              <Link
                href="/"
                className="block w-full rounded-xl border border-[#E5E5E0] bg-white touch-target flex items-center justify-center text-sm font-medium text-[#6B7280]"
              >
                {t.goHome}
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  // ── Quiz screen ──────────────────────────────────────────────────────────────
  const tagEmoji = [...getText(q.tag, lang)][0] ?? "📊";
  const qText = getText(q.q, lang);
  const qLen = qText.length;
  const qSizeClass =
    qLen > 60 ? "text-[13px] md:text-base lg:text-lg" :
    qLen > 45 ? "text-[15px] md:text-lg lg:text-xl" :
    qLen > 32 ? "text-[18px] md:text-xl lg:text-2xl" :
               "text-[22px] md:text-2xl lg:text-3xl";

  const getBtn = (val: boolean) => {
    const isChosen = selected === val;
    const isCorrectAnswer = q.answer === val;
    if (!revealed) {
      return { bg: val ? "#DCFCE7" : "#FEE2E2", text: val ? "#16A34A" : "#DC2626", border: "transparent", anim: "" };
    }
    if (isCorrectAnswer) {
      return { bg: "#DCFCE7", text: "#16A34A", border: "#00C805", anim: isChosen ? "anim-pop" : "" };
    }
    if (isChosen) {
      return { bg: "#FEE2E2", text: "#DC2626", border: "#EF4444", anim: "anim-shake" };
    }
    return { bg: "#F3F4F6", text: "#9CA3AF", border: "transparent", anim: "" };
  };

  return (
    <>
      <style>{`
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }
        @keyframes pop { 0%{transform:scale(1)} 40%{transform:scale(1.1)} 70%{transform:scale(0.95)} 100%{transform:scale(1)} }
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes comboPop { 0%{transform:scale(0.5);opacity:0} 60%{transform:scale(1.15);opacity:1} 100%{transform:scale(1);opacity:1} }
        .anim-shake { animation: shake 0.4s ease; }
        .anim-pop { animation: pop 0.35s ease; }
        .anim-feedback { animation: fadeSlideUp 0.3s ease both; }
        .anim-combo { animation: comboPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
      `}</style>

      <main className="min-h-screen bg-[#F5F5F0] font-sans flex flex-col items-center">
        {/* ── Top bar ── */}
        <div className="w-full max-w-[420px] md:max-w-lg px-4 pt-8 pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-[#9CA3AF] font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#E5E5E0] transition-colors shrink-0 text-base"
            >
              ✕
            </Link>
            <div className="flex-1 h-[6px] rounded-full bg-[#E5E5E0] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%`, background: "#00C805" }}
              />
            </div>
            <span className="text-xs font-bold tabular-nums shrink-0" style={{ color: "#00C805" }}>
              {current + 1}/{sessionTotal}
            </span>
          </div>

          <div className="mt-2">
            <span className="text-[10px] text-[#9CA3AF]">Lv.{currentLevel}</span>
          </div>
        </div>

        {/* ── Center content ── */}
        <div
          className="flex-1 flex flex-col items-center justify-start pt-4 w-full px-4 md:px-8 pb-6 gap-4"
          key={current}
        >
          {/* Combo badge */}
          {comboCount >= 2 && (
            <div
              key={comboCount}
              className="anim-combo inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-white"
              style={{ background: "#F59E0B" }}
            >
              🔥 {comboCount} COMBO
            </div>
          )}

          {/* Question card */}
          <div
            className="bg-white rounded-3xl shadow-md w-full max-w-[420px] md:max-w-lg p-6 md:p-8 flex flex-col justify-center min-h-[300px] md:min-h-[360px] transition-all duration-300"
            style={{
              border: `2px solid ${revealed ? (isCorrect ? "#00C805" : "#EF4444") : "transparent"}`,
            }}
          >
            <div className="text-[64px] text-center leading-none mb-4">{tagEmoji}</div>

            <div className="flex justify-center mb-5">
              <span
                className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold"
                style={{ background: "#F3F4F6", color: "#6B7280" }}
              >
                {getText(q.tag, lang)}
              </span>
            </div>

            <h2 className={`text-balance font-bold text-center text-[#0D0D0D] leading-snug ${qSizeClass}`}>
              &ldquo;{qText}&rdquo;
            </h2>
          </div>

          {/* O/X buttons */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-[420px] md:max-w-lg">
            {([
              { val: true as boolean, symbol: "⭕", label: t.oLabel },
              { val: false as boolean, symbol: "❌", label: t.xLabel },
            ] as const).map((opt) => {
              const s = getBtn(opt.val);
              return (
                <button
                  key={String(opt.val)}
                  onClick={() => pick(opt.val)}
                  disabled={revealed}
                  className={`rounded-xl flex items-center justify-center gap-2 font-bold transition-all active:scale-95 hover:brightness-95 ${s.anim}`}
                  style={{
                    background: s.bg,
                    color: s.text,
                    border: `2px solid ${s.border}`,
                    minHeight: "72px",
                  }}
                >
                  <span className="text-2xl">{opt.symbol}</span>
                  <span className="text-base">{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Feedback + Next */}
          {revealed && (
            <div className="w-full max-w-[420px] md:max-w-lg anim-feedback">
              <div
                className="rounded-2xl p-4 mb-3 flex items-start gap-3"
                style={{ background: isCorrect ? "#DCFCE7" : "#FEE2E2" }}
              >
                <span className="text-2xl shrink-0">{isCorrect ? "🎉" : "😅"}</span>
                <div>
                  <p
                    className="font-bold text-sm mb-0.5"
                    style={{ color: isCorrect ? "#15803D" : "#DC2626" }}
                  >
                    {isCorrect ? t.answerCorrect : t.answerWrong}
                  </p>
                  <p className="text-sm md:text-base text-[#374151] leading-relaxed">{getText(q.explain, lang)}</p>
                </div>
              </div>
              <button
                onClick={next}
                className="w-full rounded-xl py-4 text-sm font-bold text-white transition-transform active:scale-95"
                style={{ background: "#0D0D0D" }}
              >
                {current < sessionTotal - 1 ? t.nextQuestion : t.viewResult}
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
