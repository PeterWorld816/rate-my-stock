"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useLanguage, quizPool, QuizQ, LangCode } from "@/lib/i18n";
import { loadStats, applyXP } from "@/lib/gamification";

const TOTAL = 5;
const XP_PER_Q = 20;
const STORAGE_KEY = "rms_solved_ids";

// ── localStorage helpers ───────────────────────────────────────────────────────
function getSolvedSet(): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set<number>(raw ? (JSON.parse(raw) as number[]) : []);
  } catch {
    return new Set();
  }
}

function saveSolvedIndices(indices: number[]) {
  try {
    const solved = getSolvedSet();
    indices.forEach((i) => solved.add(i));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(solved)));
  } catch {}
}

function clearSolved() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

// ── Question picker ────────────────────────────────────────────────────────────
type PickResult =
  | { allDone: true }
  | { allDone: false; questions: QuizQ[]; indices: number[] };

function pickUnsolved(lang: LangCode): PickResult {
  const pool = quizPool[lang] ?? quizPool.ko;
  const solved = getSolvedSet();
  const unsolved = pool
    .map((q, i) => ({ q, i }))
    .filter(({ i }) => !solved.has(i));

  if (unsolved.length === 0) return { allDone: true };

  // Fisher-Yates shuffle
  const arr = [...unsolved];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const picked = arr.slice(0, TOTAL);
  return {
    allDone: false,
    questions: picked.map((x) => x.q),
    indices: picked.map((x) => x.i),
  };
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function QuizPage() {
  const { t, lang } = useLanguage();

  const [questions, setQuestions] = useState<QuizQ[]>([]);
  const [questionIndices, setQuestionIndices] = useState<number[]>([]);
  const [allSolved, setAllSolved] = useState(false);
  const [ready, setReady] = useState(false); // true after first useEffect

  const [phase, setPhase] = useState<"quiz" | "result">("quiz");
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [copied, setCopied] = useState(false);
  const [leveledUp, setLeveledUp] = useState<number | null>(null);

  // ── Load / reload questions ──────────────────────────────────────────────────
  const loadQuiz = useCallback((currentLang: LangCode) => {
    const result = pickUnsolved(currentLang);
    if (result.allDone) {
      setAllSolved(true);
    } else {
      setQuestions(result.questions);
      setQuestionIndices(result.indices);
      setAllSolved(false);
      setPhase("quiz");
      setCurrent(0);
      setSelected(null);
      setScore(0);
      setAnswers([]);
      setLeveledUp(null);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    loadQuiz(lang as LangCode);
  }, [lang, loadQuiz]);

  // ── Loading skeleton ─────────────────────────────────────────────────────────
  if (!ready) {
    return (
      <main className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
        <div className="text-[#9CA3AF] text-sm">Loading…</div>
      </main>
    );
  }

  // ── All-solved screen ────────────────────────────────────────────────────────
  if (allSolved) {
    const pool = quizPool[lang as LangCode] ?? quizPool.ko;
    return (
      <main className="min-h-screen bg-[#F5F5F0] font-sans flex items-center justify-center">
        <div className="px-4 w-full max-w-sm py-8">
          <div className="rounded-3xl bg-white shadow-md p-8 text-center fade-up">
            <div className="text-7xl mb-4">🎓</div>
            <h2 className="font-display font-bold text-2xl mb-2 text-[#0D0D0D]">
              전부 완료!
            </h2>
            <p className="text-sm text-[#6B7280] mb-2">
              {pool.length}개 문제를 모두 풀었어요.
            </p>
            <p className="text-sm text-[#6B7280] mb-8">
              처음부터 다시 도전해볼까요?
            </p>
            <button
              onClick={() => {
                clearSolved();
                loadQuiz(lang as LangCode);
              }}
              className="w-full rounded-2xl touch-target text-sm font-bold text-white mb-3"
              style={{ background: "#7C3AED" }}
            >
              처음부터 다시
            </button>
            <Link
              href="/"
              className="block w-full rounded-2xl border border-[#E5E5E0] bg-white touch-target flex items-center justify-center text-sm font-medium text-[#6B7280]"
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
    if (correct) setScore((s) => s + 1);
    setAnswers((a) => [...a, correct]);
  };

  const next = () => {
    if (current < sessionTotal - 1) {
      setCurrent((c) => c + 1);
      setSelected(null);
    } else {
      // Mark this session's questions as solved
      saveSolvedIndices(questionIndices);
      const prevLevel = loadStats().level;
      const updated = applyXP(score * XP_PER_Q);
      if (updated.level > prevLevel) setLeveledUp(updated.level);
      setPhase("result");
    }
  };

  const restart = () => {
    loadQuiz(lang as LangCode);
  };

  const handleShare = async () => {
    const emojis = answers.map((a) => (a ? "⭕" : "❌")).join("");
    const text = `${t.stockQuiz} ${score}/${sessionTotal}\n${emojis}\n📈 Rate My Stock`;
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await (
          navigator as Navigator & { share: (d: object) => Promise<void> }
        ).share({ title: t.stockQuiz, text });
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

  // solved count for badge
  const solvedCount = getSolvedSet().size;
  const poolTotal = (quizPool[lang as LangCode] ?? quizPool.ko).length;

  // ── Result ──────────────────────────────────────────────────────────────────
  if (phase === "result") {
    const pct = score / sessionTotal;
    const grade =
      pct >= 0.8
        ? { emoji: "🏆", msg: t.gradePerfectMsg, sub: t.gradePerfectSub, color: "#00D084" }
        : pct >= 0.6
        ? { emoji: "⭐", msg: t.gradeGoodMsg,    sub: t.gradeGoodSub,    color: "#F59E0B" }
        : { emoji: "📚", msg: t.gradeRetryMsg,   sub: t.gradeRetrySub,   color: "#7C3AED" };

    const newSolvedCount = getSolvedSet().size;
    const remaining = poolTotal - newSolvedCount;

    return (
      <main className="min-h-screen bg-[#F5F5F0] font-sans flex items-center justify-center">
        <div className="px-4 w-full max-w-sm py-8">
          <div className="rounded-3xl bg-white shadow-md p-8 text-center fade-up">
            <div className="text-7xl mb-4">{grade.emoji}</div>
            <h2 className="font-display font-bold text-2xl mb-1 text-[#0D0D0D]">{grade.msg}</h2>
            <p className="text-sm text-[#6B7280] mb-6">{grade.sub}</p>

            {/* Score */}
            <div className="rounded-2xl p-5 mb-5" style={{ background: `${grade.color}12` }}>
              <p className="text-4xl font-display font-bold mb-1" style={{ color: grade.color }}>
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
                  style={{ background: a ? "#00D08418" : "#FEE2E2", color: a ? "#00D084" : "#EF4444" }}
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
            <div className="rounded-2xl p-3 mb-4" style={{ background: "#00D08412" }}>
              <p className="text-xs font-semibold mb-0.5" style={{ color: "#00D084" }}>{t.xpEarned}</p>
              <p className="text-2xl font-display font-bold text-[#0D0D0D]">+{score * XP_PER_Q} XP ⚡</p>
            </div>

            {/* Progress badge */}
            <div className="rounded-2xl p-3 mb-5" style={{ background: "#F3F4F6" }}>
              <p className="text-xs text-[#6B7280] mb-0.5">풀이 진행도</p>
              <p className="text-sm font-bold text-[#0D0D0D]">
                {newSolvedCount} / {poolTotal} 문제 완료
                {remaining > 0 && (
                  <span className="text-[#9CA3AF] font-normal ml-1">(남은 문제 {remaining}개)</span>
                )}
              </p>
              <div className="mt-2 h-1.5 rounded-full bg-[#E5E5E0] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${(newSolvedCount / poolTotal) * 100}%`, background: "#00D084" }}
                />
              </div>
            </div>

            <button
              onClick={handleShare}
              className="w-full rounded-2xl touch-target text-sm font-bold text-white mb-3 flex items-center justify-center gap-2"
              style={{ background: "#0D0D0D" }}
            >
              {copied ? t.copied : t.shareResult}
            </button>
            <button
              onClick={restart}
              className="w-full rounded-2xl touch-target text-sm font-bold text-white mb-3"
              style={{ background: "#7C3AED" }}
            >
              {remaining > 0 ? `다음 ${Math.min(TOTAL, remaining)}문제 풀기` : t.retry}
            </button>
            <Link
              href="/"
              className="block w-full rounded-2xl border border-[#E5E5E0] bg-white touch-target flex items-center justify-center text-sm font-medium text-[#6B7280]"
            >
              {t.goHome}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ── Quiz ────────────────────────────────────────────────────────────────────
  const tagEmoji = Array.from(q.tag)[0] ?? "📊";

  const getBtn = (val: boolean) => {
    const isChosen = selected === val;
    const isCorrectAnswer = q.answer === val;
    if (!revealed) {
      return {
        bg: val ? "#DCFCE7" : "#FEE2E2",
        text: val ? "#16A34A" : "#DC2626",
        border: "transparent",
        anim: "",
      };
    }
    if (isCorrectAnswer) {
      return { bg: "#DCFCE7", text: "#16A34A", border: "#00D084", anim: isChosen ? "anim-pop" : "" };
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
        .anim-shake { animation: shake 0.4s ease; }
        .anim-pop { animation: pop 0.35s ease; }
        .anim-feedback { animation: fadeSlideUp 0.3s ease both; }
      `}</style>

      <main className="min-h-screen bg-[#F5F5F0] font-sans flex flex-col items-center">
        {/* ── Top bar ── */}
        <div className="w-full max-w-[420px] px-4 pt-8 pb-4">
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
                style={{ width: `${progress}%`, background: "#00D084" }}
              />
            </div>
            <span className="text-xs font-bold tabular-nums shrink-0" style={{ color: "#00D084" }}>
              {current + 1}/{sessionTotal}
            </span>
          </div>

          {/* Solved progress mini-badge */}
          <div className="flex justify-end mt-2">
            <span className="text-[10px] text-[#9CA3AF] tabular-nums">
              전체 {solvedCount}/{poolTotal} 완료
            </span>
          </div>
        </div>

        {/* ── Center content ── */}
        <div className="flex-1 flex flex-col items-center justify-center w-full px-4 pb-6 gap-4" key={current}>

          {/* White question card */}
          <div
            className="bg-white rounded-3xl shadow-md w-full max-w-[420px] p-6 transition-all duration-300"
            style={{
              border: `2px solid ${revealed ? (isCorrect ? "#00D084" : "#EF4444") : "transparent"}`,
            }}
          >
            <div className="text-[64px] text-center leading-none mb-4">{tagEmoji}</div>

            <div className="flex justify-center mb-5">
              <span
                className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold"
                style={{ background: "#F3F4F6", color: "#6B7280" }}
              >
                {q.tag}
              </span>
            </div>

            <h2 className="text-[22px] font-bold text-center text-[#0D0D0D] leading-snug">
              &ldquo;{q.q}&rdquo;
            </h2>
          </div>

          {/* O/X buttons */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-[420px]">
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
                  className={`rounded-2xl flex items-center justify-center gap-2 font-bold transition-all active:scale-95 hover:brightness-95 ${s.anim}`}
                  style={{
                    background: s.bg,
                    color: s.text,
                    border: `2px solid ${s.border}`,
                    height: "72px",
                  }}
                >
                  <span className="text-2xl">{opt.symbol}</span>
                  <span className="text-base">{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* ── Feedback + Next button ── */}
          {revealed && (
            <div className="w-full max-w-[420px] anim-feedback">
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
                  <p className="text-sm text-[#374151] leading-relaxed">{q.explain}</p>
                </div>
              </div>
              <button
                onClick={next}
                className="w-full rounded-2xl py-4 text-sm font-bold text-white transition-transform active:scale-95"
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
