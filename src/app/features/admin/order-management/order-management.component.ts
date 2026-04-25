import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Order } from '../../../core/models/product.model';

@Component({
  selector: 'app-order-management',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container page">
      <h1>Order Management</h1>

      <nav class="admin-nav">
        <a routerLink="/admin">Dashboard</a>
        <a routerLink="/admin/products">Products</a>
        <a routerLink="/admin/orders" class="active">Orders</a>
        <a routerLink="/admin/categories">Categories</a>
        <a routerLink="/admin/billing">Billing</a>
      </nav>

      @if (loading()) {
        <div class="loading-spinner"></div>
      } @else {
        <div class="orders-table">
          <table>
            <thead>
              <tr><th>Order ID</th><th>Date</th><th>Amount</th><th>Status</th><th>Payment</th><th>Actions</th></tr>
            </thead>
            <tbody>
              @for (order of orders(); track order.orderId) {
                <tr>
                  <td class="order-id">#{{ order.orderId.substring(0, 8) }}</td>
                  <td>{{ order.createdAt | date:'shortDate' }}</td>
                  <td>{{ order.totalAmount | currency:'INR' }}</td>
                  <td>
                    <span class="badge" [class.badge-warning]="order.status === 'PENDING'"
                          [class.badge-info]="order.status === 'CONFIRMED'"
                          [class.badge-success]="order.status === 'DELIVERED'"
                          [class.badge-danger]="order.status === 'CANCELLED'">
                      {{ order.status }}
                    </span>
                  </td>
                  <td>{{ order.paymentStatus }}</td>
                  <td>
                    <select (change)="updateStatus(order.orderId, $event)" class="status-select">
                      <option value="">Change Status</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="6" class="empty">No orders yet.</td></tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { padding: 2rem 1rem; }
    h1 { font-family: var(--font-primary); margin-bottom: 1rem; }
    .admin-nav { display: flex; gap: 1rem; margin-bottom: 2rem; border-bottom: 1px solid var(--color-border); padding-bottom: 1rem;
      a { color: var(--color-text-secondary); font-weight: 500; font-size: 0.875rem; text-decoration: none; padding: 0.5rem 1rem; border-radius: var(--radius-sm);
        &:hover, &.active { color: var(--color-primary); background: var(--color-bg-secondary); } } }
    .orders-table { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 0.75rem; border-bottom: 2px solid var(--color-border); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; color: var(--color-text-muted); }
    td { padding: 0.75rem; border-bottom: 1px solid var(--color-border); font-size: 0.875rem; }
    .order-id { font-weight: 600; }
    .empty { text-align: center; color: var(--color-text-muted); padding: 2rem; }
    .status-select {
      padding: 0.375rem 0.5rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm);
      background: var(--color-bg); font-size: 0.75rem; color: var(--color-text);
    }
  `],
})
export class OrderManagementComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly orders = signal<Order[]>([]);
  readonly loading = signal(false);

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.api.get<Order[]>('/admin/orders').subscribe({
      next: (data) => { this.orders.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  updateStatus(orderId: string, event: Event): void {
    const target = event.target as HTMLSelectElement;
    const status = target.value;
    if (!status) return;

    this.api.put<Order>(`/admin/orders/${orderId}/status`, { status }).subscribe({
      next: () => this.loadOrders(),
      error: () => {},
    });
    target.value = '';
  }
}
