import { DatePipe, NgClass } from '@angular/common';
import { Component, computed, inject, OnInit, signal, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { GetEventResponse } from '@app/api/responses/event';
import { GetSeasonResponse } from '@app/api/responses/season';
import { Season } from '@app/api/services/season';
import { map, tap } from 'rxjs';

@Component({
  imports: [NgClass, DatePipe],
  selector: 'app-events',
  styleUrl: './events.css',
  templateUrl: './events.html',
})
export class Events {
  public activeSeason = signal<string | null>(null);
  public seasonEvents = signal<GetEventResponse[]>([]);
  private seasonsService = inject(Season);
  public seasonsData = toSignal(
    this.seasonsService.getAllSeasons().pipe(
      tap((s) => {
        s.seasons.forEach((season) => {
          if (season.currentSeason) {
            this.activeSeason.set(season.id);
            this.seasonEvents.set(
              season.events.sort(
                (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
              ),
            );
          }
        });
      }),
      map((s) => {
        return s.seasons.sort((a, b) => a.name.localeCompare(b.name));
      }),
    ),
    { initialValue: [] },
  );

  public onClickSeason(season: GetSeasonResponse) {
    this.activeSeason.set(season.id);
    this.seasonEvents.set(
      season.events.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()),
    );
  }
}
