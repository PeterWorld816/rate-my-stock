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
    tag: "Most Relatable",
    tagColor: "#FF6B35",
  },
  {
    id: "couple" as Mode,
    emoji: "🤝",
    title: "Friend Match",
    subtitle: "2 players · 5 questions each",
    desc: "친구와 포트폴리오 궁합 보기",
    gradient: "from-[#A855F7] to-[#EC4899]",
    tag: "Most Shareable",
    tagColor: "#A855F7",
  },
  {
    id: "celebrity" as Mode,
    emoji: "⭐",
    title: "Celebrity Match",
    subtitle: "Elon · Buffett · Cathie · Cramer",
    desc: "유명 투자자 스타일 매칭",
    gradient: "from-[#F59E0B] to-[#EA580C]",
    tag: "Most Surprising",
    tagColor: "#F59E0B",
  },
  {
    id: "career" as Mode,
    emoji: "💼",
    title: "Career Match",
    subtitle: "100가지 직업 · 맞춤 추천",
    desc: "직업별 맞춤 주식 추천",
    gradient: "from-[#0EA5E9] to-[#0D9488]",
    tag: "Most Practical",
    tagColor: "#0EA5E9",
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
