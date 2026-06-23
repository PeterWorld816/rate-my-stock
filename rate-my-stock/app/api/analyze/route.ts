import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are StockGPT, a witty AI that matches people to stocks based on their personality, face, vibe, or financial habits.

Your job is to analyze the user's input and return a stock recommendation as a JSON object. Be fun, insightful, and slightly roast the person in a friendly way.

ALWAYS return valid JSON only, no markdown, no extra text. Use this exact format:
{
  "ticker": "NVDA",
  "name": "NVIDIA Corporation",
  "score": 87,
  "reason": "You radiate main character energy. Just like NVDA — everyone's talking about you, the growth is insane, and people either love you or are jealous. You're the moment.",
  "risk": "HIGH",
  "emoji": "🚀",
  "extras": [
    { "ticker": "TSLA", "name": "Tesla Inc.", "emoji": "⚡" },
    { "ticker": "AMZN", "name": "Amazon.com Inc.", "emoji": "📦" }
  ]
}

Rules:
- score: 60-99 (how well they match, always feel flattering)
- risk: "LOW" | "MID" | "HIGH" based on personality
- reason: 2-3 sentences, fun and specific to their input, use the stock's real personality
- emoji: one emoji that fits the stock vibe
- extras: always exactly 2 alternative stocks
- Use real, popular stocks (AAPL, NVDA, TSLA, AMZN, META, GOOG, MSFT, JPM, NFLX, SPOT, UBER, ABNB, PLTR, AMD, BRK.B, DIS, NKE, SBUX, V, MA, etc.)
- Match the stock's actual market personality to the person's personality`;

async function callGemini(prompt: string, imageBase64?: string) {
  const apiKey = process.env.GEMINI_API_KEY!;
  const model = "gemini-1.5-flash-latest";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const parts: object[] = [];

  if (imageBase64) {
    parts.push({ inlineData: { mimeType: "image/jpeg", data: imageBase64 } });
    parts.push({ text: "Look at this person's face, style, energy, and overall vibe. What stock are they? Analyze their facial features, expression, and energy to determine their investor personality and match them to a stock. Be specific about what you see." });
  } else {
    parts.push({ text: prompt });
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: "user", parts }],
      generationConfig: { maxOutputTokens: 1024, temperature: 0.9 },
    }),
  });

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  const clean = text.replace(/```json|```/g, "").trim() || "{}";
  const parsed = JSON.parse(clean);

  return {
    ticker: parsed.ticker || "SPY",
    name: parsed.name || "S&P 500 ETF",
    score: typeof parsed.score === "number" ? Math.min(99, Math.max(1, parsed.score)) : 72,
    reason: parsed.reason || "A solid match based on your profile.",
    risk: ["LOW", "MID", "HIGH"].includes(parsed.risk) ? parsed.risk : "MID",
    emoji: parsed.emoji || "📊",
    extras: Array.isArray(parsed.extras)
      ? parsed.extras
          .filter(Boolean)
          .map((e: { ticker?: string; name?: string; emoji?: string }) => ({
            ticker: e.ticker || "ETF",
            name: e.name || "Index Fund",
            emoji: e.emoji || "📈",
          }))
      : [],
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode, image, answers, vibe } = body;

    let result;

    if (mode === "face" && image) {
      result = await callGemini("", image);
    } else if (mode === "mbti" && answers) {
      const prompt = `Based on this investor personality quiz:
Q1 (invest $1k): ${answers[0]}
Q2 (stock drops 30%): ${answers[1]}
Q3 (weekend vibe): ${answers[2]}
Q4 (new IPO): ${answers[3]}
Q5 (investment goal): ${answers[4]}
What stock are they?`;
      result = await callGemini(prompt);
    } else if (mode === "vibe" && vibe) {
      result = await callGemini(`Today's mood: ${vibe}. Based purely on this energy and vibe, what stock matches this person right now?`);
    } else if (mode === "salary" && answers) {
      const prompt = `Financial profile:
- Annual income: ${answers.salary}
- Savings rate: ${answers.savings}
- Biggest expense: ${answers.spend}
- Investment horizon: ${answers.horizon}
What stock portfolio archetype are they?`;
      result = await callGemini(prompt);
    } else {
      throw new Error("Invalid mode or missing data");
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({
      ticker: "SPY",
      name: "S&P 500 ETF",
      score: 72,
      reason: "You're solid, reliable, and consistent — just like the index. Not flashy, but you always show up. That's actually a flex.",
      risk: "MID",
      emoji: "📊",
      extras: [
        { ticker: "QQQ", name: "Nasdaq 100 ETF", emoji: "💻" },
        { ticker: "VTI", name: "Vanguard Total Market", emoji: "🌎" },
      ],
    });
  }
}