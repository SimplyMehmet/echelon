import { Weekly, isUpcoming, upcomingWeeklies, weeklyId } from './index';

/**
 * The predicate exists because start.gg event state goes stale: this dataset
 * carries an ACTIVE event from March 2026 that would otherwise still advertise
 * itself as upcoming.
 */
describe('isUpcoming', () => {
  const NOW = '2026-08-28T12:00:00Z';

  const weekly = (id: string, status: Weekly['status'], startAt: string): Weekly => ({
    id: weeklyId(id),
    name: id,
    startAt,
    status,
    scoring: true,
    seasonId: null,
    weekNumber: null,
    venue: { label: 'WORM', city: 'Rotterdam', countryCode: 'NL' },
    entrantCount: 0,
    playedCount: 0,
  });

  it('counts an unstarted weekly dated in the future', () => {
    expect(isUpcoming(weekly('sched_s3w3', 'upcoming', '2026-08-30T11:00:00Z'), NOW)).toBe(true);
  });

  it('rejects an unstarted weekly whose date has passed', () => {
    // The real case: event 1553665 is CREATED but dated 31 March.
    expect(isUpcoming(weekly('1553665', 'upcoming', '2026-03-31T14:00:00Z'), NOW)).toBe(false);
  });

  it('rejects a stale ACTIVE weekly from months ago', () => {
    // Event 1566794 — 49 entrants, played in March, still marked live upstream.
    expect(isUpcoming(weekly('1566794', 'live', '2026-03-10T18:00:00Z'), NOW)).toBe(false);
  });

  it('rejects anything completed, whatever its date', () => {
    expect(isUpcoming(weekly('1689341', 'completed', '2026-09-13T11:00:00Z'), NOW)).toBe(false);
  });
});

describe('upcomingWeeklies', () => {
  const NOW = '2026-08-28T12:00:00Z';

  const at = (id: string, status: Weekly['status'], startAt: string): Weekly => ({
    id: weeklyId(id),
    name: id,
    startAt,
    status,
    scoring: true,
    seasonId: null,
    weekNumber: null,
    venue: { label: 'WORM', city: 'Rotterdam', countryCode: 'NL' },
    entrantCount: 0,
    playedCount: 0,
  });

  const sept13 = at('sept13', 'upcoming', '2026-09-13T11:00:00Z');
  const aug30 = at('aug30', 'upcoming', '2026-08-30T11:00:00Z');
  const sept6 = at('sept6', 'upcoming', '2026-09-06T11:00:00Z');
  const staleMarch = at('1566794', 'live', '2026-03-10T18:00:00Z');
  const played = at('1689341', 'completed', '2026-08-23T11:00:00Z');

  it('orders soonest first — the opposite of listWeeklies()', () => {
    expect(upcomingWeeklies([sept13, aug30, sept6], NOW).map((w) => w.id)).toEqual([
      'aug30',
      'sept6',
      'sept13',
    ]);
  });

  it('does not reorder its input', () => {
    const input = [sept13, aug30, sept6];
    upcomingWeeklies(input, NOW);
    expect(input.map((w) => w.id)).toEqual(['sept13', 'aug30', 'sept6']);
  });

  it('partitions: every weekly is upcoming or past, never both, never neither', () => {
    const all = [staleMarch, played, aug30, sept6];
    const upcoming = upcomingWeeklies(all, NOW).length;
    const past = all.filter((w) => !isUpcoming(w, NOW)).length;
    expect(upcoming + past).toBe(all.length);
  });

  it('treats a weekly starting exactly now as begun, not upcoming', () => {
    expect(isUpcoming(at('x', 'upcoming', NOW), NOW)).toBe(false);
  });
});
