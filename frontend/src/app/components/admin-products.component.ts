import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../services/product.service';
import { NotificationService } from '../services/notification.service';

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  stockQuantity: number;
  lowStockThreshold: number;
  categoryId: number;
  imageUrl?: string;
  sku: string;
  isActive: boolean;
  isFeatured: boolean;
}

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="main-content">
      <div class="container mt-4">
        <!-- Header -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h1 class="display-5 fw-bold">
                  <i class="bi bi-box-seam"></i> Product Management
                </h1>
                <p class="text-muted">Manage your product catalog</p>
              </div>
              <div>
                <button class="btn btn-premium me-2" (click)="showAddForm = !showAddForm">
                  <i class="bi bi-plus-circle me-2"></i>Add New Product
                </button>
                <a routerLink="/admin/dashboard" class="btn btn-outline-primary">
                  <i class="bi bi-arrow-left me-2"></i>Back to Dashboard
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Add Product Form -->
        <div class="row mb-4" *ngIf="showAddForm">
          <div class="col-12">
            <div class="card">
              <div class="card-header premium-gradient text-white">
                <h5 class="mb-0">
                  <i class="bi bi-plus-circle"></i> Add New Product
                </h5>
              </div>
              <div class="card-body">
                <form (ngSubmit)="addProduct()" #productForm="ngForm">
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label class="form-label">Product Name *</label>
                      <input type="text" class="form-control premium-input" 
                             [(ngModel)]="newProduct.name" name="name" required>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="form-label">SKU *</label>
                      <input type="text" class="form-control premium-input" 
                             [(ngModel)]="newProduct.sku" name="sku" required>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-4 mb-3">
                      <label class="form-label">Price *</label>
                      <input type="number" class="form-control premium-input" step="0.01"
                             [(ngModel)]="newProduct.price" name="price" required>
                    </div>
                    <div class="col-md-4 mb-3">
                      <label class="form-label">Compare At Price</label>
                      <input type="number" class="form-control premium-input" step="0.01"
                             [(ngModel)]="newProduct.compareAtPrice" name="compareAtPrice">
                    </div>
                    <div class="col-md-4 mb-3">
                      <label class="form-label">Category *</label>
                      <select class="form-select premium-input" 
                              [(ngModel)]="newProduct.categoryId" name="categoryId" required>
                        <option value="1">Electronics</option>
                        <option value="2">Clothing</option>
                        <option value="3">Books</option>
                      </select>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label class="form-label">Stock Quantity *</label>
                      <input type="number" class="form-control premium-input" 
                             [(ngModel)]="newProduct.stockQuantity" name="stockQuantity" required>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="form-label">Low Stock Threshold</label>
                      <input type="number" class="form-control premium-input" 
                             [(ngModel)]="newProduct.lowStockThreshold" name="lowStockThreshold">
                    </div>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Image URL</label>
                    <input type="url" class="form-control premium-input" 
                           [(ngModel)]="newProduct.imageUrl" name="imageUrl">
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Description *</label>
                    <textarea class="form-control premium-input" rows="3"
                              [(ngModel)]="newProduct.description" name="description" required></textarea>
                  </div>
                  <div class="row mb-3">
                    <div class="col-md-6">
                      <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" 
                               [(ngModel)]="newProduct.isActive" name="isActive" id="isActive">
                        <label class="form-check-label text-white" for="isActive">
                          Active Product
                        </label>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" 
                               [(ngModel)]="newProduct.isFeatured" name="isFeatured" id="isFeatured">
                        <label class="form-check-label text-white" for="isFeatured">
                          Featured Product
                        </label>
                      </div>
                    </div>
                  </div>
                  <div class="d-flex gap-2">
                    <button type="submit" class="btn btn-premium" [disabled]="loading || !productForm.valid">
                      <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                      <i class="bi bi-check-circle me-2"></i>Add Product
                    </button>
                    <button type="button" class="btn btn-secondary" (click)="resetForm()">
                      <i class="bi bi-arrow-clockwise me-2"></i>Reset
                    </button>
                    <button type="button" class="btn btn-outline-secondary" (click)="showAddForm = false">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        <!-- Products List -->
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                  <i class="bi bi-list-ul"></i> All Products
                </h5>
                <button class="btn btn-outline-primary btn-sm" (click)="loadProducts()">
                  <i class="bi bi-arrow-clockwise me-2"></i>Refresh
                </button>
              </div>
              <div class="card-body">
                <div class="table-responsive">
                  <table class="table table-hover" *ngIf="products.length > 0; else noProducts">
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>SKU</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let product of products">
                        <td>
                          <img [src]="getProductImage(product)" 
                               class="product-thumbnail rounded" 
                               [alt]="product.name">
                        </td>
                        <td>
                          <div class="fw-bold">{{ product.name }}</div>
                          <small class="text-muted">{{ product.description | slice:0:50 }}...</small>
                        </td>
                        <td>
                          <code class="text-info">{{ product.sku }}</code>
                        </td>
                        <td>
                          <div class="fw-bold text-success">\${{ product.price | number:'1.2-2' }}</div>
                          <small class="text-muted" *ngIf="product.compareAtPrice">
                            Was \${{ product.compareAtPrice | number:'1.2-2' }}
                          </small>
                        </td>
                        <td>
                          <span class="badge" [ngClass]="{
                            'bg-success': product.stockQuantity > product.lowStockThreshold,
                            'bg-warning': product.stockQuantity <= product.lowStockThreshold && product.stockQuantity > 0,
                            'bg-danger': product.stockQuantity === 0
                          }">
                            {{ product.stockQuantity }}
                          </span>
                        </td>
                        <td>
                          <span class="badge" [ngClass]="{
                            'bg-success': product.isActive,
                            'bg-secondary': !product.isActive
                          }">
                            {{ product.isActive ? 'Active' : 'Inactive' }}
                          </span>
                          <span class="badge bg-primary ms-1" *ngIf="product.isFeatured">
                            Featured
                          </span>
                        </td>
                        <td>
                          <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-warning" 
                                    (click)="editProduct(product)"
                                    title="Edit Product">
                              <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-outline-danger" 
                                    (click)="deleteProduct(product)"
                                    title="Delete Product">
                              <i class="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <ng-template #noProducts>
                    <div class="text-center py-5">
                      <i class="bi bi-inbox" style="font-size: 4rem; color: #6c757d;"></i>
                      <h4 class="mt-3 text-muted">No Products Found</h4>
                      <p class="text-muted">Start by adding your first product.</p>
                      <button class="btn btn-premium" (click)="showAddForm = true">
                        <i class="bi bi-plus-circle me-2"></i>Add First Product
                      </button>
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
          <p class="mt-3">Loading products...</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-thumbnail {
      width: 60px;
      height: 60px;
      object-fit: cover;
    }
    
    .form-check-input:checked {
      background: var(--gradient-primary);
      border-color: var(--accent-blue);
    }
    
    .table-hover tbody tr:hover {
      background-color: rgba(102, 126, 234, 0.05);
    }
    
    code {
      background: rgba(59, 130, 246, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.8rem;
    }
  `]
})
export class AdminProductsComponent implements OnInit {
  products: Product[] = [];
  loading = true;
  showAddForm = false;
  
  newProduct: ProductFormData = {
    name: '',
    description: '',
    price: 0,
    stockQuantity: 0,
    lowStockThreshold: 5,
    categoryId: 1,
    sku: '',
    isActive: true,
    isFeatured: false
  };

  constructor(
    private productService: ProductService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getProducts({ page: 1, pageSize: 100 }).subscribe({
      next: (result) => {
        this.products = result.items;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading = false;
        this.notificationService.error('Error', 'Failed to load products');
      }
    });
  }

  addProduct(): void {
    if (!this.newProduct.name || !this.newProduct.description || !this.newProduct.sku) {
      this.notificationService.warning('Validation Error', 'Please fill in all required fields');
      return;
    }

    this.loading = true;
    // In a real app, you would call a create product API
    // For now, we'll simulate success
    setTimeout(() => {
      this.loading = false;
      this.notificationService.success('Success', 'Product added successfully');
      this.resetForm();
      this.showAddForm = false;
      this.loadProducts();
    }, 1000);
  }

  editProduct(product: Product): void {
    this.notificationService.info('Edit Product', 'Edit functionality would be implemented here');
  }

  deleteProduct(product: Product): void {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      this.notificationService.success('Success', 'Product deleted successfully');
      this.loadProducts();
    }
  }

  resetForm(): void {
    this.newProduct = {
      name: '',
      description: '',
      price: 0,
      stockQuantity: 0,
      lowStockThreshold: 5,
      categoryId: 1,
      sku: '',
      isActive: true,
      isFeatured: false
    };
  }

  getProductImage(product: Product): string {
    if (product.imageUrl && product.imageUrl !== '') {
      return product.imageUrl;
    }
    
    const productName = product.name.toLowerCase();
    if (productName.includes('laptop') || productName.includes('computer')) {
      return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=60&h=60&fit=crop&crop=center';
    } else if (productName.includes('coffee') || productName.includes('mug')) {
      return 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=60&h=60&fit=crop&crop=center';
    } else if (productName.includes('notebook') || productName.includes('book')) {
      return 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=60&h=60&fit=crop&crop=center';
    } else {
      return `https://picsum.photos/60/60?random=${product.productId}`;
    }
  }
}