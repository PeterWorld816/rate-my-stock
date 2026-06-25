"use client";
import { useState } from "react";
import { Result } from "@/app/page";

const vibes = [
  { emoji: "🔥", label: "On fire", desc: "Crushing it today" },
  { emoji: "😌", label: "Chill", desc: "Balanced & steady" },
  { emoji: "😤", label: "Frustrated", desc: "Need a win" },
  { emoji: "🤩", label: "Hyped", desc: "Ready to take risks" },
  { emoji: "😴", label: "Meh", desc: "Low energy day" },
  { emoji: "🧘", label: "Zen", desc: "Long-term thinking" },
  { emoji: "😰", label: "Anxious", desc: "Scared of losses" },
  { emoji: "💪", label: "Confident", desc: "Trust the process" },
];

export default function VibeMode({ onResult, onBack, loading, setLoading }: {
  onResult: (r: Result) => void;
  onBack: () => void;
  loading: boolean;
  setLoading: (b: boolean) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const submit = async (vibe: string) => {
    setSelected(vibe);
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "vibe", vibe }),
      });
      const data = await res.json();
      onResult(data);
    } catch {
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="px-4 sm:px-6 pb-safe max-w-xl mx-auto fade-up">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-[#6B7280] mb-6 touch-target">
        ← Back
      </button>

      <div className="rounded-3xl bg-white p-5 shadow-md">
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-4"
          style={{ background: "#F43F8A18", color: "#F43F8A" }}>
          ✨ Today&apos;s Vibe
        </div>

        <h2 className="font-display font-bold text-2xl mb-1">How are you feeling?</h2>
        <p className="text-sm text-[#6B7280] mb-6">Your vibe energy = your stock energy today.</p>

        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
              <div key={i} className="h-[80px] rounded-2xl shimmer" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {vibes.map((v) => (
              <button
                key={v.label}
                onClick={() => submit(v.label)}
                className="rounded-2xl border border-[#E5E5E0] bg-[#F5F5F0] p-4 text-left min-h-[80px] hover:border-[#F43F8A] hover:bg-[#FFF0F6] transition-all card-hover active:scale-95"
              >
                <div className="text-2xl mb-1">{v.emoji}</div>
                <p className="text-sm font-semibold text-[#0D0D0D]">{v.label}</p>
                <p className="text-xs text-[#9CA3AF]">{v.desc}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
