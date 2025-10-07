import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../services/admin.service';
import { NotificationService } from '../services/notification.service';

interface Order {
  orderId: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  orderDate: string;
  shippingAddress?: string;
  items: OrderItem[];
}

interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="main-content">
      <div class="container mt-4">
        <!-- Header -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h1 class="display-5 fw-bold">
                  <i class="bi bi-cart-check"></i> Order Management
                </h1>
                <p class="text-muted">Track and manage customer orders</p>
              </div>
              <div>
                <button class="btn btn-outline-primary btn-sm me-2" (click)="loadOrders()">
                  <i class="bi bi-arrow-clockwise me-2"></i>Refresh
                </button>
                <a routerLink="/admin/dashboard" class="btn btn-outline-primary">
                  <i class="bi bi-arrow-left me-2"></i>Back to Dashboard
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Stats -->
        <div class="row mb-4">
          <div class="col-md-3 mb-3">
            <div class="card stat-card text-center">
              <div class="card-body">
                <i class="bi bi-hourglass-split text-warning" style="font-size: 2rem;"></i>
                <h3 class="fw-bold text-warning mt-2">{{ getPendingOrders() }}</h3>
                <p class="text-muted mb-0">Pending Orders</p>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card stat-card text-center">
              <div class="card-body">
                <i class="bi bi-gear text-info" style="font-size: 2rem;"></i>
                <h3 class="fw-bold text-info mt-2">{{ getProcessingOrders() }}</h3>
                <p class="text-muted mb-0">Processing</p>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card stat-card text-center">
              <div class="card-body">
                <i class="bi bi-truck text-primary" style="font-size: 2rem;"></i>
                <h3 class="fw-bold text-primary mt-2">{{ getShippedOrders() }}</h3>
                <p class="text-muted mb-0">Shipped</p>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card stat-card text-center">
              <div class="card-body">
                <i class="bi bi-check-circle text-success" style="font-size: 2rem;"></i>
                <h3 class="fw-bold text-success mt-2">{{ getDeliveredOrders() }}</h3>
                <p class="text-muted mb-0">Delivered</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="card">
              <div class="card-body">
                <div class="row align-items-end">
                  <div class="col-md-3 mb-2">
                    <label class="form-label">Status Filter</label>
                    <select class="form-select premium-input" [(ngModel)]="statusFilter" (change)="filterOrders()">
                      <option value="">All Status</option>
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div class="col-md-3 mb-2">
                    <label class="form-label">Payment Status</label>
                    <select class="form-select premium-input" [(ngModel)]="paymentFilter" (change)="filterOrders()">
                      <option value="">All Payments</option>
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Failed">Failed</option>
                    </select>
                  </div>
                  <div class="col-md-4 mb-2">
                    <label class="form-label">Search Orders</label>
                    <input type="text" class="form-control premium-input" placeholder="Order number or customer name..." 
                           [(ngModel)]="searchTerm" (input)="filterOrders()">
                  </div>
                  <div class="col-md-2 mb-2">
                    <button class="btn btn-outline-secondary w-100" (click)="clearFilters()">
                      <i class="bi bi-x-circle me-1"></i>Clear
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Orders List -->
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">
                  <i class="bi bi-list-ul"></i> Orders ({{ filteredOrders.length }})
                </h5>
              </div>
              <div class="card-body">
                <div class="table-responsive">
                  <table class="table table-hover" *ngIf="filteredOrders.length > 0; else noOrders">
                    <thead>
                      <tr>
                        <th>Order #</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Payment</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let order of filteredOrders">
                        <td>
                          <div class="fw-bold">#{{ order.orderNumber }}</div>
                          <small class="text-muted">ID: {{ order.orderId }}</small>
                        </td>
                        <td>
                          <div class="fw-bold">{{ order.customerName }}</div>
                          <small class="text-muted">{{ order.customerEmail }}</small>
                        </td>
                        <td>
                          <div class="fw-bold text-success">\${{ order.totalAmount | number:'1.2-2' }}</div>
                          <small class="text-muted">{{ order.items.length }} item(s)</small>
                        </td>
                        <td>
                          <span class="badge order-status" [ngClass]="getStatusClass(order.status)">
                            <i class="bi" [ngClass]="getStatusIcon(order.status)"></i>
                            {{ order.status }}
                          </span>
                        </td>
                        <td>
                          <span class="badge" [ngClass]="getPaymentStatusClass(order.paymentStatus)">
                            <i class="bi" [ngClass]="getPaymentStatusIcon(order.paymentStatus)"></i>
                            {{ order.paymentStatus }}
                          </span>
                        </td>
                        <td>
                          <div>{{ order.orderDate | date:'MMM d, y' }}</div>
                          <small class="text-muted">{{ order.orderDate | date:'shortTime' }}</small>
                        </td>
                        <td>
                          <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary" 
                                    (click)="viewOrderDetails(order)"
                                    title="View Details">
                              <i class="bi bi-eye"></i>
                            </button>
                            <div class="dropdown">
                              <button class="btn btn-outline-secondary dropdown-toggle" 
                                      type="button" 
                                      data-bs-toggle="dropdown" 
                                      title="Update Status">
                                <i class="bi bi-pencil"></i>
                              </button>
                              <ul class="dropdown-menu">
                                <li><a class="dropdown-item" (click)="updateOrderStatus(order, 'Processing')">
                                  <i class="bi bi-gear me-2"></i>Mark as Processing
                                </a></li>
                                <li><a class="dropdown-item" (click)="updateOrderStatus(order, 'Shipped')">
                                  <i class="bi bi-truck me-2"></i>Mark as Shipped
                                </a></li>
                                <li><a class="dropdown-item" (click)="updateOrderStatus(order, 'Delivered')">
                                  <i class="bi bi-check-circle me-2"></i>Mark as Delivered
                                </a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item text-danger" (click)="updateOrderStatus(order, 'Cancelled')">
                                  <i class="bi bi-x-circle me-2"></i>Cancel Order
                                </a></li>
                              </ul>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <ng-template #noOrders>
                    <div class="text-center py-5">
                      <i class="bi bi-cart-x" style="font-size: 4rem; color: #6c757d;"></i>
                      <h4 class="mt-3 text-muted">No Orders Found</h4>
                      <p class="text-muted">{{ getEmptyStateMessage() }}</p>
                    </div>
                  </ng-template>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="text-center py-5">
          <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;"></div>
          <p class="mt-3">Loading orders...</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      border: 1px solid rgba(255,255,255,0.06);
      background: var(--gradient-card);
      transition: all 0.3s ease;
    }
    
    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }
    
    .order-status {
      min-width: 90px;
      font-size: 0.75rem;
      padding: 6px 12px;
    }
    
    .table-hover tbody tr:hover {
      background-color: rgba(102, 126, 234, 0.05);
    }
    
    .dropdown-menu {
      background: var(--card-bg);
      border: 1px solid rgba(255,255,255,0.1);
      box-shadow: 0 8px 25px rgba(0,0,0,0.3);
    }
    
    .dropdown-item {
      color: var(--primary-white);
      transition: all 0.2s ease;
    }
    
    .dropdown-item:hover {
      background: rgba(102, 126, 234, 0.1);
      color: var(--primary-white);
    }
    
    .dropdown-divider {
      border-color: rgba(255,255,255,0.1);
    }
  `]
})
export class AdminOrdersComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  loading = true;
  
  statusFilter = '';
  paymentFilter = '';
  searchTerm = '';

  // Mock data for demonstration
  private mockOrders: Order[] = [
    {
      orderId: 1001,
      orderNumber: 'ORD-2024-001',
      customerName: 'John Doe',
      customerEmail: 'john.doe@example.com',
      totalAmount: 299.99,
      status: 'Processing',
      paymentStatus: 'Paid',
      orderDate: '2024-01-15T10:30:00Z',
      items: [
        { productId: 1, productName: 'Laptop Pro', quantity: 1, price: 299.99, total: 299.99 }
      ]
    },
    {
      orderId: 1002,
      orderNumber: 'ORD-2024-002',
      customerName: 'Jane Smith',
      customerEmail: 'jane.smith@example.com',
      totalAmount: 59.99,
      status: 'Shipped',
      paymentStatus: 'Paid',
      orderDate: '2024-02-01T14:45:00Z',
      items: [
        { productId: 2, productName: 'Coffee Mug', quantity: 2, price: 19.99, total: 39.99 },
        { productId: 3, productName: 'Notebook', quantity: 1, price: 29.99, total: 29.99 }
      ]
    },
    {
      orderId: 1003,
      orderNumber: 'ORD-2024-003',
      customerName: 'Mike Johnson',
      customerEmail: 'mike.johnson@example.com',
      totalAmount: 1299.99,
      status: 'Pending',
      paymentStatus: 'Pending',
      orderDate: '2024-02-10T09:15:00Z',
      items: [
        { productId: 1, productName: 'Laptop Pro', quantity: 1, price: 1299.99, total: 1299.99 }
      ]
    },
    {
      orderId: 1004,
      orderNumber: 'ORD-2024-004',
      customerName: 'Sarah Wilson',
      customerEmail: 'sarah.wilson@example.com',
      totalAmount: 89.98,
      status: 'Delivered',
      paymentStatus: 'Paid',
      orderDate: '2024-01-20T16:20:00Z',
      items: [
        { productId: 3, productName: 'Notebook', quantity: 3, price: 29.99, total: 89.97 }
      ]
    },
    {
      orderId: 1005,
      orderNumber: 'ORD-2024-005',
      customerName: 'David Brown',
      customerEmail: 'david.brown@example.com',
      totalAmount: 199.99,
      status: 'Cancelled',
      paymentStatus: 'Failed',
      orderDate: '2024-02-05T11:10:00Z',
      items: [
        { productId: 4, productName: 'Wireless Headphones', quantity: 1, price: 199.99, total: 199.99 }
      ]
    }
  ];

  constructor(
    private adminService: AdminService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    
    // Simulate API call
    setTimeout(() => {
      this.orders = [...this.mockOrders];
      this.filteredOrders = [...this.orders];
      this.loading = false;
    }, 800);
  }

  filterOrders(): void {
    this.filteredOrders = this.orders.filter(order => {
      const matchesStatus = !this.statusFilter || order.status === this.statusFilter;
      const matchesPayment = !this.paymentFilter || order.paymentStatus === this.paymentFilter;
      const matchesSearch = !this.searchTerm || 
        order.orderNumber.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return matchesStatus && matchesPayment && matchesSearch;
    });
  }

  clearFilters(): void {
    this.statusFilter = '';
    this.paymentFilter = '';
    this.searchTerm = '';
    this.filteredOrders = [...this.orders];
  }

  getPendingOrders(): number {
    return this.orders.filter(o => o.status === 'Pending').length;
  }

  getProcessingOrders(): number {
    return this.orders.filter(o => o.status === 'Processing').length;
  }

  getShippedOrders(): number {
    return this.orders.filter(o => o.status === 'Shipped').length;
  }

  getDeliveredOrders(): number {
    return this.orders.filter(o => o.status === 'Delivered').length;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Pending': return 'bg-warning text-dark';
      case 'Processing': return 'bg-info';
      case 'Shipped': return 'bg-primary';
      case 'Delivered': return 'bg-success';
      case 'Cancelled': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'Pending': return 'bi-hourglass-split';
      case 'Processing': return 'bi-gear';
      case 'Shipped': return 'bi-truck';
      case 'Delivered': return 'bi-check-circle';
      case 'Cancelled': return 'bi-x-circle';
      default: return 'bi-question-circle';
    }
  }

  getPaymentStatusClass(status: string): string {
    switch (status) {
      case 'Pending': return 'bg-warning text-dark';
      case 'Paid': return 'bg-success';
      case 'Failed': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getPaymentStatusIcon(status: string): string {
    switch (status) {
      case 'Pending': return 'bi-clock';
      case 'Paid': return 'bi-check-circle';
      case 'Failed': return 'bi-x-circle';
      default: return 'bi-question-circle';
    }
  }

  viewOrderDetails(order: Order): void {
    this.notificationService.info(
      'Order Details',
      `Viewing details for order #${order.orderNumber}`
    );
  }

  updateOrderStatus(order: Order, newStatus: string): void {
    if (confirm(`Update order #${order.orderNumber} status to "${newStatus}"?`)) {
      order.status = newStatus as any;
      this.notificationService.success(
        'Status Updated',
        `Order #${order.orderNumber} has been updated to ${newStatus}`
      );
    }
  }

  getEmptyStateMessage(): string {
    if (this.statusFilter || this.paymentFilter || this.searchTerm) {
      return 'No orders match your current filters. Try adjusting your search criteria.';
    }
    return 'No orders have been placed yet.';
  }
}