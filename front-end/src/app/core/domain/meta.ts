/**
 * Provenance for the whole dataset. The caveats are not boilerplate — the
 * points table was reverse-engineered and has never been published by Levels,
 * so the honesty is part of the product.
 */
export interface ScoringMeta {
  readonly generatedAt: string;
  readonly source: string;
  readonly scope: string;
  readonly scoringRule: string;
  readonly statsScope: string;
  readonly caveats: readonly string[];
  readonly counts: DatasetCounts;
  readonly pointsTable: PointsTable;
}

export interface DatasetCounts {
  readonly entries: number;
  readonly events: number;
  readonly players: number;
  readonly playersLinked: number;
  readonly playersUnlinked: number;
  readonly scoringEvents: number;
  readonly seasons: number;
  readonly tournaments: number;
}

export interface PointsTable {
  /** Ordered by placement ascending, open-ended row last. */
  readonly rows: readonly PointsTableRow[];
  /** Stamped from the dataset's generatedAt — which rule produced a score. */
  readonly version: string;
}

export interface PointsTableRow {
  /** '1', '5-6', '13+'. */
  readonly label: string;
  readonly fromPlacement: number;
  /** Null means open-ended. */
  readonly toPlacement: number | null;
  readonly points: number;
}

export function pointsForPlacement(table: PointsTable, placement: number): number {
  for (const row of table.rows) {
    const withinLower = placement >= row.fromPlacement;
    const withinUpper = row.toPlacement === null || placement <= row.toPlacement;
    if (withinLower && withinUpper) {
      return row.points;
    }
  }
  return 0;
}
