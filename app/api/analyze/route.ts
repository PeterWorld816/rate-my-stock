import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const LANG_NAMES: Record<string, string> = {
  ko: "Korean (한국어)",
  zh: "Chinese (中文)",
  ja: "Japanese (日本語)",
  es: "Spanish (Español)",
  fr: "French (Français)",
  de: "German (Deutsch)",
  pt: "Portuguese (Português)",
  hi: "Hindi (हिन्दी)",
  ar: "Arabic (العربية)",
};

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
- extras: always exactly 2 alternative stocks that are DIFFERENT from the main ticker AND different from each other
- CRITICAL: Diversify recommendations widely across ALL categories below — do NOT default to the same few stocks every time
- Match the stock's actual market personality to the person's personality

STOCK UNIVERSE — pick based on personality archetype:

💰 DIVIDEND LOVERS (steady, loves passive income, craves reliability):
- SCHD (Schwab US Dividend Equity ETF) — "dividend royalty, the silent millionaire"
- VYM (Vanguard High Dividend Yield ETF) — "old money energy, set it and forget it"
- JEPI (JPMorgan Equity Premium Income) — "covered calls and chill, the sophisticated income machine"
- O (Realty Income) — "monthly dividend, literal money clock"
- MO (Altria Group) — "controversial but consistent, that one uncle who always pays back"
- KO (Coca-Cola) — "Warren Buffett's comfort drink, timeless and underrated"
- JNJ (Johnson & Johnson) — "boring in the best way, bulletproof dividend"
- T (AT&T) — "had a rough patch but pays you to wait"

🛡️ STABLE / CONSERVATIVE (risk-averse, plays the long game, values safety):
- BRK.B (Berkshire Hathaway B) — "the GOAT's portfolio in one share, old-school discipline"
- VTI (Vanguard Total Market ETF) — "literally owns everything, diversified to the bone"
- SPY (S&P 500 ETF) — "the index, the myth, the legend"
- QQQ (Nasdaq 100 ETF) — "tech-heavy safety net for the cautiously optimistic"
- VOO (Vanguard S&P 500 ETF) — "Bogle's gift to humanity"
- GLD (SPDR Gold ETF) — "doesn't trust banks, probably prepping"
- TLT (iShares 20+ Year Treasury) — "macro obsessed, reads Fed statements for fun"
- VNQ (Vanguard Real Estate ETF) — "landlord vibes without the 3am calls"

🚀 GROWTH / MOMENTUM (ambitious, FOMO-driven, lives in the future):
- NVDA (NVIDIA) — "the AI king, everyone's talking about you"
- META (Meta Platforms) — "reinvented itself twice, chameleon energy"
- AMZN (Amazon) — "built differently, operates at a scale nobody else does"
- GOOG (Alphabet/Google) — "knows everything about you and still prints money"
- MSFT (Microsoft) — "the quiet overachiever who aged like fine wine"
- AMD (Advanced Micro Devices) — "the underdog that became the wolf"
- AVGO (Broadcom) — "the chip whisperer, quietly dominates everything"
- ARM (Arm Holdings) — "every chip runs on your blueprint, understated power"
- CRM (Salesforce) — "enterprise royalty, the B2B boss"
- NOW (ServiceNow) — "the unsexy stock that's somehow sexy"

⚡ HIGH RISK / SPECULATIVE (chaotic, loves volatility, born gambler):
- TSLA (Tesla) — "pure chaos energy, you either 10x or cry"
- PLTR (Palantir) — "government secrets and alien vibes, controversial af"
- COIN (Coinbase) — "crypto native, volatility is your love language"
- MSTR (MicroStrategy / Strategy) — "basically a Bitcoin ETF with extra drama"
- RKLB (Rocket Lab) — "wants to go to space but budget airline version"
- IONQ (IonQ) — "quantum computing, you believe in things that don't exist yet"
- SOUN (SoundHound AI) — "AI audio hype, might be nothing might be everything"
- SMCI (Super Micro Computer) — "server drama, high risk high chaos"
- MARA (Marathon Digital) — "Bitcoin miner, basically a leveraged BTC bet"
- HOOD (Robinhood) — "started the revolution, still volatile, Gen-Z icon"

🍎 DIVIDEND + GROWTH (balanced, wants it all, classic choice):
- AAPL (Apple) — "lifestyle stock, you own AirPods AND the stock"
- MSFT (Microsoft) — "the cloud that ate everything, pays dividends too"
- V (Visa) — "every swipe is revenue, prints money quietly"
- MA (Mastercard) — "Visa's cooler twin, also prints money"
- JPM (JPMorgan Chase) — "biggest bank in the game, Jamie Dimon's empire"
- HD (Home Depot) — "DIY culture's stock market darling"
- UNH (UnitedHealth) — "healthcare dominance, slightly controversial but stacked"
- COST (Costco) — "bulk buy mentality, you're the person with 3 years of paper towels"

🌊 GEN-Z TRENDY (young, culturally plugged in, vibes over fundamentals):
- HOOD (Robinhood Markets) — "the app that got Gen-Z into stocks, still raw"
- SOFI (SoFi Technologies) — "your bank is an app and you're proud of it"
- ABNB (Airbnb) — "travels 3 months a year, has opinions on 'authentic experiences'"
- UBER (Uber Technologies) — "never bought a car, runs life through apps"
- SHOP (Shopify) — "side hustle to empire, entrepreneur coded"
- RBLX (Roblox) — "you either get it or you don't (you're probably under 25)"
- SNAP (Snap Inc.) — "disappearing messages for a disappearing market share, but so cool"
- PINS (Pinterest) — "aesthetic vision board turned actual business"
- DUOL (Duolingo) — "the green owl guilt-tripped you into becoming bilingual"
- NFLX (Netflix) — "password sharing ended but the binge never did"
- SPOT (Spotify) — "you have 4 playlists and a parasocial relationship with your Wrapped"

🔥 CULTURE / LIFESTYLE (brand-obsessed, culturally aware, picks by feel):
- NKE (Nike) — "just do it energy, you've said 'I fw this stock' unironically"
- SBUX (Starbucks) — "iced coffee every morning, $7 latte loyalist"
- DIS (Disney) — "nostalgia as an investment thesis, you cried at Up"
- LVS (Las Vegas Sands) — "Macau and Vegas casinos, high roller energy"
- WYNN (Wynn Resorts) — "luxury casino vibes, you tip 25% minimum"
- RCL (Royal Caribbean) — "cruise ship enjoyer, floating mall enthusiast"
- DKNG (DraftKings) — "sports betting is 'investing' in your mind"
- MGM (MGM Resorts) — "Vegas is a second home, loyalty card maxed out"

🤖 DEEP TECH / AI ECOSYSTEM:
- SMCI (Super Micro Computer) — "builds the servers that run the AI you use"
- DELL (Dell Technologies) — "enterprise AI infrastructure, the plumber of the AI age"
- ORCL (Oracle) — "boring database company that somehow won the cloud AI race"
- SNOW (Snowflake) — "data cloud royalty, every enterprise runs through you"
- PALO (Palo Alto Networks) — "cybersecurity in an AI world, fear drives revenue"
- CRWD (CrowdStrike) — "the company that accidentally broke the internet, then got stronger"
- ANET (Arista Networks) — "AI needs networking, you're the invisible backbone"

🏠 REAL ASSETS / MACRO PLAYS:
- XOM (ExxonMobil) — "fossil fuel forever energy, unironically bullish on oil"
- CVX (Chevron) — "Texas tea aristocrat, Buffett bought it so it must be fine"
- FCX (Freeport-McMoRan) — "copper for EVs and AI data centers, picks and shovels"
- NEM (Newmont) — "gold miner, you're hedging against civilization"
- AMT (American Tower) — "owns the towers your phone talks to, cell signal landlord"
- PLD (Prologis) — "warehouses for Amazon and everyone else, logistics royalty"

PERSONALITY MATCHING GUIDE:
- Chill/laid-back → SCHD, VYM, VTI, KO
- Ambitious/hustler → NVDA, META, AMZN, SHOP
- Risk-lover/degen → TSLA, PLTR, COIN, MSTR
- Gen-Z/young → HOOD, SOFI, ABNB, DUOL, RBLX
- Traditional/conservative → BRK.B, JNJ, V, JPM
- Trendy/brand-aware → NKE, SBUX, AAPL, NFLX
- Tech nerd → AMD, AVGO, SNOW, CRWD, ORCL
- Income-focused → JEPI, O, VYM, MO
- Macro thinker → GLD, TLT, XOM, FCX
- Balanced → MSFT, COST, HD, MA`;

const COUPLE_SYSTEM_PROMPT = `You are StockMatchmaker, a witty AI that analyzes two friends' investor personalities and determines their portfolio compatibility.

Given two people's quiz answers, match each to their ideal stock, calculate their investment compatibility score, and suggest sectors to invest in together.

ALWAYS return valid JSON only, no markdown, no extra text. Use this EXACT format:
{
  "person1": { "ticker": "NVDA", "name": "NVIDIA Corporation", "emoji": "🤖", "risk": "HIGH" },
  "person2": { "ticker": "SCHD", "name": "Schwab US Dividend Equity ETF", "emoji": "🏦", "risk": "LOW" },
  "compatibilityScore": 72,
  "compatibilityLabel": "Yin & Yang 🌓",
  "dynamicDesc": "The Rocket & The Banker",
  "reason": "You two are investment opposites — and that's your superpower. Person 1 brings explosive growth energy while Person 2 keeps the portfolio from imploding. Together you're basically a hedge fund minus the fees.",
  "recommendedSectors": [
    { "name": "Technology ETFs", "emoji": "💻" },
    { "name": "Dividend Growth Stocks", "emoji": "📈" },
    { "name": "Healthcare Staples", "emoji": "🏥" }
  ]
}

Rules:
- person1 / person2: pick stocks from this universe: TSLA, NVDA, META, AMZN, AAPL, MSFT, BRK.B, VTI, SCHD, JEPI, PLTR, COIN, HOOD, SOFI, GOOG, AMD, JPM, V, KO, ABNB, SHOP, NFLX, SPOT, VYM, QQQ, MSTR, AVGO, CRWD, SNOW, NKE, SBUX
- risk: "LOW" | "MID" | "HIGH" — infer from their answers
- compatibilityScore: 60-99 (always feel positive, never depressing)
- compatibilityLabel: pick one — "Perfect Match 🔥" / "Power Couple 👑" / "Dynamic Duo 💫" / "Yin & Yang 🌓" / "Chaos & Order ⚡" / "The Odd Couple 🎭" / "Dream Team 🏆" / "Fire & Ice ❄️🔥"
- dynamicDesc: creative 4-6 word nickname (e.g. "The Bull & The Bear", "The Visionary & The Sage", "Fire & Ice")
- reason: 2-3 sentences, fun, witty, slightly roasty but positive — reference both stocks' real market personalities
- recommendedSectors: exactly 3 sectors that balance both investors' styles`;

async function callCoupleMode(p1Answers: string[], p2Answers: string[]) {
  const prompt = `Person 1 answers:
${p1Answers.map((a, i) => `Q${i + 1}: ${a}`).join("\n")}

Person 2 answers:
${p2Answers.map((a, i) => `Q${i + 1}: ${a}`).join("\n")}

Analyze both investors, match each to their ideal stock, and return their Friend Match result.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    temperature: 0.9,
    system: COUPLE_SYSTEM_PROMPT,
    messages: [{ role: "user", content: [{ type: "text", text: prompt }] }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  if (!text) throw new Error("Empty couple response");

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON in couple response");

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error("Couple JSON parse failed");
  }

  const p1 = (parsed.person1 as Record<string, unknown>) || {};
  const p2 = (parsed.person2 as Record<string, unknown>) || {};
  const sectors = Array.isArray(parsed.recommendedSectors) ? parsed.recommendedSectors : [];

  return {
    person1: {
      ticker: typeof p1.ticker === "string" ? p1.ticker : "SPY",
      name: typeof p1.name === "string" ? p1.name : "S&P 500 ETF",
      emoji: typeof p1.emoji === "string" ? p1.emoji : "📊",
      risk: (["LOW", "MID", "HIGH"].includes(p1.risk as string) ? p1.risk : "MID") as "LOW" | "MID" | "HIGH",
    },
    person2: {
      ticker: typeof p2.ticker === "string" ? p2.ticker : "VTI",
      name: typeof p2.name === "string" ? p2.name : "Vanguard Total Market ETF",
      emoji: typeof p2.emoji === "string" ? p2.emoji : "🌎",
      risk: (["LOW", "MID", "HIGH"].includes(p2.risk as string) ? p2.risk : "MID") as "LOW" | "MID" | "HIGH",
    },
    compatibilityScore: typeof parsed.compatibilityScore === "number"
      ? Math.min(99, Math.max(60, parsed.compatibilityScore)) : 75,
    compatibilityLabel: typeof parsed.compatibilityLabel === "string" ? parsed.compatibilityLabel : "Dynamic Duo 💫",
    dynamicDesc: typeof parsed.dynamicDesc === "string" ? parsed.dynamicDesc : "Two of a Kind",
    reason: typeof parsed.reason === "string" ? parsed.reason : "Your investment styles complement each other perfectly.",
    recommendedSectors: sectors.slice(0, 3).map((s: { name?: string; emoji?: string }) => ({
      name: typeof s.name === "string" ? s.name : "Diversified ETFs",
      emoji: typeof s.emoji === "string" ? s.emoji : "📊",
    })),
  };
}

async function callClaude(prompt: string, imageBase64?: string, lang?: string) {
  const langInstruction = lang && lang !== "en" && LANG_NAMES[lang]
    ? `\n\nLANGUAGE RULE: You MUST write the "reason" field entirely in ${LANG_NAMES[lang]}. All other JSON fields (ticker, name, risk, emoji, extras.ticker, extras.name, extras.emoji) must remain in English.`
    : "";

  const content: Anthropic.MessageParam["content"] = imageBase64
    ? [
        {
          type: "image",
          source: {
            type: "base64",
            media_type: "image/jpeg",
            data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
          },
        },
        {
          type: "text",
          text: "Look at this person's face, style, energy, and overall vibe. What stock are they? Analyze their facial features, expression, and energy to determine their investor personality and match them to a stock. Be specific about what you see.",
        },
      ]
    : [{ type: "text", text: prompt }];

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    temperature: 0.9,
    system: SYSTEM_PROMPT + langInstruction,
    messages: [{ role: "user", content }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";

  if (!text) {
    throw new Error("Claude empty response");
  }

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`Claude non-JSON response: ${text.slice(0, 300)}`);
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error(`Claude JSON parse failed: ${jsonMatch[0].slice(0, 300)}`);
  }

  const rawExtras = Array.isArray(parsed.extras) ? parsed.extras : [];
  return {
    ticker: typeof parsed.ticker === "string" ? parsed.ticker : "SPY",
    name: typeof parsed.name === "string" ? parsed.name : "S&P 500 ETF",
    score: typeof parsed.score === "number" ? Math.min(99, Math.max(1, parsed.score)) : 72,
    reason: typeof parsed.reason === "string" ? parsed.reason : "A solid match based on your profile.",
    risk: ["LOW", "MID", "HIGH"].includes(parsed.risk as string) ? parsed.risk : "MID",
    emoji: typeof parsed.emoji === "string" ? parsed.emoji : "📊",
    extras: rawExtras
      .filter(Boolean)
      .map((e: { ticker?: string; name?: string; emoji?: string }) => ({
        ticker: e.ticker || "ETF",
        name: e.name || "Index Fund",
        emoji: e.emoji || "📈",
      })),
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode, image, answers, vibe, investorCode, archetype, p1Answers, p2Answers,
            celebrity, celebrityId, matchPct, holdings,
            career, careerCategory, experience, goal, careerPrompt, lang } = body;

    // Couple mode returns a different shape — handle separately
    if (mode === "couple" && p1Answers && p2Answers) {
      const coupleResult = await callCoupleMode(p1Answers, p2Answers);
      return NextResponse.json(coupleResult);
    }

    let result;

    if (mode === "face" && image) {
      result = await callClaude("", image, lang);
    } else if (mode === "mbti" && answers) {
      const codeContext = investorCode && archetype
        ? ` This investor's Stock MBTI code is ${investorCode} ("${archetype}") — meaning ${
            investorCode.split("").map((l: string) => ({ A:"Aggressive", S:"Stable", G:"Growth", V:"Value", T:"Tech-focused", B:"Broad-market", R:"Reactive", P:"Patient" }[l] ?? l)).join(", ")
          }. Generate the reason knowing this investor's predetermined stock match — make the reason specific to both this investor archetype AND the stock's real personality.`
        : "";
      const prompt = `Based on this Stock MBTI investor personality quiz:${codeContext}
Q1 (portfolio crash response): ${answers[0]}
Q2 (pre-IPO startup response): ${answers[1]}
Q3 (investment endgame): ${answers[2]}
Q4 (stock analysis approach): ${answers[3]}
Q5 (exciting headline): ${answers[4]}
Q6 (ideal portfolio): ${answers[5]}
Q7 (decision-making style): ${answers[6]}
Q8 (investment horizon): ${answers[7]}
What stock are they?`;
      result = await callClaude(prompt, undefined, lang);
    } else if (mode === "celebrity" && celebrity && answers) {
      const holdingsList = Array.isArray(holdings) ? (holdings as string[]).join(", ") : "AAPL, VTI";
      const celebPersonality: Record<string, string> = {
        elon:    "revolutionary disruptor who bets everything on first-principles thinking, loves electric vehicles, space, and AI",
        buffett: "patient value investor who reads annual reports like novels, loves consumer brands, banks, and holding forever",
        cathie:  "visionary who believes disruptive tech will change everything within 5 years — ARK Innovation personified",
        cramer:  "high-energy blue-chip enthusiast who diversifies across sectors and has very loud opinions on TV",
      };
      const personality = celebPersonality[String(celebrityId)] ?? "legendary investor";
      const prompt = `The user is a ${matchPct}% personality match with ${celebrity}, the ${personality}.

${celebrity}'s known holdings include: ${holdingsList}

The user's quiz answers that matched them to ${celebrity}:
Q1 (investment philosophy): ${answers[0]}
Q2 (market crash reaction): ${answers[1]}
Q3 (portfolio choice): ${answers[2]}

CRITICAL: You MUST recommend ONE stock from this exact list: ${holdingsList}
Pick the holding that best fits the user's personality from those answers. Reference ${celebrity}'s actual investment style and explain why this stock — which ${celebrity} actually holds — is the perfect match for this user. Be fun, slightly roasty, and reference both the celebrity and the stock's real personality.`;
      result = await callClaude(prompt, undefined, lang);
    } else if (mode === "career" && career && careerPrompt) {
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
      const fullPrompt = `Stock recommendation for a ${String(career)} in the ${String(careerCategory)} field.

Career: ${String(career)} (${String(careerCategory)} industry)
Investment experience: This person ${experienceLabels[String(experience)] ?? String(experience)}.
Main investment goal: ${goalLabels[String(goal)] ?? String(goal)}.

This ${String(career)} has insider knowledge of the ${String(careerCategory)} industry. Recommend the best stock match for them, prioritizing stocks they would understand from their field.

Make the reason witty and career-specific — reference their profession, the insider knowledge they have, and tie it to the stock's personality. Factor in their experience level and goal.`;
      result = await callClaude(fullPrompt, undefined, lang);
    } else if (mode === "vibe" && vibe) {
      result = await callClaude(`Today's mood: ${vibe}. Based purely on this energy and vibe, what stock matches this person right now?`, undefined, lang);
    } else if (mode === "salary" && answers) {
      const prompt = `Financial profile:
- Annual income: ${answers.salary}
- Savings rate: ${answers.savings}
- Biggest expense: ${answers.spend}
- Investment horizon: ${answers.horizon}
What stock portfolio archetype are they?`;
      result = await callClaude(prompt, undefined, lang);
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