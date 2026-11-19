import { DatePipe } from '@angular/common';
import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { GetEventResponse, GetEventSetsResponse } from '@app/api/responses/event';
import { Event } from '@app/api/services/event';
import { catchError, map, of, startWith, switchMap } from 'rxjs';

type EventState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'not-found' }
  | { status: 'loaded'; event: GetEventResponse };

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

const EMPTY_ID = '00000000-0000-0000-0000-000000000000';
const GROUP_NUMBER: Record<string, number> = {
  'single-bracket': 1,
  'winner-bracket': 1,
  'loser-bracket': 2,
  'final-group': 3,
};

@Component({
  imports: [DatePipe, RouterLink],
  selector: 'app-event-detail',
  styleUrl: './event-detail.css',
  templateUrl: './event-detail.html',
})
export class EventDetail {
  private activatedRoute = inject(ActivatedRoute);
  private eventsService = inject(Event);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private bracketElement = viewChild<ElementRef<HTMLElement>>('bracket');

  public state = toSignal(
    this.activatedRoute.params.pipe(
      switchMap((params) =>
        this.eventsService.getEventByID(params['id']).pipe(
          map((event): EventState =>
            // The API answers with an empty event when the ID doesn't exist.
            event.id === EMPTY_ID || !event.name
              ? { status: 'not-found' }
              : { status: 'loaded', event },
          ),
          catchError((error) =>
            of<EventState>(error?.status === 400 ? { status: 'not-found' } : { status: 'error' }),
          ),
          startWith<EventState>({ status: 'loading' }),
        ),
      ),
    ),
    { initialValue: { status: 'loading' } as EventState },
  );

  public event = computed(() => {
    const state = this.state();
    return state.status === 'loaded' ? state.event : null;
  });

  public sets = computed(() => this.event()?.sets ?? []);
  public isLive = computed(() => this.sets().some((s) => s.startedAt && !s.completedAt));
  public onStream = computed(() =>
    this.sets().filter((s) => s.onStream && s.startedAt && !s.completedAt),
  );

  /** Whether the bracket was drawn; false shows the sets as a list instead. */
  public bracketStatus = signal<'loading' | 'shown' | 'unavailable'>('loading');

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
      if (event && element) void this.renderBracket(event, element.nativeElement);
    });
  }

  private async renderBracket(event: GetEventResponse, element: HTMLElement) {
    if (!this.isBrowser) return;
    this.bracketStatus.set('loading');
    try {
      const { buildBracket, groupKey } = await import('./bracket');
      const data = await buildBracket(event.name, event.entrants, event.sets ?? []);
      if (!data) {
        this.bracketStatus.set('unavailable');
        return;
      }

      // brackets-viewer is a browser-only script that registers itself on window.
      await import('brackets-viewer/dist/brackets-viewer.min.js');
      const viewer = (window as unknown as { bracketsViewer: BracketsViewer }).bracketsViewer;
      element.id ||= 'event-bracket';
      await viewer.render(data, {
        selector: `#${element.id}`,
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
      this.bracketStatus.set('shown');
    } catch (error) {
      console.error('Could not draw the bracket', error);
      this.bracketStatus.set('unavailable');
    }
  }
}
