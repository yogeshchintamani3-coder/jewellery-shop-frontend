import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService } from './api.service';
import { AuthResponse } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);

  private readonly tokenState = signal<string | null>(this.getStoredToken());
  private readonly userState = signal<AuthResponse | null>(this.getStoredUser());
  private readonly loadingState = signal(false);
  private readonly errorState = signal<string | null>(null);

  readonly token = this.tokenState.asReadonly();
  readonly user = this.userState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly isAuthenticated = computed(() => !!this.tokenState());
  readonly isAdmin = computed(() => this.userState()?.role === 'ADMIN');

  login(email: string, password: string): void {
    this.loadingState.set(true);
    this.errorState.set(null);
    this.api.post<AuthResponse>('/auth/login', { email, password }).subscribe({
      next: (res) => {
        this.storeAuth(res);
        this.loadingState.set(false);
      },
      error: (err) => {
        this.errorState.set(err?.error?.message || 'Login failed');
        this.loadingState.set(false);
      },
    });
  }

  signup(fullName: string, email: string, password: string, phone?: string): void {
    this.loadingState.set(true);
    this.errorState.set(null);
    this.api.post<AuthResponse>('/auth/signup', { fullName, email, password, phone }).subscribe({
      next: (res) => {
        this.storeAuth(res);
        this.loadingState.set(false);
      },
      error: (err) => {
        this.errorState.set(err?.error?.message || 'Signup failed');
        this.loadingState.set(false);
      },
    });
  }

  logout(): void {
    localStorage.removeItem('jc_token');
    localStorage.removeItem('jc_user');
    this.tokenState.set(null);
    this.userState.set(null);
  }

  private storeAuth(res: AuthResponse): void {
    localStorage.setItem('jc_token', res.token);
    localStorage.setItem('jc_user', JSON.stringify(res));
    this.tokenState.set(res.token);
    this.userState.set(res);
  }

  private getStoredToken(): string | null {
    return localStorage.getItem('jc_token');
  }

  private getStoredUser(): AuthResponse | null {
    const raw = localStorage.getItem('jc_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthResponse;
    } catch {
      return null;
    }
  }
}
