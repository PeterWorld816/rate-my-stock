"use client";
import { Mode } from "@/app/page";
import { useLanguage } from "@/lib/i18n";

const primaryModes = [
  { id: "face" as Mode, icon: "🤳", title: "Face Read", desc: "AI reads your vibe from your photo", tag: "Most Viral" },
  { id: "mbti" as Mode, icon: "🧠", title: "Stock MBTI", desc: "Your personality → perfect stock match", tag: "Most Accurate" },
];

const secondaryModes = [
  { id: "salary" as Mode, icon: "📝", title: "Personality Quiz", desc: "Financial profile → stock match", tag: "Most Relatable" },
  { id: "couple" as Mode, icon: "🤝", title: "Friend Match", desc: "2 players · portfolio compatibility", tag: "Most Shareable" },
  { id: "celebrity" as Mode, icon: "⭐", title: "Celebrity Match", desc: "Match your style to the legends", tag: "Most Surprising" },
  { id: "career" as Mode, icon: "💼", title: "Career Match", desc: "100 careers · personalized picks", tag: "Most Practical" },
  { id: "vibe" as Mode, icon: "✨", title: "Today's Vibe", desc: "Your mood = your stock energy", tag: "Most Fun" },
];

const allModes = [...primaryModes, ...secondaryModes];

function ModeCard({ m, onSelect }: { m: (typeof allModes)[0]; onSelect: (id: Mode) => void }) {
  const { t } = useLanguage();
  return (
    <button
      onClick={() => onSelect(m.id)}
      className="card-hover text-left rounded-3xl bg-white p-6 shadow-md flex flex-col"
    >
      <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mb-4 bg-[#00D08418] text-[#00D084]">
        {m.tag}
      </span>
      <div className="text-3xl mb-3">{m.icon}</div>
      <h3 className="font-display font-bold text-xl text-[#0D0D0D] mb-1.5">{m.title}</h3>
      <p className="text-sm text-[#6B7280] leading-snug flex-1">{m.desc}</p>
      <div className="mt-5 text-xs font-semibold text-[#00D084]">{t.startQuiz}</div>
    </button>
  );
}

export default function ModeSelector({ onSelect }: { onSelect: (m: Mode) => void }) {
  const { t } = useLanguage();
  return (
    <section className="px-4 sm:px-6 lg:px-8 pb-safe fade-up lg:max-w-[1200px] lg:mx-auto">
      <p className="text-center text-[11px] font-semibold text-[#6B7280] uppercase tracking-[0.2em] mb-8">
        {t.matchHowTitle}
      </p>

      {/* ── Mobile only (<768px): 2 primary large + 5 scroll pills ── */}
      <div className="md:hidden">
        <div className="grid grid-cols-2 gap-4 mb-5">
          {primaryModes.map((m) => (
            <button
              key={m.id}
              onClick={() => onSelect(m.id)}
              className="card-hover text-left rounded-3xl bg-white p-6 shadow-md"
            >
              <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mb-4 bg-[#00D08418] text-[#00D084]">
                {m.tag}
              </span>
              <div className="text-3xl mb-3">{m.icon}</div>
              <h3 className="font-display font-bold text-xl text-[#0D0D0D] mb-1.5">{m.title}</h3>
              <p className="text-sm text-[#6B7280] leading-snug">{m.desc}</p>
              <div className="mt-5 text-xs font-semibold text-[#00D084]">{t.startQuiz}</div>
            </button>
          ))}
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
          {secondaryModes.map((m) => (
            <button
              key={m.id}
              onClick={() => onSelect(m.id)}
              className="card-hover flex-shrink-0 flex items-center gap-2 rounded-full bg-white px-5 py-3 shadow-sm text-sm font-medium text-[#0D0D0D] whitespace-nowrap"
            >
              <span className="text-base">{m.icon}</span>
              {m.title}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tablet (768px–1023px): 2-col grid for all 7 ── */}
      <div className="hidden md:grid md:grid-cols-2 lg:hidden gap-4">
        {allModes.map((m) => (
          <ModeCard key={m.id} m={m} onSelect={onSelect} />
        ))}
      </div>

      {/* ── Desktop (≥1024px): 3-col grid for all 7 ── */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-6">
        {allModes.map((m) => (
          <ModeCard key={m.id} m={m} onSelect={onSelect} />
        ))}
      </div>
    </section>
  );
}
