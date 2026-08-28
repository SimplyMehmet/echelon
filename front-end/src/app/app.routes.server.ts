import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    // On-demand SSR, not Prerender. Prerender cannot enumerate /players/:playerId
    // without getPrerenderParams and fails the build; it would also bake a frozen
    // snapshot of the fixtures into static HTML.
    renderMode: RenderMode.Server,
  },
];
