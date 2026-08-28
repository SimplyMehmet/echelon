import { HttpClient } from '@angular/common/http';
import { Injectable, InjectionToken, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

/**
 * Artificial latency, so every loading skeleton and error branch in the app is
 * exercised rather than being dead code that breaks on the first real request.
 * Set to 0 in tests.
 */
export const MOCK_LATENCY_MS = new InjectionToken<number>('MOCK_LATENCY_MS', {
  providedIn: 'root',
  factory: () => 120,
});

@Injectable({ providedIn: 'root' })
export class FixtureLoader {
  private readonly http = inject(HttpClient);
  private readonly latency = inject(MOCK_LATENCY_MS);

  /**
   * Caches the promise, not the value, so concurrent callers dedupe — a page
   * that needs seasons, weeklies and a leaderboard issues one request each.
   *
   * Instance state, not module state: module-level caches leak across requests
   * under SSR.
   */
  private readonly cache = new Map<string, Promise<unknown>>();

  load<T>(file: string): Promise<T> {
    const existing = this.cache.get(file) as Promise<T> | undefined;
    if (existing) {
      return existing;
    }
    const pending = firstValueFrom(this.http.get<T>(`/data/${file}`)).then(async (value) => {
      if (this.latency > 0) {
        await new Promise((resolve) => setTimeout(resolve, this.latency));
      }
      return value;
    });
    this.cache.set(file, pending);
    return pending;
  }
}
