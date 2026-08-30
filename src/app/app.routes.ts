import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'estimate',
    loadComponent: () =>
      import('./components/estimate/estimate').then((m) => m.EstimateComponent),
  },
  { path: '**', redirectTo: '' },
];
