import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export type GameState = "welcome" | "playing" | "nameInput" | "leaderboard";
export type GameLevel = "welcome" | "singleplayer" | "multiplayer";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isMobile() {
  return 1 < navigator.maxTouchPoints;
}
