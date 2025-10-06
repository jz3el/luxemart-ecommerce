import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdminDashboard {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
  recentOrders: AdminOrderSummary[];
  lowStockProducts: ProductSummary[];
}

export interface AdminOrderSummary {
  orderId: number;
  orderNumber: string;
  userName: string;
  userEmail: string;
  totalAmount: number;
  status: string;
  orderDate: Date;
}

export interface ProductSummary {
  productId: number;
  name: string;
  sku: string;
  stockQuantity: number;
  lowStockThreshold: number;
  price: number;
}

export interface AdminUser {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:5000/api/admin';

  constructor(private http: HttpClient) {}

  // Dashboard
  getDashboard(): Observable<AdminDashboard> {
    return this.http.get<AdminDashboard>(`${this.apiUrl}/dashboard`);
  }

  // User Management
  getUsers(search?: string, role?: string, page: number = 1, pageSize: number = 10): Observable<PagedResult<AdminUser>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    if (search) params = params.set('search', search);
    if (role) params = params.set('role', role);

    return this.http.get<PagedResult<AdminUser>>(`${this.apiUrl}/users`, { params });
  }

  toggleUserStatus(userId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}/toggle-status`, {});
  }

  updateUserRole(userId: number, role: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}/role`, { role });
  }

  // Product Management
  getAdminProducts(
    search?: string,
    categoryId?: number,
    isActive?: boolean,
    page: number = 1,
    pageSize: number = 10
  ): Observable<PagedResult<any>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    if (search) params = params.set('search', search);
    if (categoryId) params = params.set('categoryId', categoryId.toString());
    if (isActive !== undefined) params = params.set('isActive', isActive.toString());

    return this.http.get<PagedResult<any>>(`${this.apiUrl}/products`, { params });
  }

  createProduct(product: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/products`, product);
  }

  updateProduct(productId: number, product: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/products/${productId}`, product);
  }

  deleteProduct(productId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/products/${productId}`);
  }

  // Order Management
  getAdminOrders(
    status?: string,
    search?: string,
    page: number = 1,
    pageSize: number = 10
  ): Observable<PagedResult<any>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    if (status) params = params.set('status', status);
    if (search) params = params.set('search', search);

    return this.http.get<PagedResult<any>>(`${this.apiUrl}/orders`, { params });
  }
}