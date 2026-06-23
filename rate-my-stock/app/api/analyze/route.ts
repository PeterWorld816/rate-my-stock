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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode, image, answers, vibe } = body;

    let userMessage = "";

    if (mode === "face" && image) {
      // Image analysis
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY!,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: "image/jpeg",
                    data: image,
                  },
                },
                {
                  type: "text",
                  text: "Look at this person's face, style, energy, and overall vibe. What stock are they? Analyze their facial features, expression, and energy to determine their investor personality and match them to a stock. Be specific about what you see.",
                },
              ],
            },
          ],
        }),
      });

      const data = await response.json();
      const text = data.content?.[0]?.text || "{}";
      const clean = text.replace(/```json|```/g, "").trim();
      return NextResponse.json(JSON.parse(clean));
    }

    if (mode === "mbti" && answers) {
      userMessage = `Based on this investor personality quiz:
Q1 (invest $1k): ${answers[0]}
Q2 (stock drops 30%): ${answers[1]}
Q3 (weekend vibe): ${answers[2]}
Q4 (new IPO): ${answers[3]}
Q5 (investment goal): ${answers[4]}
What stock are they?`;
    }

    if (mode === "vibe" && vibe) {
      userMessage = `Today's mood: ${vibe}. Based purely on this energy and vibe, what stock matches this person right now? Think about the stock's recent market energy and personality.`;
    }

    if (mode === "salary" && answers) {
      userMessage = `Financial profile:
- Annual income: ${answers.salary}
- Savings rate: ${answers.savings}
- Biggest expense: ${answers.spend}
- Investment horizon: ${answers.horizon}
What stock portfolio archetype are they? Pick the one stock that best fits their financial personality and goals.`;
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || "{}";
    const clean = text.replace(/```json|```/g, "").trim();
    return NextResponse.json(JSON.parse(clean));

  } catch (error) {
    console.error("API error:", error);
    // Fallback result
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
