import {
  Entry,
  LeaderboardRow,
  Player,
  PlayerRef,
  PlayerStats,
  PointsTable,
  PointsTableRow,
  ScoringMeta,
  Season,
  Team,
  TeamMembership,
  Venue,
  Weekly,
  WeeklyStatus,
  playerId,
  seasonId,
  teamId,
  weeklyId,
} from '@core/domain';
import {
  RawEntry,
  RawEvent,
  RawLeaderboardRow,
  RawMeta,
  RawPlayer,
  RawPlayerStats,
  RawSeason,
  RawTeam,
  RawTeamMembership,
  RawTournament,
} from './dto';

/**
 * Hand-written per type, never a reflective camelize(). A generic walker would
 * return `any`, would mangle the points table's '13+' key, and would rewrite
 * leaderboards.json's 'season-1' key to 'season1' — silently breaking every
 * lookup. It would also hide the mappings that actually matter: id branding,
 * start.gg enum translation, and external_refs collapsing to a single URL.
 *
 * Mirrors the backend's own explicit MapModelIntoStruct convention.
 */

export function toSeason(raw: RawSeason): Season {
  return {
    id: seasonId(raw.id),
    name: raw.name,
    startAt: raw.start_at,
    endAt: raw.end_at,
    scoring: raw.scoring,
    note: raw.note ?? null,
    // startgg_league_id is deliberately not carried across.
    weeklyIds: raw.event_ids.map(weeklyId),
  };
}

/** 'Levels Tekken League Season 2 @ DOX' -> 'DOX'. Falls back to the city. */
function toVenue(tournament: RawTournament | undefined, fallbackCity: string): Venue {
  if (!tournament) {
    return { label: fallbackCity, city: fallbackCity, countryCode: 'NL' };
  }
  const suffix = tournament.name.split('@').at(1)?.trim();
  return {
    label: suffix && suffix.length > 0 ? suffix : tournament.city,
    city: tournament.city,
    countryCode: tournament.country_code,
  };
}

/** 'COMPLETED' | 'ACTIVE' | 'CREATED' are start.gg's words, not ours. */
function toStatus(state: string): WeeklyStatus {
  switch (state) {
    case 'COMPLETED':
      return 'completed';
    case 'ACTIVE':
      return 'live';
    default:
      return 'upcoming';
  }
}

export function toWeekly(raw: RawEvent, tournaments: ReadonlyMap<string, RawTournament>): Weekly {
  return {
    id: weeklyId(raw.id),
    name: raw.name,
    startAt: raw.start_at,
    status: toStatus(raw.state),
    scoring: raw.scoring,
    seasonId: raw.season_id ? seasonId(raw.season_id) : null,
    weekNumber: raw.week_number ?? null,
    venue: toVenue(tournaments.get(raw.tournament_id), 'Rotterdam'),
    entrantCount: raw.num_entrants,
    playedCount: raw.num_standings,
  };
}

export function toPlayer(raw: RawPlayer): Player {
  const slug = raw.external_refs.startgg_user_slug;
  return {
    id: playerId(raw.id),
    gamertag: raw.gamertag,
    aliases: raw.aliases ?? [],
    origin: raw.linked ? 'startgg' : 'walk-in',
    attendance: { entered: raw.events_entered, played: raw.events_played },
    startggProfileUrl: slug ? `https://start.gg/${slug}` : null,
  };
}

export const toPlayerRef = (player: Player): PlayerRef => ({
  id: player.id,
  gamertag: player.gamertag,
});

/** 'NMY | Metabyte' -> 'Metabyte'. The prefix is a self-declared sponsor tag. */
function stripSponsorPrefix(entrantName: string): string {
  const parts = entrantName.split('|');
  return (parts.at(-1) ?? entrantName).trim();
}

export function toEntry(raw: RawEntry): Entry {
  return {
    playerId: playerId(raw.player_id),
    weeklyId: weeklyId(raw.event_id),
    seasonId: raw.season_id ? seasonId(raw.season_id) : null,
    placement: raw.placement,
    points: raw.points,
    played: raw.played,
    enteredAs: stripSponsorPrefix(raw.entrant_name),
  };
}

/**
 * The fixture carries the shared rank number but no tie marker, so isTied is
 * derived by counting rank occurrences across the whole board.
 */
export function toLeaderboardRows(raws: readonly RawLeaderboardRow[]): LeaderboardRow[] {
  const perRank = new Map<number, number>();
  for (const raw of raws) {
    perRank.set(raw.rank, (perRank.get(raw.rank) ?? 0) + 1);
  }
  return raws.map((raw) => ({
    rank: raw.rank,
    isTied: (perRank.get(raw.rank) ?? 0) > 1,
    player: { id: playerId(raw.player_id), gamertag: raw.gamertag },
    points: raw.points,
    entered: raw.entered,
    played: raw.played,
  }));
}

export function toPlayerStats(raw: RawPlayerStats): PlayerStats {
  return {
    playerId: playerId(raw.player_id),
    eventsEntered: raw.events_entered,
    eventsPlayed: raw.events_played,
    totalPoints: raw.total_points,
    bestPlacement: raw.best_placement,
    avgPlacement: raw.avg_placement,
    setsWon: raw.sets_won,
    setsLost: raw.sets_lost,
    setWinRate: raw.set_winrate,
    gamesWon: raw.games_won,
    gamesLost: raw.games_lost,
    gameWinRate: raw.game_winrate,
    dqs: raw.dqs,
  };
}

export const toTeam = (raw: RawTeam): Team => ({
  id: teamId(raw.id),
  seasonId: seasonId(raw.season_id),
  name: raw.name,
  tag: raw.tag,
  foundedAt: raw.founded_at,
});

export const toTeamMembership = (raw: RawTeamMembership): TeamMembership => ({
  teamId: teamId(raw.team_id),
  playerId: playerId(raw.player_id),
  joinedAt: raw.joined_at,
  leftAt: raw.left_at,
});

/**
 * The table's keys are range starts, not placements: '5' covers 5th-6th, '7'
 * covers 7th-8th, '9' covers 9th-12th, '13+' is open-ended. Expanded once here
 * so no caller has to know that.
 *
 * Key order is sorted explicitly rather than trusting Object.entries — the raw
 * JSON literally lists '13+' second.
 */
export function toPointsTable(raw: Readonly<Record<string, number>>, version: string): PointsTable {
  const parsed = Object.entries(raw)
    .map(([label, points]) => ({ label, points, from: Number.parseInt(label, 10) }))
    .filter((entry) => Number.isFinite(entry.from))
    .sort((a, b) => a.from - b.from);

  const rows: PointsTableRow[] = parsed.map((entry, index) => {
    const next = parsed[index + 1];
    const openEnded = entry.label.endsWith('+') || next === undefined;
    const toPlacement = openEnded ? null : next.from - 1;
    const label =
      toPlacement === null
        ? `${entry.from}+`
        : toPlacement === entry.from
          ? `${entry.from}`
          : `${entry.from}-${toPlacement}`;
    return { label, fromPlacement: entry.from, toPlacement, points: entry.points };
  });

  return { rows, version };
}

export function toScoringMeta(raw: RawMeta): ScoringMeta {
  return {
    generatedAt: raw.generated_at,
    source: raw.source,
    scope: raw.scope,
    scoringRule: raw.scoring_rule,
    statsScope: raw.stats_scope,
    caveats: raw.caveats,
    counts: {
      entries: raw.counts.entries,
      events: raw.counts.events,
      players: raw.counts.players,
      playersLinked: raw.counts.players_linked,
      playersUnlinked: raw.counts.players_unlinked,
      scoringEvents: raw.counts.scoring_events,
      seasons: raw.counts.seasons,
      tournaments: raw.counts.tournaments,
    },
    pointsTable: toPointsTable(raw.points_table, raw.generated_at),
  };
}
