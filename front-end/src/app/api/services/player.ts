import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { getAllPlayersResponse } from '../responses/player';
import { ApiClient } from '../api';

@Service()
export class Player {
  private http = inject(ApiClient);

  public getAllPlayers(): Observable<getAllPlayersResponse> {
    return this.http.get<getAllPlayersResponse>('/player');
  }
}
