import { pointsForPlacement, rankWithTies } from '@core/domain';
import { toEntry, toPlayer, toPointsTable, toLeaderboardRows } from './mappers';
import { RawEntry, RawLeaderboardRow, RawPlayer } from './dto';

/** Also proves tsconfig path aliases resolve under the unit-test builder. */
describe('mappers', () => {
  it('collapses external_refs to a single profile URL for a linked player', () => {
    const raw: RawPlayer = {
      id: 'p_16cd44f2e716',
      gamertag: 'Metabyte',
      linked: true,
      aliases: ['Probase'],
      events_entered: 24,
      events_played: 24,
      external_refs: { startgg_user_slug: 'user/02276a07', startgg_user_id: '475142' },
    };
    const player = toPlayer(raw);
    expect(player.origin).toBe('startgg');
    expect(player.startggProfileUrl).toBe('https://start.gg/user/02276a07');
    expect(player.aliases).toEqual(['Probase']);
  });

  it('gives a walk-in no profile URL', () => {
    const raw: RawPlayer = {
      id: 'p_2719abe0aaad',
      gamertag: 'AT',
      linked: false,
      events_entered: 2,
      events_played: 2,
      external_refs: { startgg_player_id: '5343077' },
    };
    const player = toPlayer(raw);
    expect(player.origin).toBe('walk-in');
    expect(player.startggProfileUrl).toBeNull();
  });

  it('strips the self-declared sponsor prefix from an entrant name', () => {
    const raw: RawEntry = {
      player_id: 'p_16cd44f2e716',
      event_id: '1605184',
      season_id: 'season-2',
      placement: null,
      points: 0,
      played: false,
      entrant_name: 'NMY | Metabyte',
    };
    const entry = toEntry(raw);
    expect(entry.enteredAs).toBe('Metabyte');
    // The invariant that makes "registered, did not play" renderable.
    expect(entry.placement).toBeNull();
    expect(entry.played).toBe(false);
  });

  it('expands the points table from range starts to real ranges', () => {
    const table = toPointsTable(
      { '1': 25, '13+': 0, '2': 18, '3': 15, '4': 12, '5': 10, '7': 6, '9': 2 },
      'v1',
    );
    expect(table.rows.map((r) => r.label)).toEqual([
      '1',
      '2',
      '3',
      '4',
      '5-6',
      '7-8',
      '9-12',
      '13+',
    ]);
    // '9' covers 9th through 12th — a fact no caller should have to know.
    expect(pointsForPlacement(table, 11)).toBe(2);
    expect(pointsForPlacement(table, 6)).toBe(10);
    expect(pointsForPlacement(table, 40)).toBe(0);
  });

  it('marks shared ranks as tied', () => {
    const rows: RawLeaderboardRow[] = [
      { player_id: 'p_a', gamertag: 'Sin', rank: 1, points: 43, entered: 2, played: 2 },
      { player_id: 'p_b', gamertag: 'Malekith', rank: 2, points: 25, entered: 2, played: 2 },
      { player_id: 'p_c', gamertag: 'ILIAS', rank: 2, points: 25, entered: 1, played: 1 },
      { player_id: 'p_d', gamertag: 'faccboi', rank: 4, points: 20, entered: 2, played: 2 },
    ];
    const mapped = toLeaderboardRows(rows);
    expect(mapped.map((r) => r.isTied)).toEqual([false, true, true, false]);
  });
});

describe('rankWithTies', () => {
  it('uses standard competition ranking, not dense', () => {
    const ranked = rankWithTies([9, 7, 7, 7, 4], (n) => n);
    expect(ranked.map((r) => r.rank)).toEqual([1, 2, 2, 2, 5]);
    expect(ranked.map((r) => r.isTied)).toEqual([false, true, true, true, false]);
  });
});
