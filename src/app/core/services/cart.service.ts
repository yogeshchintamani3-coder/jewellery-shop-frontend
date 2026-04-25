import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService } from './api.service';
import { CartItem } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly api = inject(ApiService);

  private readonly itemsState = signal<CartItem[]>([]);
  private readonly loadingState = signal(false);

  readonly items = this.itemsState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly itemCount = computed(() => this.itemsState().reduce((sum, i) => sum + i.quantity, 0));
  readonly totalAmount = computed(() =>
    this.itemsState().reduce((sum, i) => {
      const price = i.product?.discountPrice || i.product?.price || 0;
      return sum + price * i.quantity;
    }, 0)
  );

  loadCart(): void {
    this.loadingState.set(true);
    this.api.get<CartItem[]>('/cart').subscribe({
      next: (data) => {
        this.itemsState.set(data);
        this.loadingState.set(false);
      },
      error: () => this.loadingState.set(false),
    });
  }

  addToCart(productId: string, quantity: number = 1): void {
    this.api.post<CartItem>('/cart', { productId, quantity }).subscribe({
      next: () => this.loadCart(),
      error: () => {},
    });
  }

  updateQuantity(itemId: string, quantity: number): void {
    this.api.put<CartItem>(`/cart/${itemId}`, { quantity }).subscribe({
      next: () => this.loadCart(),
      error: () => {},
    });
  }

  removeItem(itemId: string): void {
    this.api.delete(`/cart/${itemId}`).subscribe({
      next: () => this.loadCart(),
      error: () => {},
    });
  }
}
