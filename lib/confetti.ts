import confetti from "canvas-confetti";

// Rate My Stock brand palette (see app/quiz, app/match accents).
const BRAND_COLORS = ["#00C805", "#7C3AED", "#F59E0B", "#06B6D4", "#EF4444"];

export function triggerPerfectConfetti(): void {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: BRAND_COLORS,
  });
}

export function triggerLevelUpConfetti(): void {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: BRAND_COLORS,
  });
}
