"use client";

export default function HeroSection() {
  return (
    <section className="px-6 sm:px-12 lg:px-0 pt-16 sm:pt-20 lg:pt-28 pb-10 sm:pb-14 lg:pb-24 text-center bg-[#F5F5F0]">
      {/* Top pill badge */}
      <div className="inline-flex items-center gap-2 rounded-full bg-[#0D0D0D] px-4 py-1.5 text-xs font-semibold text-white mb-8">
        <span className="h-1.5 w-1.5 rounded-full bg-[#00C805] animate-pulse" />
        Not financial advice 😅
      </div>

      {/* Headline — clamp scales with viewport, larger cap for desktop */}
      <h1
        className="font-display tracking-tight leading-[0.88] mb-4 sm:mb-6"
        style={{ fontWeight: 800, fontSize: "clamp(4rem, 10vw, 11rem)" }}
      >
        Rate My<br />
        <span style={{ color: "var(--green)" }}>Stock.</span>
      </h1>

      {/* One-liner subtext */}
      <p className="text-base sm:text-lg lg:text-xl text-[#6B7280] mb-10">
        Find your stock match in 30 seconds.
      </p>

      {/* Social proof badge */}
      <div className="inline-flex items-center gap-3 rounded-2xl bg-white px-6 py-3.5 shadow-sm">
        <div className="flex -space-x-1.5">
          {["🧑", "👩", "👨"].map((e, i) => (
            <span
              key={i}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F0F0EB] text-sm ring-2 ring-white"
            >
              {e}
            </span>
          ))}
        </div>
        <div className="text-left">
          <p className="text-sm font-semibold text-[#0D0D0D] leading-none mb-0.5">1M+ matches made</p>
          <p className="text-xs text-[#6B7280]">Join the community</p>
        </div>
      </div>
    </section>
  );
}
