import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { signal } from '@angular/core';
import { filter } from 'rxjs/operators';

interface Crumb {
  label: string;
  url: string;
}

const ROUTE_LABELS: Record<string, string> = {
  '': 'Home',
  'products': 'Shop',
  'cart': 'Cart',
  'checkout': 'Checkout',
  'orders': 'My Orders',
  'login': 'Login',
  'signup': 'Sign Up',
  'admin': 'Admin',
};

const ADMIN_LABELS: Record<string, string> = {
  '': 'Dashboard',
  'products': 'Products',
  'orders': 'Orders',
  'categories': 'Categories',
  'billing': 'Billing',
};

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (crumbs().length > 1) {
      <nav class="breadcrumb" aria-label="breadcrumb">
        <div class="container breadcrumb-inner">
          @for (crumb of crumbs(); track crumb.url; let last = $last) {
            @if (!last) {
              <a [routerLink]="crumb.url" class="crumb-link">{{ crumb.label }}</a>
              <span class="separator">&#x203A;</span>
            } @else {
              <span class="crumb-current">{{ crumb.label }}</span>
            }
          }
        </div>
      </nav>
    }
  `,
  styles: [`
    .breadcrumb {
      background: var(--color-bg-secondary);
      border-bottom: 1px solid var(--color-border);
      font-size: 0.75rem;
    }
    .breadcrumb-inner {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1rem;
      max-width: 1200px;
      margin: 0 auto;
      flex-wrap: wrap;
    }
    .crumb-link {
      color: var(--color-text-muted);
      text-decoration: none;
      transition: color 0.2s;
      &:hover { color: var(--color-primary); }
    }
    .separator { color: var(--color-text-muted); }
    .crumb-current {
      color: var(--color-text);
      font-weight: 500;
    }
  `],
})
export class BreadcrumbComponent {
  private readonly router = inject(Router);
  readonly crumbs = signal<Crumb[]>([]);

  constructor() {
    this.updateCrumbs(this.router.url);
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd)
    ).subscribe(e => this.updateCrumbs(e.urlAfterRedirects));
  }

  private updateCrumbs(url: string): void {
    const path = url.split('?')[0].replace(/^\//, '');
    const segments = path ? path.split('/') : [];
    const crumbs: Crumb[] = [{ label: 'Home', url: '/' }];

    if (segments.length === 0) {
      this.crumbs.set(crumbs);
      return;
    }

    if (segments[0] === 'admin') {
      crumbs.push({ label: 'Admin', url: '/admin' });
      if (segments.length > 1) {
        const adminSeg = segments[1];
        crumbs.push({ label: ADMIN_LABELS[adminSeg] || adminSeg, url: `/admin/${adminSeg}` });
      }
    } else if (segments[0] === 'products' && segments.length > 1) {
      crumbs.push({ label: 'Shop', url: '/products' });
      crumbs.push({ label: 'Product Details', url: url });
    } else if (segments[0] === 'orders' && segments.length > 1) {
      crumbs.push({ label: 'My Orders', url: '/orders' });
      crumbs.push({ label: 'Order Details', url: url });
    } else {
      const label = ROUTE_LABELS[segments[0]] || segments[0];
      crumbs.push({ label, url: `/${segments[0]}` });
    }

    this.crumbs.set(crumbs);
  }
}
