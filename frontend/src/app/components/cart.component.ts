import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService, CartSummary } from '../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="main-content">
      <div class="container mt-4">
        <div class="row">
          <div class="col-12">
            <h1 class="display-5 text-center mb-4">
              <i class="bi bi-cart3"></i> Shopping Cart
            </h1>
          </div>
        </div>
        
        <div *ngIf="cart.items.length > 0; else emptyCart">
          <div class="row">
            <div class="col-lg-8">
              <div class="card shadow-sm border-0 mb-4" *ngFor="let item of cart.items">
                <div class="card-body">
                  <div class="row align-items-center">
                    <div class="col-md-2">
                      <img [src]="item.productImageUrl || 'https://via.placeholder.com/80x80'" 
                           class="img-fluid rounded" [alt]="item.productName">
                    </div>
                    <div class="col-md-4">
                      <h6 class="fw-bold">{{ item.productName }}</h6>
                      <p class="text-muted mb-0">Price: \${{ item.unitPrice | number:'1.2-2' }}</p>
                      <span *ngIf="!item.isAvailable" class="badge bg-warning">Out of Stock</span>
                    </div>
                    <div class="col-md-3">
                      <div class="d-flex align-items-center">
                        <button class="btn btn-outline-secondary btn-sm me-2" 
                                (click)="updateQuantity(item.cartItemId, item.quantity - 1)"
                                [disabled]="item.quantity <= 1">
                          <i class="bi bi-dash"></i>
                        </button>
                        <span class="fw-bold mx-2">{{ item.quantity }}</span>
                        <button class="btn btn-outline-secondary btn-sm ms-2" 
                                (click)="updateQuantity(item.cartItemId, item.quantity + 1)"
                                [disabled]="item.quantity >= item.stockQuantity">
                          <i class="bi bi-plus"></i>
                        </button>
                      </div>
                    </div>
                    <div class="col-md-2">
                      <strong class="text-success">\${{ item.totalPrice | number:'1.2-2' }}</strong>
                    </div>
                    <div class="col-md-1">
                      <button class="btn btn-outline-danger btn-sm" 
                              (click)="removeItem(item.cartItemId)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="col-lg-4">
              <div class="card shadow-sm border-0 sticky-top">
                <div class="card-header premium-gradient text-white">
                  <h5 class="mb-0"><i class="bi bi-receipt"></i> Order Summary</h5>
                </div>
                <div class="card-body">
                  <div class="d-flex justify-content-between mb-2">
                    <span>Subtotal ({{ cart.totalItems }} items):</span>
                    <strong>\${{ cart.subTotal | number:'1.2-2' }}</strong>
                  </div>
                  <div class="d-flex justify-content-between mb-2">
                    <span>Estimated Tax:</span>
                    <span>\${{ cart.estimatedTax | number:'1.2-2' }}</span>
                  </div>
                  <hr>
                  <div class="d-flex justify-content-between mb-3">
                    <strong>Total:</strong>
                    <strong class="text-success h5">\${{ cart.estimatedTotal | number:'1.2-2' }}</strong>
                  </div>
                  
                  <button class="btn btn-premium w-100 mb-2" 
                          [disabled]="cart.hasUnavailableItems"
                          (click)="proceedToCheckout()">
                    <i class="bi bi-credit-card"></i> Proceed to Checkout
                  </button>
                  
                  <button class="btn btn-outline-secondary w-100" (click)="clearCart()">
                    <i class="bi bi-trash"></i> Clear Cart
                  </button>
                  
                  <div *ngIf="cart.hasUnavailableItems" class="alert alert-warning mt-3">
                    <small><i class="bi bi-exclamation-triangle"></i> Some items are out of stock</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <ng-template #emptyCart>
          <div class="text-center mt-5">
            <i class="bi bi-cart-x" style="font-size: 5rem; color: #6c757d;"></i>
            <h3 class="mt-3 text-muted">Your cart is empty</h3>
            <p class="text-muted">Add some products to get started!</p>
            <a routerLink="/products" class="btn btn-premium">
              <i class="bi bi-shop"></i> Start Shopping
            </a>
          </div>
        </ng-template>
      </div>
    </div>
  `
})
export class CartComponent implements OnInit {
  cart: CartSummary = {
    items: [],
    totalItems: 0,
    subTotal: 0,
    estimatedTax: 0,
    estimatedTotal: 0,
    hasUnavailableItems: false
  };

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.cartService.getCart().subscribe({
      next: (cart) => this.cart = cart,
      error: () => console.error('Error loading cart')
    });
  }

  updateQuantity(itemId: number, quantity: number): void {
    if (quantity <= 0) return;
    
    this.cartService.updateCartItem(itemId, quantity).subscribe({
      next: () => this.loadCart(),
      error: () => alert('Error updating cart item')
    });
  }

  removeItem(itemId: number): void {
    this.cartService.removeFromCart(itemId).subscribe({
      next: () => this.loadCart(),
      error: () => alert('Error removing item')
    });
  }

  clearCart(): void {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.cartService.clearCart().subscribe({
        next: () => this.loadCart(),
        error: () => alert('Error clearing cart')
      });
    }
  }

  proceedToCheckout(): void {
    // TODO: Implement checkout functionality
    alert('Checkout functionality will be implemented soon!');
  }
}