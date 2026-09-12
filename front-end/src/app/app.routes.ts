import { Routes } from '@angular/router';
import { Home } from '@pages/home/home';
import { Events } from './pages/events/events';
import { Leaderboards } from './pages/leaderboards/leaderboards';
import { FullScreen } from './pages/full-screen/full-screen';

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
  {
    path: 'full-screen',
    component: FullScreen,
  },
];
