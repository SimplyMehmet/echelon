import { PlayerId } from './ids';

/**
 * Only 16 of 169 players have these — the most-attending regulars. Everyone
 * else renders an empty state, which is the common case, not the edge case.
 *
 * Scopes are mixed and the fixture's own `stats_scope` note understates it:
 * `eventsEntered`/`eventsPlayed` are all-time while `totalPoints` counts
 * scoring events only. Do not divide one by the other.
 */
export interface PlayerStats {
  readonly playerId: PlayerId;
  readonly eventsEntered: number;
  readonly eventsPlayed: number;
  readonly totalPoints: number;
  readonly bestPlacement: number;
  readonly avgPlacement: number;
  readonly setsWon: number;
  readonly setsLost: number;
  /** 0..1 fraction. */
  readonly setWinRate: number;
  readonly gamesWon: number;
  readonly gamesLost: number;
  readonly gameWinRate: number;
  readonly dqs: number;
}
