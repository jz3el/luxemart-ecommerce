import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService, User } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="main-content">
      <div class="container mt-4">
        <div class="row">
          <div class="col-lg-8 offset-lg-2">
            <!-- Header -->
            <div class="text-center mb-5">
              <h1 class="display-5 fw-bold">
                <i class="bi bi-person-circle"></i> My Profile
              </h1>
              <p class="text-muted">Manage your account information</p>
            </div>

            <!-- Profile Card -->
            <div class="card shadow-lg border-0" *ngIf="user">
              <div class="card-header premium-gradient text-white text-center py-4">
                <div class="profile-avatar mb-3">
                  <i class="bi bi-person-circle display-3"></i>
                </div>
                <h4 class="mb-0">{{ user.firstName }} {{ user.lastName }}</h4>
                <p class="mb-0 opacity-75">{{ user.email }}</p>
                <span class="badge bg-light text-dark mt-2">{{ user.role }}</span>
              </div>
              
              <div class="card-body p-4">
                <!-- Account Information -->
                <div class="row mb-4">
                  <div class="col-md-6 mb-3">
                    <label class="form-label fw-bold">First Name</label>
                    <div class="input-group">
                      <span class="input-group-text"><i class="bi bi-person"></i></span>
                      <input type="text" class="form-control premium-input" 
                             [(ngModel)]="user.firstName" readonly>
                    </div>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label fw-bold">Last Name</label>
                    <div class="input-group">
                      <span class="input-group-text"><i class="bi bi-person"></i></span>
                      <input type="text" class="form-control premium-input" 
                             [(ngModel)]="user.lastName" readonly>
                    </div>
                  </div>
                </div>

                <div class="row mb-4">
                  <div class="col-md-6 mb-3">
                    <label class="form-label fw-bold">Email Address</label>
                    <div class="input-group">
                      <span class="input-group-text"><i class="bi bi-envelope"></i></span>
                      <input type="email" class="form-control premium-input" 
                             [(ngModel)]="user.email" readonly>
                    </div>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label fw-bold">Phone Number</label>
                    <div class="input-group">
                      <span class="input-group-text"><i class="bi bi-telephone"></i></span>
                      <input type="tel" class="form-control premium-input" 
                             [(ngModel)]="user.phoneNumber" 
                             placeholder="Not provided">
                    </div>
                  </div>
                </div>

                <!-- Address Information -->
                <h5 class="mb-3 text-success">
                  <i class="bi bi-geo-alt"></i> Address Information
                </h5>
                <div class="row mb-4">
                  <div class="col-12 mb-3">
                    <label class="form-label fw-bold">Street Address</label>
                    <div class="input-group">
                      <span class="input-group-text"><i class="bi bi-house"></i></span>
                      <input type="text" class="form-control premium-input" 
                             [(ngModel)]="user.address" 
                             placeholder="Enter your address">
                    </div>
                  </div>
                  <div class="col-md-4 mb-3">
                    <label class="form-label fw-bold">City</label>
                    <input type="text" class="form-control premium-input" 
                           [(ngModel)]="user.city" 
                           placeholder="City">
                  </div>
                  <div class="col-md-4 mb-3">
                    <label class="form-label fw-bold">State</label>
                    <input type="text" class="form-control premium-input" 
                           [(ngModel)]="user.state" 
                           placeholder="State">
                  </div>
                  <div class="col-md-4 mb-3">
                    <label class="form-label fw-bold">ZIP Code</label>
                    <input type="text" class="form-control premium-input" 
                           [(ngModel)]="user.zipCode" 
                           placeholder="ZIP">
                  </div>
                </div>

                <div class="row mb-4">
                  <div class="col-md-6 mb-3">
                    <label class="form-label fw-bold">Country</label>
                    <input type="text" class="form-control premium-input" 
                           [(ngModel)]="user.country" 
                           placeholder="Country">
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label fw-bold">Member Since</label>
                    <div class="input-group">
                      <span class="input-group-text"><i class="bi bi-calendar"></i></span>
                      <input type="text" class="form-control premium-input" 
                             [value]="user.createdAt | date:'fullDate'" readonly>
                    </div>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="d-flex gap-3 justify-content-center">
                  <button type="button" class="btn btn-premium px-4" 
                          (click)="updateProfile()" [disabled]="isUpdating">
                    <span *ngIf="isUpdating" class="spinner-border spinner-border-sm me-2"></span>
                    <i class="bi bi-check-circle me-2"></i>
                    {{ isUpdating ? 'Updating...' : 'Update Profile' }}
                  </button>
                  <button type="button" class="btn btn-outline-primary px-4" 
                          (click)="showChangePassword = !showChangePassword">
                    <i class="bi bi-key me-2"></i>
                    Change Password
                  </button>
                </div>

                <!-- Change Password Section -->
                <div *ngIf="showChangePassword" class="mt-4 pt-4 border-top">
                  <h5 class="mb-3 text-warning">
                    <i class="bi bi-key"></i> Change Password
                  </h5>
                  <div class="row">
                    <div class="col-md-4 mb-3">
                      <label class="form-label">Current Password</label>
                      <input type="password" class="form-control premium-input" 
                             [(ngModel)]="passwordData.currentPassword" 
                             placeholder="Enter current password">
                    </div>
                    <div class="col-md-4 mb-3">
                      <label class="form-label">New Password</label>
                      <input type="password" class="form-control premium-input" 
                             [(ngModel)]="passwordData.newPassword" 
                             placeholder="Enter new password">
                    </div>
                    <div class="col-md-4 mb-3">
                      <label class="form-label">Confirm Password</label>
                      <input type="password" class="form-control premium-input" 
                             [(ngModel)]="passwordData.confirmPassword" 
                             placeholder="Confirm new password">
                    </div>
                  </div>
                  <div class="text-center">
                    <button type="button" class="btn btn-warning me-2" 
                            (click)="changePassword()" [disabled]="isChangingPassword">
                      <span *ngIf="isChangingPassword" class="spinner-border spinner-border-sm me-2"></span>
                      {{ isChangingPassword ? 'Changing...' : 'Change Password' }}
                    </button>
                    <button type="button" class="btn btn-outline-secondary" 
                            (click)="cancelChangePassword()">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Stats -->
            <div class="row mt-5">
              <div class="col-md-4 mb-3">
                <div class="card stat-card text-center">
                  <div class="card-body">
                    <i class="bi bi-cart-check display-4 text-success mb-3"></i>
                    <h3 class="text-success">Coming Soon</h3>
                    <p class="text-muted">Total Orders</p>
                  </div>
                </div>
              </div>
              <div class="col-md-4 mb-3">
                <div class="card stat-card text-center">
                  <div class="card-body">
                    <i class="bi bi-heart display-4 text-danger mb-3"></i>
                    <h3 class="text-danger">Coming Soon</h3>
                    <p class="text-muted">Wishlist Items</p>
                  </div>
                </div>
              </div>
              <div class="col-md-4 mb-3">
                <div class="card stat-card text-center">
                  <div class="card-body">
                    <i class="bi bi-star display-4 text-warning mb-3"></i>
                    <h3 class="text-warning">Coming Soon</h3>
                    <p class="text-muted">Reviews</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  isUpdating = false;
  isChangingPassword = false;
  showChangePassword = false;
  
  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
  }

  updateProfile(): void {
    if (!this.user) return;
    
    this.isUpdating = true;
    
    // Mock profile update - replace with actual API call
    setTimeout(() => {
      this.isUpdating = false;
      this.notificationService.success(
        'Profile Updated',
        'Your profile has been updated successfully!'
      );
    }, 1500);
  }

  changePassword(): void {
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.notificationService.error(
        'Password Mismatch',
        'New password and confirmation do not match'
      );
      return;
    }
    
    if (this.passwordData.newPassword.length < 6) {
      this.notificationService.error(
        'Weak Password',
        'Password must be at least 6 characters long'
      );
      return;
    }
    
    this.isChangingPassword = true;
    
    // Mock password change - replace with actual API call
    setTimeout(() => {
      this.isChangingPassword = false;
      this.showChangePassword = false;
      this.passwordData = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
      this.notificationService.success(
        'Password Changed',
        'Your password has been changed successfully!'
      );
    }, 2000);
  }

  cancelChangePassword(): void {
    this.showChangePassword = false;
    this.passwordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }
}