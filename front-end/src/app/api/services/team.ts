import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { getAllTeamsResponse } from '../responses/team';
import { ApiClient } from '../api';

@Service()
export class Team {
  private http = inject(ApiClient);

  public getAllTeams(): Observable<getAllTeamsResponse> {
    return this.http.get<getAllTeamsResponse>('/team');
  }
}
