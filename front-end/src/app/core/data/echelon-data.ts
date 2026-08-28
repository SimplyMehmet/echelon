import {
  Leaderboard,
  LeaderboardMetric,
  Player,
  PlayerId,
  PlayerProfile,
  PlayerSearchHit,
  PlayerStats,
  ScoringMeta,
  Season,
  SeasonId,
  Team,
  TeamDetail,
  TeamId,
  TeamStandings,
  Weekly,
  WeeklyId,
  WeeklyResults,
} from '@core/domain';

/**
 * The seam.
 *
 * An abstract class rather than an InjectionToken + interface: it is both the
 * compile-time contract and the runtime DI token in one symbol, so
 * `inject(EchelonData)` is typed with no generics, `implements EchelonData`
 * turns "we added a method" into a compile error in the other implementation,
 * and tests override it in one line.
 *
 * Every method is shaped like an endpoint Gin would realistically serve, NOT
 * like the fixture files. Joins happen inside the implementation, so when the
 * backend ships pre-joined responses no component changes.
 *
 * Swapping the whole app onto the real API is one line in app.config.ts:
 *   { provide: EchelonData, useClass: HttpEchelonData }
 *
 * Convention: `null` means "asked correctly, no such thing" — render a
 * not-found panel. A rejected promise means "could not ask" — render an error
 * with retry. Conflating the two puts a typo'd URL in the same UI as a dead
 * network.
 */
export abstract class EchelonData {
  /** GET /api/v1/meta */
  abstract getScoringMeta(): Promise<ScoringMeta>;

  /** GET /api/v1/seasons */
  abstract listSeasons(): Promise<Season[]>;

  /** GET /api/v1/seasons/{id} */
  abstract getSeason(id: SeasonId): Promise<Season | null>;

  /** GET /api/v1/seasons/{id}/leaderboard?metric= */
  abstract getLeaderboard(id: SeasonId, metric: LeaderboardMetric): Promise<Leaderboard | null>;

  /** GET /api/v1/weeklies?season= */
  abstract listWeeklies(filter?: { seasonId?: SeasonId }): Promise<Weekly[]>;

  /** GET /api/v1/weeklies/{id} */
  abstract getWeekly(id: WeeklyId): Promise<Weekly | null>;

  /** GET /api/v1/weeklies/{id}/results */
  abstract getWeeklyResults(id: WeeklyId): Promise<WeeklyResults | null>;

  /** GET /api/v1/players?q= */
  abstract searchPlayers(query?: string): Promise<PlayerSearchHit[]>;

  /** GET /api/v1/players/{id} */
  abstract getPlayer(id: PlayerId): Promise<Player | null>;

  /** GET /api/v1/players/{id}/stats — null for all but the tracked regulars. */
  abstract getPlayerStats(id: PlayerId): Promise<PlayerStats | null>;

  /** GET /api/v1/players/{id}/profile */
  abstract getPlayerProfile(id: PlayerId): Promise<PlayerProfile | null>;

  /** GET /api/v1/teams */
  abstract listTeams(): Promise<Team[]>;

  /** GET /api/v1/teams/{id} */
  abstract getTeam(id: TeamId): Promise<TeamDetail | null>;

  /** GET /api/v1/teams/standings?season= */
  abstract getTeamStandings(seasonId: SeasonId): Promise<TeamStandings>;

  // ---- organiser writes. The mock mutates in-memory only. ----

  /** POST /api/v1/teams/{id}/members */
  abstract addTeamMember(teamId: TeamId, playerId: PlayerId, joinedAt: string): Promise<void>;

  /** DELETE /api/v1/teams/{id}/members/{playerId} */
  abstract endTeamMembership(teamId: TeamId, playerId: PlayerId, leftAt: string): Promise<void>;

  /** POST /api/v1/players/{keep}/merge */
  abstract mergePlayers(keep: PlayerId, absorb: PlayerId): Promise<void>;
}
