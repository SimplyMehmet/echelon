import { RenderMode, ServerRoute } from '@angular/ssr';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Every route is prerendered to a file: the dataset is a frozen snapshot, so
 * there is nothing a request-time render could know that build time cannot.
 * That makes the whole site static — no server to run, nothing to keep patched.
 *
 * This file is only ever bundled into the server/build, never the browser, so
 * reading the fixtures straight off disk here is safe. Doing the same inside a
 * shared service would break the browser build.
 */
const read = <T>(file: string): T =>
  JSON.parse(readFileSync(join(process.cwd(), 'public/data', file), 'utf8')) as T;

const ids = <T extends { id: string }>(file: string): string[] => read<T[]>(file).map((r) => r.id);

export const serverRoutes: ServerRoute[] = [
  {
    path: 'leaderboard/:seasonId',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => ids('seasons.json').map((seasonId) => ({ seasonId })),
  },
  {
    path: 'players/:playerId',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => ids('players.json').map((playerId) => ({ playerId })),
  },
  {
    path: 'weeklies/:weeklyId',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => ids('events.json').map((weeklyId) => ({ weeklyId })),
  },
  {
    path: 'teams/:teamId',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => ids('teams.json').map((teamId) => ({ teamId })),
  },
  { path: '**', renderMode: RenderMode.Prerender },
];
