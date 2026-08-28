import { PlayerId, SeasonId, WeeklyId } from './ids';

/**
 * One player in one weekly. `(playerId, weeklyId)` is the key — verified unique
 * across all 835 rows.
 *
 * Invariant, exact in the data: `placement === null` if and only if
 * `played === false` (127 of 835 rows). Never render those as a blank cell —
 * they signed up and did not play, which is precisely what start.gg hides.
 */
export interface Entry {
  readonly playerId: PlayerId;
  readonly weeklyId: WeeklyId;
  /** Null on the 209 entries belonging to non-scoring events. */
  readonly seasonId: SeasonId | null;
  readonly placement: number | null;
  readonly points: number;
  readonly played: boolean;
  /** The entrant name as it appeared, sponsor prefix stripped. */
  readonly enteredAs: string;
}
