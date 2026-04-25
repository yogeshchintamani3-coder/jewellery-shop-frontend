import { Component, ChangeDetectionStrategy, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { Product } from '../../../core/models/product.model';
import { TiltDirective } from '../../directives/tilt.directive';
import { RippleDirective } from '../../directives/ripple.directive';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, TiltDirective, RippleDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card" appTilt [maxTilt]="6">
      <a [routerLink]="['/products', product().productId]" class="card-image">
        @if (product().imageUrls?.length) {
          <img [src]="product().imageUrls[0]" [alt]="product().name" loading="lazy" />
        } @else {
          <div class="placeholder-img">&#x1F48E;</div>
        }
        <div class="card-image-overlay">
          <span class="quick-view-icon">&#x1F50D;</span>
          <span class="quick-view">View Details</span>
        </div>
        <div class="card-shine"></div>
        @if (product().discountPrice > 0) {
          <span class="discount-badge float-badge">SALE</span>
        }
        @if (product().featured) {
          <span class="bestseller-badge float-badge">&#x2B50; Bestseller</span>
        }
      </a>
      <button class="wishlist-btn" [class.liked]="wishlisted()" (click)="toggleWishlist($event)" title="Add to wishlist">
        <span class="heart">{{ wishlisted() ? '&#x2764;&#xFE0F;' : '&#x1F90D;' }}</span>
      </button>
      <div class="card-body">
        <span class="category">{{ product().category }}</span>
        <h3 class="name">
          <a [routerLink]="['/products', product().productId]">{{ product().name }}</a>
        </h3>
        <p class="material">{{ product().material }} &middot; {{ product().weight }}</p>
        <div class="price-row">
          @if (product().discountPrice > 0) {
            <span class="price sale">{{ product().discountPrice | currency:'INR' }}</span>
            <span class="price original">{{ product().price | currency:'INR' }}</span>
            <span class="save-tag">Save {{ savingsPercent() }}%</span>
          } @else {
            <span class="price">{{ product().price | currency:'INR' }}</span>
          }
        </div>
        <button class="btn btn-primary btn-sm add-cart-btn" appRipple (click)="addToCart.emit(product().productId)">
          <span class="btn-cart-icon">&#x1F6D2;</span>
          Add to Cart
        </button>
      </div>
    </div>
  `,
  styles: [`
    .card {
      position: relative;
      background: var(--color-bg-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      overflow: hidden;
      transition: box-shadow 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                  border-color 0.3s;
      &:hover {
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(183, 110, 121, 0.2);
        border-color: var(--color-primary-light);
      }
    }
    .card-image {
      position: relative;
      display: block;
      aspect-ratio: 1;
      overflow: hidden;
      background: var(--color-bg-secondary);
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94), filter 0.5s;
      }
      &:hover img { transform: scale(1.1); filter: brightness(1.05); }
    }
    .card-shine {
      position: absolute;
      inset: 0;
      background: linear-gradient(120deg, transparent 30%, rgba(255, 255, 255, 0.15) 50%, transparent 70%);
      transform: translateX(-100%);
      transition: transform 0.8s;
      pointer-events: none;
      z-index: 4;
    }
    .card:hover .card-shine { transform: translateX(100%); }

    .card-image-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.1) 40%, transparent 60%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      padding-bottom: 1.25rem;
      gap: 0.4rem;
      opacity: 0;
      transition: opacity 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    .card:hover .card-image-overlay { opacity: 1; }
    .quick-view-icon {
      font-size: 1.5rem;
      transform: translateY(12px) scale(0.5);
      opacity: 0;
      transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.1s;
    }
    .card:hover .quick-view-icon { transform: translateY(0) scale(1); opacity: 1; }
    .quick-view {
      color: #fff;
      font-size: 0.65rem;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      font-weight: 500;
      transform: translateY(8px);
      transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      background: rgba(255,255,255,0.1);
      padding: 0.3rem 0.8rem;
      border-radius: 50px;
      backdrop-filter: blur(4px);
    }
    .card:hover .quick-view { transform: translateY(0); }
    .placeholder-img {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3rem;
      background: var(--color-bg-secondary);
    }
    .discount-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      background: var(--color-accent);
      color: #fff;
      padding: 0.3rem 0.7rem;
      font-size: 0.6rem;
      font-weight: 700;
      letter-spacing: 1.5px;
      border-radius: 50px;
      z-index: 2;
      box-shadow: 0 4px 12px rgba(160, 66, 92, 0.3);
    }
    .bestseller-badge {
      position: absolute;
      top: 12px;
      left: 12px;
      background: linear-gradient(135deg, #B76E79, #D4919A);
      color: #fff;
      padding: 0.25rem 0.7rem;
      font-size: 0.6rem;
      font-weight: 700;
      letter-spacing: 1px;
      border-radius: 50px;
      z-index: 2;
      box-shadow: 0 4px 12px rgba(183, 110, 121, 0.4);
    }
    .wishlist-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      z-index: 3;
      background: rgba(255, 255, 255, 0.9);
      border: none;
      border-radius: 50%;
      width: 38px;
      height: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 0;
      transform: scale(0.5) rotate(-20deg);
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      backdrop-filter: blur(8px);
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .card:hover .wishlist-btn { opacity: 1; transform: scale(1) rotate(0); }
    .wishlist-btn:hover { background: #fff; transform: scale(1.2) rotate(0); box-shadow: 0 4px 15px rgba(0,0,0,0.15); }
    .wishlist-btn.liked { opacity: 1; transform: scale(1) rotate(0); }
    .heart {
      font-size: 1rem;
      transition: transform 0.3s;
    }
    .wishlist-btn.liked .heart { animation: heartPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    @keyframes heartPop {
      0% { transform: scale(1); }
      30% { transform: scale(0.8); }
      60% { transform: scale(1.5); }
      100% { transform: scale(1); }
    }

    .card-body {
      padding: 1rem 1.1rem;
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }
    .category {
      font-size: 0.6rem;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: var(--color-primary);
      font-weight: 600;
      opacity: 0.8;
    }
    .name {
      font-family: var(--font-primary);
      font-size: 0.95rem;
      font-weight: 500;
      a {
        color: var(--color-text);
        text-decoration: none;
        transition: color 0.3s;
        background-image: linear-gradient(var(--color-primary), var(--color-primary));
        background-size: 0 2px;
        background-position: 0 100%;
        background-repeat: no-repeat;
        transition: background-size 0.4s, color 0.3s;
        &:hover { color: var(--color-primary); background-size: 100% 2px; }
      }
    }
    .material { font-size: 0.7rem; color: var(--color-text-muted); margin: 0; }
    .price-row { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.35rem; }
    .price {
      font-weight: 700;
      font-size: 1.05rem;
      color: var(--color-text);
      &.sale { color: var(--color-accent); }
      &.original { text-decoration: line-through; color: var(--color-text-muted); font-size: 0.8rem; font-weight: 400; }
    }
    .save-tag {
      font-size: 0.6rem;
      font-weight: 600;
      color: var(--color-success);
      background: rgba(52, 168, 83, 0.1);
      padding: 0.2rem 0.5rem;
      border-radius: 50px;
      animation: save-pulse 2s ease-in-out infinite;
    }
    @keyframes save-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    .add-cart-btn {
      margin-top: 0.5rem;
      transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      display: flex;
      align-items: center;
      gap: 0.4rem;
      &:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(183, 110, 121, 0.3); }
      &:active { transform: translateY(0) scale(0.98); }
    }
    .btn-cart-icon {
      font-size: 0.85rem;
      transition: transform 0.3s;
    }
    .add-cart-btn:hover .btn-cart-icon { transform: translateX(-2px) rotate(-12deg); }
  `],
})
export class ProductCardComponent {
  product = input.required<Product>();
  addToCart = output<string>();
  readonly wishlisted = signal(false);

  savingsPercent(): number {
    const p = this.product();
    if (p.discountPrice > 0 && p.price > 0) {
      return Math.round(((p.price - p.discountPrice) / p.price) * 100);
    }
    return 0;
  }

  toggleWishlist(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.wishlisted.update(v => !v);
  }
}
