import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { OrderService } from '../../../core/services/order.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container page">
      @if (orderService.loading()) {
        <div class="loading-spinner"></div>
      } @else {
        @if (orderService.selectedOrder(); as order) {
          <div class="breadcrumb">
            <a routerLink="/orders">My Orders</a> / <span>#{{ order.orderId.substring(0, 8) }}</span>
          </div>

          <div class="order-detail">
            <div class="detail-header">
              <h1>Order Details</h1>
              <span class="badge" [class.badge-warning]="order.status === 'PENDING'"
                    [class.badge-info]="order.status === 'CONFIRMED'"
                    [class.badge-success]="order.status === 'DELIVERED'"
                    [class.badge-danger]="order.status === 'CANCELLED'">
                {{ order.status }}
              </span>
            </div>

            <div class="detail-grid">
              <div class="detail-card">
                <h3>Order Info</h3>
                <p><strong>Order ID:</strong> {{ order.orderId }}</p>
                <p><strong>Date:</strong> {{ order.createdAt | date:'medium' }}</p>
                <p><strong>Payment:</strong> {{ order.paymentStatus }}</p>
              </div>

              <div class="detail-card">
                <h3>Shipping</h3>
                <p>{{ order.shippingAddress }}</p>
              </div>
            </div>

            <div class="detail-card">
              <h3>Total</h3>
              <p class="total">{{ order.totalAmount | currency:'INR' }}</p>
            </div>
          </div>
        } @else {
          <p class="not-found">Order not found.</p>
        }
      }
    </div>
  `,
  styles: [`
    .page { padding: 2rem 1rem; }
    .breadcrumb { margin-bottom: 1.5rem; font-size: 0.875rem; color: var(--color-text-muted);
      a { color: var(--color-text-secondary); &:hover { color: var(--color-primary); } }
    }
    .detail-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;
      h1 { font-family: var(--font-primary); }
    }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem; }
    .detail-card {
      background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 1.5rem;
      h3 { font-family: var(--font-primary); margin-bottom: 0.75rem; font-size: 1rem; }
      p { font-size: 0.875rem; color: var(--color-text-secondary); margin-bottom: 0.25rem; }
    }
    .total { font-size: 1.5rem !important; font-weight: 700; color: var(--color-text) !important; }
    .not-found { text-align: center; padding: 3rem; color: var(--color-text-muted); }

    @media (max-width: 768px) { .detail-grid { grid-template-columns: 1fr; } }
  `],
})
export class OrderDetailComponent implements OnInit {
  readonly orderService = inject(OrderService);
  private readonly route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.orderService.loadOrder(params['id']);
    });
  }
}
