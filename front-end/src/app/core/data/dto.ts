/**
 * Wire shapes, mirroring the fixture JSON exactly. Nothing outside
 * `core/data` may import these — components see domain models only.
 *
 * When the Go backend replaces the fixtures these get replaced too; the
 * domain model and every component stay put. That is the whole point.
 */

export interface RawMeta {
  readonly generated_at: string;
  readonly source: string;
  readonly scope: string;
  readonly scoring_rule: string;
  readonly stats_scope: string;
  readonly caveats: readonly string[];
  readonly counts: {
    readonly entries: number;
    readonly events: number;
    readonly players: number;
    readonly players_linked: number;
    readonly players_unlinked: number;
    readonly scoring_events: number;
    readonly seasons: number;
    readonly tournaments: number;
  };
  /** Keys are range *starts*: '5' covers 5-6, '9' covers 9-12, '13+' is open. */
  readonly points_table: Readonly<Record<string, number>>;
}

export interface RawSeason {
  readonly id: string;
  readonly name: string;
  readonly start_at: string;
  readonly end_at: string;
  readonly scoring: boolean;
  readonly note?: string;
  readonly event_ids: readonly string[];
  /** start.gg league id — deliberately dropped by the mapper. */
  readonly startgg_league_id?: string;
}

export interface RawTournament {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly city: string;
  readonly country_code: string;
  readonly num_attendees: number;
  readonly start_at: string;
}

export interface RawEvent {
  readonly id: string;
  readonly name: string;
  readonly start_at: string;
  readonly state: string;
  readonly scoring: boolean;
  readonly season_id?: string;
  readonly week_number?: number;
  readonly tournament_id: string;
  readonly num_entrants: number;
  readonly num_standings: number;
}

export interface RawPlayer {
  readonly id: string;
  readonly gamertag: string;
  readonly linked: boolean;
  readonly aliases?: readonly string[];
  readonly events_entered: number;
  readonly events_played: number;
  readonly external_refs: {
    readonly startgg_player_id?: string;
    readonly startgg_user_id?: string;
    readonly startgg_user_slug?: string;
  };
}

export interface RawEntry {
  readonly player_id: string;
  readonly event_id: string;
  readonly season_id?: string;
  readonly placement: number | null;
  readonly points: number;
  readonly played: boolean;
  readonly entrant_name: string;
}

export interface RawLeaderboardRow {
  readonly player_id: string;
  readonly gamertag: string;
  readonly rank: number;
  readonly points: number;
  readonly entered: number;
  readonly played: number;
}

export type RawLeaderboards = Readonly<Record<string, readonly RawLeaderboardRow[]>>;

export interface RawPlayerStats {
  readonly player_id: string;
  readonly gamertag: string;
  readonly events_entered: number;
  readonly events_played: number;
  readonly total_points: number;
  readonly best_placement: number;
  readonly avg_placement: number;
  readonly sets_won: number;
  readonly sets_lost: number;
  readonly set_winrate: number;
  readonly games_won: number;
  readonly games_lost: number;
  readonly game_winrate: number;
  readonly dqs: number;
}

export interface RawTeam {
  readonly id: string;
  readonly season_id: string;
  readonly name: string;
  readonly tag: string;
  readonly founded_at: string;
}

export interface RawTeamMembership {
  readonly team_id: string;
  readonly player_id: string;
  readonly joined_at: string;
  readonly left_at: string | null;
}
