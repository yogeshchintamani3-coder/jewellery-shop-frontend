import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container page">
      <h1>Shopping Cart</h1>

      @if (cartService.loading()) {
        <div class="loading-spinner"></div>
      } @else if (cartService.items().length === 0) {
        <div class="empty-cart">
          <p>Your cart is empty</p>
          <a routerLink="/products" class="btn btn-primary">Continue Shopping</a>
        </div>
      } @else {
        <div class="cart-layout">
          <div class="cart-items">
            @for (item of cartService.items(); track item.cartItemId) {
              <div class="cart-item">
                <div class="item-image">
                  @if (item.product?.imageUrls?.length) {
                    <img [src]="item.product!.imageUrls[0]" [alt]="item.product!.name" />
                  } @else {
                    <div class="placeholder">💎</div>
                  }
                </div>
                <div class="item-info">
                  <h3>{{ item.product?.name || 'Loading...' }}</h3>
                  <p class="item-category">{{ item.product?.category }}</p>
                  <p class="item-price">
                    {{ (item.product?.discountPrice || item.product?.price || 0) | currency:'INR' }}
                  </p>
                </div>
                <div class="item-actions">
                  <div class="quantity-row">
                    <button (click)="decreaseQty(item.cartItemId, item.quantity)">−</button>
                    <span>{{ item.quantity }}</span>
                    <button (click)="increaseQty(item.cartItemId, item.quantity)">+</button>
                  </div>
                  <button class="btn-link danger" (click)="removeItem(item.cartItemId)">Remove</button>
                </div>
              </div>
            }
          </div>

          <div class="cart-summary">
            <h3>Order Summary</h3>
            <div class="summary-row">
              <span>Items ({{ cartService.itemCount() }})</span>
              <span>{{ cartService.totalAmount() | currency:'INR' }}</span>
            </div>
            <div class="summary-row">
              <span>Shipping</span>
              <span class="free">FREE</span>
            </div>
            <div class="summary-row total">
              <span>Total</span>
              <span>{{ cartService.totalAmount() | currency:'INR' }}</span>
            </div>
            <a routerLink="/checkout" class="btn btn-primary btn-lg full-width">Proceed to Checkout</a>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { padding: 2rem 1rem; }
    h1 { font-family: var(--font-primary); text-align: center; margin-bottom: 2rem; }
    .empty-cart { text-align: center; padding: 3rem; p { color: var(--color-text-muted); margin-bottom: 1.5rem; font-size: 1.125rem; } }
    .cart-layout { display: grid; grid-template-columns: 1fr 350px; gap: 2rem; }
    .cart-item { display: flex; gap: 1rem; padding: 1.5rem; border: 1px solid var(--color-border); border-radius: var(--radius-md); margin-bottom: 1rem; }
    .item-image { width: 100px; height: 100px; flex-shrink: 0;
      img { width: 100%; height: 100%; object-fit: cover; border-radius: var(--radius-sm); }
      .placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: var(--color-bg-secondary); border-radius: var(--radius-sm); font-size: 2rem; }
    }
    .item-info { flex: 1; h3 { font-size: 1rem; margin-bottom: 0.25rem; } }
    .item-category { font-size: 0.75rem; color: var(--color-primary); text-transform: uppercase; letter-spacing: 0.5px; }
    .item-price { font-weight: 600; margin-top: 0.25rem; }
    .item-actions { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
    .quantity-row { display: flex; align-items: center; gap: 0.5rem;
      button { width: 30px; height: 30px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-bg); cursor: pointer; font-size: 1rem; }
      span { min-width: 24px; text-align: center; font-weight: 500; }
    }
    .btn-link { background: none; border: none; font-size: 0.75rem; cursor: pointer; &.danger { color: var(--color-error); } }
    .cart-summary { background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 1.5rem; height: fit-content; position: sticky; top: 80px;
      h3 { font-family: var(--font-primary); margin-bottom: 1rem; }
    }
    .summary-row { display: flex; justify-content: space-between; padding: 0.5rem 0; font-size: 0.875rem;
      &.total { border-top: 1px solid var(--color-border); padding-top: 1rem; margin-top: 0.5rem; font-weight: 600; font-size: 1rem; }
    }
    .free { color: var(--color-success); font-weight: 500; }
    .full-width { width: 100%; margin-top: 1.5rem; }

    @media (max-width: 768px) {
      .cart-layout { grid-template-columns: 1fr; }
      .cart-item { flex-wrap: wrap; }
    }
  `],
})
export class CartComponent implements OnInit {
  readonly cartService = inject(CartService);

  ngOnInit(): void {
    this.cartService.loadCart();
  }

  increaseQty(itemId: string, currentQty: number): void {
    this.cartService.updateQuantity(itemId, currentQty + 1);
  }

  decreaseQty(itemId: string, currentQty: number): void {
    if (currentQty <= 1) {
      this.cartService.removeItem(itemId);
    } else {
      this.cartService.updateQuantity(itemId, currentQty - 1);
    }
  }

  removeItem(itemId: string): void {
    this.cartService.removeItem(itemId);
  }
}
