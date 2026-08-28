import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import {
  TitleStrategy,
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
} from '@angular/router';
import { provideClientHydration, withNoHttpTransferCache } from '@angular/platform-browser';
import { EchelonData } from '@core/data/echelon-data';
import { MockEchelonData } from '@core/data/mock-echelon-data';
import { baseUrlInterceptor } from '@core/data/base-url.interceptor';
import { AppTitleStrategy } from '@core/routing/app-title-strategy';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      // Binds route params, query params and route data to same-named inputs.
      // This is why route params are :seasonId and not :id.
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
    ),
    // No transfer cache: every page is prerendered, so the cache would inline the
    // entire fixture set into all 212 of them (185 kB each, 43 MB total). The
    // browser fetches /data/*.json once instead and the CDN caches it.
    provideClientHydration(withNoHttpTransferCache()),
    provideHttpClient(withFetch(), withInterceptors([baseUrlInterceptor])),
    { provide: TitleStrategy, useClass: AppTitleStrategy },
    // The one line that swaps the whole app onto the real API.
    { provide: EchelonData, useClass: MockEchelonData },
  ],
};
