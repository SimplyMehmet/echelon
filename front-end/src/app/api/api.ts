import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NEVER, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiClient {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private readonly baseUrl = environment.apiUrl;

  get<T>(endpoint: string): Observable<T> {
    // Pages are prerendered at build time. Fetching there would freeze the
    // response into the HTML, and the browser would reuse it until the next deploy.
    if (isPlatformServer(this.platformId)) {
      return NEVER;
    }
    return this.http.get<T>(`${this.baseUrl}${endpoint}`);
  }

  post<T>(endpoint: string, body: unknown) {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body);
  }
}
