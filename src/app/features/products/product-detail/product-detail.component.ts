import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { ScrollRevealDirective } from '../../../shared/directives/scroll-reveal.directive';
import { RippleDirective } from '../../../shared/directives/ripple.directive';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, ScrollRevealDirective, RippleDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container page">
      @if (productService.loading()) {
        <div class="detail-shimmer">
          <div class="shimmer-card"><div class="shimmer-line" style="aspect-ratio:1;width:100%"></div></div>
          <div style="display:flex;flex-direction:column;gap:1rem">
            <div class="shimmer-line" style="height:14px;width:30%"></div>
            <div class="shimmer-line" style="height:28px;width:70%"></div>
            <div class="shimmer-line" style="height:22px;width:40%"></div>
            <div class="shimmer-line" style="height:60px;width:100%"></div>
            <div class="shimmer-line" style="height:14px;width:50%"></div>
            <div class="shimmer-line" style="height:14px;width:45%"></div>
            <div class="shimmer-line" style="height:44px;width:200px;border-radius:var(--radius-md)"></div>
          </div>
        </div>
      } @else {
        @if (productService.selectedProduct(); as product) {
          <div class="breadcrumb" appScrollReveal="up">
            <a routerLink="/">Home</a> / <a routerLink="/products">Shop</a> / <span>{{ product.name }}</span>
          </div>

          <div class="product-detail">
            <div class="gallery" appScrollReveal="left">
              @if (product.imageUrls?.length) {
                <div class="main-image-wrap">
                  <img [src]="selectedImage() || product.imageUrls[0]" [alt]="product.name" class="main-image" />
                  <div class="image-zoom-lens"></div>
                </div>
                @if (product.imageUrls.length > 1) {
                  <div class="thumbnails">
                    @for (img of product.imageUrls; track img) {
                      <img [src]="img" [alt]="product.name" (click)="selectedImage.set(img)"
                           [class.active]="selectedImage() === img" />
                    }
                  </div>
                }
              } @else {
                <div class="placeholder">&#x1F48E;</div>
              }
            </div>

            <div class="info" appScrollReveal="right">
              <span class="category">{{ product.category }}</span>
              <h1>{{ product.name }}</h1>

              <div class="price-section">
                @if (product.discountPrice > 0) {
                  <span class="price sale">{{ product.discountPrice | currency:'INR' }}</span>
                  <span class="price original">{{ product.price | currency:'INR' }}</span>
                  <span class="discount-pct">
                    {{ (((product.price - product.discountPrice) / product.price) * 100).toFixed(0) }}% OFF
                  </span>
                } @else {
                  <span class="price">{{ product.price | currency:'INR' }}</span>
                }
              </div>

              <div class="divider"></div>

              <p class="description">{{ product.description }}</p>

              <div class="meta">
                @if (product.material) {
                  <div class="meta-item">
                    <span class="meta-label">Material</span>
                    <span class="meta-value">{{ product.material }}</span>
                  </div>
                }
                @if (product.weight) {
                  <div class="meta-item">
                    <span class="meta-label">Weight</span>
                    <span class="meta-value">{{ product.weight }}</span>
                  </div>
                }
                <div class="meta-item">
                  <span class="meta-label">Availability</span>
                  @if (product.stock > 0) {
                    <span class="meta-value in-stock">In Stock ({{ product.stock }})</span>
                  } @else {
                    <span class="meta-value out-of-stock">Out of Stock</span>
                  }
                </div>
              </div>

              <div class="divider"></div>

              <div class="quantity-row">
                <span class="qty-label">Quantity</span>
                <div class="qty-controls">
                  <button (click)="decreaseQty()">&#x2212;</button>
                  <span>{{ quantity() }}</span>
                  <button (click)="increaseQty()">+</button>
                </div>
              </div>

              <button class="btn btn-primary btn-lg add-to-cart-btn" appRipple
                      (click)="addToCart(product.productId)"
                      [disabled]="product.stock === 0">
                &#x1F6D2; Add to Cart
              </button>
            </div>
          </div>
        } @else {
          <p class="not-found">Product not found.</p>
        }
      }
    </div>
  `,
  styles: [`
    .page { padding: 2rem 1rem; animation: page-enter 0.5s ease-out; }
    .breadcrumb {
      margin-bottom: 2rem;
      font-size: 0.8rem;
      color: var(--color-text-muted);
      letter-spacing: 0.5px;
      a { color: var(--color-text-secondary); transition: color 0.3s; &:hover { color: var(--color-primary); } }
    }
    .detail-shimmer { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; }
    .product-detail { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; }
    .gallery {
      .main-image-wrap {
        position: relative;
        overflow: hidden;
        border-radius: var(--radius-md);
        background: var(--color-bg-secondary);
      }
      .main-image {
        width: 100%;
        aspect-ratio: 1;
        object-fit: cover;
        display: block;
        transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      }
      .main-image-wrap:hover .main-image { transform: scale(1.03); }
      .placeholder {
        aspect-ratio: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 5rem;
        background: var(--color-bg-secondary);
        border-radius: var(--radius-md);
      }
    }
    .thumbnails {
      display: flex;
      gap: 0.75rem;
      margin-top: 1rem;
      img {
        width: 64px;
        height: 64px;
        object-fit: cover;
        border-radius: var(--radius-sm);
        border: 2px solid transparent;
        cursor: pointer;
        transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
        &.active { border-color: var(--color-primary); box-shadow: 0 2px 8px rgba(183, 110, 121, 0.3); }
        &:hover { border-color: var(--color-primary); transform: translateY(-2px); }
      }
    }
    .info { display: flex; flex-direction: column; gap: 1rem; }
    .category {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: var(--color-primary);
      font-weight: 500;
    }
    h1 {
      font-family: var(--font-primary);
      font-size: 2rem;
      line-height: 1.2;
    }
    .price-section { display: flex; align-items: center; gap: 0.75rem; }
    .price {
      font-size: 1.5rem;
      font-weight: 700;
      &.sale { color: var(--color-accent); }
      &.original { text-decoration: line-through; color: var(--color-text-muted); font-size: 1rem; }
    }
    .discount-pct {
      background: var(--color-accent);
      color: #fff;
      padding: 0.25rem 0.6rem;
      border-radius: var(--radius-sm);
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .divider {
      height: 1px;
      background: linear-gradient(to right, var(--color-border), transparent);
      margin: 0.25rem 0;
    }
    .description { color: var(--color-text-secondary); line-height: 1.8; font-size: 0.95rem; }
    .meta { display: flex; flex-direction: column; gap: 0.75rem; }
    .meta-item { display: flex; justify-content: space-between; align-items: center; font-size: 0.875rem; }
    .meta-label { color: var(--color-text-muted); text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.5px; }
    .meta-value { color: var(--color-text); font-weight: 500; }
    .in-stock { color: var(--color-success); }
    .out-of-stock { color: var(--color-error); }
    .quantity-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .qty-label { font-size: 0.875rem; color: var(--color-text-secondary); font-weight: 500; }
    .qty-controls {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      button {
        width: 40px;
        height: 40px;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        background: var(--color-bg);
        font-size: 1.25rem;
        cursor: pointer;
        transition: all 0.3s;
        &:hover { border-color: var(--color-primary); background: var(--color-bg-secondary); }
      }
      span { font-size: 1.125rem; font-weight: 600; min-width: 30px; text-align: center; }
    }
    .add-to-cart-btn {
      letter-spacing: 1.5px;
      font-size: 0.875rem;
      padding: 1rem 2rem;
      transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      &:hover:not(:disabled) {
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(183, 110, 121, 0.4);
      }
      &:active:not(:disabled) {
        transform: translateY(-1px) scale(0.98);
      }
    }
    .gallery .main-image {
      animation: image-reveal-clip 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    }
    @keyframes image-reveal-clip {
      from { clip-path: inset(0 100% 0 0); }
      to { clip-path: inset(0 0 0 0); }
    }
    .not-found { text-align: center; padding: 3rem; color: var(--color-text-muted); }

    @media (max-width: 768px) {
      .product-detail, .detail-shimmer { grid-template-columns: 1fr; gap: 1.5rem; }
    }
  `],
})
export class ProductDetailComponent implements OnInit {
  readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly route = inject(ActivatedRoute);

  readonly selectedImage = signal<string | null>(null);
  readonly quantity = signal(1);

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.productService.loadProduct(params['id']);
      this.selectedImage.set(null);
      this.quantity.set(1);
    });
  }

  increaseQty(): void { this.quantity.update(q => q + 1); }
  decreaseQty(): void { this.quantity.update(q => Math.max(1, q - 1)); }

  addToCart(productId: string): void {
    this.cartService.addToCart(productId, this.quantity());
  }
}
