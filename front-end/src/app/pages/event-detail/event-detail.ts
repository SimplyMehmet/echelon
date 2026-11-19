import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GetEventResponse } from '@app/api/responses/event';
import { Event } from '@app/api/services/event';
import { switchMap } from 'rxjs';

@Component({
  imports: [],
  selector: 'app-event-detail',
  styleUrl: './event-detail.css',
  templateUrl: './event-detail.html',
})
export class EventDetail implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  private eventsService = inject(Event);
  public event = signal<GetEventResponse | null>(null);

  ngOnInit(): void {
    this.activatedRoute.params
      .pipe(switchMap((res) => this.eventsService.getEventByID(res['id'])))
      .subscribe((resp) => {
        this.event.set(resp);
      });
  }
}
