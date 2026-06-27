export interface GameStats {
  xp: number;
  streak: number;
  lastVisit: string; // "YYYY-MM-DD" in local time
  level: number;
}

const STORAGE_KEY = "rms_stats";

// XP required to reach each level (index = level - 1)
const LEVEL_XP = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500];

export const MAX_LEVEL = LEVEL_XP.length;

export function getLevel(xp: number): number {
  let lv = 1;
  for (let i = 0; i < LEVEL_XP.length; i++) {
    if (xp >= LEVEL_XP[i]) lv = i + 1;
  }
  return lv;
}

export function xpForNextLevel(level: number): number | null {
  return level < MAX_LEVEL ? LEVEL_XP[level] : null;
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseLocal(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

const DEFAULTS: GameStats = { xp: 0, streak: 1, lastVisit: "", level: 1 };

export function loadStats(): GameStats {
  if (typeof window === "undefined") return { ...DEFAULTS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<GameStats>) };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveStats(stats: GameStats): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {}
}

/** Call on each page visit. Updates streak if it's a new day. */
export function applyDailyVisit(stats: GameStats): GameStats {
  const today = todayStr();
  if (stats.lastVisit === today) return stats;

  let newStreak = 1;
  if (stats.lastVisit) {
    const diffMs = parseLocal(today).getTime() - parseLocal(stats.lastVisit).getTime();
    const diffDays = Math.round(diffMs / 86_400_000);
    newStreak = diffDays === 1 ? stats.streak + 1 : 1;
  }

  const updated: GameStats = { ...stats, streak: newStreak, lastVisit: today };
  saveStats(updated);
  return updated;
}

/** Add XP, recalculate level, persist. Returns updated stats. */
export function applyXP(xpToAdd: number): GameStats {
  const stats = loadStats();
  const newXP = stats.xp + xpToAdd;
  const updated: GameStats = { ...stats, xp: newXP, level: getLevel(newXP) };
  saveStats(updated);
  return updated;
}
