/**
 * Branded id types.
 *
 * The fixtures contain four string-shaped id namespaces and three of them are
 * numeric strings that look identical (`event.id`, `event.tournament_id`).
 * `getWeekly(tournamentId)` type-checks fine with plain strings and returns
 * nothing at runtime. Branding costs zero bytes and confines the cast to the
 * mappers plus route-param reads.
 *
 * start.gg ids never appear here — see the cardinal rule in the README.
 */
declare const brand: unique symbol;
type Branded<T extends string> = string & { readonly [brand]: T };

export type PlayerId = Branded<'PlayerId'>;
export type WeeklyId = Branded<'WeeklyId'>;
export type SeasonId = Branded<'SeasonId'>;
export type TeamId = Branded<'TeamId'>;

export const playerId = (raw: string): PlayerId => raw as PlayerId;
export const weeklyId = (raw: string): WeeklyId => raw as WeeklyId;
export const seasonId = (raw: string): SeasonId => raw as SeasonId;
export const teamId = (raw: string): TeamId => raw as TeamId;
