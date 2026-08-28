import { Entry } from './entry';
import { LeaderboardRow } from './leaderboard';
import { PlayerRef } from './player';
import { Season } from './season';
import { TeamRef, TeamStanding } from './team';
import { Weekly } from './weekly';

/** What a weekly's page needs: the placed field and, separately, the no-shows. */
export interface WeeklyResults {
  readonly weekly: Weekly;
  /** Placed, ascending. */
  readonly standings: readonly WeeklyStanding[];
  /** Signed up, never played. start.gg drops these entirely. */
  readonly didNotPlay: readonly PlayerRef[];
}

export interface WeeklyStanding {
  readonly placement: number;
  readonly isTied: boolean;
  readonly player: PlayerRef;
  readonly points: number;
  readonly enteredAs: string;
}

/** One row of a player's career: the entry joined to the weekly it happened at. */
export interface PlayerHistoryRow {
  readonly entry: Entry;
  readonly weekly: Weekly;
}

export interface PlayerSeasonSummary {
  readonly seasonName: string;
  readonly points: number;
  readonly entered: number;
  readonly played: number;
  readonly rank: number | null;
}

/** Everything the profile page renders beyond the player record itself. */
export interface PlayerProfile {
  readonly history: readonly PlayerHistoryRow[];
  readonly seasons: readonly PlayerSeasonSummary[];
  readonly teams: readonly PlayerTeamSpell[];
}

export interface PlayerTeamSpell {
  readonly team: TeamRef;
  readonly joinedAt: string;
  readonly leftAt: string | null;
  readonly current: boolean;
}

/**
 * Everything the landing page shows, in one shape.
 *
 * A real backend would serve this as a single endpoint rather than making the
 * homepage issue four round trips, so the seam exposes it that way too.
 */
export interface HomeSummary {
  readonly season: Season;
  /** Already cut to three by the source, as the endpoint would. */
  readonly topPlayers: readonly LeaderboardRow[];
  readonly leadingTeam: TeamStanding | null;
  readonly upcoming: readonly Weekly[];
}
