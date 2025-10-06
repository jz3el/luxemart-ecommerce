import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, User } from '../services/auth.service';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark premium-gradient" style="box-shadow: 0 8px 25px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1);">
      <div class="container">
        <a class="navbar-brand d-flex align-items-center" routerLink="/">
          <div class="logo-container me-3">
            <i class="bi bi-hexagon-fill" style="font-size: 2rem; background: var(--gradient-secondary); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;"></i>
          </div>
          <div class="brand-text">
            <div class="brand-name">LUXEMART</div>
            <div class="brand-tagline">Premium E-Commerce</div>
          </div>
        </a>
        
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <a class="nav-link px-3" routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
                <i class="bi bi-house-fill me-2"></i>Home
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link px-3" routerLink="/products" routerLinkActive="active">
                <i class="bi bi-grid-fill me-2"></i>Products
              </a>
            </li>
            <li class="nav-item" *ngIf="currentUser?.role === 'Admin'">
              <a class="nav-link px-3 admin-link" routerLink="/admin" routerLinkActive="active">
                <i class="bi bi-speedometer2 me-2"></i>Dashboard
              </a>
            </li>
          </ul>
          
          <ul class="navbar-nav">
            <li class="nav-item" *ngIf="currentUser">
              <a class="nav-link position-relative cart-link px-3" routerLink="/cart">
                <i class="bi bi-bag-fill me-2"></i>Cart
                <span *ngIf="cartItemCount > 0" 
                      class="position-absolute top-0 start-100 translate-middle badge rounded-pill" 
                      style="background: var(--gradient-secondary); color: var(--deep-black); font-weight: 600;">
                  {{ cartItemCount }}
                </span>
              </a>
            </li>
            
            <li class="nav-item dropdown" *ngIf="currentUser; else loginLinks">
              <a class="nav-link dropdown-toggle user-dropdown px-3" href="#" role="button" data-bs-toggle="dropdown">
                <i class="bi bi-person-circle me-2"></i>{{ currentUser.firstName }}
              </a>
              <ul class="dropdown-menu dropdown-menu-end premium-dropdown">
                <li><a class="dropdown-item" routerLink="/profile"><i class="bi bi-person me-2"></i>Profile</a></li>
                <li><a class="dropdown-item" routerLink="/orders"><i class="bi bi-box-seam me-2"></i>Orders</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item text-danger" href="#" (click)="logout()"><i class="bi bi-box-arrow-right me-2"></i>Logout</a></li>
              </ul>
            </li>
            
            <ng-template #loginLinks>
              <li class="nav-item">
                <a class="nav-link px-3" routerLink="/login" routerLinkActive="active">
                  <i class="bi bi-box-arrow-in-right me-2"></i>Login
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link px-3 btn btn-outline-light rounded-pill" routerLink="/register" routerLinkActive="active">
                  <i class="bi bi-person-plus me-2"></i>Register
                </a>
              </li>
            </ng-template>
          </ul>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .brand-name {
      font-size: 1.5rem;
      font-weight: 800;
      line-height: 1;
      letter-spacing: -0.03em;
      background: var(--gradient-secondary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .brand-tagline {
      font-size: 0.75rem;
      color: rgba(255,255,255,0.8);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 1px;
      line-height: 1;
    }
    
    .logo-container {
      transition: transform 0.3s ease;
    }
    
    .navbar-brand:hover .logo-container {
      transform: rotate(360deg);
    }
    
    .premium-dropdown {
      background: var(--gradient-primary);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 15px;
      box-shadow: 0 15px 35px rgba(0,0,0,0.3);
      backdrop-filter: blur(10px);
      padding: 10px 0;
    }
    
    .premium-dropdown .dropdown-item {
      color: var(--primary-white);
      padding: 12px 20px;
      transition: all 0.3s ease;
      border-radius: 8px;
      margin: 2px 8px;
    }
    
    .premium-dropdown .dropdown-item:hover {
      background: rgba(255,255,255,0.1);
      color: var(--primary-white);
      transform: translateX(5px);
    }
    
    .admin-link {
      background: rgba(255,255,255,0.1);
      border-radius: 20px;
      margin-left: 10px;
    }
    
    .cart-link {
      background: rgba(255,255,255,0.05);
      border-radius: 20px;
    }
    
    .user-dropdown {
      background: rgba(255,255,255,0.05);
      border-radius: 20px;
    }
  `]
})
export class HeaderComponent implements OnInit {
  currentUser: User | null = null;
  cartItemCount = 0;

  constructor(
    private authService: AuthService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadCartCount();
      } else {
        this.cartItemCount = 0;
      }
    });

    this.cartService.cart$.subscribe(cart => {
      this.cartItemCount = cart.totalItems;
    });
  }

  private loadCartCount(): void {
    this.cartService.getCartItemCount().subscribe({
      next: count => this.cartItemCount = count,
      error: () => this.cartItemCount = 0
    });
  }

  logout(): void {
    this.authService.logout();
  }
}