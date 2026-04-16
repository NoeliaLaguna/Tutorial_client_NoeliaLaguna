import { Routes } from '@angular/router';
import { ClientsList } from './clients/clients-list/clients-list';

export const routes: Routes = [
    { path: '', redirectTo: '/games', pathMatch: 'full'},
    { path: 'categories', loadComponent: () => import('./category/category-list/category-list').then(m => m.CategoryList)},
    { path: 'authors', loadComponent: () => import('./author/author-list/author-list').then(m => m.AuthorList)},
    { path: 'games', loadComponent: () => import('./game/game-list/game-list').then(m => m.GameList)},
    { path: 'clients', loadComponent: () => import('./clients/clients-list/clients-list').then(m => m.ClientsList)},
    { path: 'loan', loadComponent: () => import('./loan/loan-list/loan-list').then(m => m.LoanList)},
];
