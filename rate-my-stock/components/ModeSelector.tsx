"use client";
import { Mode } from "@/app/page";

const modes = [
  {
    id: "face" as Mode,
    emoji: "🤳",
    title: "Face Read",
    subtitle: "Upload your photo",
    desc: "AI reads your vibe and matches you to a stock",
    gradient: "from-[#00D084] to-[#00A86B]",
    tag: "Most Viral",
    tagColor: "#00D084",
  },
  {
    id: "mbti" as Mode,
    emoji: "🧠",
    title: "Personality Quiz",
    subtitle: "5 quick questions",
    desc: "Your investor personality → stock match",
    gradient: "from-[#7C3AED] to-[#5B21B6]",
    tag: "Most Accurate",
    tagColor: "#7C3AED",
  },
  {
    id: "vibe" as Mode,
    emoji: "✨",
    title: "Today's Vibe",
    subtitle: "How are you feeling?",
    desc: "Your current mood = your stock energy",
    gradient: "from-[#F43F8A] to-[#BE185D]",
    tag: "Most Fun",
    tagColor: "#F43F8A",
  },
  {
    id: "salary" as Mode,
    emoji: "💰",
    title: "Money Profile",
    subtitle: "Salary & spending habits",
    desc: "Build your portfolio based on your financial life",
    gradient: "from-[#FF6B35] to-[#EA580C]",
    tag: "Most Practical",
    tagColor: "#FF6B35",
  },
];

export default function ModeSelector({ onSelect }: { onSelect: (m: Mode) => void }) {
  return (
    <section className="px-6 pb-20 max-w-2xl mx-auto fade-up">
      <p className="text-center text-sm font-medium text-[#6B7280] mb-6 uppercase tracking-widest">
        Choose Your Mode
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {modes.map((m, i) => (
          <button
            key={m.id}
            onClick={() => onSelect(m.id)}
            className="card-hover relative text-left rounded-3xl bg-white border border-[#E5E5E0] p-6 shadow-sm overflow-hidden group"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {/* Gradient accent top bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${m.gradient}`} />

            {/* Tag */}
            <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mb-3"
              style={{ background: m.tagColor + "18", color: m.tagColor }}>
              {m.tag}
            </span>

            <div className="text-3xl mb-3">{m.emoji}</div>
            <h3 className="font-display font-bold text-lg text-[#0D0D0D] mb-0.5">{m.title}</h3>
            <p className="text-xs text-[#6B7280] mb-2">{m.subtitle}</p>
            <p className="text-sm text-[#374151] leading-snug">{m.desc}</p>

            <div className="mt-4 flex items-center gap-1 text-xs font-semibold"
              style={{ color: m.tagColor }}>
              Start →
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
