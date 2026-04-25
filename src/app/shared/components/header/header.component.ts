import { Component, ChangeDetectionStrategy, inject, signal, OnInit, OnDestroy, NgZone } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { ThemeService } from '../../../core/services/theme.service';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="header" [class.scrolled]="scrolled()">
      <!-- Marquee top bar -->
      <div class="top-bar">
        <div class="top-bar-marquee">
          <div class="top-bar-track">
            @for (_ of [1,2]; track $index) {
              <span class="top-bar-item">&#x2728; Free Shipping on Orders Above &#x20B9;5,000</span>
              <span class="top-bar-item">&#x1F48E; BIS Hallmarked Jewellery</span>
              <span class="top-bar-item">&#x1F512; 100% Secure Payments</span>
              <span class="top-bar-item">&#x1F504; Easy 30-Day Returns</span>
            }
          </div>
        </div>
        <div class="top-bar-actions">
          <button class="theme-toggle" (click)="theme.toggleTheme()" title="Toggle theme">
            <span class="theme-icon" [class.spin]="themeAnimating()">
              {{ theme.currentTheme() === 'light' ? '&#x1F319;' : '&#x2600;&#xFE0F;' }}
            </span>
          </button>
        </div>
      </div>

      <div class="container header-inner">
        <a routerLink="/" class="logo">
          <span class="logo-icon">&#x1F48E;</span>
          <span class="logo-text">Prathamesh Jewellers</span>
        </a>

        <button class="mobile-toggle" (click)="toggleMenu()" [class.active]="menuOpen()">
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav class="nav" [class.open]="menuOpen()">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" class="nav-link">Home</a>

          <div class="nav-dropdown">
            <a routerLink="/products" routerLinkActive="active" class="dropdown-trigger nav-link">
              Shop <span class="chevron">&#x25BE;</span>
            </a>
            <div class="dropdown-menu">
              <a routerLink="/products" [queryParams]="{category: ''}" class="dropdown-item all-cat">
                All Collections
              </a>
              @for (cat of productService.categories(); track cat.categoryId) {
                <a routerLink="/products" [queryParams]="{category: cat.name}" class="dropdown-item">
                  {{ cat.name }}
                </a>
              }
            </div>
          </div>

          <a routerLink="/try-on" routerLinkActive="active" class="nav-link try-on-link">
            &#x2728; Try On
          </a>

          @if (auth.isAuthenticated()) {
            <a routerLink="/cart" routerLinkActive="active" class="cart-link nav-link">
              &#x1F6D2; Cart
              @if (cart.itemCount() > 0) {
                <span class="cart-badge">{{ cart.itemCount() }}</span>
              }
            </a>
            <a routerLink="/orders" routerLinkActive="active" class="nav-link">Orders</a>
            @if (auth.isAdmin()) {
              <a routerLink="/admin" routerLinkActive="active" class="nav-link">Admin</a>
            }
            <button class="btn-link" (click)="auth.logout()">Logout</button>
          } @else {
            <a routerLink="/login" routerLinkActive="active" class="nav-link">Login</a>
            <a routerLink="/signup" class="btn btn-primary btn-sm signup-btn">Sign Up</a>
          }
        </nav>
      </div>
    </header>
  `,
  styles: [`
    .header {
      position: sticky;
      top: 0;
      z-index: 100;
      border-bottom: 1px solid rgba(232, 224, 208, 0.5);
      backdrop-filter: blur(20px) saturate(1.8);
      -webkit-backdrop-filter: blur(20px) saturate(1.8);
      background: rgba(255, 255, 255, 0.85);
      transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    :host-context([data-theme="dark"]) .header {
      background: rgba(15, 15, 26, 0.85);
      border-bottom-color: rgba(42, 42, 64, 0.5);
    }
    .header.scrolled {
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.08);
      background: rgba(255, 255, 255, 0.95);
    }
    :host-context([data-theme="dark"]) .header.scrolled {
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
      background: rgba(15, 15, 26, 0.95);
    }

    /* Scrolling marquee top bar */
    .top-bar {
      background: linear-gradient(90deg, var(--color-primary), var(--color-primary-dark), var(--color-primary));
      background-size: 200% 100%;
      animation: top-bar-gradient 8s ease infinite;
      color: #fff;
      font-size: 0.65rem;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      overflow: hidden;
      position: relative;
    }
    @keyframes top-bar-gradient {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }
    .top-bar-marquee {
      flex: 1;
      overflow: hidden;
      padding: 0.4rem 0;
    }
    .top-bar-track {
      display: flex;
      animation: marquee-scroll 25s linear infinite;
      width: max-content;
    }
    @keyframes marquee-scroll {
      from { transform: translateX(0); }
      to { transform: translateX(-50%); }
    }
    .top-bar-item {
      display: inline-block;
      padding: 0 2.5rem;
      white-space: nowrap;
      font-weight: 500;
    }
    .top-bar-actions {
      display: flex;
      align-items: center;
      padding-right: 1rem;
      flex-shrink: 0;
    }

    .header-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      max-width: 1200px;
      margin: 0 auto;
      transition: padding 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    .header.scrolled .header-inner {
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      color: var(--color-text);
      transition: transform 0.3s;
      &:hover { transform: scale(1.03); }
    }
    .logo-icon {
      font-size: 1.5rem;
      animation: logo-float 3s ease-in-out infinite;
    }
    @keyframes logo-float {
      0%, 100% { transform: translateY(0) rotate(0); }
      50% { transform: translateY(-3px) rotate(5deg); }
    }
    .logo-text {
      font-family: var(--font-primary);
      font-size: 1.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .nav {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }
    .nav-link {
      color: var(--color-text-secondary);
      font-weight: 500;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      text-decoration: none;
      position: relative;
      transition: color 0.3s;
      &::after {
        content: '';
        position: absolute;
        bottom: -4px;
        left: 50%;
        width: 0;
        height: 2px;
        background: linear-gradient(90deg, transparent, var(--color-primary), transparent);
        transition: width 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), left 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      }
      &:hover, &.active {
        color: var(--color-primary);
        &::after { width: 100%; left: 0; }
      }
    }

    .nav-dropdown {
      position: relative;
    }
    .dropdown-trigger {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    .chevron {
      font-size: 0.7rem;
      transition: transform 0.3s;
    }
    .dropdown-menu {
      position: absolute;
      top: calc(100% + 12px);
      left: 50%;
      transform: translateX(-50%);
      min-width: 220px;
      background: var(--color-bg);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
      padding: 0.5rem 0;
      opacity: 0;
      visibility: hidden;
      transform: translateX(-50%) translateY(12px) scale(0.95);
      transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      z-index: 200;
      backdrop-filter: blur(12px);
    }
    .nav-dropdown:hover .dropdown-menu {
      opacity: 1;
      visibility: visible;
      transform: translateX(-50%) translateY(0) scale(1);
    }
    .nav-dropdown:hover .chevron { transform: rotate(180deg); }
    .dropdown-item {
      display: block;
      padding: 0.6rem 1.25rem;
      font-size: 0.8rem;
      color: var(--color-text-secondary);
      text-transform: none;
      letter-spacing: 0.3px;
      transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      white-space: nowrap;
      text-decoration: none;
      position: relative;
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        background: var(--color-primary);
        transform: scaleY(0);
        transition: transform 0.25s;
      }
      &:hover {
        color: var(--color-primary);
        background: var(--color-bg-secondary);
        padding-left: 1.5rem;
        &::before { transform: scaleY(1); }
      }
    }
    .all-cat {
      font-weight: 600;
      color: var(--color-primary);
      border-bottom: 1px solid var(--color-border);
      padding-bottom: 0.625rem;
      margin-bottom: 0.25rem;
    }

    .try-on-link {
      background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      font-weight: 600;
    }
    .cart-link { position: relative; }
    .cart-badge {
      position: absolute;
      top: -10px;
      right: -14px;
      background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
      color: #fff;
      font-size: 0.6rem;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      animation: badge-bounce 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      box-shadow: 0 2px 8px rgba(183, 110, 121, 0.4);
    }
    @keyframes badge-bounce {
      0% { transform: scale(0); }
      60% { transform: scale(1.3); }
      100% { transform: scale(1); }
    }
    .btn-link {
      background: none;
      border: none;
      color: var(--color-text-secondary);
      font-weight: 500;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      cursor: pointer;
      transition: color 0.3s;
      &:hover { color: var(--color-primary); }
    }
    .signup-btn {
      transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      &:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(183, 110, 121, 0.3); }
    }
    .theme-toggle {
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.25);
      border-radius: 50%;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.3s;
      &:hover { border-color: #fff; background: rgba(255,255,255,0.25); transform: rotate(15deg); }
    }
    .theme-icon {
      display: inline-block;
      transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .theme-icon.spin { transform: rotate(360deg) scale(1.2); }

    .mobile-toggle {
      display: none;
      flex-direction: column;
      gap: 5px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      span {
        width: 24px;
        height: 2px;
        background: var(--color-text);
        transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        transform-origin: center;
      }
      &.active span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
      &.active span:nth-child(2) { opacity: 0; transform: scaleX(0); }
      &.active span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
    }

    @media (max-width: 768px) {
      .top-bar { display: none; }
      .mobile-toggle { display: flex; }
      .nav {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--color-bg);
        flex-direction: column;
        padding: 1rem;
        border-bottom: 1px solid var(--color-border);
        display: none;
        box-shadow: 0 8px 30px rgba(0,0,0,0.1);
        animation: nav-slide-in 0.3s ease-out;
        &.open { display: flex; }
      }
      @keyframes nav-slide-in {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .nav-link::after { display: none; }
      .nav-dropdown { width: 100%; }
      .dropdown-menu {
        position: static;
        transform: none;
        opacity: 1;
        visibility: visible;
        box-shadow: none;
        border: none;
        padding: 0 0 0 1rem;
        min-width: auto;
        backdrop-filter: none;
      }
    }
  `],
})
export class HeaderComponent implements OnInit, OnDestroy {
  readonly auth = inject(AuthService);
  readonly cart = inject(CartService);
  readonly theme = inject(ThemeService);
  readonly productService = inject(ProductService);
  private readonly zone = inject(NgZone);
  readonly menuOpen = signal(false);
  readonly scrolled = signal(false);
  readonly themeAnimating = signal(false);

  private scrollHandler: (() => void) | null = null;

  ngOnInit(): void {
    this.productService.loadCategories();

    this.zone.runOutsideAngular(() => {
      this.scrollHandler = () => {
        const isScrolled = window.scrollY > 40;
        if (this.scrolled() !== isScrolled) {
          this.scrolled.set(isScrolled);
        }
      };
      window.addEventListener('scroll', this.scrollHandler, { passive: true });
    });
  }

  ngOnDestroy(): void {
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
    }
  }

  toggleMenu(): void {
    this.menuOpen.update(v => !v);
  }
}
