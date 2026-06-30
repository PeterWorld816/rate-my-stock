"use client";
import { useState } from "react";
import { Result } from "@/app/page";
import { useLanguage, salaryQuestions } from "@/lib/i18n";

export default function SalaryMode({ onResult, onBack, loading, setLoading }: {
  onResult: (r: Result) => void;
  onBack: () => void;
  loading: boolean;
  setLoading: (b: boolean) => void;
}) {
  const { t, lang } = useLanguage();
  const bi = (lang === "ko" ? "ko" : "en") as "ko" | "en";
  const steps = salaryQuestions;

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
      alert(t.somethingWrongAlert);
    } finally {
      setLoading(false);
    }
  };

  const progress = (step / steps.length) * 100;

  return (
    <section className="px-4 sm:px-6 pb-safe max-w-xl mx-auto fade-up">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-[#6B7280] mb-6 touch-target">
        ← {t.back}
      </button>

      <div className="rounded-3xl bg-white p-5 shadow-md">
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-4"
          style={{ background: "#FF6B3518", color: "#FF6B35" }}>
          {t.modeLabelSalary}
        </div>

        <div className="h-1.5 rounded-full bg-[#F3F4F6] mb-6 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: "#FF6B35" }} />
        </div>

        <p className="text-xs font-bold tabular-nums text-[#9CA3AF] mb-2">{step + 1} / {steps.length}</p>
        <h2 className="font-display font-bold text-xl mb-6 leading-snug">
          {steps[step].q[bi]}
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className="touch-target rounded-2xl shimmer" style={{ opacity: 1 - i * 0.12 }} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {steps[step].options.map((opt) => (
              <button key={opt.en} onClick={() => pick(opt[bi])}
                className="w-full text-left rounded-2xl border border-[#E5E5E0] bg-[#F5F5F0] px-4 touch-target text-sm font-medium text-[#374151] hover:border-[#FF6B35] hover:bg-[#FFF7F0] transition-all card-hover flex items-center">
                {opt[bi]}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
