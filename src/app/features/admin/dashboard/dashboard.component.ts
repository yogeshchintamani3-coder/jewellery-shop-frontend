import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { SalesSummary, UserStats } from '../../../core/models/product.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container page">
      <h1>Admin Dashboard</h1>

      <nav class="admin-nav">
        <a routerLink="/admin" class="active">Dashboard</a>
        <a routerLink="/admin/products">Products</a>
        <a routerLink="/admin/orders">Orders</a>
        <a routerLink="/admin/categories">Categories</a>
        <a routerLink="/admin/billing">Billing</a>
      </nav>

      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-label">Total Revenue</span>
          <span class="stat-value gold">{{ sales()?.totalRevenue | currency:'INR' }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Paid Revenue</span>
          <span class="stat-value">{{ sales()?.paidRevenue | currency:'INR' }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Total Orders</span>
          <span class="stat-value">{{ sales()?.totalOrders }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Total Users</span>
          <span class="stat-value">{{ users()?.totalUsers }}</span>
        </div>
      </div>

      <div class="detail-grid">
        <div class="detail-card">
          <h3>Orders Breakdown</h3>
          <div class="breakdown-item"><span>Pending</span><span class="badge badge-warning">{{ sales()?.pendingOrders }}</span></div>
          <div class="breakdown-item"><span>Confirmed</span><span class="badge badge-info">{{ sales()?.confirmedOrders }}</span></div>
          <div class="breakdown-item"><span>Delivered</span><span class="badge badge-success">{{ sales()?.deliveredOrders }}</span></div>
          <div class="breakdown-item"><span>Cancelled</span><span class="badge badge-danger">{{ sales()?.cancelledOrders }}</span></div>
        </div>

        <div class="detail-card">
          <h3>User Breakdown</h3>
          <div class="breakdown-item"><span>Regular Users</span><span>{{ users()?.regularUsers }}</span></div>
          <div class="breakdown-item"><span>Admin Users</span><span>{{ users()?.adminUsers }}</span></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 2rem 1rem; animation: page-enter 0.5s ease-out; }
    h1 { font-family: var(--font-primary); margin-bottom: 1rem; }
    .admin-nav {
      display: flex; gap: 1rem; margin-bottom: 2rem; border-bottom: 1px solid var(--color-border); padding-bottom: 1rem;
      a { color: var(--color-text-secondary); font-weight: 500; font-size: 0.875rem; text-decoration: none; padding: 0.5rem 1rem; border-radius: var(--radius-sm);
        transition: all 0.3s;
        &:hover, &.active { color: var(--color-primary); background: var(--color-bg-secondary); }
      }
    }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem; }
    .stat-card {
      background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 1.5rem; text-align: center;
      display: flex; flex-direction: column; gap: 0.5rem;
      transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.3s;
      &:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
    }
    .stat-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: var(--color-text-muted); }
    .stat-value { font-size: 1.5rem; font-weight: 700; &.gold { color: var(--color-primary); } }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    .detail-card {
      background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 1.5rem;
      transition: box-shadow 0.3s;
      &:hover { box-shadow: var(--shadow-sm); }
      h3 { font-family: var(--font-primary); margin-bottom: 1rem; }
    }
    .breakdown-item { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--color-border); font-size: 0.875rem;
      transition: background 0.2s;
      &:hover { background: var(--color-bg-secondary); }
      &:last-child { border-bottom: none; }
    }

    @media (max-width: 768px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .detail-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class DashboardComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly sales = signal<SalesSummary | null>(null);
  readonly users = signal<UserStats | null>(null);

  ngOnInit(): void {
    this.api.get<SalesSummary>('/admin/analytics/sales').subscribe({
      next: (data) => this.sales.set(data),
      error: () => {},
    });
    this.api.get<UserStats>('/admin/analytics/users').subscribe({
      next: (data) => this.users.set(data),
      error: () => {},
    });
  }
}
