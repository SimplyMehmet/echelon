import { HttpInterceptorFn } from '@angular/common/http';
import { InjectionToken, inject } from '@angular/core';

/**
 * Absolute origin the server-rendered app uses for its own relative requests.
 * There is no document under SSR, so HttpClient cannot resolve a relative URL
 * and every request fails without this.
 *
 * See app.config.server.ts for how it is derived — it is deliberately not
 * simply the request's own origin.
 */
export const SERVER_ORIGIN = new InjectionToken<string>('SERVER_ORIGIN');

/** A no-op in the browser, where relative URLs resolve against the document. */
export const baseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  if (/^https?:\/\//i.test(req.url)) {
    return next(req);
  }

  const origin = inject(SERVER_ORIGIN, { optional: true });
  if (!origin) {
    return next(req);
  }

  const path = req.url.startsWith('/') ? req.url : `/${req.url}`;
  return next(req.clone({ url: `${origin}${path}` }));
};
