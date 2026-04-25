import { Component, ChangeDetectionStrategy, inject, signal, OnInit, OnDestroy, NgZone } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { BreadcrumbComponent } from './shared/components/breadcrumb/breadcrumb.component';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, BreadcrumbComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="app-loader" [class.loaded]="loaded()">
      <div class="loader-content">
        <span class="loader-diamond">&#x1F48E;</span>
        <span class="loader-text">Prathamesh Jewellers</span>
        <div class="loader-bar"><div class="loader-bar-fill"></div></div>
      </div>
    </div>
    <app-header />
    <app-breadcrumb />
    <main class="main-content">
      <router-outlet />
    </main>
    <app-footer />

    <!-- Scroll to top button -->
    <button class="scroll-top-btn" [class.visible]="showScrollTop()"
            (click)="scrollToTop()" title="Back to top">
      &#x2191;
    </button>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    .main-content {
      flex: 1;
      animation: page-enter 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }

    /* Luxury loading screen */
    .app-loader {
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: var(--color-bg, #fff);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.6s ease-out, visibility 0.6s;
    }
    .app-loader.loaded {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }
    .loader-content {
      text-align: center;
      animation: loader-fade-in 0.5s ease-out;
    }
    @keyframes loader-fade-in {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .loader-diamond {
      font-size: 3rem;
      display: block;
      margin-bottom: 1rem;
      animation: loader-bounce 1s ease-in-out infinite;
    }
    @keyframes loader-bounce {
      0%, 100% { transform: translateY(0) scale(1); }
      50% { transform: translateY(-10px) scale(1.1); }
    }
    .loader-text {
      display: block;
      font-family: var(--font-primary, 'Playfair Display', serif);
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-primary, #B76E79);
      margin-bottom: 1.5rem;
      letter-spacing: 2px;
    }
    .loader-bar {
      width: 120px;
      height: 2px;
      background: var(--color-border, #E8E0D0);
      border-radius: 2px;
      margin: 0 auto;
      overflow: hidden;
    }
    .loader-bar-fill {
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, var(--color-primary, #C5A05E), var(--color-primary-dark, #A88B4A));
      animation: loader-fill 1.2s ease-in-out;
    }
    @keyframes loader-fill {
      from { transform: translateX(-100%); }
      to { transform: translateX(0); }
    }

    /* Scroll to top */
    .scroll-top-btn {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
      color: #fff;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      z-index: 50;
      opacity: 0;
      visibility: hidden;
      transform: translateY(20px) scale(0.8);
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      box-shadow: 0 4px 20px rgba(183, 110, 121, 0.4);
      &.visible {
        opacity: 1;
        visibility: visible;
        transform: translateY(0) scale(1);
      }
      &:hover {
        transform: translateY(-4px) scale(1.1);
        box-shadow: 0 8px 30px rgba(183, 110, 121, 0.5);
      }
    }
  `],
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly theme = inject(ThemeService);
  private readonly zone = inject(NgZone);

  readonly loaded = signal(false);
  readonly showScrollTop = signal(false);

  private scrollHandler: (() => void) | null = null;

  ngOnInit(): void {
    setTimeout(() => this.loaded.set(true), 1400);

    this.zone.runOutsideAngular(() => {
      this.scrollHandler = () => {
        const show = window.scrollY > 400;
        if (this.showScrollTop() !== show) {
          this.showScrollTop.set(show);
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

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
