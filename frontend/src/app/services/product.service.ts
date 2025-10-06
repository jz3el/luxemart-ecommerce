import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  productId: number;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  sku: string;
  stockQuantity: number;
  imageUrl?: string;
  categoryId: number;
  categoryName: string;
  isFeatured: boolean;
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

export interface ProductQuery {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  getProducts(query?: ProductQuery): Observable<PagedResult<Product>> {
    let params = new HttpParams();
    
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<PagedResult<Product>>(`${this.apiUrl}/products`, { params });
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`);
  }

  getFeaturedProducts(count = 8): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/featured?count=${count}`);
  }
}