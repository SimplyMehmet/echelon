import { DatePipe, NgClass } from '@angular/common';
import { Component, computed, inject, signal, Signal } from '@angular/core';
import { GetEventResponse } from '@app/api/responses/event';
import { GetSeasonResponse } from '@app/api/responses/season';
import { toRequestState } from '@app/api/request-state';
import { Season } from '@app/api/services/season';
import { StatusMessage, StatusMessageType } from '@app/shared/status-message/status-message';
import { map, tap } from 'rxjs';

// Upcoming events first (soonest on top), then past events (most recent on top).
export function sortEvents(events: GetEventResponse[], now: number): GetEventResponse[] {
  const time = (e: GetEventResponse) => new Date(e.startsAt).getTime();
  const upcoming = events.filter((e) => time(e) >= now).sort((a, b) => time(a) - time(b));
  const past = events.filter((e) => time(e) < now).sort((a, b) => time(b) - time(a));
  return [...upcoming, ...past];
}

@Component({
  imports: [NgClass, DatePipe, StatusMessage],
  selector: 'app-events',
  styleUrl: './events.css',
  templateUrl: './events.html',
})
export class Events {
  public activeSeason = signal<string | null>(null);
  public seasonEvents = signal<GetEventResponse[]>([]);
  private seasonsService = inject(Season);
  private seasonsState = toRequestState(
    this.seasonsService.getAllSeasons().pipe(
      tap((s) => {
        s.seasons.forEach((season) => {
          if (season.currentSeason) {
            this.activeSeason.set(season.id);
            this.seasonEvents.set(sortEvents(season.events, Date.now()));
          }
        });
      }),
      map((s) => {
        return s.seasons.sort((a, b) => a.name.localeCompare(b.name));
      }),
    ),
  );

  public seasonsData = computed(() => {
    const state = this.seasonsState();
    return state.status === 'ready' ? state.data : [];
  });

  public nextEventId = computed(() => {
    const first = this.seasonEvents()[0];
    return first && new Date(first.startsAt).getTime() >= Date.now() ? first.id : null;
  });

  public listStatus: Signal<StatusMessageType | null> = computed(() => {
    const status = this.seasonsState().status;
    if (status !== 'ready') {
      return status;
    }
    return this.seasonEvents().length === 0 ? 'empty' : null;
  });

  public onClickSeason(season: GetSeasonResponse) {
    this.activeSeason.set(season.id);
    this.seasonEvents.set(sortEvents(season.events, Date.now()));
  }
}
