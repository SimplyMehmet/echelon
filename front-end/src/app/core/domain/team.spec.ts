import { PlayerId, TeamId, TeamMembership, isMemberAt } from './index';

/**
 * The rule that stops a mid-season transfer from retroactively rewriting the
 * points a player earned for their previous team.
 */
describe('isMemberAt', () => {
  const spell = (joinedAt: string, leftAt: string | null): TeamMembership => ({
    teamId: 't_dnc' as TeamId,
    playerId: 'p_505c7e8656cc' as PlayerId,
    joinedAt,
    leftAt,
  });

  it('counts a weekly played inside the window', () => {
    expect(
      isMemberAt(spell('2025-12-01T00:00:00Z', '2026-05-15T00:00:00Z'), '2026-05-14T17:00:00Z'),
    ).toBe(true);
  });

  it('excludes a weekly played after the player left', () => {
    expect(
      isMemberAt(spell('2025-12-01T00:00:00Z', '2026-05-15T00:00:00Z'), '2026-05-19T17:00:00Z'),
    ).toBe(false);
  });

  it('excludes a weekly played before the player joined', () => {
    expect(isMemberAt(spell('2026-05-15T00:00:00Z', null), '2026-05-14T17:00:00Z')).toBe(false);
  });

  it('treats a null leftAt as still current', () => {
    expect(isMemberAt(spell('2026-05-15T00:00:00Z', null), '2026-05-28T17:00:00Z')).toBe(true);
  });
});
