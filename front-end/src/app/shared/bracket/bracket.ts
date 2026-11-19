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
      // start.gg doesn't show byes, so hide rounds that only contain byes.
      for (const round of element.querySelectorAll('.round')) {
        const matches = [...round.querySelectorAll<HTMLElement>('.match')];
        if (matches.every((m) => m.querySelector('.bye') || m.style.visibility === 'hidden')) {
          round.classList.add('bye-round');
        }
      }
      this.status.set('shown');
    } catch (error) {
      console.error('Could not draw the bracket', error);
      this.status.set('unavailable');
    }
  }
}
