import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { GetEventResponse } from '@app/api/responses/event';
import { Event } from '@app/api/services/event';
import { Bracket } from '@app/shared/bracket/bracket';
import { catchError, map, of, startWith, switchMap } from 'rxjs';

type EventState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'not-found' }
  | { status: 'loaded'; event: GetEventResponse };

const EMPTY_ID = '00000000-0000-0000-0000-000000000000';
@Component({
  imports: [Bracket, DatePipe, RouterLink],
  selector: 'app-event-detail',
  styleUrl: './event-detail.css',
  templateUrl: './event-detail.html',
})
export class EventDetail {
  private activatedRoute = inject(ActivatedRoute);
  private eventsService = inject(Event);

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
}
