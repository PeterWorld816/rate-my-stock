"use client";
import { useState } from "react";
import { Result } from "@/app/page";

const steps = [
  {
    key: "salary",
    q: "What's your annual income range?",
    options: ["Under $30K", "$30K–$60K", "$60K–$100K", "$100K–$200K", "$200K+"],
  },
  {
    key: "savings",
    q: "What % of your income do you save?",
    options: ["I don't save", "1–5%", "5–15%", "15–30%", "30%+"],
  },
  {
    key: "spend",
    q: "Biggest monthly expense?",
    options: ["Rent/mortgage", "Food & dining", "Shopping/fashion", "Travel", "Subscriptions & tech"],
  },
  {
    key: "horizon",
    q: "Investment time horizon?",
    options: ["I want gains this month", "1–2 years", "3–5 years", "10+ years", "Retirement"],
  },
];

export default function SalaryMode({ onResult, onBack, loading, setLoading }: {
  onResult: (r: Result) => void;
  onBack: () => void;
  loading: boolean;
  setLoading: (b: boolean) => void;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const pick = async (answer: string) => {
    const newAnswers = { ...answers, [steps[step].key]: answer };
    if (step < steps.length - 1) {
      setAnswers(newAnswers);
      setStep(step + 1);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "salary", answers: newAnswers }),
      });
      const data = await res.json();
      onResult(data);
    } catch {
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const progress = (step / steps.length) * 100;

  return (
    <section className="px-6 pb-20 max-w-md mx-auto fade-up">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-[#6B7280] mb-6 hover:text-[#0D0D0D] transition-colors">
        ← Back
      </button>

      <div className="rounded-3xl bg-white border border-[#E5E5E0] p-6 shadow-sm">
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-4"
          style={{ background: "#FF6B3518", color: "#FF6B35" }}>
          💰 Money Profile
        </div>

        <div className="h-1.5 rounded-full bg-[#F3F4F6] mb-6 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: "linear-gradient(90deg, #FF6B35, #FBBF24)" }} />
        </div>

        <p className="text-xs text-[#9CA3AF] mb-2">Step {step + 1} of {steps.length}</p>
        <h2 className="font-display font-bold text-xl mb-6 leading-snug">
          {steps[step].q}
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[0,1,2,3,4].map(i => <div key={i} className="h-12 rounded-2xl shimmer" />)}
          </div>
        ) : (
          <div className="space-y-3">
            {steps[step].options.map((opt) => (
              <button key={opt} onClick={() => pick(opt)}
                className="w-full text-left rounded-2xl border border-[#E5E5E0] bg-[#FAFAF8] px-4 py-3 text-sm font-medium text-[#374151] hover:border-[#FF6B35] hover:bg-[#FFF7F0] transition-all card-hover">
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
