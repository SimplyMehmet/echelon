import { Routes } from '@angular/router';
import { Home } from '@pages/home/home';
import { Events } from './pages/events/events';
import { Leaderboards } from './pages/leaderboards/leaderboards';
import { FullScreen } from './pages/full-screen/full-screen';

export const routes: Routes = [
  {
    path: '',
    title: 'Levels Gaming',
    component: Home,
  },
  {
    path: 'events',
    title: 'Events | Levels Gaming',
    component: Events,
  },
  {
    path: 'leaderboards',
    title: 'Leaderboards | Levels Gaming',
    component: Leaderboards,
  },
  {
    path: 'full-screen',
    title: 'Levels Gaming',
    component: FullScreen,
  },
];
