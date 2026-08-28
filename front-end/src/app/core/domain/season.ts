import { SeasonId, WeeklyId } from './ids';

export interface Season {
  readonly id: SeasonId;
  readonly name: string;
  readonly startAt: string;
  readonly endAt: string;
  readonly scoring: boolean;
  /** Present on preseason and season-2; worth surfacing, it explains a judgement call. */
  readonly note: string | null;
  /**
   * In week order, straight from `seasons.event_ids`.
   *
   * This array order carries real information: season 2's ids are neither in
   * numeric order nor in the order they appear in events.json, because the
   * season is split across two venues and interleaved. Never re-sort it, and
   * never derive week order from `week_number` — see Weekly.weekNumber.
   */
  readonly weeklyIds: readonly WeeklyId[];
}
