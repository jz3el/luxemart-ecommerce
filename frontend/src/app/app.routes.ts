import { Routes } from '@angular/router';
import { LoginComponent } from './components/login.component';
import { RegisterComponent } from './components/register.component';
import { ProductListComponent } from './components/product-list.component';
import { CartComponent } from './components/cart.component';
import { AdminDashboardComponent } from './components/admin-dashboard.component';
import { ProfileComponent } from './components/profile.component';

export const routes: Routes = [
  // Public routes
  { path: '', component: ProductListComponent, title: 'LuxeMart - Premium E-Commerce' },
  { path: 'products', component: ProductListComponent, title: 'Products - LuxeMart' },
  { path: 'login', component: LoginComponent, title: 'Login - LuxeMart' },
  { path: 'register', component: RegisterComponent, title: 'Register - LuxeMart' },
  
  // Protected routes (require authentication)
  { path: 'cart', component: CartComponent, title: 'Shopping Cart - LuxeMart' },
  { path: 'profile', component: ProfileComponent, title: 'My Profile - LuxeMart' },
  
  // Admin routes (require admin role)
  { path: 'admin', redirectTo: 'admin/dashboard' },
  { path: 'admin/dashboard', component: AdminDashboardComponent, title: 'Admin Dashboard - LuxeMart' },
  
  // Fallback route
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
