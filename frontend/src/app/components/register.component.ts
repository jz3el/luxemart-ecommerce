import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, RegisterRequest } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="main-content">
      <div class="container mt-4">
        <div class="row justify-content-center">
          <div class="col-md-6">
            <div class="card shadow-lg border-0">
              <div class="card-header premium-gradient text-white text-center">
                <h3 class="mb-0"><i class="bi bi-person-plus"></i> Create Account</h3>
              </div>
              <div class="card-body p-4">
                <form (ngSubmit)="onSubmit()" #registerForm="ngForm">
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="firstName" class="form-label">First Name</label>
                      <input type="text" class="form-control premium-input" id="firstName" 
                             [(ngModel)]="registerData.firstName" name="firstName" required>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label for="lastName" class="form-label">Last Name</label>
                      <input type="text" class="form-control premium-input" id="lastName" 
                             [(ngModel)]="registerData.lastName" name="lastName" required>
                    </div>
                  </div>
                  
                  <div class="mb-3">
                    <label for="email" class="form-label">Email</label>
                    <input type="email" class="form-control premium-input" id="email" 
                           [(ngModel)]="registerData.email" name="email" required>
                  </div>
                  
                  <div class="mb-3">
                    <label for="phoneNumber" class="form-label">Phone Number (Optional)</label>
                    <input type="tel" class="form-control premium-input" id="phoneNumber" 
                           [(ngModel)]="registerData.phoneNumber" name="phoneNumber">
                  </div>
                  
                  <div class="mb-3">
                    <label for="password" class="form-label">Password</label>
                    <input type="password" class="form-control premium-input" id="password" 
                           [(ngModel)]="registerData.password" name="password" required>
                  </div>
                  
                  <div class="mb-3">
                    <label for="confirmPassword" class="form-label">Confirm Password</label>
                    <input type="password" class="form-control premium-input" id="confirmPassword" 
                           [(ngModel)]="registerData.confirmPassword" name="confirmPassword" required>
                  </div>
                  
                  <div *ngIf="errorMessage" class="alert alert-danger">
                    {{ errorMessage }}
                  </div>
                  
                  <button type="submit" class="btn btn-premium w-100 mb-3" 
                          [disabled]="isLoading || !registerForm.valid">
                    <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                    <i class="bi bi-person-check"></i> Create Account
                  </button>
                </form>
                
                <div class="text-center">
                  <p class="text-muted">Already have an account? 
                    <a routerLink="/login" class="premium-link">Sign in here</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  registerData: RegisterRequest = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: ''
  };
  
  isLoading = false;
  errorMessage = '';

  constructor(private authService: AuthService) {}

  onSubmit(): void {
    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    
    this.authService.register(this.registerData).subscribe({
      next: () => {
        this.isLoading = false;
        // Redirect will happen automatically via route guard
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Registration failed';
      }
    });
  }
}