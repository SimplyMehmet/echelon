import { Weekly, WeeklyId, isUpcoming, weeklyId } from './index';

/**
 * The predicate exists because start.gg event state goes stale: this dataset
 * carries an ACTIVE event from March 2026 that would otherwise still advertise
 * itself as upcoming.
 */
describe('isUpcoming', () => {
  const NOW = '2026-08-28T12:00:00Z';

  const weekly = (id: string, status: Weekly['status'], startAt: string): Weekly => ({
    id: weeklyId(id) as WeeklyId,
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
