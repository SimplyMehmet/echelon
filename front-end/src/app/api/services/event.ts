import { inject, Service } from '@angular/core';
import { ApiClient } from '../api';
import { Observable } from 'rxjs';
import { GetEventResponse } from '../responses/event';

@Service()
export class Event {
  private http = inject(ApiClient);

  public getEventByID(id: string): Observable<GetEventResponse> {
    return this.http.get<GetEventResponse>(`/event/${id}`);
  }
}
