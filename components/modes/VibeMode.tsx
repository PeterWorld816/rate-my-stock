"use client";
import { useState, useEffect } from "react";
import { Result } from "@/app/page";
import { useLanguage, vibeItems } from "@/lib/i18n";

export default function VibeMode({ onResult, onBack, loading, setLoading }: {
  onResult: (r: Result) => void;
  onBack: () => void;
  loading: boolean;
  setLoading: (b: boolean) => void;
}) {
  const { t, lang } = useLanguage();
  const vibes = vibeItems[lang] ?? vibeItems.en ?? [];
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    setSelected(null);
  }, [lang]);

  const submit = async (vibeKey: string) => {
    setSelected(vibeKey);
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "vibe", vibe: vibeKey }),
      });
      const data = await res.json();
      onResult(data);
    } catch {
      setSelected(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="px-4 sm:px-6 pb-safe max-w-xl mx-auto fade-up">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-[#6B7280] mb-6 touch-target">
        ← {t.back}
      </button>

      <div className="rounded-3xl bg-white p-5 shadow-md">
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-4"
          style={{ background: "#F43F8A18", color: "#F43F8A" }}>
          {t.vibeChip}
        </div>

        <h2 className="font-display font-bold text-2xl mb-1">{t.vibeTitle}</h2>
        <p className="text-sm text-[#6B7280] mb-6">{t.vibeSubtitle}</p>

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
                key={v.key}
                onClick={() => submit(v.key)}
                disabled={selected !== null}
                className="rounded-2xl border border-[#E5E5E0] bg-[#F5F5F0] p-4 text-left min-h-[80px] hover:border-[#F43F8A] hover:bg-[#FFF0F6] transition-all card-hover active:scale-95 disabled:opacity-60"
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
