import { REQUEST, mergeApplicationConfig, ApplicationConfig, inject } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { SERVER_ORIGIN } from '@core/data/base-url.interceptor';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

/**
 * Where the server should send its own relative requests.
 *
 * Prefer loopback plus the port the process is actually listening on: behind a
 * container port mapping the app is reached on one port (3000) but listens on
 * another (4000), so echoing the request's public origin back produces an
 * address the container cannot route. server.ts sets PORT whenever it runs the
 * Node server itself.
 *
 * Fall back to the request's origin for `ng serve`, where the dev server owns
 * the port and PORT is not set.
 */
function serverOrigin(): string {
  const port = process.env['PORT'];
  if (port) {
    return `http://127.0.0.1:${port}`;
  }
  const request = inject(REQUEST, { optional: true });
  return request ? new URL(request.url).origin : '';
}

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    { provide: SERVER_ORIGIN, useFactory: serverOrigin },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
