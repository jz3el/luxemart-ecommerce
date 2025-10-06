import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface CartItem {
  cartItemId: number;
  productId: number;
  productName: string;
  productImageUrl?: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  stockQuantity: number;
  isAvailable: boolean;
}

export interface CartSummary {
  items: CartItem[];
  totalItems: number;
  subTotal: number;
  estimatedTax: number;
  estimatedTotal: number;
  hasUnavailableItems: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:5000/api';
  private cartSubject = new BehaviorSubject<CartSummary>({
    items: [],
    totalItems: 0,
    subTotal: 0,
    estimatedTax: 0,
    estimatedTotal: 0,
    hasUnavailableItems: false
  });
  
  public cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) {}

  getCart(): Observable<CartSummary> {
    return this.http.get<CartSummary>(`${this.apiUrl}/cart`)
      .pipe(tap(cart => this.cartSubject.next(cart)));
  }

  addToCart(productId: number, quantity: number): Observable<CartItem> {
    return this.http.post<CartItem>(`${this.apiUrl}/cart/items`, { productId, quantity })
      .pipe(tap(() => this.refreshCart()));
  }

  updateCartItem(itemId: number, quantity: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/cart/items/${itemId}`, { quantity })
      .pipe(tap(() => this.refreshCart()));
  }

  removeFromCart(itemId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cart/items/${itemId}`)
      .pipe(tap(() => this.refreshCart()));
  }

  clearCart(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cart`)
      .pipe(tap(() => this.refreshCart()));
  }

  getCartItemCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/cart/count`);
  }

  private refreshCart(): void {
    this.getCart().subscribe();
  }
}