import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { OrderService } from '../../../core/services/order.service';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container page">
      <h1>My Orders</h1>

      @if (orderService.loading()) {
        <div class="loading-spinner"></div>
      } @else if (orderService.orders().length === 0) {
        <div class="empty">
          <p>You haven't placed any orders yet.</p>
          <a routerLink="/products" class="btn btn-primary">Start Shopping</a>
        </div>
      } @else {
        <div class="orders-list">
          @for (order of orderService.orders(); track order.orderId) {
            <a [routerLink]="['/orders', order.orderId]" class="order-card">
              <div class="order-header">
                <span class="order-id">#{{ order.orderId.substring(0, 8) }}</span>
                <span class="badge" [class.badge-warning]="order.status === 'PENDING'"
                      [class.badge-info]="order.status === 'CONFIRMED'"
                      [class.badge-success]="order.status === 'DELIVERED'"
                      [class.badge-danger]="order.status === 'CANCELLED'">
                  {{ order.status }}
                </span>
              </div>
              <div class="order-body">
                <span>{{ order.createdAt | date:'mediumDate' }}</span>
                <span class="amount">{{ order.totalAmount | currency:'INR' }}</span>
              </div>
            </a>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page { padding: 2rem 1rem; }
    h1 { font-family: var(--font-primary); text-align: center; margin-bottom: 2rem; }
    .empty { text-align: center; padding: 3rem; p { color: var(--color-text-muted); margin-bottom: 1.5rem; } }
    .orders-list { display: flex; flex-direction: column; gap: 1rem; max-width: 700px; margin: 0 auto; }
    .order-card {
      display: block; text-decoration: none; color: var(--color-text);
      padding: 1.25rem; border: 1px solid var(--color-border); border-radius: var(--radius-md);
      transition: box-shadow 0.2s; &:hover { box-shadow: var(--shadow-md); }
    }
    .order-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
    .order-id { font-weight: 600; font-size: 0.875rem; }
    .order-body { display: flex; justify-content: space-between; font-size: 0.875rem; color: var(--color-text-secondary); }
    .amount { font-weight: 600; color: var(--color-text); }
  `],
})
export class OrderListComponent implements OnInit {
  readonly orderService = inject(OrderService);

  ngOnInit(): void {
    this.orderService.loadOrders();
  }
}
