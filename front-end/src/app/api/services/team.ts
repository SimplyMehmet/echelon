import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { getAllTeamsResponse } from '../responses/team';
import { HttpClient } from '@angular/common/http';

@Service()
export class Team {
  private http = inject(HttpClient);

  public getAllTeams(): Observable<getAllTeamsResponse> {
    return this.http.get<getAllTeamsResponse>('http://localhost:8080/api/v1/team');
  }
}
