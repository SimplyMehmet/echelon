import { PlayerId, SeasonId, TeamId } from './ids';
import { PlayerRef } from './player';

/**
 * Teams do not exist in start.gg at all — 0 of 573 entrant rows carry one, and
 * the free-text sponsor prefixes are unusable as truth (`ML` vs `ML |`, someone
 * using `None`). They are assigned manually in our app.
 *
 * A team belongs to exactly one season: Levels drafts fresh teams each season,
 * so "the same team" does not persist across them and standings must never mix
 * a team from one season with entries from another.
 */
export interface Team {
  readonly id: TeamId;
  readonly seasonId: SeasonId;
  readonly name: string;
  readonly tag: string;
  readonly foundedAt: string;
}

export interface TeamRef {
  readonly id: TeamId;
  readonly name: string;
  readonly tag: string;
}

/**
 * Membership is windowed. Without `joinedAt`/`leftAt`, a mid-season transfer
 * would retroactively rewrite every past result the player earned elsewhere.
 */
export interface TeamMembership {
  readonly teamId: TeamId;
  readonly playerId: PlayerId;
  readonly joinedAt: string;
  /** Null means current. */
  readonly leftAt: string | null;
}

export interface TeamStandings {
  readonly seasonId: SeasonId;
  readonly rows: readonly TeamStanding[];
}

export interface TeamStanding {
  readonly rank: number;
  readonly isTied: boolean;
  readonly team: TeamRef;
  readonly points: number;
  readonly currentMemberCount: number;
  readonly contributors: readonly TeamContribution[];
}

export interface TeamContribution {
  readonly player: PlayerRef;
  readonly points: number;
  readonly weekliesCounted: number;
}

export interface TeamDetail {
  readonly team: Team;
  readonly roster: readonly TeamRosterEntry[];
}

export interface TeamRosterEntry {
  readonly player: PlayerRef;
  readonly joinedAt: string;
  readonly leftAt: string | null;
  readonly current: boolean;
}

/**
 * A weekly's points count for a team only if the player was a member when it
 * happened. This is the whole reason the window exists.
 *
 * ISO-8601 UTC strings are fixed-width and Z-suffixed throughout the dataset,
 * so lexicographic comparison is correct and no Date objects are needed.
 */
export const isMemberAt = (m: TeamMembership, instant: string): boolean =>
  m.joinedAt <= instant && (m.leftAt === null || instant < m.leftAt);
