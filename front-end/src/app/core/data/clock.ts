import { InjectionToken } from '@angular/core';

/**
 * The current instant, as an ISO-8601 UTC string.
 *
 * Injected rather than read directly so that "what counts as upcoming" is
 * deterministic in tests, and so the server render and the client hydration
 * cannot disagree about it.
 */
export const NOW = new InjectionToken<() => string>('NOW', {
  providedIn: 'root',
  factory: () => () => new Date().toISOString(),
});
