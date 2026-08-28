/**
 * Standard competition ranking: 1, 2, 2, 4 — never dense (1, 2, 2, 3).
 * Verified against the scraped leaderboards, where season 2's five players on
 * rank 22 are followed by rank 27.
 */
export interface Ranked<T> {
  readonly rank: number;
  readonly isTied: boolean;
  readonly item: T;
}

export function rankWithTies<T>(items: readonly T[], scoreOf: (item: T) => number): Ranked<T>[] {
  const counts = new Map<number, number>();
  const ranks: number[] = [];

  items.forEach((item, index) => {
    const score = scoreOf(item);
    const previous = index > 0 ? scoreOf(items[index - 1]!) : null;
    const rank = previous !== null && score === previous ? ranks[index - 1]! : index + 1;
    ranks.push(rank);
    counts.set(rank, (counts.get(rank) ?? 0) + 1);
  });

  return items.map((item, index) => ({
    rank: ranks[index]!,
    isTied: (counts.get(ranks[index]!) ?? 0) > 1,
    item,
  }));
}

/** Newest first. Weeklies interleave across seasons, so never order by week number. */
export const byStartAtDescending = <T extends { startAt: string }>(a: T, b: T): number =>
  b.startAt.localeCompare(a.startAt);

/** Soonest first. A schedule reads forwards; a history reads backwards. */
export const byStartAtAscending = <T extends { startAt: string }>(a: T, b: T): number =>
  a.startAt.localeCompare(b.startAt);
