import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { GetAllSeasonsResponse } from '../responses/season';
import { ApiClient } from '../api';

@Service()
export class Season {
  private http = inject(ApiClient);

  public getAllSeasons(): Observable<GetAllSeasonsResponse> {
    return this.http.get<GetAllSeasonsResponse>('/season');
  }
}
