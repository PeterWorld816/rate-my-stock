"use client";
import { useState, useEffect } from "react";
import { Result } from "@/app/page";
import { useLanguage, careerLocale } from "@/lib/i18n";

interface CareerEntry {
  emoji: string;
  title: string;
  tickers: [string, string, string];
}

interface CategoryData {
  id: string;
  emoji: string;
  name: string;
  color: string;
  bg: string;
  careers: CareerEntry[];
}

const CATEGORIES: CategoryData[] = [
  {
    id: "tech",
    emoji: "💻",
    name: "기술/IT",
    color: "#6366F1",
    bg: "#6366F118",
    careers: [
      { emoji: "👨‍💻", title: "소프트웨어 개발자", tickers: ["MSFT", "NVDA", "GOOG"] },
      { emoji: "🤖", title: "AI/ML 엔지니어", tickers: ["NVDA", "MSFT", "AMD"] },
      { emoji: "🔐", title: "사이버보안 전문가", tickers: ["CRWD", "MSFT", "AMZN"] },
      { emoji: "☁️", title: "클라우드 엔지니어", tickers: ["AMZN", "MSFT", "GOOG"] },
      { emoji: "📊", title: "데이터 사이언티스트", tickers: ["SNOW", "MSFT", "PLTR"] },
      { emoji: "📱", title: "모바일 앱 개발자", tickers: ["AAPL", "GOOG", "META"] },
      { emoji: "🎮", title: "게임 개발자", tickers: ["MSFT", "RBLX", "NVDA"] },
      { emoji: "🌐", title: "웹 개발자", tickers: ["META", "SHOP", "AMZN"] },
      { emoji: "💡", title: "IT 컨설턴트", tickers: ["MSFT", "CRM", "IBM"] },
      { emoji: "🖥️", title: "DevOps 엔지니어", tickers: ["AMZN", "MSFT", "SNOW"] },
    ],
  },
  {
    id: "healthcare",
    emoji: "🏥",
    name: "의료/헬스케어",
    color: "#10B981",
    bg: "#10B98118",
    careers: [
      { emoji: "👨‍⚕️", title: "의사", tickers: ["UNH", "JNJ", "MDT"] },
      { emoji: "💊", title: "약사", tickers: ["JNJ", "PFE", "ABBV"] },
      { emoji: "🏥", title: "간호사", tickers: ["UNH", "HUM", "CVS"] },
      { emoji: "🦷", title: "치과의사", tickers: ["JNJ", "ABBV", "MDT"] },
      { emoji: "🧠", title: "정신과 의사", tickers: ["ABBV", "LLY", "JNJ"] },
      { emoji: "🔬", title: "의학 연구원", tickers: ["LLY", "MRNA", "VRTX"] },
      { emoji: "🏃", title: "물리치료사", tickers: ["UNH", "MDT", "SYK"] },
      { emoji: "🧬", title: "유전공학자", tickers: ["MRNA", "CRSP", "VRTX"] },
      { emoji: "🩺", title: "외과의사", tickers: ["ISRG", "MDT", "SYK"] },
      { emoji: "🌿", title: "한의사/대체의학", tickers: ["UNH", "JNJ", "ABBV"] },
    ],
  },
  {
    id: "finance",
    emoji: "💰",
    name: "금융/투자",
    color: "#F59E0B",
    bg: "#F59E0B18",
    careers: [
      { emoji: "📈", title: "주식 트레이더", tickers: ["JPM", "GS", "SCHW"] },
      { emoji: "🏦", title: "투자 은행가", tickers: ["GS", "MS", "JPM"] },
      { emoji: "💼", title: "자산 관리사", tickers: ["BLK", "V", "BRK.B"] },
      { emoji: "📊", title: "퀀트 애널리스트", tickers: ["MSFT", "GS", "NVDA"] },
      { emoji: "🏢", title: "부동산 투자자", tickers: ["AMT", "PLD", "O"] },
      { emoji: "💳", title: "핀테크 전문가", tickers: ["SQ", "PYPL", "V"] },
      { emoji: "📋", title: "보험 계리사", tickers: ["BRK.B", "MET", "PRU"] },
      { emoji: "🔢", title: "금융 분석가", tickers: ["JPM", "V", "BRK.B"] },
      { emoji: "💹", title: "헤지펀드 매니저", tickers: ["GS", "MS", "BLK"] },
      { emoji: "🏛️", title: "이코노미스트", tickers: ["BRK.B", "GLD", "TLT"] },
    ],
  },
  {
    id: "education",
    emoji: "🎓",
    name: "교육/연구",
    color: "#8B5CF6",
    bg: "#8B5CF618",
    careers: [
      { emoji: "👨‍🏫", title: "교사/강사", tickers: ["GOOG", "MSFT", "DUOL"] },
      { emoji: "🔭", title: "물리학자", tickers: ["NVDA", "MSFT", "GOOG"] },
      { emoji: "🧪", title: "화학자", tickers: ["LIN", "APD", "DD"] },
      { emoji: "📚", title: "연구원", tickers: ["GOOG", "MSFT", "IBM"] },
      { emoji: "📝", title: "언론인/작가", tickers: ["GOOG", "META", "NFLX"] },
      { emoji: "🧮", title: "수학자/통계학자", tickers: ["NVDA", "MSFT", "GOOG"] },
      { emoji: "🌍", title: "사회과학자", tickers: ["META", "GOOG", "DUOL"] },
      { emoji: "📡", title: "우주과학자", tickers: ["RKLB", "BA", "NVDA"] },
      { emoji: "🦋", title: "생물학자", tickers: ["MRNA", "VRTX", "GILD"] },
      { emoji: "🏫", title: "교육 행정가", tickers: ["GOOG", "MSFT", "DUOL"] },
    ],
  },
  {
    id: "creative",
    emoji: "🎨",
    name: "창작/예술",
    color: "#EC4899",
    bg: "#EC489918",
    careers: [
      { emoji: "🎨", title: "그래픽 디자이너", tickers: ["AAPL", "ADBE", "MSFT"] },
      { emoji: "📸", title: "사진작가", tickers: ["AAPL", "SNAP", "META"] },
      { emoji: "🎬", title: "영상 제작자", tickers: ["DIS", "NFLX", "META"] },
      { emoji: "🎵", title: "음악가", tickers: ["SPOT", "AAPL", "META"] },
      { emoji: "✍️", title: "작가/소설가", tickers: ["AMZN", "META", "NFLX"] },
      { emoji: "🎭", title: "배우/엔터테이너", tickers: ["DIS", "NFLX", "META"] },
      { emoji: "🏗️", title: "건축가", tickers: ["CAT", "HD", "HON"] },
      { emoji: "🖥️", title: "UX/UI 디자이너", tickers: ["AAPL", "ADBE", "META"] },
      { emoji: "🖌️", title: "일러스트레이터", tickers: ["AAPL", "ADBE", "MSFT"] },
      { emoji: "📹", title: "크리에이터/유튜버", tickers: ["META", "GOOG", "SPOT"] },
    ],
  },
  {
    id: "engineering",
    emoji: "🔧",
    name: "엔지니어링",
    color: "#0EA5E9",
    bg: "#0EA5E918",
    careers: [
      { emoji: "🏗️", title: "토목 엔지니어", tickers: ["CAT", "DE", "VMC"] },
      { emoji: "⚡", title: "전기 엔지니어", tickers: ["GE", "ETN", "HON"] },
      { emoji: "🔧", title: "기계 엔지니어", tickers: ["CAT", "HON", "EMR"] },
      { emoji: "🛢️", title: "화학 엔지니어", tickers: ["LIN", "APD", "DOW"] },
      { emoji: "🚀", title: "항공우주 엔지니어", tickers: ["BA", "LMT", "RTX"] },
      { emoji: "🌱", title: "환경 엔지니어", tickers: ["NEE", "ENPH", "FSLR"] },
      { emoji: "🏭", title: "산업 엔지니어", tickers: ["HON", "GE", "MMM"] },
      { emoji: "🚗", title: "자동차 엔지니어", tickers: ["TSLA", "GM", "F"] },
      { emoji: "🤖", title: "로보틱스 엔지니어", tickers: ["ISRG", "NVDA", "HON"] },
      { emoji: "💧", title: "수자원 엔지니어", tickers: ["XYL", "AWK", "NEE"] },
    ],
  },
  {
    id: "business",
    emoji: "🛍️",
    name: "비즈니스/마케팅",
    color: "#F97316",
    bg: "#F9731618",
    careers: [
      { emoji: "📢", title: "마케터/광고 전문가", tickers: ["META", "GOOG", "TTD"] },
      { emoji: "🛍️", title: "영업 관리자", tickers: ["AMZN", "SHOP", "CRM"] },
      { emoji: "👔", title: "CEO/창업자", tickers: ["TSLA", "AMZN", "SHOP"] },
      { emoji: "📱", title: "소셜 미디어 매니저", tickers: ["META", "SNAP", "PINS"] },
      { emoji: "🎯", title: "브랜드 매니저", tickers: ["NKE", "SBUX", "MCD"] },
      { emoji: "📦", title: "공급망 관리자", tickers: ["AMZN", "UPS", "FDX"] },
      { emoji: "🤝", title: "비즈니스 개발 매니저", tickers: ["MSFT", "AMZN", "CRM"] },
      { emoji: "🌐", title: "글로벌 무역 전문가", tickers: ["AMZN", "UPS", "WMT"] },
      { emoji: "📊", title: "경영 컨설턴트", tickers: ["MSFT", "IBM", "CRM"] },
      { emoji: "🏪", title: "이커머스 전문가", tickers: ["AMZN", "SHOP", "ETSY"] },
    ],
  },
  {
    id: "law",
    emoji: "⚖️",
    name: "법률/공공",
    color: "#64748B",
    bg: "#64748B18",
    careers: [
      { emoji: "⚖️", title: "변호사", tickers: ["BRK.B", "JPM", "V"] },
      { emoji: "👨‍✈️", title: "판사", tickers: ["BRK.B", "JNJ", "KO"] },
      { emoji: "🏛️", title: "공무원", tickers: ["LMT", "GD", "RTX"] },
      { emoji: "🌐", title: "외교관", tickers: ["JPM", "BRK.B", "KO"] },
      { emoji: "👮", title: "경찰관", tickers: ["AXON", "LMT", "GD"] },
      { emoji: "🚒", title: "소방관/응급대원", tickers: ["JNJ", "MDT", "AXON"] },
      { emoji: "🏥", title: "사회복지사", tickers: ["UNH", "JNJ", "CVS"] },
      { emoji: "📜", title: "법무사/공증인", tickers: ["BRK.B", "JPM", "V"] },
      { emoji: "🔍", title: "검사/수사관", tickers: ["AXON", "CRWD", "LMT"] },
      { emoji: "🌱", title: "NGO/비영리 활동가", tickers: ["GOOG", "NEE", "MSFT"] },
    ],
  },
  {
    id: "service",
    emoji: "🍽️",
    name: "서비스/요식업",
    color: "#DC2626",
    bg: "#DC262618",
    careers: [
      { emoji: "👨‍🍳", title: "셰프/요리사", tickers: ["MCD", "SBUX", "CMG"] },
      { emoji: "🍕", title: "레스토랑 오너", tickers: ["MCD", "DRI", "CMG"] },
      { emoji: "☕", title: "카페 운영자", tickers: ["SBUX", "MCD", "KO"] },
      { emoji: "✈️", title: "항공 승무원", tickers: ["DAL", "UAL", "RCL"] },
      { emoji: "🏨", title: "호텔 매니저", tickers: ["MAR", "HLT", "ABNB"] },
      { emoji: "💆", title: "미용사/뷰티 전문가", tickers: ["EL", "ULTA", "NKE"] },
      { emoji: "🎯", title: "이벤트 플래너", tickers: ["RCL", "MAR", "ABNB"] },
      { emoji: "🚢", title: "크루즈/관광업", tickers: ["RCL", "CCL", "ABNB"] },
      { emoji: "🍷", title: "소믈리에/F&B 컨설턴트", tickers: ["MCD", "SBUX", "DRI"] },
      { emoji: "🧖", title: "스파/웰니스 전문가", tickers: ["LULU", "NKE", "EL"] },
    ],
  },
  {
    id: "energy",
    emoji: "🌾",
    name: "농업/에너지",
    color: "#16A34A",
    bg: "#16A34A18",
    careers: [
      { emoji: "🌾", title: "농부/농업인", tickers: ["DE", "ADM", "MOS"] },
      { emoji: "🌳", title: "산림/환경관리", tickers: ["NEE", "ENPH", "XYL"] },
      { emoji: "⚡", title: "전력/에너지 엔지니어", tickers: ["NEE", "XOM", "CVX"] },
      { emoji: "☀️", title: "태양광 전문가", tickers: ["ENPH", "FSLR", "NEE"] },
      { emoji: "🌊", title: "해양/수산업", tickers: ["XOM", "CVX", "XYL"] },
      { emoji: "🐄", title: "축산/낙농업", tickers: ["TSN", "HRL", "ADM"] },
      { emoji: "🔋", title: "배터리/EV 기술자", tickers: ["TSLA", "ALB", "NVDA"] },
      { emoji: "🌿", title: "유기농/푸드테크", tickers: ["DE", "ADM", "AMZN"] },
      { emoji: "🛢️", title: "석유/가스 기술자", tickers: ["XOM", "CVX", "SLB"] },
      { emoji: "💨", title: "신재생에너지 전문가", tickers: ["NEE", "ENPH", "FSLR"] },
    ],
  },
];

const THEME_COLOR = "#0D9488";
const THEME_GRADIENT = "linear-gradient(135deg, #0D9488, #0F766E)";
const THEME_BG = "#0D948818";

type Step = "category" | "career" | "experience" | "goal";

export default function CareerMode({
  onResult,
  onBack,
  loading,
  setLoading,
}: {
  onResult: (r: Result) => void;
  onBack: () => void;
  loading: boolean;
  setLoading: (b: boolean) => void;
}) {
  const { t, lang } = useLanguage();
  const catLocale = careerLocale[lang] ?? careerLocale.en!;

  const localizedCats: CategoryData[] = CATEGORIES.map((cat, ci) => {
    const loc = catLocale.categories[ci];
    return {
      ...cat,
      name: loc?.name ?? cat.name,
      careers: cat.careers.map((career, ji) => ({
        ...career,
        title: loc?.careers[ji]?.title ?? career.title,
      })),
    };
  });

  const expOptions = catLocale.expOptions;
  const goalOptions = catLocale.goalOptions;

  const [step, setStep] = useState<Step>("category");
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<CareerEntry | null>(null);
  const [selectedExperience, setSelectedExperience] = useState<string | null>(null);
  const [revealing, setRevealing] = useState(false);

  useEffect(() => {
    setStep("category");
    setSelectedCategory(null);
    setSelectedCareer(null);
    setSelectedExperience(null);
    setRevealing(false);
  }, [lang]);

  const handleCategorySelect = (cat: CategoryData) => {
    setSelectedCategory(cat);
    setStep("career");
  };

  const handleCareerSelect = (career: CareerEntry) => {
    setSelectedCareer(career);
    setStep("experience");
  };

  const handleExperienceSelect = (expId: string) => {
    setSelectedExperience(expId);
    setStep("goal");
  };

  const handleGoalSelect = async (goalId: string) => {
    if (!selectedCareer || !selectedCategory || !selectedExperience) return;

    setRevealing(true);
    setLoading(true);

    const experienceLabels: Record<string, string> = {
      beginner: "just starting out with no prior investment experience",
      some: "has 1-3 years of basic investment experience",
      experienced: "has 3-7 years of solid investment experience",
      expert: "is a seasoned investor with 7+ years of experience",
    };
    const goalLabels: Record<string, string> = {
      retirement: "long-term retirement (10+ year horizon, wants steady compounding)",
      shortterm: "short-term gains (1-2 years, wants fast returns)",
      passive: "passive income (wants dividends and cash flow)",
      growth: "aggressive growth (willing to take high risk for big returns)",
    };

    const prompt = `Stock recommendation for a ${selectedCareer.title} in the ${selectedCategory.name} field.

Career: ${selectedCareer.emoji} ${selectedCareer.title} (${selectedCategory.name} industry)
Investment experience: This person ${experienceLabels[selectedExperience]}.
Main investment goal: ${goalLabels[goalId]}

Industry-relevant stocks they'd understand best: ${selectedCareer.tickers.join(", ")}

Recommend the best matching stock for this ${selectedCareer.title}. Prioritize stocks they have insider knowledge of (${selectedCareer.tickers.join(", ")}), but you can pick any stock from the universe if it truly fits better.

Important: Make the reason witty and career-specific — reference their profession, what insider knowledge they have about the industry, and tie it directly to the stock's personality. Factor in their experience level and goal. Make them feel like a smart insider for picking this stock.`;

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "career",
          career: selectedCareer.title,
          careerEmoji: selectedCareer.emoji,
          careerCategory: selectedCategory.name,
          experience: selectedExperience,
          goal: goalId,
          careerPrompt: prompt,
        }),
      });
      const data = await res.json();
      onResult({
        ticker: typeof data.ticker === "string" ? data.ticker : selectedCareer.tickers[0],
        name: typeof data.name === "string" ? data.name : selectedCareer.tickers[0],
        score: typeof data.score === "number" ? data.score : 82,
        reason: typeof data.reason === "string" ? data.reason : `As a ${selectedCareer.title}, you have insider knowledge that makes this the perfect pick.`,
        risk: (["LOW", "MID", "HIGH"].includes(data.risk) ? data.risk : "MID") as "LOW" | "MID" | "HIGH",
        emoji: typeof data.emoji === "string" ? data.emoji : selectedCareer.emoji,
        extras: Array.isArray(data.extras) && data.extras.length > 0 ? data.extras : [
          { ticker: selectedCareer.tickers[1], name: selectedCareer.tickers[1], emoji: "📈" },
          { ticker: selectedCareer.tickers[2], name: selectedCareer.tickers[2], emoji: "💼" },
        ],
      });
    } catch {
      onResult({
        ticker: selectedCareer.tickers[0],
        name: selectedCareer.tickers[0],
        score: 82,
        reason: `As a ${selectedCareer.title}, you have insider knowledge that makes this stock your natural match.`,
        risk: "MID",
        emoji: selectedCareer.emoji,
        extras: [
          { ticker: selectedCareer.tickers[1], name: selectedCareer.tickers[1], emoji: "📈" },
          { ticker: selectedCareer.tickers[2], name: selectedCareer.tickers[2], emoji: "💼" },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  // Loading reveal screen
  if (revealing && loading && selectedCareer && selectedCategory) {
    return (
      <section className="px-4 sm:px-6 pb-safe max-w-xl mx-auto fade-up">
        <div className="rounded-3xl bg-white p-8 shadow-md text-center">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-6"
            style={{ background: THEME_BG, color: THEME_COLOR }}>
            {t.careerLoadingChip}
          </div>
          <div className="text-6xl mb-4">{selectedCareer.emoji}</div>
          <p className="text-xl font-bold mb-1" style={{ color: THEME_COLOR }}>{selectedCareer.title}</p>
          <p className="text-sm text-[#6B7280] mb-8">
            {selectedCategory.emoji} {selectedCategory.name} · {t.careerLoadingSubtitle}
          </p>
          <div className="space-y-2.5">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="h-3 rounded-full shimmer" style={{ opacity: 1 - i * 0.15 }} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // STEP: Category selection
  if (step === "category") {
    return (
      <section className="px-4 sm:px-6 pb-safe max-w-4xl mx-auto fade-up">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-[#6B7280] mb-6 hover:text-[#0D0D0D] transition-colors">
          ← {t.back}
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-3"
            style={{ background: THEME_BG, color: THEME_COLOR }}>
            {t.careerChip}
          </div>
          <h2 className="font-display font-bold text-2xl text-[#0D0D0D] mb-1">{t.careerCategoryTitle}</h2>
          <p className="text-sm text-[#6B7280]">{t.careerCategorySubtitle}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {localizedCats.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat)}
              className="card-hover relative text-left rounded-2xl bg-white p-4 shadow-md overflow-hidden group"
            >
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                style={{ background: cat.color }} />
              <div className="text-3xl mb-2">{cat.emoji}</div>
              <p className="font-bold text-sm text-[#0D0D0D] mb-0.5">{cat.name}</p>
              <p className="text-[10px]" style={{ color: cat.color }}>{cat.careers.length}{t.careerCountSuffix}</p>
            </button>
          ))}
        </div>
      </section>
    );
  }

  // STEP: Career selection
  if (step === "career" && selectedCategory) {
    return (
      <section className="px-4 sm:px-6 pb-safe max-w-xl mx-auto fade-up">
        <button
          onClick={() => { setStep("category"); setSelectedCategory(null); }}
          className="flex items-center gap-2 text-sm text-[#6B7280] mb-6 hover:text-[#0D0D0D] transition-colors touch-target"
        >
          ← {t.back}
        </button>

        <div className="rounded-3xl bg-white p-5 shadow-md">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
              style={{ background: selectedCategory.bg }}>
              {selectedCategory.emoji}
            </div>
            <div>
              <div className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{ background: selectedCategory.bg, color: selectedCategory.color }}>
                {t.careerChip}
              </div>
              <p className="font-bold text-[#0D0D0D]">{selectedCategory.name}</p>
            </div>
          </div>

          <p className="text-sm font-semibold text-[#374151] mb-3">{t.careerPickLabel}</p>

          <div className="space-y-2">
            {selectedCategory.careers.map((career) => (
              <button
                key={career.title}
                onClick={() => handleCareerSelect(career)}
                className="w-full text-left rounded-2xl border border-[#E5E5E0] bg-[#F5F5F0] px-4 touch-target text-sm font-medium text-[#374151] transition-all flex items-center gap-3 group"
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = selectedCategory.color;
                  (e.currentTarget as HTMLButtonElement).style.background = selectedCategory.bg;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#E5E5E0";
                  (e.currentTarget as HTMLButtonElement).style.background = "#FAFAF8";
                }}
              >
                <span className="text-xl shrink-0">{career.emoji}</span>
                <span className="flex-1">{career.title}</span>
                <span className="text-xs text-[#9CA3AF] shrink-0">{career.tickers.join(" · ")}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // STEP: Experience question
  if (step === "experience" && selectedCareer) {
    return (
      <section className="px-4 sm:px-6 pb-safe max-w-xl mx-auto fade-up">
        <button
          onClick={() => setStep("career")}
          className="flex items-center gap-2 text-sm text-[#6B7280] mb-6 hover:text-[#0D0D0D] transition-colors touch-target"
        >
          ← {t.back}
        </button>

        <div className="rounded-3xl bg-white p-5 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: THEME_BG, color: THEME_COLOR }}>
              {selectedCareer.emoji} {selectedCareer.title}
            </div>
            <span className="text-xs font-bold tabular-nums" style={{ color: THEME_COLOR }}>1 / 2</span>
          </div>

          <div className="h-1.5 rounded-full bg-[#F3F4F6] mb-6 overflow-hidden">
            <div className="h-full w-1/2 rounded-full transition-all duration-500"
              style={{ background: THEME_COLOR }} />
          </div>

          <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: THEME_COLOR }}>
            {t.careerExpLabel}
          </p>
          <h2 className="font-display font-bold text-xl mb-6 leading-snug text-[#0D0D0D]">
            {t.careerExpTitle}
          </h2>

          <div className="space-y-3">
            {expOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleExperienceSelect(opt.id)}
                className="w-full text-left rounded-2xl border border-[#E5E5E0] bg-[#F5F5F0] px-4 touch-target text-sm font-medium text-[#374151] hover:border-[#0D9488] hover:bg-[#F0FDF9] transition-all card-hover flex items-center gap-3"
              >
                <span className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: THEME_BG, color: THEME_COLOR }}>
                  {opt.label.split(" ")[0]}
                </span>
                <div>
                  <p className="font-semibold">{opt.label.split(" ").slice(1).join(" ")}</p>
                  <p className="text-xs text-[#9CA3AF]">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // STEP: Goal question
  if (step === "goal" && selectedCareer && selectedExperience) {
    return (
      <section className="px-4 sm:px-6 pb-safe max-w-xl mx-auto fade-up">
        <button
          onClick={() => setStep("experience")}
          className="flex items-center gap-2 text-sm text-[#6B7280] mb-6 hover:text-[#0D0D0D] transition-colors touch-target"
        >
          ← {t.back}
        </button>

        <div className="rounded-3xl bg-white p-5 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: THEME_BG, color: THEME_COLOR }}>
              {selectedCareer.emoji} {selectedCareer.title}
            </div>
            <span className="text-xs font-bold tabular-nums" style={{ color: THEME_COLOR }}>2 / 2</span>
          </div>

          <div className="h-1.5 rounded-full bg-[#F3F4F6] mb-6 overflow-hidden">
            <div className="h-full w-full rounded-full transition-all duration-500"
              style={{ background: THEME_COLOR }} />
          </div>

          <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: THEME_COLOR }}>
            {t.careerGoalLabel}
          </p>
          <h2 className="font-display font-bold text-xl mb-6 leading-snug text-[#0D0D0D]">
            {t.careerGoalTitle}
          </h2>

          <div className="space-y-3">
            {goalOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleGoalSelect(opt.id)}
                disabled={loading}
                className="w-full text-left rounded-2xl border border-[#E5E5E0] bg-[#F5F5F0] px-4 touch-target text-sm font-medium text-[#374151] hover:border-[#0D9488] hover:bg-[#F0FDF9] transition-all card-hover flex items-center gap-3 disabled:opacity-50"
              >
                <span className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: THEME_BG, color: THEME_COLOR }}>
                  {opt.label.split(" ")[0]}
                </span>
                <div>
                  <p className="font-semibold">{opt.label.split(" ").slice(1).join(" ")}</p>
                  <p className="text-xs text-[#9CA3AF]">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return null;
}
