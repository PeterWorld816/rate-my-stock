import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams.get("ticker") || "NVDA";
  const safe = encodeURIComponent(ticker);
  try {
    const interval = req.nextUrl.searchParams.get("interval") || "1d";
  const range = req.nextUrl.searchParams.get("range") || "5d";
  const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${safe}?interval=${interval}&range=${range}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "application/json",
        },
        next: { revalidate: 300 },
      }
    );
    if (!res.ok) throw new Error("yahoo error");
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "fetch_failed" }, { status: 502 });
  }
}
