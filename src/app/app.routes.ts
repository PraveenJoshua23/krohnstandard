import { Routes } from '@angular/router';
import { HomePage } from './pages/home/home.page';

export const routes: Routes = [
  { path: '', component: HomePage, title: 'KROHN — Custom iPhone, by hand.' },
  {
    path: 'studio',
    loadComponent: () => import('./pages/studio/studio.page').then((m) => m.StudioPage),
    title: 'KROHN Studio — Configure Your iPhone',
  },
  { path: '**', redirectTo: '' },
];
