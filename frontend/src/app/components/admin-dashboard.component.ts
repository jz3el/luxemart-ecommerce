import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService, AdminDashboard } from '../services/admin.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="main-content">
      <div class="container mt-4">
        <!-- Header -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h1 class="display-5 fw-bold">
                  <i class="bi bi-speedometer2"></i> Admin Dashboard
                </h1>
                <p class="text-muted">Manage your e-commerce platform</p>
              </div>
              <div class="text-end">
                <span class="badge premium-gradient px-3 py-2 fs-6">
                  <i class="bi bi-shield-check"></i> Administrator
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Statistics Cards -->
        <div class="row mb-5" *ngIf="dashboard">
          <div class="col-lg-3 col-md-6 mb-4">
            <div class="card stat-card h-100">
              <div class="card-body text-center">
                <div class="stat-icon mb-3">
                  <i class="bi bi-people-fill text-primary"></i>
                </div>
                <h2 class="stat-number">{{ dashboard.totalUsers | number }}</h2>
                <p class="stat-label">Total Users</p>
                <div class="stat-trend">
                  <i class="bi bi-arrow-up text-success"></i>
                  <span class="text-success">+12%</span>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-3 col-md-6 mb-4">
            <div class="card stat-card h-100">
              <div class="card-body text-center">
                <div class="stat-icon mb-3">
                  <i class="bi bi-cart-check-fill text-success"></i>
                </div>
                <h2 class="stat-number">{{ dashboard.totalOrders | number }}</h2>
                <p class="stat-label">Total Orders</p>
                <div class="stat-trend">
                  <i class="bi bi-arrow-up text-success"></i>
                  <span class="text-success">+8%</span>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-3 col-md-6 mb-4">
            <div class="card stat-card h-100">
              <div class="card-body text-center">
                <div class="stat-icon mb-3">
                  <i class="bi bi-box-seam-fill text-warning"></i>
                </div>
                <h2 class="stat-number">{{ dashboard.totalProducts | number }}</h2>
                <p class="stat-label">Products</p>
                <div class="stat-trend">
                  <i class="bi bi-arrow-up text-success"></i>
                  <span class="text-success">+5%</span>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-3 col-md-6 mb-4">
            <div class="card stat-card h-100">
              <div class="card-body text-center">
                <div class="stat-icon mb-3">
                  <i class="bi bi-currency-dollar text-success"></i>
                </div>
                <h2 class="stat-number">\${{ dashboard.totalRevenue | number:'1.2-2' }}</h2>
                <p class="stat-label">Revenue</p>
                <div class="stat-trend">
                  <i class="bi bi-arrow-up text-success"></i>
                  <span class="text-success">+23%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="row mb-5">
          <div class="col-12">
            <div class="card">
              <div class="card-header premium-gradient text-white">
                <h5 class="mb-0"><i class="bi bi-lightning-fill"></i> Quick Actions</h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-lg-3 col-md-6 mb-3">
                    <a routerLink="/admin/products" class="btn btn-premium w-100 py-3">
                      <i class="bi bi-plus-circle me-2"></i>
                      Add Product
                    </a>
                  </div>
                  <div class="col-lg-3 col-md-6 mb-3">
                    <a routerLink="/admin/orders" class="btn btn-outline-primary w-100 py-3">
                      <i class="bi bi-list-check me-2"></i>
                      Manage Orders
                    </a>
                  </div>
                  <div class="col-lg-3 col-md-6 mb-3">
                    <a routerLink="/admin/users" class="btn btn-outline-primary w-100 py-3">
                      <i class="bi bi-people me-2"></i>
                      Manage Users
                    </a>
                  </div>
                  <div class="col-lg-3 col-md-6 mb-3">
                    <button class="btn btn-outline-primary w-100 py-3" (click)="refreshData()">
                      <i class="bi bi-arrow-clockwise me-2"></i>
                      Refresh Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Orders & Low Stock -->
        <div class="row">
          <!-- Recent Orders -->
          <div class="col-lg-8 mb-4">
            <div class="card h-100">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                  <i class="bi bi-clock-history"></i> Recent Orders
                </h5>
                <a routerLink="/admin/orders" class="btn btn-sm btn-outline-primary">View All</a>
              </div>
              <div class="card-body">
                <div class="table-responsive">
                  <table class="table table-hover" *ngIf="dashboard && dashboard.recentOrders && dashboard.recentOrders.length > 0; else noOrders">
                    <thead>
                      <tr>
                        <th>Order #</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let order of dashboard?.recentOrders || []">
                        <td class="fw-bold">#{{ order.orderNumber }}</td>
                        <td>
                          <div>{{ order.userName }}</div>
                          <small class="text-muted">{{ order.userEmail }}</small>
                        </td>
                        <td class="text-success fw-bold">\${{ order.totalAmount | number:'1.2-2' }}</td>
                        <td>
                          <span class="badge" [ngClass]="{
                            'bg-warning': order.status === 'Pending',
                            'bg-info': order.status === 'Processing', 
                            'bg-primary': order.status === 'Shipped',
                            'bg-success': order.status === 'Delivered',
                            'bg-danger': order.status === 'Cancelled'
                          }">{{ order.status }}</span>
                        </td>
                        <td>{{ order.orderDate | date:'short' }}</td>
                      </tr>
                    </tbody>
                  </table>
                  <ng-template #noOrders>
                    <div class="text-center py-4">
                      <i class="bi bi-inbox" style="font-size: 3rem; color: #6c757d;"></i>
                      <h5 class="mt-2 text-muted">No recent orders</h5>
                    </div>
                  </ng-template>
                </div>
              </div>
            </div>
          </div>

          <!-- Low Stock Products -->
          <div class="col-lg-4 mb-4">
            <div class="card h-100">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0 text-warning">
                  <i class="bi bi-exclamation-triangle"></i> Low Stock
                </h5>
                <a routerLink="/admin/products" class="btn btn-sm btn-outline-warning">Manage</a>
              </div>
              <div class="card-body">
                <div *ngIf="dashboard && dashboard.lowStockProducts && dashboard.lowStockProducts.length > 0; else noLowStock">
                  <div *ngFor="let product of dashboard?.lowStockProducts || []"
                       class="d-flex justify-content-between align-items-center mb-3 p-2 border rounded">
                    <div>
                      <div class="fw-bold">{{ product.name }}</div>
                      <small class="text-muted">SKU: {{ product.sku }}</small>
                    </div>
                    <div class="text-end">
                      <span class="badge bg-warning text-dark">{{ product.stockQuantity }}</span>
                      <div class="small text-muted">/ {{ product.lowStockThreshold }}</div>
                    </div>
                  </div>
                </div>
                <ng-template #noLowStock>
                  <div class="text-center py-4">
                    <i class="bi bi-check-circle" style="font-size: 3rem; color: #28a745;"></i>
                    <h6 class="mt-2 text-success">All products in stock</h6>
                  </div>
                </ng-template>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="text-center py-5">
          <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;"></div>
          <p class="mt-3">Loading dashboard...</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      border: none;
      border-radius: 15px;
      box-shadow: 0 8px 25px rgba(0,255,136,0.1);
      transition: transform 0.3s ease;
      background: linear-gradient(145deg, var(--charcoal), var(--deep-black));
    }
    
    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 35px rgba(0,255,136,0.2);
    }
    
    .stat-icon i {
      font-size: 3rem;
    }
    
    .stat-number {
      font-size: 2.5rem;
      font-weight: bold;
      color: var(--primary-green);
      margin: 0;
    }
    
    .stat-label {
      color: #adb5bd;
      font-weight: 500;
      margin-bottom: 10px;
    }
    
    .stat-trend {
      font-size: 0.9rem;
    }
    
    .table-hover tbody tr:hover {
      background-color: rgba(0,255,136,0.05);
    }
    
    .card-header {
      border-bottom: 1px solid rgba(0,255,136,0.2);
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  dashboard: AdminDashboard | null = null;
  loading = true;

  constructor(
    private adminService: AdminService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.adminService.getDashboard().subscribe({
      next: (data) => {
        this.dashboard = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard:', error);
        this.loading = false;
      }
    });
  }

  refreshData(): void {
    this.loadDashboard();
  }
}