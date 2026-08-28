import { Injectable, inject } from '@angular/core';
import {
  Entry,
  HomeSummary,
  Leaderboard,
  LeaderboardMetric,
  LeaderboardRow,
  Player,
  PlayerHistoryRow,
  PlayerId,
  PlayerProfile,
  PlayerSearchHit,
  PlayerSeasonSummary,
  PlayerStats,
  PlayerTeamSpell,
  ScoringMeta,
  Season,
  SeasonId,
  Team,
  TeamContribution,
  TeamDetail,
  TeamId,
  TeamMembership,
  TeamStanding,
  TeamStandings,
  Weekly,
  WeeklyId,
  WeeklyResults,
  WeeklyStanding,
  byStartAtDescending,
  isMemberAt,
  isUpcoming,
  rankWithTies,
} from '@core/domain';
import { NOW } from './clock';
import { EchelonData } from './echelon-data';
import { FixtureLoader } from './fixture-loader';
import {
  RawEntry,
  RawEvent,
  RawLeaderboards,
  RawMeta,
  RawPlayer,
  RawPlayerStats,
  RawSeason,
  RawTeam,
  RawTeamMembership,
  RawTournament,
} from './dto';
import {
  toEntry,
  toLeaderboardRows,
  toPlayer,
  toPlayerStats,
  toScoringMeta,
  toSeason,
  toTeam,
  toTeamMembership,
  toWeekly,
} from './mappers';

interface Fixtures {
  readonly meta: ScoringMeta;
  readonly seasons: readonly Season[];
  readonly weeklies: ReadonlyMap<WeeklyId, Weekly>;
  readonly players: ReadonlyMap<PlayerId, Player>;
  readonly entries: readonly Entry[];
  readonly entriesByWeekly: ReadonlyMap<WeeklyId, readonly Entry[]>;
  readonly entriesByPlayer: ReadonlyMap<PlayerId, readonly Entry[]>;
  readonly leaderboards: ReadonlyMap<SeasonId, readonly LeaderboardRow[]>;
  readonly stats: ReadonlyMap<PlayerId, PlayerStats>;
  readonly teams: readonly Team[];
}

function groupBy<T, K>(items: readonly T[], keyOf: (item: T) => K): Map<K, T[]> {
  const out = new Map<K, T[]>();
  for (const item of items) {
    const key = keyOf(item);
    const bucket = out.get(key);
    if (bucket) {
      bucket.push(item);
    } else {
      out.set(key, [item]);
    }
  }
  return out;
}

/**
 * Reads the frozen dataset from public/data and does, client-side, the joins
 * the Go backend will later do in SQL. Every such join is marked
 * SERVER-SIDE LATER so the migration is a grep.
 *
 * Team memberships are mutable in-memory so the organiser screens are genuinely
 * demoable; everything else is immutable.
 */
@Injectable()
export class MockEchelonData extends EchelonData {
  private readonly loader = inject(FixtureLoader);
  private readonly now = inject(NOW);
  private fixtures?: Promise<Fixtures>;
  private memberships?: TeamMembership[];

  private load(): Promise<Fixtures> {
    this.fixtures ??= this.buildFixtures();
    return this.fixtures;
  }

  private async buildFixtures(): Promise<Fixtures> {
    const [
      rawMeta,
      rawSeasons,
      rawTournaments,
      rawEvents,
      rawPlayers,
      rawEntries,
      rawBoards,
      rawStats,
      rawTeams,
      rawMemberships,
    ] = await Promise.all([
      this.loader.load<RawMeta>('meta.json'),
      this.loader.load<RawSeason[]>('seasons.json'),
      this.loader.load<RawTournament[]>('tournaments.json'),
      this.loader.load<RawEvent[]>('events.json'),
      this.loader.load<RawPlayer[]>('players.json'),
      this.loader.load<RawEntry[]>('entries.json'),
      this.loader.load<RawLeaderboards>('leaderboards.json'),
      this.loader.load<RawPlayerStats[]>('player_stats.json'),
      this.loader.load<RawTeam[]>('teams.json'),
      this.loader.load<RawTeamMembership[]>('team_memberships.json'),
    ]);

    const tournaments = new Map(rawTournaments.map((t) => [t.id, t]));
    const weeklies = new Map(
      rawEvents.map((e) => [toWeekly(e, tournaments).id, toWeekly(e, tournaments)]),
    );
    const players = new Map(rawPlayers.map((p) => [toPlayer(p).id, toPlayer(p)]));
    const entries = rawEntries.map(toEntry);

    this.memberships ??= rawMemberships.map(toTeamMembership);

    return {
      meta: toScoringMeta(rawMeta),
      seasons: rawSeasons.map(toSeason),
      weeklies,
      players,
      entries,
      entriesByWeekly: groupBy(entries, (e) => e.weeklyId),
      entriesByPlayer: groupBy(entries, (e) => e.playerId),
      leaderboards: new Map(
        Object.entries(rawBoards).map(([id, rows]) => [id as SeasonId, toLeaderboardRows(rows)]),
      ),
      stats: new Map(rawStats.map((s) => [toPlayerStats(s).playerId, toPlayerStats(s)])),
      teams: rawTeams.map(toTeam),
    };
  }

  /** SERVER-SIDE LATER: GET /home */
  async getHomeSummary(): Promise<HomeSummary | null> {
    const fixtures = await this.load();
    const season = fixtures.seasons.at(-1);
    if (!season) {
      return null;
    }

    const [board, teams, weeklies] = await Promise.all([
      this.getLeaderboard(season.id, 'points'),
      this.getTeamStandings(season.id),
      this.listWeeklies(),
    ]);

    const now = this.now();
    return {
      season,
      // Hard cut at three. Season 3's rank-2 tie sits entirely inside the cut,
      // so nothing is arbitrarily excluded here.
      topPlayers: (board?.rows ?? []).slice(0, 3),
      leadingTeam: teams.rows.at(0) ?? null,
      upcoming: weeklies.filter((weekly) => isUpcoming(weekly, now)).reverse(),
    };
  }

  async getScoringMeta(): Promise<ScoringMeta> {
    return (await this.load()).meta;
  }

  async listSeasons(): Promise<Season[]> {
    return [...(await this.load()).seasons];
  }

  async getSeason(id: SeasonId): Promise<Season | null> {
    return (await this.load()).seasons.find((s) => s.id === id) ?? null;
  }

  /** SERVER-SIDE LATER: GET /seasons/{id}/leaderboard?metric= */
  async getLeaderboard(id: SeasonId, metric: LeaderboardMetric): Promise<Leaderboard | null> {
    const fixtures = await this.load();
    const rows = fixtures.leaderboards.get(id);
    const season = fixtures.seasons.find((s) => s.id === id);
    if (!rows || !season) {
      return null;
    }

    const ordered =
      metric === 'points'
        ? rows
        : rankWithTies(
            [...rows].sort((a, b) => b.played - a.played || b.points - a.points),
            (row) => row.played,
          ).map((ranked) => ({ ...ranked.item, rank: ranked.rank, isTied: ranked.isTied }));

    return {
      seasonId: id,
      metric,
      rankingRule: 'standard-competition',
      rows: ordered,
      totalPlayers: rows.length,
      // Only weeklies that have actually been played contribute points; a
      // season with scheduled weeks ahead of it must not claim them.
      weekliesCounted: season.weeklyIds.filter(
        (weeklyId) => fixtures.weeklies.get(weeklyId)?.status === 'completed',
      ).length,
    };
  }

  async listWeeklies(filter?: { seasonId?: SeasonId }): Promise<Weekly[]> {
    const fixtures = await this.load();
    const all = [...fixtures.weeklies.values()];
    const scoped = filter?.seasonId ? all.filter((w) => w.seasonId === filter.seasonId) : all;
    return scoped.sort(byStartAtDescending);
  }

  async getWeekly(id: WeeklyId): Promise<Weekly | null> {
    return (await this.load()).weeklies.get(id) ?? null;
  }

  /** SERVER-SIDE LATER: GET /weeklies/{id}/results */
  async getWeeklyResults(id: WeeklyId): Promise<WeeklyResults | null> {
    const fixtures = await this.load();
    const weekly = fixtures.weeklies.get(id);
    if (!weekly) {
      return null;
    }

    const entries = fixtures.entriesByWeekly.get(id) ?? [];
    const placed = entries
      .filter((entry) => entry.placement !== null)
      .sort((a, b) => (a.placement ?? 0) - (b.placement ?? 0));

    const perPlacement = new Map<number, number>();
    for (const entry of placed) {
      perPlacement.set(entry.placement!, (perPlacement.get(entry.placement!) ?? 0) + 1);
    }

    const standings: WeeklyStanding[] = placed.map((entry) => ({
      placement: entry.placement!,
      isTied: (perPlacement.get(entry.placement!) ?? 0) > 1,
      player: this.refFor(fixtures, entry.playerId, entry.enteredAs),
      points: entry.points,
      enteredAs: entry.enteredAs,
    }));

    return {
      weekly,
      standings,
      didNotPlay: entries
        .filter((entry) => !entry.played)
        .map((entry) => this.refFor(fixtures, entry.playerId, entry.enteredAs)),
    };
  }

  private refFor(fixtures: Fixtures, id: PlayerId, fallback: string) {
    return { id, gamertag: fixtures.players.get(id)?.gamertag ?? fallback };
  }

  /** SERVER-SIDE LATER: GET /players?q= */
  async searchPlayers(query?: string): Promise<PlayerSearchHit[]> {
    const fixtures = await this.load();
    const all = [...fixtures.players.values()];
    const needle = query?.trim().toLowerCase();

    if (!needle) {
      return all
        .sort(
          (a, b) =>
            b.attendance.played - a.attendance.played || a.gamertag.localeCompare(b.gamertag),
        )
        .map((player) => ({
          player,
          matchedOn: 'gamertag' as const,
          matchedText: player.gamertag,
        }));
    }

    const hits: PlayerSearchHit[] = [];
    for (const player of all) {
      if (player.gamertag.toLowerCase().includes(needle)) {
        hits.push({ player, matchedOn: 'gamertag', matchedText: player.gamertag });
        continue;
      }
      // A former tag must still find the player — and must not merge them with
      // whoever holds that tag now. Metabyte (was "Probase") vs Probaze.
      const alias = player.aliases.find((a) => a.toLowerCase().includes(needle));
      if (alias) {
        hits.push({ player, matchedOn: 'alias', matchedText: alias });
      }
    }
    return hits.sort((a, b) => b.player.attendance.played - a.player.attendance.played);
  }

  async getPlayer(id: PlayerId): Promise<Player | null> {
    return (await this.load()).players.get(id) ?? null;
  }

  async getPlayerStats(id: PlayerId): Promise<PlayerStats | null> {
    return (await this.load()).stats.get(id) ?? null;
  }

  /** SERVER-SIDE LATER: GET /players/{id}/profile */
  async getPlayerProfile(id: PlayerId): Promise<PlayerProfile | null> {
    const fixtures = await this.load();
    if (!fixtures.players.has(id)) {
      return null;
    }

    const history: PlayerHistoryRow[] = (fixtures.entriesByPlayer.get(id) ?? [])
      .flatMap((entry) => {
        const weekly = fixtures.weeklies.get(entry.weeklyId);
        return weekly ? [{ entry, weekly }] : [];
      })
      .sort((a, b) => byStartAtDescending(a.weekly, b.weekly));

    const seasons: PlayerSeasonSummary[] = fixtures.seasons.flatMap((season) => {
      const row = fixtures.leaderboards.get(season.id)?.find((r) => r.player.id === id);
      if (!row) {
        return [];
      }
      return [
        {
          seasonName: season.name,
          points: row.points,
          entered: row.entered,
          played: row.played,
          rank: row.rank,
        },
      ];
    });

    const teams: PlayerTeamSpell[] = (this.memberships ?? [])
      .filter((m) => m.playerId === id)
      .flatMap((m) => {
        const team = fixtures.teams.find((t) => t.id === m.teamId);
        if (!team) {
          return [];
        }
        return [
          {
            team: { id: team.id, name: team.name, tag: team.tag },
            joinedAt: m.joinedAt,
            leftAt: m.leftAt,
            current: m.leftAt === null,
          },
        ];
      });

    return { history, seasons, teams };
  }

  async listTeams(): Promise<Team[]> {
    return [...(await this.load()).teams];
  }

  async getTeam(id: TeamId): Promise<TeamDetail | null> {
    const fixtures = await this.load();
    const team = fixtures.teams.find((t) => t.id === id);
    if (!team) {
      return null;
    }
    const roster = (this.memberships ?? [])
      .filter((m) => m.teamId === id)
      .map((m) => ({
        player: this.refFor(fixtures, m.playerId, m.playerId),
        joinedAt: m.joinedAt,
        leftAt: m.leftAt,
        current: m.leftAt === null,
      }))
      .sort(
        (a, b) =>
          Number(b.current) - Number(a.current) ||
          a.player.gamertag.localeCompare(b.player.gamertag),
      );

    return { team, roster };
  }

  /**
   * SERVER-SIDE LATER: GET /teams/standings?season=
   *
   * The load-bearing rule: a weekly's points count for a team only if the
   * player was a member when it happened. Without the window, a mid-season
   * transfer would retroactively rewrite both teams' history.
   */
  async getTeamStandings(seasonId: SeasonId): Promise<TeamStandings> {
    const fixtures = await this.load();
    const memberships = this.memberships ?? [];

    const standings = fixtures.teams.map((team) => {
      const contributions = new Map<PlayerId, TeamContribution>();

      for (const membership of memberships.filter((m) => m.teamId === team.id)) {
        for (const entry of fixtures.entriesByPlayer.get(membership.playerId) ?? []) {
          if (entry.seasonId !== seasonId) {
            continue;
          }
          const weekly = fixtures.weeklies.get(entry.weeklyId);
          if (!weekly || !isMemberAt(membership, weekly.startAt)) {
            continue;
          }
          const existing = contributions.get(membership.playerId);
          contributions.set(membership.playerId, {
            player: this.refFor(fixtures, membership.playerId, membership.playerId),
            points: (existing?.points ?? 0) + entry.points,
            weekliesCounted: (existing?.weekliesCounted ?? 0) + 1,
          });
        }
      }

      const contributors = [...contributions.values()].sort((a, b) => b.points - a.points);
      return {
        team: { id: team.id, name: team.name, tag: team.tag },
        points: contributors.reduce((sum, c) => sum + c.points, 0),
        currentMemberCount: memberships.filter((m) => m.teamId === team.id && m.leftAt === null)
          .length,
        contributors,
      };
    });

    const ranked = rankWithTies(
      standings.sort((a, b) => b.points - a.points),
      (row) => row.points,
    );

    const rows: TeamStanding[] = ranked.map((r) => ({
      rank: r.rank,
      isTied: r.isTied,
      ...r.item,
    }));

    return { seasonId, rows };
  }

  async addTeamMember(teamId: TeamId, playerId: PlayerId, joinedAt: string): Promise<void> {
    await this.load();
    this.memberships?.push({ teamId, playerId, joinedAt, leftAt: null });
  }

  async endTeamMembership(teamId: TeamId, playerId: PlayerId, leftAt: string): Promise<void> {
    await this.load();
    const open = this.memberships?.find(
      (m) => m.teamId === teamId && m.playerId === playerId && m.leftAt === null,
    );
    if (open) {
      this.memberships = this.memberships?.map((m) => (m === open ? { ...m, leftAt } : m));
    }
  }

  /**
   * Demo-only: the real merge rewrites entries and re-runs points. Here it just
   * folds the absorbed player's tag into the survivor's aliases so the admin
   * screen has honest feedback.
   */
  async mergePlayers(keep: PlayerId, absorb: PlayerId): Promise<void> {
    const fixtures = await this.load();
    const survivor = fixtures.players.get(keep);
    const absorbed = fixtures.players.get(absorb);
    if (!survivor || !absorbed) {
      return;
    }
    const merged: Player = {
      ...survivor,
      aliases: [...new Set([...survivor.aliases, absorbed.gamertag, ...absorbed.aliases])],
      attendance: {
        entered: survivor.attendance.entered + absorbed.attendance.entered,
        played: survivor.attendance.played + absorbed.attendance.played,
      },
    };
    (fixtures.players as Map<PlayerId, Player>).set(keep, merged);
    (fixtures.players as Map<PlayerId, Player>).delete(absorb);
  }
}
