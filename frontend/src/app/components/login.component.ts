import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="main-content">
      <div class="container mt-4">
        <div class="row justify-content-center">
          <div class="col-md-6">
            <div class="card shadow-lg border-0">
              <div class="card-header premium-gradient text-white text-center">
                <h3 class="mb-0"><i class="bi bi-person-circle"></i> Welcome Back</h3>
              </div>
              <div class="card-body p-4">
                <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
                  <div class="mb-3">
                    <label for="email" class="form-label">Email Address</label>
                    <input type="email" class="form-control premium-input" id="email" formControlName="email"
                           [class.is-invalid]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
                           placeholder="Enter your email">
                    <div class="invalid-feedback">Please enter a valid email</div>
                  </div>
                  <div class="mb-3">
                    <label for="password" class="form-label">Password</label>
                    <input type="password" class="form-control premium-input" id="password" formControlName="password"
                           [class.is-invalid]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                           placeholder="Enter your password">
                    <div class="invalid-feedback">Password is required</div>
                  </div>
                  <div *ngIf="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
                  <button type="submit" class="btn btn-premium w-100 mb-3" [disabled]="loginForm.invalid || isLoading">
                    <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                    <i class="bi bi-box-arrow-in-right"></i>
                    {{ isLoading ? 'Signing In...' : 'Sign In' }}
                  </button>
                </form>
                <div class="text-center">
                  <p class="text-muted">Don't have an account? 
                    <a routerLink="/register" class="premium-link">Create one here</a>
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
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Login failed';
        }
      });
    }
  }
}