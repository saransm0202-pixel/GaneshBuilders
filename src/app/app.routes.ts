import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'estimate',
    loadComponent: () =>
      import('./components/estimate/estimate').then((m) => m.EstimateComponent),
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./components/users/users').then((m) => m.UsersComponent),
  },
  {
    path: 'projects',
    loadComponent: () =>
      import('./components/projects/projects').then((m) => m.ProjectsComponent),
  },
  {
    path: 'full-projects',
    loadComponent: () =>
      import('./components/full-project/full-project').then((m) => m.FullProjectComponent),
  },
  {
    path: 'admin-panel',
    loadComponent: () =>
      import('./components/admin-panel/admin-panel').then((m) => m.AdminPanelComponent),
  },
  {
    path: 'app-config',
    loadComponent: () =>
      import('./components/app-config/app-config').then((m) => m.AppConfigComponent),
  },
  {
    path: 'package-management',
    loadComponent: () =>
      import('./components/package-management/package-management').then(
        (m) => m.PackageManagementComponent,
      ),
  },
  { path: '**', redirectTo: '' },
];
