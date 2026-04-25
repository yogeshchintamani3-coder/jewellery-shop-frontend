import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';
import { ScrollRevealDirective } from '../../../shared/directives/scroll-reveal.directive';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [FormsModule, ProductCardComponent, SearchBarComponent, ScrollRevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container page">
      <div class="page-header" appScrollReveal="up">
        <h1>Our Collection</h1>
        <div class="section-divider"><span class="section-divider-diamond"></span></div>
      </div>

      <div class="filters-row" appScrollReveal="up" [revealDelay]="100">
        <app-search-bar (searchEvent)="onSearch($event)" />

        <div class="filter-controls">
          <select [ngModel]="selectedCategory()" (ngModelChange)="onCategoryChange($event)">
            <option value="">All Categories</option>
            @for (cat of productService.categories(); track cat.categoryId) {
              <option [value]="cat.name">{{ cat.name }}</option>
            }
          </select>

          <select [ngModel]="selectedSort()" (ngModelChange)="onSortChange($event)">
            <option value="">Sort By</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A-Z</option>
            <option value="newest">Newest First</option>
          </select>
        </div>
      </div>

      @if (productService.loading()) {
        <div class="shimmer-grid">
          @for (_ of [1,2,3,4,5,6,7,8]; track _) {
            <div class="shimmer-card">
              <div class="shimmer-line" style="aspect-ratio:1;width:100%"></div>
              <div style="padding:1rem;display:flex;flex-direction:column;gap:0.5rem">
                <div class="shimmer-line" style="height:12px;width:40%"></div>
                <div class="shimmer-line" style="height:16px;width:80%"></div>
                <div class="shimmer-line" style="height:14px;width:50%"></div>
                <div class="shimmer-line" style="height:36px;width:100%;margin-top:0.5rem;border-radius:var(--radius-md)"></div>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="products-grid">
          @for (product of productService.products(); track product.productId; let i = $index) {
            <div appScrollReveal="up" [revealDelay]="(i % 4) * 80">
              <app-product-card [product]="product" (addToCart)="onAddToCart($event)" />
            </div>
          } @empty {
            <p class="empty-text">No products found matching your criteria.</p>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page { padding: 2rem 1rem; animation: page-enter 0.5s ease-out; }
    .page-header { text-align: center; margin-bottom: 2rem; }
    h1 { font-family: var(--font-primary); margin-bottom: 0.75rem; }
    .filters-row {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    .filter-controls {
      display: flex;
      gap: 0.75rem;
      select {
        padding: 0.625rem 1rem;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        background: var(--color-bg);
        color: var(--color-text);
        font-size: 0.875rem;
        transition: border-color 0.3s, box-shadow 0.3s;
        &:focus { outline: none; border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(183, 110, 121, 0.15); }
      }
    }
    .products-grid, .shimmer-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1.5rem;
    }
    .empty-text { text-align: center; color: var(--color-text-muted); grid-column: 1 / -1; padding: 3rem; }

    @media (max-width: 768px) {
      .filters-row { flex-direction: column; }
      .filter-controls { width: 100%; flex-wrap: wrap; }
      .products-grid, .shimmer-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); }
    }
  `],
})
export class ProductListComponent implements OnInit {
  readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly route = inject(ActivatedRoute);

  readonly selectedCategory = signal('');
  readonly selectedSort = signal('');
  private searchTerm = '';

  ngOnInit(): void {
    this.productService.loadCategories();
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategory.set(params['category']);
      }
      if (params['sort']) {
        this.selectedSort.set(params['sort']);
      }
      this.loadProducts();
    });
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.loadProducts();
  }

  onCategoryChange(category: string): void {
    this.selectedCategory.set(category);
    this.loadProducts();
  }

  onSortChange(sort: string): void {
    this.selectedSort.set(sort);
    this.loadProducts();
  }

  onAddToCart(productId: string): void {
    this.cartService.addToCart(productId);
  }

  private loadProducts(): void {
    this.productService.loadProducts({
      category: this.selectedCategory(),
      search: this.searchTerm,
      sort: this.selectedSort(),
    });
  }
}
