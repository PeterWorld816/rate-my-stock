"use client";
import { useState, useEffect } from "react";
import { GameStats, loadStats, applyDailyVisit, applyXP } from "./gamification";

const INIT: GameStats = { xp: 0, streak: 1, lastVisit: "", level: 1 };

export function useGamification() {
  const [stats, setStats] = useState<GameStats>(INIT);

  useEffect(() => {
    // Load from localStorage and update streak for today's visit
    setStats(applyDailyVisit(loadStats()));
  }, []);

  const addXP = (amount: number): GameStats => {
    const updated = applyXP(amount);
    setStats(updated);
    return updated;
  };

  return { stats, addXP };
}
