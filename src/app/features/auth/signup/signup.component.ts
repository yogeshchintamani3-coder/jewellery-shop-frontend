import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <h1>Create Account</h1>
        <p class="subtitle">Join Prathamesh Jewellers for a luxurious shopping experience</p>

        @if (auth.error()) {
          <div class="error-msg">{{ auth.error() }}</div>
        }

        <form (ngSubmit)="onSubmit()">
          <div class="input-group">
            <label for="fullName">Full Name</label>
            <input id="fullName" type="text" [(ngModel)]="fullName" name="fullName" required placeholder="Your Name" />
          </div>
          <div class="input-group">
            <label for="email">Email</label>
            <input id="email" type="email" [(ngModel)]="email" name="email" required placeholder="your@email.com" />
          </div>
          <div class="input-group">
            <label for="phone">Phone (optional)</label>
            <input id="phone" type="tel" [(ngModel)]="phone" name="phone" placeholder="+91 98765 43210" />
          </div>
          <div class="input-group">
            <label for="password">Password</label>
            <input id="password" type="password" [(ngModel)]="password" name="password" required minlength="6" placeholder="••••••••" />
          </div>
          <button type="submit" class="btn btn-primary btn-lg full-width" [disabled]="auth.loading()">
            {{ auth.loading() ? 'Creating account...' : 'Create Account' }}
          </button>
        </form>

        <p class="switch-text">
          Already have an account? <a routerLink="/login">Sign in</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { display: flex; justify-content: center; align-items: center; min-height: 60vh; padding: 2rem; }
    .auth-card { background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: 2.5rem; max-width: 420px; width: 100%; box-shadow: var(--shadow-md); }
    h1 { font-family: var(--font-primary); text-align: center; margin-bottom: 0.25rem; }
    .subtitle { text-align: center; color: var(--color-text-muted); margin-bottom: 1.5rem; font-size: 0.875rem; }
    .error-msg { background: #FFEBEE; color: var(--color-error); padding: 0.75rem; border-radius: var(--radius-md); margin-bottom: 1rem; font-size: 0.875rem; text-align: center; }
    .full-width { width: 100%; }
    .switch-text { text-align: center; margin-top: 1.5rem; font-size: 0.875rem; color: var(--color-text-muted); }
  `],
})
export class SignupComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  fullName = '';
  email = '';
  phone = '';
  password = '';

  onSubmit(): void {
    if (!this.fullName || !this.email || !this.password) return;
    this.auth.signup(this.fullName, this.email, this.password, this.phone);

    const checkAuth = setInterval(() => {
      if (this.auth.isAuthenticated()) {
        clearInterval(checkAuth);
        this.router.navigate(['/']);
      }
    }, 200);
    setTimeout(() => clearInterval(checkAuth), 10000);
  }
}
