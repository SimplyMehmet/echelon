import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  PLATFORM_ID,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { GetEventResponse, GetEventSetsResponse } from '@app/api/responses/event';

/** The parts of brackets-viewer's API used here (its own types pull in SCSS). */
type BracketsViewer = {
  render(
    data: object,
    config: {
      selector: string;
      clear: boolean;
      customRoundName: (info: { groupType: string; roundNumber: number }) => string | undefined;
    },
  ): Promise<void>;
};

const GROUP_NUMBER: Record<string, number> = {
  'single-bracket': 1,
  'winner-bracket': 1,
  'loser-bracket': 2,
  'final-group': 3,
};

let nextId = 0;

@Component({
  selector: 'app-bracket',
  styleUrl: './bracket.css',
  templateUrl: './bracket.html',
  // brackets-viewer creates its HTML outside Angular, so scoped styles can't
  // reach it. Every rule in bracket.css starts with `app-bracket` instead.
  encapsulation: ViewEncapsulation.None,
})
export class Bracket {
  public event = input.required<GetEventResponse>();

  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private bracketElement = viewChild<ElementRef<HTMLElement>>('bracket');
  public elementId = `bracket-${nextId++}`;

  public sets = computed(() => this.event().sets ?? []);

  /** Whether the bracket was drawn; unavailable shows the sets as a list instead. */
  public status = signal<'loading' | 'shown' | 'unavailable'>('loading');

  /** Players in the drawn bracket, for the player search. */
  public players = signal<{ id: number; name: string }[]>([]);
  public query = signal('');

  /** The player matching the search: an exact name, or the only partial match. */
  public foundPlayer = computed(() => {
    const query = this.query().trim().toLowerCase();
    if (!query) return null;
    const players = this.players();
    const exact = players.find((p) => p.name.toLowerCase() === query);
    if (exact) return exact;
    const partial = players.filter((p) => p.name.toLowerCase().includes(query));
    return partial.length === 1 ? partial[0] : null;
  });

  /** How many of the found player's matches are in the bracket. */
  public foundMatches = signal(0);

  /** Sets grouped by round, for when the bracket can't be drawn. */
  public rounds = computed(() => {
    const groups = new Map<string, GetEventSetsResponse[]>();
    const order = (s: GetEventSetsResponse) => (s.round > 0 ? s.round : 1000 - s.round);
    for (const set of [...this.sets()].sort((a, b) => order(a) - order(b))) {
      groups.set(set.name, [...(groups.get(set.name) ?? []), set]);
    }
    return [...groups.entries()].map(([name, sets]) => ({ name, sets }));
  });

  constructor() {
    effect(() => this.highlight(this.foundPlayer(), this.query().trim() !== ''));
    effect(() => {
      const event = this.event();
      const element = this.bracketElement();
      if (element) void this.render(event, element.nativeElement);
    });
  }

  private async render(event: GetEventResponse, element: HTMLElement) {
    if (!this.isBrowser) return;
    this.status.set('loading');
    try {
      const { buildBracket, groupKey } = await import('./build-bracket');
      const data = await buildBracket(event.name, event.entrants, event.sets ?? []);
      if (!data) {
        this.status.set('unavailable');
        return;
      }

      // brackets-viewer is a browser-only script that registers itself on window.
      await import('brackets-viewer/dist/brackets-viewer.min.js');
      const viewer = (window as unknown as { bracketsViewer: BracketsViewer }).bracketsViewer;
      await viewer.render(data, {
        selector: `#${this.elementId}`,
        clear: true,
        customRoundName: (info) =>
          data.roundNames.get(groupKey(GROUP_NUMBER[info.groupType] ?? 0, info.roundNumber)),
      });
      for (const id of data.onStream) {
        element.querySelector(`.match[data-match-id="${id}"]`)?.classList.add('on-stream');
      }
      // start.gg doesn't show byes, so hide rounds that only contain byes.
      for (const round of element.querySelectorAll('.round')) {
        const matches = [...round.querySelectorAll<HTMLElement>('.match')];
        if (matches.every((m) => m.querySelector('.bye') || m.style.visibility === 'hidden')) {
          round.classList.add('bye-round');
        }
      }
      this.players.set(
        data.participants
          .map((p) => ({ id: Number(p.id), name: p.name }))
          .sort((a, b) => a.name.localeCompare(b.name)),
      );
      this.status.set('shown');
      this.highlight(this.foundPlayer(), this.query().trim() !== '');
    } catch (error) {
      console.error('Could not draw the bracket', error);
      this.status.set('unavailable');
    }
  }

  public onSearch(event: Event) {
    this.query.set((event.target as HTMLInputElement).value);
  }

  /** Fades out every match the found player didn't play in. */
  private highlight(player: { id: number } | null, searching: boolean) {
    const element = this.bracketElement()?.nativeElement;
    if (!element) return;
    element.classList.toggle('searching', searching);
    element.querySelectorAll('.found').forEach((el) => el.classList.remove('found'));
    if (!player) {
      this.foundMatches.set(0);
      return;
    }
    const rows = element.querySelectorAll(`.participant[data-participant-id="${player.id}"]`);
    const matches = new Set<Element>();
    rows.forEach((row) => {
      row.classList.add('found');
      const match = row.closest('.match');
      if (match) {
        match.classList.add('found');
        matches.add(match);
      }
    });
    this.foundMatches.set(matches.size);
    [...matches][0]?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  }
}
