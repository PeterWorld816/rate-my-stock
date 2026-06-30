import type { Metadata } from "next";
import ResultClient from "./ResultClient";

type RawSP = Record<string, string | string[] | undefined>;

function str(v: string | string[] | undefined, fallback = ""): string {
  if (Array.isArray(v)) return v[0] ?? fallback;
  return v ?? fallback;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: RawSP;
}): Promise<Metadata> {
  const t = str(searchParams.t, "STOCK");
  const n = str(searchParams.n);
  const s = str(searchParams.s, "0");
  const r = str(searchParams.r, "MID");
  const e = str(searchParams.e, "📈");
  const m = str(searchParams.m);

  const title = `${e} $${t} 타입 · Rate My Stock`;
  const desc  = `AI가 분석한 나의 주식 타입은 $${t}!${n ? ` (${n})` : ""} 점수 ${s}/100 · Rate My Stock에서 당신의 주식 타입을 찾아보세요.`;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ratemystock.app";
  const ogUrl   = `${baseUrl}/api/og?${new URLSearchParams({ t, n, s, r, e, m }).toString()}`;

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      type: "website",
      images: [{ url: ogUrl, width: 1200, height: 630, alt: `${t} 주식 타입 결과` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [ogUrl],
    },
  };
}

export default function ResultPage() {
  return <ResultClient />;
}
