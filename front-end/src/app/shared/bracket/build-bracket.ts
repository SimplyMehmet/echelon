import { GetEventSetsResponse } from '@app/api/responses/event';
import { BracketsManager } from 'brackets-manager';
import { InMemoryDatabase } from 'brackets-memory-db';
import { Match, Participant, Stage, Status } from 'brackets-model';

/** The data brackets-viewer needs to draw a stage. */
export type BracketData = {
  stages: Stage[];
  matches: Match[];
  matchGames: [];
  participants: Participant[];
  /** Round names from start.gg, keyed by `<group number>-<round number>`. */
  roundNames: Map<string, string>;
  /** IDs of the matches whose set is or was on stream. */
  onStream: Set<number>;
};

type Slot = GetEventSetsResponse | null;

const groupKey = (group: number, round: number) => `${group}-${round}`;
const isGrandFinal = (set: GetEventSetsResponse) => /grand final/i.test(set.name);
const isReset = (set: GetEventSetsResponse) => /reset/i.test(set.name);

/** Groups sets by round number into a list of `count` rounds. */
function byRound(
  sets: GetEventSetsResponse[],
  count: number,
  offset = 0,
): GetEventSetsResponse[][] {
  const rounds = Array.from({ length: count }, () => [] as GetEventSetsResponse[]);
  for (const set of sets) rounds[Math.abs(set.round) - 1 - offset]?.push(set);
  return rounds;
}

/**
 * Puts each set in its position within the bracket. start.gg doesn't tell us
 * the positions, so they're worked out from the last round backwards: the set
 * a player won in the previous round is the one that feeds into their match.
 *
 * `feeders(round, index)` gives the indexes of the matches in the previous
 * round that feed into a match: one per player, or a single one when the other
 * player drops down from the winners bracket.
 */
function place(
  rounds: GetEventSetsResponse[][],
  counts: number[],
  feeders: (round: number, index: number) => number[],
): Slot[][] {
  const placed: Slot[][] = counts.map((count) => Array<Slot>(count).fill(null));
  const last = rounds.length - 1;
  rounds[last].slice(0, counts[last]).forEach((set, i) => (placed[last][i] = set));

  for (let round = last; round > 0; round--) {
    const pool = [...rounds[round - 1]];
    placed[round].forEach((set, index) => {
      if (!set) return;
      const slots = feeders(round, index);
      set.players.forEach((player, k) => {
        // A losers bracket match has one player from the previous losers
        // round and one from the winners bracket, and we don't know which.
        const target = slots.length === 1 ? slots[0] : slots[k];
        if (target === undefined || placed[round - 1][target]) return;
        const found = pool.findIndex((s) => s.players.some((p) => p.name === player.name));
        if (found >= 0) placed[round - 1][target] = pool.splice(found, 1)[0];
      });
    });
    // Sets we couldn't link (e.g. the next round hasn't been filled in yet).
    // The API returns sets in random order, so sort them to keep the bracket
    // the same between page loads.
    for (const set of pool.sort((a, b) => a.id.localeCompare(b.id))) {
      const free = placed[round - 1].indexOf(null);
      if (free >= 0) placed[round - 1][free] = set;
    }
  }
  return placed;
}

function toOpponent(
  player: GetEventSetsResponse['players'][number] | undefined,
  ids: Map<string, number>,
  set: GetEventSetsResponse,
  winner: string | undefined,
) {
  if (!player) return { id: null };
  const completed = !!set.completedAt;
  return {
    id: ids.get(player.name) ?? null,
    score: set.startedAt || completed ? player.score : undefined,
    result: completed && winner ? (player.name === winner ? 'win' : 'loss') : undefined,
  } as const;
}

function statusOf(set: GetEventSetsResponse): Status {
  if (set.completedAt) return Status.Completed;
  if (set.startedAt) return Status.Running;
  return set.players.length === 2 ? Status.Ready : Status.Waiting;
}

/**
 * Builds a single or double elimination bracket from start.gg sets. Returns
 * null when the sets don't fit an elimination bracket, so the caller can list
 * them instead.
 */
export async function buildBracket(
  name: string,
  entrants: number,
  apiSets: GetEventSetsResponse[],
): Promise<BracketData | null> {
  if (apiSets.length === 0) return null;
  const sets = apiSets.map((s) => ({ ...s, players: [...s.players] }));

  const doubleElimination = sets.some((s) => s.round < 0);
  const finals = doubleElimination ? sets.filter((s) => s.round > 0 && isGrandFinal(s)) : [];
  const winnerSets = sets.filter((s) => s.round > 0 && !finals.includes(s));
  const loserSets = sets.filter((s) => s.round < 0);
  const players = new Set(sets.flatMap((s) => s.players.map((p) => p.name)));

  // Later rounds may not have sets yet, so size the bracket by player count.
  const winnersCount = Math.max(
    ...winnerSets.map((s) => s.round),
    Math.ceil(Math.log2(Math.max(entrants, players.size, 2))),
  );
  const size = 2 ** winnersCount;
  const losersCount = doubleElimination ? 2 * (winnersCount - 1) : 0;
  const deepestLosers = Math.max(0, ...loserSets.map((s) => -s.round));
  if (winnerSets.length === 0 || players.size > size) return null;

  const winners = byRound(winnerSets, winnersCount);
  // If start.gg numbered the losers rounds differently, line them up with the
  // losers final.
  const losers = byRound(loserSets, losersCount, Math.max(0, deepestLosers - losersCount));

  // Winners bracket: each match is fed by two matches of the previous round.
  const winnersPlaced = place(
    winners,
    winners.map((_, r) => size / 2 ** (r + 1)),
    (_, i) => [2 * i, 2 * i + 1],
  );

  // Losers bracket: rounds alternate between matches fed by two losers
  // matches (odd rounds) and matches against a player dropping down from the
  // winners bracket (even rounds).
  const losersCounts = losers.map((_, r) => size / 2 ** (Math.floor(r / 2) + 2));
  const losersPlaced =
    losersCount > 0
      ? place(losers, losersCounts, (round, i) =>
          (round + 1) % 2 === 0 ? [i] : [2 * i, 2 * i + 1],
        )
      : [];

  // Seed the first round as it was played, including byes, so brackets-manager
  // works out where byes go in the rest of the bracket.
  const seeding: (string | null)[] = [];
  winnersPlaced[0].forEach((set, i) => {
    if (set) {
      seeding.push(set.players[0]?.name ?? null, set.players[1]?.name ?? null);
      return;
    }
    const next = winnersPlaced[1]?.[Math.floor(i / 2)];
    const bye = next?.players[i % 2]?.name ?? null;
    seeding.push(bye, null);
  });

  const hasReset = finals.some(isReset);
  const storage = new InMemoryDatabase();
  const manager = new BracketsManager(storage);
  await manager.create.stage({
    tournamentId: 0,
    name,
    type: doubleElimination ? 'double_elimination' : 'single_elimination',
    seeding,
    settings: {
      size,
      seedOrdering: ['natural'],
      balanceByes: false,
      grandFinal: hasReset ? 'double' : 'simple',
    },
  });

  // Add players who weren't in the first round (shouldn't happen, but start.gg
  // data can be incomplete).
  const ids = new Map<string, number>();
  for (const p of (await storage.select<Participant>('participant')) ?? [])
    ids.set(p.name, Number(p.id));
  for (const set of sets) {
    for (const player of set.players) {
      if (!ids.has(player.name)) {
        const id = await storage.insert<Participant>('participant', {
          tournament_id: 0,
          name: player.name,
        });
        ids.set(player.name, id as number);
      }
    }
  }

  const data = await manager.get.stageData(0);
  const groupNumber = new Map(data.group.map((g) => [g.id, g.number]));
  const roundNumber = new Map(data.round.map((r) => [r.id, r.number]));
  const roundNames = new Map<string, string>();
  const onStream = new Set<number>();

  const finalsPlaced: Slot[][] = [
    finals.filter((s) => !isReset(s)).slice(0, 1),
    finals.filter(isReset).slice(0, 1),
  ];
  const placedByGroup: Record<number, Slot[][]> = {
    1: winnersPlaced,
    2: losersPlaced,
    3: finalsPlaced,
  };

  for (const match of data.match) {
    const group = groupNumber.get(match.group_id) ?? 0;
    const round = roundNumber.get(match.round_id) ?? 0;
    const set = placedByGroup[group]?.[round - 1]?.[match.number - 1];
    if (!set) {
      // brackets-manager drops winners bracket losers into different losers
      // bracket slots than start.gg, so it doesn't always know which slots
      // are byes. A match without a set whose next match has already started
      // can only have been a bye.
      const index = match.number - 1;
      const next = group === 1 || round % 2 === 0 ? Math.floor(index / 2) : index;
      const child = group === 3 ? null : placedByGroup[group]?.[round]?.[next];
      if (child?.startedAt || child?.completedAt) {
        await storage.update<Match>('match', Number(match.id), {
          ...match,
          opponent1: null,
          opponent2: null,
        });
      }
      continue;
    }
    roundNames.set(groupKey(group, round), set.name);
    if (set.onStream) onStream.add(Number(match.id));

    const [a, b] = set.players;
    let winner: string | undefined;
    if (set.completedAt && a && b && a.score !== b.score)
      winner = a.score > b.score ? a.name : b.name;
    const updated: Match = {
      ...match,
      status: statusOf(set),
      opponent1: toOpponent(a, ids, set, winner),
      opponent2: toOpponent(b, ids, set, winner),
    };
    await storage.update<Match>('match', Number(match.id), updated);
  }

  const result = await manager.get.stageData(0);
  return {
    stages: result.stage,
    matches: result.match,
    matchGames: [],
    participants: result.participant,
    roundNames,
    onStream,
  };
}

export { groupKey };
