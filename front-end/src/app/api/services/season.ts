import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { GetAllSeasonsResponse } from '../responses/season';

@Service()
export class Season {
  private http = inject(HttpClient);

  public getAllSeasons(): Observable<GetAllSeasonsResponse> {
    return this.http.get<GetAllSeasonsResponse>('http://localhost:8080/api/v1/season');
  }
}
