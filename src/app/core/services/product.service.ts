import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService } from './api.service';
import { Product, Category } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly api = inject(ApiService);

  private readonly productsState = signal<Product[]>([]);
  private readonly categoriesState = signal<Category[]>([]);
  private readonly featuredState = signal<Product[]>([]);
  private readonly selectedProductState = signal<Product | null>(null);
  private readonly loadingState = signal(false);
  private readonly errorState = signal<string | null>(null);

  readonly products = this.productsState.asReadonly();
  readonly categories = this.categoriesState.asReadonly();
  readonly featured = this.featuredState.asReadonly();
  readonly selectedProduct = this.selectedProductState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();

  loadProducts(params?: Record<string, string | number | boolean>): void {
    this.loadingState.set(true);
    this.api.get<Product[]>('/products', params).subscribe({
      next: (data) => {
        this.productsState.set(data);
        this.loadingState.set(false);
      },
      error: (err) => {
        this.errorState.set(err?.error?.message || 'Failed to load products');
        this.loadingState.set(false);
      },
    });
  }

  loadFeatured(): void {
    this.api.get<Product[]>('/products/featured').subscribe({
      next: (data) => this.featuredState.set(data),
      error: () => {},
    });
  }

  loadProduct(id: string): void {
    this.loadingState.set(true);
    this.selectedProductState.set(null);
    this.api.get<Product>(`/products/${id}`).subscribe({
      next: (data) => {
        this.selectedProductState.set(data);
        this.loadingState.set(false);
      },
      error: (err) => {
        this.errorState.set(err?.error?.message || 'Product not found');
        this.loadingState.set(false);
      },
    });
  }

  loadCategories(): void {
    this.api.get<Category[]>('/categories').subscribe({
      next: (data) => this.categoriesState.set(data),
      error: () => {},
    });
  }
}
