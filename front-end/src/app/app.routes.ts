import { Routes } from '@angular/router';
import { Home } from '@pages/home/home';
import { Events } from './pages/events/events';
import { Leaderboards } from './pages/leaderboards/leaderboards';

export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
  {
    path: 'events',
    component: Events,
  },
  {
    path: 'leaderboards',
    component: Leaderboards,
  },
];
