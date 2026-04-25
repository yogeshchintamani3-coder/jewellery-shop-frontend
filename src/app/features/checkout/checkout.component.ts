import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { ApiService } from '../../core/services/api.service';

declare let Razorpay: unknown;

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container page">
      <h1>Checkout</h1>

      <div class="checkout-layout">
        <div class="shipping-form">
          <h2>Shipping Address</h2>
          <div class="input-group">
            <label for="address">Full Address</label>
            <textarea id="address" [(ngModel)]="address" name="address" rows="4" required
                      placeholder="Enter your complete shipping address"></textarea>
          </div>
        </div>

        <div class="order-summary">
          <h3>Order Summary</h3>
          <div class="summary-items">
            @for (item of cartService.items(); track item.cartItemId) {
              <div class="summary-item">
                <span>{{ item.product?.name }} x {{ item.quantity }}</span>
                <span>{{ ((item.product?.discountPrice || item.product?.price || 0) * item.quantity) | currency:'INR' }}</span>
              </div>
            }
          </div>
          <div class="summary-total">
            <span>Total</span>
            <span>{{ cartService.totalAmount() | currency:'INR' }}</span>
          </div>

          <button class="btn btn-primary btn-lg full-width"
                  (click)="placeOrder()"
                  [disabled]="processing() || !address">
            {{ processing() ? 'Processing...' : 'Place Order & Pay' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 2rem 1rem; }
    h1 { font-family: var(--font-primary); text-align: center; margin-bottom: 2rem; }
    .checkout-layout { display: grid; grid-template-columns: 1fr 380px; gap: 2rem; }
    .shipping-form { h2 { font-family: var(--font-primary); margin-bottom: 1rem; } }
    .order-summary {
      background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 1.5rem; height: fit-content;
      h3 { font-family: var(--font-primary); margin-bottom: 1rem; }
    }
    .summary-items { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
    .summary-item { display: flex; justify-content: space-between; font-size: 0.875rem; color: var(--color-text-secondary); }
    .summary-total { display: flex; justify-content: space-between; border-top: 1px solid var(--color-border); padding-top: 1rem; font-weight: 600; font-size: 1.125rem; }
    .full-width { width: 100%; margin-top: 1.5rem; }

    @media (max-width: 768px) { .checkout-layout { grid-template-columns: 1fr; } }
  `],
})
export class CheckoutComponent implements OnInit {
  readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly apiService = inject(ApiService);
  private readonly router = inject(Router);

  readonly processing = signal(false);
  address = '';

  ngOnInit(): void {
    this.cartService.loadCart();
  }

  placeOrder(): void {
    if (!this.address) return;
    this.processing.set(true);

    this.apiService.post<{orderId: string; totalAmount: number}>('/orders', { shippingAddress: this.address })
      .subscribe({
        next: (order) => {
          this.apiService.post<{razorpayOrderId: string; amount: string}>('/payments/create-order', { orderId: order.orderId })
            .subscribe({
              next: (payment) => {
                this.processing.set(false);
                this.router.navigate(['/orders', order.orderId]);
              },
              error: () => {
                this.processing.set(false);
                this.router.navigate(['/orders', order.orderId]);
              },
            });
        },
        error: () => this.processing.set(false),
      });
  }
}
