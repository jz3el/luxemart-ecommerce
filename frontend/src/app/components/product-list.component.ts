import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService, Product, PagedResult } from '../services/product.service';
import { CartService } from '../services/cart.service';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="main-content">
      <div class="container mt-4">
        <!-- Header with Search -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="text-center mb-4">
              <h1 class="display-4 fw-bold mb-2" style="background: var(--gradient-secondary); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                <i class="bi bi-gem me-3"></i>Premium Collection
              </h1>
              <p class="text-muted fs-5">Discover luxury products crafted for excellence</p>
              <div class="d-flex justify-content-center mt-3">
                <div class="divider-line"></div>
              </div>
            </div>
            
            <!-- Search and Filters -->
            <div class="card mb-4">
              <div class="card-body">
                <div class="row align-items-center">
                  <div class="col-md-6 mb-3 mb-md-0">
                    <div class="input-group">
                      <span class="input-group-text premium-gradient text-white border-0">
                        <i class="bi bi-search"></i>
                      </span>
                      <input type="text" class="form-control premium-input border-0" 
                             placeholder="Search products..." 
                             [(ngModel)]="searchTerm" 
                             (keyup.enter)="searchProducts()"
                             #searchInput>
                      <button class="btn btn-premium" (click)="searchProducts()">
                        Search
                      </button>
                    </div>
                  </div>
                  <div class="col-md-3 mb-3 mb-md-0">
                    <select class="form-select premium-input" [(ngModel)]="selectedCategory" (change)="filterProducts()">
                      <option value="">All Categories</option>
                      <option value="1">Electronics</option>
                      <option value="2">Clothing</option>
                      <option value="3">Books</option>
                    </select>
                  </div>
                  <div class="col-md-3">
                    <select class="form-select premium-input" [(ngModel)]="sortBy" (change)="sortProducts()">
                      <option value="name">Name (A-Z)</option>
                      <option value="price_low">Price (Low to High)</option>
                      <option value="price_high">Price (High to Low)</option>
                      <option value="newest">Newest First</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      
      <div class="row" *ngIf="!loading">
        <div class="col-lg-4 col-md-6 mb-4" *ngFor="let product of products">
          <div class="card h-100 premium-card">
            <div class="position-relative overflow-hidden">
              <img [src]="getProductImage(product)" 
                   class="card-img-top product-image" 
                   [alt]="product.name">
              <div class="product-overlay">
                <div class="overlay-content">
                  <i class="bi bi-eye-fill"></i>
                </div>
              </div>
              <span *ngIf="product.stockQuantity === 0" 
                    class="position-absolute top-0 end-0 badge text-white m-3" 
                    style="background: var(--gradient-primary); font-weight: 600;">
                <i class="bi bi-x-circle me-1"></i>Out of Stock
              </span>
              <span *ngIf="product.stockQuantity > 0 && product.stockQuantity <= 10" 
                    class="position-absolute top-0 end-0 badge text-dark m-3" 
                    style="background: var(--gradient-secondary); font-weight: 600;">
                <i class="bi bi-exclamation-triangle me-1"></i>Limited
              </span>
            </div>
            <div class="card-body d-flex flex-column p-4">
              <h5 class="card-title fw-bold mb-3" style="color: var(--primary-white);">{{ product.name }}</h5>
              <p class="card-text flex-grow-1 text-muted mb-4">{{ product.description }}</p>
              
              <div class="price-section mb-4">
                <div class="d-flex align-items-center justify-content-between">
                  <div class="price-group">
                    <span class="h3 fw-bold" style="background: var(--gradient-secondary); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                      \${{ product.price | number:'1.2-2' }}
                    </span>
                    <span *ngIf="product.compareAtPrice" 
                          class="text-muted text-decoration-line-through ms-2 fs-6">
                      \${{ product.compareAtPrice | number:'1.2-2' }}
                    </span>
                  </div>
                  <div class="stock-badge">
                    <span class="badge rounded-pill" 
                          [style.background]="product.stockQuantity > 10 ? 'var(--gradient-secondary)' : 'var(--gradient-primary)'" 
                          [style.color]="product.stockQuantity > 10 ? 'var(--deep-black)' : 'var(--primary-white)'">
                      <i class="bi bi-box-seam me-1"></i>{{ product.stockQuantity }} left
                    </span>
                  </div>
                </div>
              </div>
              
              <button class="btn btn-primary btn-lg mt-3" 
                      [disabled]="!isAuthenticated || product.stockQuantity === 0 || isAddingToCart"
                      (click)="addToCart(product)">
                <span *ngIf="isAddingToCart" class="spinner-border spinner-border-sm me-2" role="status"></span>
                <i class="bi bi-cart-plus me-1"></i>
                {{ getButtonText(product) }}
              </button>
              
              <div *ngIf="!isAuthenticated" class="text-center mt-2">
                <small class="text-muted">
                  <i class="bi bi-info-circle"></i> 
                  <a routerLink="/login" class="text-decoration-none">Login</a> to purchase
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Pagination -->
      <div class="row mt-5" *ngIf="!loading && pagedResult && pagedResult.totalPages > 1">
        <div class="col-12">
          <nav aria-label="Product pagination">
            <ul class="pagination justify-content-center">
              <li class="page-item" [class.disabled]="!hasPreviousPage">
                <button class="page-link premium-pagination" (click)="changePage(currentPage - 1)" [disabled]="!hasPreviousPage">
                  <i class="bi bi-chevron-left"></i> Previous
                </button>
              </li>
              
              <li class="page-item" *ngFor="let page of getPageNumbers()" [class.active]="page === currentPage">
                <button class="page-link premium-pagination" (click)="changePage(page)">{{ page }}</button>
              </li>
              
              <li class="page-item" [class.disabled]="!hasNextPage">
                <button class="page-link premium-pagination" (click)="changePage(currentPage + 1)" [disabled]="!hasNextPage">
                  Next <i class="bi bi-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
          
          <!-- Results Info -->
          <div class="text-center text-muted">
            Showing {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, pagedResult.totalCount) }} 
            of {{ pagedResult.totalCount }} products
          </div>
        </div>
      </div>
      
      <!-- Loading State -->
      <div *ngIf="loading" class="text-center mt-5">
        <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
          <span class="visually-hidden">Loading products...</span>
        </div>
        <p class="mt-3 text-muted">Loading amazing products for you...</p>
      </div>
      
      <!-- Empty State -->
      <div *ngIf="!loading && products.length === 0" class="text-center mt-5 py-5">
        <div class="empty-state-icon mb-4">
          <i class="bi bi-search" style="font-size: 4rem; opacity: 0.5;"></i>
        </div>
        <h3 class="mt-3" style="color: var(--primary-white);">No products found</h3>
        <p class="text-muted mb-4">We couldn't find any products matching your criteria</p>
        <button class="btn btn-premium px-4 py-2" (click)="clearFilters()">
          <i class="bi bi-arrow-clockwise me-2"></i>Clear Filters
        </button>
      </div>
    </div>
    </div>
  `,
  styles: [`
    .divider-line {
      width: 100px;
      height: 3px;
      background: var(--gradient-secondary);
      border-radius: 2px;
    }
    
    .premium-card {
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      border: 2px solid rgba(255,255,255,0.1);
      overflow: hidden;
    }
    
    .premium-card:hover {
      transform: translateY(-10px) scale(1.02);
      border-color: rgba(255,255,255,0.3);
    }
    
    .product-image {
      width: 100%;
      height: 250px;
      object-fit: cover;
      transition: transform 0.6s ease;
    }
    
    .premium-card:hover .product-image {
      transform: scale(1.1);
    }
    
    .product-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: all 0.3s ease;
      backdrop-filter: blur(5px);
    }
    
    .premium-card:hover .product-overlay {
      opacity: 1;
    }
    
    .overlay-content {
      color: var(--primary-white);
      font-size: 2rem;
      transform: translateY(20px);
      transition: transform 0.3s ease;
    }
    
    .premium-card:hover .overlay-content {
      transform: translateY(0);
    }
    
    .price-group {
      display: flex;
      align-items: baseline;
    }
    
    .stock-badge .badge {
      font-size: 0.75rem;
      padding: 6px 12px;
      font-weight: 600;
    }
    
    .empty-state-icon {
      background: var(--gradient-primary);
      border-radius: 50%;
      width: 120px;
      height: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
      border: 3px solid rgba(255,255,255,0.1);
    }
    
    .empty-state-icon i {
      background: var(--gradient-secondary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    @media (max-width: 768px) {
      .product-image {
        height: 200px;
      }
      
      .card-body {
        padding: 1rem !important;
      }
    }
  `]
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  pagedResult: PagedResult<Product> | null = null;
  loading = true;
  isAuthenticated = false;
  isAddingToCart = false;
  
  // Search and Filter properties
  searchTerm = '';
  selectedCategory = '';
  sortBy = 'name';
  currentPage = 1;
  pageSize = 12;
  
  // Pagination helper
  get totalPages(): number {
    return this.pagedResult?.totalPages || 1;
  }
  
  get hasNextPage(): boolean {
    return this.pagedResult?.hasNext || false;
  }
  
  get hasPreviousPage(): boolean {
    return this.pagedResult?.hasPrevious || false;
  }

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
    });

    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    
    const query = {
      search: this.searchTerm,
      categoryId: this.selectedCategory ? parseInt(this.selectedCategory) : undefined,
      page: this.currentPage,
      pageSize: this.pageSize,
      sortBy: this.getSortField(),
      sortOrder: this.getSortOrder()
    };
    
    this.productService.getProducts(query).subscribe({
      next: (result) => {
        this.pagedResult = result;
        this.products = result.items;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.products = [];
      }
    });
  }
  
  searchProducts(): void {
    this.currentPage = 1;
    this.loadProducts();
  }
  
  filterProducts(): void {
    this.currentPage = 1;
    this.loadProducts();
  }
  
  sortProducts(): void {
    this.currentPage = 1;
    this.loadProducts();
  }
  
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadProducts();
    }
  }
  
  private getSortField(): string {
    switch (this.sortBy) {
      case 'price_low':
      case 'price_high':
        return 'Price';
      case 'newest':
        return 'CreatedAt';
      default:
        return 'Name';
    }
  }
  
  private getSortOrder(): string {
    return this.sortBy === 'price_high' || this.sortBy === 'newest' ? 'desc' : 'asc';
  }

  addToCart(product: Product): void {
    if (!this.isAuthenticated) {
      this.notificationService.warning(
        'Login Required',
        'Please login to add items to your cart'
      );
      return;
    }
    
    if (product.stockQuantity === 0) {
      this.notificationService.error(
        'Out of Stock',
        `${product.name} is currently out of stock`
      );
      return;
    }
    
    this.isAddingToCart = true;
    this.cartService.addToCart(product.productId, 1).subscribe({
      next: () => {
        this.isAddingToCart = false;
        this.notificationService.success(
          'Added to Cart',
          `${product.name} has been added to your cart`
        );
      },
      error: (error) => {
        this.isAddingToCart = false;
        this.notificationService.error(
          'Cart Error',
          error.error?.message || 'Failed to add item to cart'
        );
      }
    });
  }

  getProductImage(product: Product): string {
    if (product.imageUrl && product.imageUrl !== '') {
      return product.imageUrl;
    }
    
    // Generate a beautiful placeholder based on product category/name
    const productName = product.name.toLowerCase();
    if (productName.includes('laptop') || productName.includes('computer')) {
      return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop&crop=center';
    } else if (productName.includes('coffee') || productName.includes('mug')) {
      return 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=300&fit=crop&crop=center';
    } else if (productName.includes('notebook') || productName.includes('book')) {
      return 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop&crop=center';
    } else if (productName.includes('phone') || productName.includes('mobile')) {
      return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop&crop=center';
    } else if (productName.includes('watch')) {
      return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop&crop=center';
    } else {
      // Default beautiful placeholder
      return `https://picsum.photos/400/300?random=${product.productId}&blur=1`;
    }
  }

  getButtonText(product: Product): string {
    if (product.stockQuantity === 0) {
      return 'Out of Stock';
    }
    return this.isAuthenticated ? 'Add to Cart' : 'Login to Purchase';
  }
  
  getPageNumbers(): number[] {
    const maxPages = 5;
    const pages: number[] = [];
    const startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    const endPage = Math.min(this.totalPages, startPage + maxPages - 1);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }
  
  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.sortBy = 'name';
    this.currentPage = 1;
    this.loadProducts();
  }
  
  // Make Math available in template
  Math = Math;
}
