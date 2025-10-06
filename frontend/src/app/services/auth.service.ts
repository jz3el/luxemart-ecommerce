import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface User {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  expiration: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token && !this.isTokenExpired(token)) {
        this.loadUserFromToken();
      }
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(tap(response => this.setSession(response)));
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, userData)
      .pipe(tap(response => this.setSession(response)));
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiry');
    }
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : null;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return token != null && !this.isTokenExpired(token);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private setSession(authResult: AuthResponse): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', authResult.token);
      localStorage.setItem('tokenExpiry', authResult.expiration);
    }
    this.currentUserSubject.next(authResult.user);
  }

  private isTokenExpired(token: string): boolean {
    if (!isPlatformBrowser(this.platformId)) return true;
    const expiry = localStorage.getItem('tokenExpiry');
    return expiry ? new Date() > new Date(expiry) : true;
  }

  private loadUserFromToken(): void {
    this.http.get<User>(`${this.apiUrl}/auth/profile`).subscribe({
      next: user => this.currentUserSubject.next(user),
      error: () => this.logout()
    });
  }
}