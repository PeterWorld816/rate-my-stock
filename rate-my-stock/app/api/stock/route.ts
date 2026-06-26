import { NextRequest, NextResponse } from "next/server";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";

async function getCrumb(): Promise<{ cookie: string; crumb: string } | null> {
  try {
    const r1 = await fetch("https://fc.yahoo.com", {
      headers: { "User-Agent": UA },
      redirect: "follow",
    });
    const rawCookie = r1.headers.get("set-cookie") ?? "";
    const cookie = rawCookie.split(";")[0].trim();
    if (!cookie) return null;

    const r2 = await fetch(
      "https://query1.finance.yahoo.com/v1/test/getcrumb",
      { headers: { "User-Agent": UA, Cookie: cookie } }
    );
    if (!r2.ok) return null;
    const crumb = (await r2.text()).trim();
    if (!crumb || crumb.length > 30 || crumb.includes("<")) return null;

    return { cookie, crumb };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const ticker   = req.nextUrl.searchParams.get("ticker")   || "NVDA";
  const interval = req.nextUrl.searchParams.get("interval") || "1d";
  const range    = req.nextUrl.searchParams.get("range")    || "5d";
  const safe     = encodeURIComponent(ticker);

  try {
    const creds = await getCrumb();
    const crumbParam = creds ? `&crumb=${encodeURIComponent(creds.crumb)}` : "";
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${safe}?interval=${interval}&range=${range}${crumbParam}`;

    const headers: Record<string, string> = {
      "User-Agent": UA,
      Accept: "application/json",
      "Accept-Language": "en-US,en;q=0.9",
      Referer: "https://finance.yahoo.com/",
    };
    if (creds?.cookie) headers.Cookie = creds.cookie;

    const res = await fetch(url, { headers });

    if (!res.ok) {
      const res2 = await fetch(
        `https://query2.finance.yahoo.com/v8/finance/chart/${safe}?interval=${interval}&range=${range}`,
        { headers }
      );
      if (!res2.ok) throw new Error(`${res.status}`);
      const json2 = await res2.json();
      const m  = json2?.chart?.result?.[0]?.meta;
      const cl = extractCloses(json2);
      if (!m) throw new Error("no meta");
      return buildResponse(m, cl, ticker);
    }

    const json = await res.json();
    const meta = json?.chart?.result?.[0]?.meta;
    const closes = extractCloses(json);
    if (!meta) throw new Error("no meta");

    return buildResponse(meta, closes, ticker);
  } catch {
    return NextResponse.json({ error: "fetch_failed" }, { status: 502 });
  }
}

function extractCloses(json: unknown): number[] {
  const raw: (number | null)[] =
    (json as { chart?: { result?: { indicators?: { quote?: { close?: (number | null)[] }[] } }[] } })
      ?.chart?.result?.[0]?.indicators?.quote?.[0]?.close ?? [];
  return raw.filter((c): c is number => c != null && !isNaN(c) && c > 0);
}

function buildResponse(
  meta: Record<string, unknown>,
  closes: number[],
  ticker: string
) {
  return NextResponse.json({
    price: (meta.regularMarketPrice as number) ?? 0,
    prevClose:
      (meta.chartPreviousClose as number) ??
      (meta.regularMarketPreviousClose as number) ??
      (meta.previousClose as number) ??
      0,
    high52:   (meta.fiftyTwoWeekHigh as number) ?? 0,
    low52:    (meta.fiftyTwoWeekLow  as number) ?? 0,
    currency: (meta.currency  as string) ?? "USD",
    longName: (meta.longName  as string) ?? (meta.shortName as string) ?? ticker,
    closes,
    buyPrice: closes[0] ?? 0,
  });
}
