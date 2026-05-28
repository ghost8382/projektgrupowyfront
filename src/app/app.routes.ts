import { Routes } from '@angular/router';
import { AuthGuard } from './guard/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./shell/shell.component').then(m => m.ShellComponent),
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard',   loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'products',    loadComponent: () => import('./products/products.component').then(m => m.ProductsComponent) },
      { path: 'categories',  loadComponent: () => import('./categories/categories.component').then(m => m.CategoriesComponent) },
      { path: 'users',       loadComponent: () => import('./users/users.component').then(m => m.UsersComponent) },
      { path: 'sales',       loadComponent: () => import('./sales/sales.component').then(m => m.SalesComponent) },
      { path: 'contractors', loadComponent: () => import('./contractors/contractors.component').then(m => m.ContractorsComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
