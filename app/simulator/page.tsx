import type { Metadata } from "next";
import SimulatorClient from "./SimulatorClient";

type RawSP = Record<string, string | string[] | undefined>;

function str(v: string | string[] | undefined, fallback = ""): string {
  if (Array.isArray(v)) return v[0] ?? fallback;
  return v ?? fallback;
}

const fmtUSD = (v: string) => {
  const n = Number(v);
  return Number.isFinite(n) ? `$${Math.round(n).toLocaleString("en-US")}` : v;
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: RawSP;
}): Promise<Metadata> {
  const ticker    = str(searchParams.ticker, "NVDA");
  const emoji     = str(searchParams.emoji, "📈");
  const period    = str(searchParams.period);
  const pct       = str(searchParams.pct);
  const principal = str(searchParams.amount);
  const value     = str(searchParams.value);

  const hasResult = Boolean(period && pct && principal && value);

  if (!hasResult) {
    return {
      title: `${emoji} $${ticker} 주식 시뮬레이터 · Rate My Stock`,
      description: "과거에 이 주식을 샀다면 지금 얼마가 됐을지 계산해보세요. 무료 주식 투자 시뮬레이터.",
    };
  }

  const sign  = Number(pct) >= 0 ? "+" : "";
  const title = `${emoji} $${ticker} ${sign}${pct}% · Rate My Stock 시뮬레이터`;
  const desc  = `${fmtUSD(principal)}를 ${period} 전에 $${ticker}에 넣었으면 지금 ${fmtUSD(value)}! 너라면 얼마 벌었을지 확인해보세요.`;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ratemystock.app";
  const ogUrl   = `${baseUrl}/api/og/sim?${new URLSearchParams({
    stock: ticker,
    emoji,
    returnPct: pct,
    amount: value,
    principal,
    period,
    bankReturn: "5",
  }).toString()}`;

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      type: "website",
      images: [{ url: ogUrl, width: 1200, height: 630, alt: `${ticker} 시뮬레이터 결과` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [ogUrl],
    },
  };
}

export default function SimulatorPage() {
  return <SimulatorClient />;
}
