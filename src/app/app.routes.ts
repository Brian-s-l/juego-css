import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
    },
    {
        path: 'aim',
        loadComponent: () => import('./aim/aim.component').then(m => m.AimComponent)
    }
];
