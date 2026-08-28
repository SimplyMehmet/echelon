import { Routes } from '@angular/router';
import { currentSeasonRedirectGuard } from '@core/routing/current-season.guard';
import { playerTitle, seasonTitle, teamTitle, weeklyTitle } from '@core/routing/titles';
import { Home } from '@pages/home/home';
import { NotFound } from '@pages/not-found/not-found';

/**
 * Conventions, enforced by review:
 *
 * 1. Param names are :seasonId / :playerId / :weeklyId / :teamId, never :id.
 *    withComponentInputBinding() matches params to inputs by exact name, so the
 *    param name IS the component's public API.
 *
 * 2. Resolvers are for route titles and nothing else. Page data is fetched with
 *    resource() inside the container — resolvers block navigation, cannot
 *    express loading or error in the template, and do not re-run when a query
 *    param changes.
 *
 * 3. Season lives in the path and sort lives in a query param, so both are
 *    shareable links. Neither is app state.
 */
export const routes: Routes = [
  // Eager, and no title: it is the landing route, so lazy-loading it would only
  // add a chunk request to the most common first paint, and AppTitleStrategy
  // renders a title-less route as plain "Edgelon".
  { path: '', component: Home },
  { path: 'leaderboard', canActivate: [currentSeasonRedirectGuard], children: [] },
  {
    path: 'leaderboard/:seasonId',
    title: seasonTitle,
    loadComponent: () => import('@pages/leaderboard/leaderboard').then((m) => m.Leaderboard),
  },
  {
    path: 'players',
    title: 'Players',
    loadComponent: () => import('@pages/players/players').then((m) => m.Players),
  },
  {
    path: 'players/:playerId',
    title: playerTitle,
    loadComponent: () =>
      import('@pages/player-profile/player-profile').then((m) => m.PlayerProfilePage),
  },
  {
    path: 'weeklies',
    title: 'Weeklies',
    loadComponent: () => import('@pages/weeklies/weeklies').then((m) => m.Weeklies),
  },
  {
    path: 'weeklies/:weeklyId',
    title: weeklyTitle,
    loadComponent: () => import('@pages/weekly-detail/weekly-detail').then((m) => m.WeeklyDetail),
  },
  // Reserved: bracket rendering is out of v1 scope. The set data (fullRoundText,
  // round, winnerId, per-slot scores) is complete enough to build it here.
  // {
  //   path: 'weeklies/:weeklyId/bracket',
  //   loadComponent: () => import('@pages/bracket/bracket').then((m) => m.Bracket),
  // },
  {
    path: 'teams',
    title: 'Teams',
    loadComponent: () => import('@pages/teams/teams').then((m) => m.Teams),
  },
  {
    path: 'teams/:teamId',
    title: teamTitle,
    loadComponent: () => import('@pages/team-detail/team-detail').then((m) => m.TeamDetail),
  },
  {
    path: 'admin',
    title: 'Organiser',
    loadChildren: () => import('@pages/admin/admin.routes').then((m) => m.adminRoutes),
  },
  // Eager: it must render even when a lazy chunk 404s after a deploy.
  { path: '**', title: 'Not found', component: NotFound },
];
