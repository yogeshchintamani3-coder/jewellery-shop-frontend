import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { Order } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly api = inject(ApiService);

  private readonly ordersState = signal<Order[]>([]);
  private readonly selectedOrderState = signal<Order | null>(null);
  private readonly loadingState = signal(false);

  readonly orders = this.ordersState.asReadonly();
  readonly selectedOrder = this.selectedOrderState.asReadonly();
  readonly loading = this.loadingState.asReadonly();

  loadOrders(): void {
    this.loadingState.set(true);
    this.api.get<Order[]>('/orders').subscribe({
      next: (data) => {
        this.ordersState.set(data);
        this.loadingState.set(false);
      },
      error: () => this.loadingState.set(false),
    });
  }

  loadOrder(id: string): void {
    this.loadingState.set(true);
    this.api.get<Order>(`/orders/${id}`).subscribe({
      next: (data) => {
        this.selectedOrderState.set(data);
        this.loadingState.set(false);
      },
      error: () => this.loadingState.set(false),
    });
  }

  placeOrder(shippingAddress: string): void {
    this.loadingState.set(true);
    this.api.post<Order>('/orders', { shippingAddress }).subscribe({
      next: (data) => {
        this.selectedOrderState.set(data);
        this.loadingState.set(false);
      },
      error: () => this.loadingState.set(false),
    });
  }
}
