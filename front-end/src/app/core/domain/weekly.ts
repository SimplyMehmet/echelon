import { SeasonId, WeeklyId } from './ids';

/**
 * A weekly is a start.gg *event*, not a tournament — `startAt` here is the real
 * date; the tournament's own date is meaningless (both season-2 tournaments
 * claim the same one).
 *
 * Named `Weekly` rather than `Event` so it does not shadow the DOM's global
 * `Event` in every file that also handles a click.
 */
export interface Weekly {
  readonly id: WeeklyId;
  readonly name: string;
  /** ISO 8601 UTC. Kept as a string — they sort lexicographically. */
  readonly startAt: string;
  readonly status: WeeklyStatus;
  readonly scoring: boolean;
  readonly seasonId: SeasonId | null;
  /**
   * NOT a season index. Event 1566794 ("Levels Tekken League Major #1") has
   * weekNumber 1 with no season, and all three preseason weeklies have none at
   * all. Use it as a label, never as an ordering or lookup key.
   */
  readonly weekNumber: number | null;
  readonly venue: Venue;
  /** Everyone who signed up. */
  readonly entrantCount: number;
  /** Everyone who actually placed. 10-25% lower — that gap is a feature. */
  readonly playedCount: number;
}

export type WeeklyStatus = 'completed' | 'live' | 'upcoming';

export interface Venue {
  /** 'WORM' | 'DOX' | 'Twitchcon 2026' | else the city. */
  readonly label: string;
  readonly city: string;
  readonly countryCode: string;
}

/**
 * Upcoming means both not-yet-run AND not-yet-happened.
 *
 * start.gg event state goes stale: this dataset carries an ACTIVE event from
 * March and a CREATED one from the March before that, so `status` alone would
 * advertise them as upcoming months after the fact.
 *
 * ISO-8601 UTC strings are fixed-width and Z-suffixed throughout the dataset,
 * so lexicographic comparison is correct. Same trick as isMemberAt in team.ts.
 */
export const isUpcoming = (weekly: Weekly, now: string): boolean =>
  weekly.status !== 'completed' && weekly.startAt > now;
