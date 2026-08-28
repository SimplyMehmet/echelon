import { Entry } from './entry';
import { PlayerRef } from './player';
import { TeamRef } from './team';
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
