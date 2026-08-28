import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./admin-shell/admin-shell').then((m) => m.AdminShell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'teams' },
      {
        path: 'teams',
        title: 'Team rosters',
        loadComponent: () => import('./admin-teams/admin-teams').then((m) => m.AdminTeams),
      },
      {
        path: 'players/merge',
        title: 'Merge players',
        loadComponent: () => import('./admin-merge/admin-merge').then((m) => m.AdminMerge),
      },
    ],
  },
];
