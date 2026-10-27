import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'snippets'
  },
  {
    path: 'snippets',
    loadComponent: () => import('./views/snippets-view/snippets-view.component').then(m => m.SnippetsViewComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./views/new-snippet/new-snippet.component').then(m => m.NewSnippetComponent)
  },
  {
    path: 'api-playground',
    loadComponent: () => import('./views/api-playground/api-playground.component').then(m => m.ApiPlaygroundComponent)
  },
  {
    path: 'tasks',
    loadComponent: () => import('./views/tasks-view/tasks-view.component').then(m => m.TasksViewComponent)
  },
  {
    path: '**',
    redirectTo: 'snippets'
  }
];
