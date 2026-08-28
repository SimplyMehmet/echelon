import { PlayerId } from './ids';

/**
 * `gamertag` is display only and must never be used as a key: Metabyte was
 * formerly "Probase" while a different human is "Probaze". Eight players in
 * this dataset have changed tag.
 */
export interface Player {
  readonly id: PlayerId;
  readonly gamertag: string;
  readonly aliases: readonly string[];
  readonly origin: PlayerOrigin;
  /** All-time, across every event — not season-scoped. */
  readonly attendance: PlayerAttendance;
  readonly startggProfileUrl: string | null;
}

/** 21 of 169 are walk-ins the TO added by name only; they have no online profile. */
export type PlayerOrigin = 'startgg' | 'walk-in';

export interface PlayerAttendance {
  readonly entered: number;
  readonly played: number;
}

/** Denormalised player reference, exactly as a leaderboard endpoint would return one. */
export interface PlayerRef {
  readonly id: PlayerId;
  readonly gamertag: string;
}

/** Search must disambiguate: "probas" matches both Metabyte (via alias) and Probaze. */
export interface PlayerSearchHit {
  readonly player: Player;
  readonly matchedOn: 'gamertag' | 'alias';
  readonly matchedText: string;
}
