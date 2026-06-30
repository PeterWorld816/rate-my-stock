"use client";
import { Mode } from "@/app/page";
import { useLanguage } from "@/lib/i18n";

type ModeEntry = { id: Mode; icon: string; title: string; desc: string; tag: string };

function ModeCard({ m, onSelect }: { m: ModeEntry; onSelect: (id: Mode) => void }) {
  const { t } = useLanguage();
  return (
    <button
      onClick={() => onSelect(m.id)}
      className="card-hover text-left rounded-3xl bg-white p-6 shadow-md flex flex-col"
    >
      <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mb-4 bg-[#00C80518] text-[#00C805]">
        {m.tag}
      </span>
      <div className="text-3xl mb-3">{m.icon}</div>
      <h3 className="font-display font-bold text-xl text-[#0D0D0D] mb-1.5">{m.title}</h3>
      <p className="text-sm text-[#6B7280] leading-snug flex-1">{m.desc}</p>
      <div className="mt-5 text-xs font-semibold text-[#00C805]">{t.startQuiz}</div>
    </button>
  );
}

export default function ModeSelector({ onSelect }: { onSelect: (m: Mode) => void }) {
  const { t } = useLanguage();

  const primaryModes: ModeEntry[] = [
    { id: "face",   icon: "🤳", title: t.modeCardFaceTitle,   desc: t.modeCardFaceDesc,   tag: t.modeCardFaceTag },
    { id: "salary", icon: "📝", title: t.modeCardSalaryTitle, desc: t.modeCardSalaryDesc, tag: t.modeCardSalaryTag },
  ];

  const secondaryModes: ModeEntry[] = [
    { id: "couple", icon: "🤝", title: t.modeCardCoupleTitle, desc: t.modeCardCoupleDesc, tag: t.modeCardCoupleTag },
  ];

  const allModes = [...primaryModes, ...secondaryModes];

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
              <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mb-4 bg-[#00C80518] text-[#00C805]">
                {m.tag}
              </span>
              <div className="text-3xl mb-3">{m.icon}</div>
              <h3 className="font-display font-bold text-xl text-[#0D0D0D] mb-1.5">{m.title}</h3>
              <p className="text-sm text-[#6B7280] leading-snug">{m.desc}</p>
              <div className="mt-5 text-xs font-semibold text-[#00C805]">{t.startQuiz}</div>
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
