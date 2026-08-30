import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { getAllPlayersResponse } from '../responses/player';

@Service()
export class Player {
  private http = inject(HttpClient);

  public getAllPlayers(): Observable<getAllPlayersResponse> {
    return this.http.get<getAllPlayersResponse>('http://localhost:8080/api/v1/player');
  }
}
