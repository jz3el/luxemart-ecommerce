import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../services/admin.service';
import { NotificationService } from '../services/notification.service';

interface User {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-admin-users',
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
                  <i class="bi bi-people"></i> User Management
                </h1>
                <p class="text-muted">Manage customer accounts and administrators</p>
              </div>
              <div>
                <button class="btn btn-outline-primary btn-sm me-2" (click)="loadUsers()">
                  <i class="bi bi-arrow-clockwise me-2"></i>Refresh
                </button>
                <a routerLink="/admin/dashboard" class="btn btn-outline-primary">
                  <i class="bi bi-arrow-left me-2"></i>Back to Dashboard
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="row mb-4">
          <div class="col-md-4 mb-3">
            <div class="card stat-card">
              <div class="card-body text-center">
                <div class="stat-icon mb-2">
                  <i class="bi bi-people-fill text-primary"></i>
                </div>
                <h3 class="fw-bold text-primary">{{ getTotalUsers() }}</h3>
                <p class="text-muted mb-0">Total Users</p>
              </div>
            </div>
          </div>
          <div class="col-md-4 mb-3">
            <div class="card stat-card">
              <div class="card-body text-center">
                <div class="stat-icon mb-2">
                  <i class="bi bi-person-check-fill text-success"></i>
                </div>
                <h3 class="fw-bold text-success">{{ getActiveUsers() }}</h3>
                <p class="text-muted mb-0">Active Users</p>
              </div>
            </div>
          </div>
          <div class="col-md-4 mb-3">
            <div class="card stat-card">
              <div class="card-body text-center">
                <div class="stat-icon mb-2">
                  <i class="bi bi-shield-check-fill text-warning"></i>
                </div>
                <h3 class="fw-bold text-warning">{{ getAdminUsers() }}</h3>
                <p class="text-muted mb-0">Administrators</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Users List -->
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">
                  <i class="bi bi-list-ul"></i> All Users
                </h5>
              </div>
              <div class="card-body">
                <div class="table-responsive">
                  <table class="table table-hover" *ngIf="users.length > 0; else noUsers">
                    <thead>
                      <tr>
                        <th>Avatar</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let user of users">
                        <td>
                          <div class="user-avatar">
                            {{ getUserInitials(user) }}
                          </div>
                        </td>
                        <td>
                          <div class="fw-bold">{{ user.firstName }} {{ user.lastName }}</div>
                          <small class="text-muted">ID: {{ user.userId }}</small>
                        </td>
                        <td>
                          <div>{{ user.email }}</div>
                          <small class="text-muted">{{ user.email.split('@')[1] }}</small>
                        </td>
                        <td>
                          <span *ngIf="user.phoneNumber; else noPhone">{{ user.phoneNumber }}</span>
                          <ng-template #noPhone>
                            <span class="text-muted">-</span>
                          </ng-template>
                        </td>
                        <td>
                          <span class="badge" [ngClass]="{
                            'bg-warning text-dark': user.role === 'Admin',
                            'bg-info': user.role === 'Customer'
                          }">
                            <i class="bi" [ngClass]="{
                              'bi-shield-check': user.role === 'Admin',
                              'bi-person': user.role === 'Customer'
                            }"></i>
                            {{ user.role }}
                          </span>
                        </td>
                        <td>
                          <span class="badge" [ngClass]="{
                            'bg-success': user.isActive,
                            'bg-danger': !user.isActive
                          }">
                            <i class="bi" [ngClass]="{
                              'bi-check-circle': user.isActive,
                              'bi-x-circle': !user.isActive
                            }"></i>
                            {{ user.isActive ? 'Active' : 'Inactive' }}
                          </span>
                        </td>
                        <td>
                          <div>{{ user.createdAt | date:'MMM d, y' }}</div>
                          <small class="text-muted">{{ user.createdAt | date:'shortTime' }}</small>
                        </td>
                        <td>
                          <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary" 
                                    (click)="viewUser(user)"
                                    title="View Details">
                              <i class="bi bi-eye"></i>
                            </button>
                            <button class="btn btn-outline-warning" 
                                    (click)="editUser(user)"
                                    title="Edit User"
                                    [disabled]="user.role === 'Admin'">
                              <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn" 
                                    [ngClass]="user.isActive ? 'btn-outline-danger' : 'btn-outline-success'"
                                    (click)="toggleUserStatus(user)"
                                    [title]="user.isActive ? 'Deactivate User' : 'Activate User'"
                                    [disabled]="user.role === 'Admin'">
                              <i class="bi" [ngClass]="user.isActive ? 'bi-pause' : 'bi-play'"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <ng-template #noUsers>
                    <div class="text-center py-5">
                      <i class="bi bi-people" style="font-size: 4rem; color: #6c757d;"></i>
                      <h4 class="mt-3 text-muted">No Users Found</h4>
                      <p class="text-muted">No users have registered yet.</p>
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
          <p class="mt-3">Loading users...</p>
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
    
    .stat-icon i {
      font-size: 2rem;
    }
    
    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--gradient-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 0.8rem;
      text-transform: uppercase;
    }
    
    .table-hover tbody tr:hover {
      background-color: rgba(102, 126, 234, 0.05);
    }
    
    .badge {
      font-size: 0.75rem;
      padding: 4px 8px;
    }
    
    .btn-group-sm .btn {
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
    }
  `]
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  loading = true;

  // Mock data for demonstration
  private mockUsers: User[] = [
    {
      userId: 1,
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@ecommerce.com',
      role: 'Admin',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      userId: 2,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phoneNumber: '+1234567890',
      role: 'Customer',
      isActive: true,
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      userId: 3,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phoneNumber: '+1987654321',
      role: 'Customer',
      isActive: true,
      createdAt: '2024-02-01T14:45:00Z'
    },
    {
      userId: 4,
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike.johnson@example.com',
      role: 'Customer',
      isActive: false,
      createdAt: '2024-02-10T09:15:00Z'
    }
  ];

  constructor(
    private adminService: AdminService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    
    // Simulate API call
    setTimeout(() => {
      this.users = [...this.mockUsers];
      this.loading = false;
    }, 800);
  }

  getTotalUsers(): number {
    return this.users.length;
  }

  getActiveUsers(): number {
    return this.users.filter(u => u.isActive).length;
  }

  getAdminUsers(): number {
    return this.users.filter(u => u.role === 'Admin').length;
  }

  getUserInitials(user: User): string {
    return (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase();
  }

  viewUser(user: User): void {
    this.notificationService.info('User Details', `Viewing details for ${user.firstName} ${user.lastName}`);
  }

  editUser(user: User): void {
    if (user.role === 'Admin') {
      this.notificationService.warning('Access Denied', 'Cannot edit administrator accounts');
      return;
    }
    this.notificationService.info('Edit User', `Edit functionality for ${user.firstName} ${user.lastName} would be implemented here`);
  }

  toggleUserStatus(user: User): void {
    if (user.role === 'Admin') {
      this.notificationService.warning('Access Denied', 'Cannot modify administrator accounts');
      return;
    }

    const action = user.isActive ? 'deactivate' : 'activate';
    if (confirm(`Are you sure you want to ${action} ${user.firstName} ${user.lastName}?`)) {
      user.isActive = !user.isActive;
      this.notificationService.success(
        'Status Updated',
        `User ${user.firstName} ${user.lastName} has been ${user.isActive ? 'activated' : 'deactivated'}`
      );
    }
  }
}