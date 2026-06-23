"use client";
import { useState } from "react";
import { Result } from "@/app/page";

const questions = [
  {
    q: "You have $1,000 to invest. What do you do?",
    options: ["Put it all in one stock", "Split across 5-10 stocks", "Put it in index funds", "Keep it in cash for now"],
  },
  {
    q: "A stock you own drops 30% overnight. You:",
    options: ["Buy more immediately", "Hold and wait it out", "Sell half to cut losses", "Sell everything"],
  },
  {
    q: "What's your vibe on weekends?",
    options: ["Extreme sports / YOLO", "Outdoor hikes / balance", "Cozy at home / stable", "Reading / learning"],
  },
  {
    q: "You hear about a hot new AI startup IPO. You:",
    options: ["All in day one", "Research for a week then decide", "Wait 6 months to see the trend", "Ignore it"],
  },
  {
    q: "Your investment goal is:",
    options: ["Get rich quick", "Beat the market", "Steady 10% annual growth", "Preserve what I have"],
  },
];

export default function MbtiMode({ onResult, onBack, loading, setLoading }: {
  onResult: (r: Result) => void;
  onBack: () => void;
  loading: boolean;
  setLoading: (b: boolean) => void;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  const pick = async (answer: string) => {
    const newAnswers = [...answers, answer];
    if (step < questions.length - 1) {
      setAnswers(newAnswers);
      setStep(step + 1);
      return;
    }
    // Final answer — submit
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "mbti", answers: newAnswers }),
      });
      const data = await res.json();
      onResult(data);
    } catch {
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const progress = ((step) / questions.length) * 100;

  return (
    <section className="px-6 pb-20 max-w-md mx-auto fade-up">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-[#6B7280] mb-6 hover:text-[#0D0D0D] transition-colors">
        ← Back
      </button>

      <div className="rounded-3xl bg-white border border-[#E5E5E0] p-6 shadow-sm">
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-4"
          style={{ background: "#7C3AED18", color: "#7C3AED" }}>
          🧠 Personality Quiz
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full bg-[#F3F4F6] mb-6 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: "linear-gradient(90deg, #7C3AED, #A855F7)" }} />
        </div>

        <p className="text-xs text-[#9CA3AF] mb-2">Question {step + 1} of {questions.length}</p>
        <h2 className="font-display font-bold text-xl mb-6 leading-snug">
          {questions[step].q}
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[0,1,2,3].map(i => <div key={i} className="h-14 rounded-2xl shimmer" />)}
          </div>
        ) : (
          <div className="space-y-3">
            {questions[step].options.map((opt) => (
              <button key={opt} onClick={() => pick(opt)}
                className="w-full text-left rounded-2xl border border-[#E5E5E0] bg-[#FAFAF8] px-4 py-3.5 text-sm font-medium text-[#374151] hover:border-[#7C3AED] hover:bg-[#F5F3FF] transition-all card-hover">
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
