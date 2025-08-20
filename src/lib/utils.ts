import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export type GameState =
  | "welcome"
  | "learning"
  | "playing"
  | "ending"
  | "nameInput"
  | "leaderboard";

export const SINGLEPLAYER_ACTIVE_STATES = [
  "playing",
  "ending",
  "nameInput",
  "leaderboard",
] as const;

export type SingleplayerActiveState =
  (typeof SINGLEPLAYER_ACTIVE_STATES)[number];

export type GameLevel = "welcome" | "singleplayer" | "multiplayer";

export interface LeaderboardEntry {
  id: string;
  player_name: string;
  score: number;
  created_at: string;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isMobile() {
  return 1 < navigator.maxTouchPoints;
}
