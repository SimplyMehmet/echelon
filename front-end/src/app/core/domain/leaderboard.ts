import { PlayerRef } from './player';
import { SeasonId } from './ids';

export type LeaderboardMetric = 'points' | 'attendance';

export interface Leaderboard {
  readonly seasonId: SeasonId;
  readonly metric: LeaderboardMetric;
  /** 1, 2, 2, 4 — not dense. Season 2 has 33 players sharing rank 27. */
  readonly rankingRule: 'standard-competition';
  /** Pre-sorted. Do not re-sort in a template. */
  readonly rows: readonly LeaderboardRow[];
  readonly totalPlayers: number;
  /** Season 3 is 2 of 8 — surface it so a partial table is not read as final. */
  readonly weekliesCounted: number;
}

export interface LeaderboardRow {
  readonly rank: number;
  /** More than one row shares this rank. */
  readonly isTied: boolean;
  readonly player: PlayerRef;
  readonly points: number;
  readonly entered: number;
  readonly played: number;
}
