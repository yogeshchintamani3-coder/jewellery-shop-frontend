import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, ScrollRevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="footer">
      <div class="footer-divider">
        <div class="footer-divider-line"></div>
        <span class="footer-divider-diamond">&#x2726;</span>
        <div class="footer-divider-line"></div>
      </div>
      <div class="container footer-inner">
        <div class="footer-brand" appScrollReveal="up">
          <div class="footer-logo">
            <span class="logo-icon">&#x1F48E;</span>
            <span class="logo-text">Prathamesh Jewellers</span>
          </div>
          <p>Exquisite handcrafted jewellery for every occasion. Each piece tells a story of artistry and elegance.</p>
          <div class="footer-socials">
            <a href="#" class="social-link" title="Instagram">&#x1F4F7;</a>
            <a href="#" class="social-link" title="Facebook">&#x1F310;</a>
            <a href="#" class="social-link" title="Pinterest">&#x1F4CC;</a>
          </div>
        </div>
        <div class="footer-links" appScrollReveal="up" [revealDelay]="100">
          <h4>Quick Links</h4>
          <a routerLink="/" class="footer-link">Home</a>
          <a routerLink="/products" class="footer-link">Shop</a>
          <a routerLink="/cart" class="footer-link">Cart</a>
          <a routerLink="/orders" class="footer-link">Orders</a>
        </div>
        <div class="footer-links" appScrollReveal="up" [revealDelay]="200">
          <h4>Categories</h4>
          <a routerLink="/products" [queryParams]="{category: 'Rings'}" class="footer-link">Rings</a>
          <a routerLink="/products" [queryParams]="{category: 'Necklaces'}" class="footer-link">Necklaces</a>
          <a routerLink="/products" [queryParams]="{category: 'Earrings'}" class="footer-link">Earrings</a>
          <a routerLink="/products" [queryParams]="{category: 'Bracelets'}" class="footer-link">Bracelets</a>
        </div>
        <div class="footer-newsletter" appScrollReveal="up" [revealDelay]="300">
          <h4>Stay Updated</h4>
          <p>Get notified about new collections and exclusive offers.</p>
          <div class="newsletter-form">
            <input type="email" placeholder="Your email address" />
            <button class="btn btn-primary btn-sm">&#x2192;</button>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2026 Prathamesh Jewellers. All rights reserved.</p>
          <p class="footer-tagline">Crafted with &#x2764;&#xFE0F; in India</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: var(--color-bg-secondary);
      padding: 0 0 1.5rem;
      margin-top: 3rem;
      position: relative;
    }
    .footer-divider {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      padding: 2rem 0;
    }
    .footer-divider-line {
      width: 80px;
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--color-primary), transparent);
    }
    .footer-divider-diamond {
      color: var(--color-primary);
      font-size: 0.8rem;
      animation: diamond-spin 3s ease-in-out infinite;
    }
    @keyframes diamond-spin {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(180deg); }
    }
    .footer-inner {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1.5fr;
      gap: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }
    .footer-brand {
      .footer-logo { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; }
      .logo-icon { font-size: 1.5rem; }
      .logo-text {
        font-family: var(--font-primary);
        font-size: 1.25rem;
        font-weight: 700;
        background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      p {
        color: var(--color-text-muted);
        font-size: 0.85rem;
        line-height: 1.7;
      }
    }
    .footer-socials {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
    }
    .social-link {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
      text-decoration: none;
      transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      &:hover {
        border-color: var(--color-primary);
        background: var(--color-primary);
        transform: translateY(-3px) rotate(5deg);
        box-shadow: 0 4px 15px rgba(183, 110, 121, 0.3);
      }
    }
    .footer-links {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      h4 {
        font-family: var(--font-primary);
        color: var(--color-text);
        font-size: 1rem;
        margin-bottom: 0.5rem;
        position: relative;
        &::after {
          content: '';
          display: block;
          width: 24px;
          height: 2px;
          background: var(--color-primary);
          margin-top: 0.4rem;
          transition: width 0.3s;
        }
      }
    }
    .footer-link {
      color: var(--color-text-muted);
      font-size: 0.85rem;
      text-decoration: none;
      transition: all 0.3s;
      padding-left: 0;
      &:hover {
        color: var(--color-primary);
        padding-left: 0.5rem;
      }
    }
    .footer-newsletter {
      h4 {
        font-family: var(--font-primary);
        color: var(--color-text);
        font-size: 1rem;
        margin-bottom: 0.5rem;
      }
      p {
        color: var(--color-text-muted);
        font-size: 0.8rem;
        margin-bottom: 0.75rem;
      }
    }
    .newsletter-form {
      display: flex;
      gap: 0.5rem;
      input {
        flex: 1;
        padding: 0.6rem 0.75rem;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        background: var(--color-bg);
        color: var(--color-text);
        font-size: 0.8rem;
        transition: border-color 0.3s, box-shadow 0.3s;
        &:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(183, 110, 121, 0.15);
        }
      }
      .btn {
        padding: 0.6rem 0.9rem;
        font-size: 1rem;
        transition: all 0.3s;
        &:hover { transform: translateX(3px); }
      }
    }
    .footer-bottom {
      grid-column: 1 / -1;
      text-align: center;
      padding-top: 1.5rem;
      border-top: 1px solid var(--color-border);
      color: var(--color-text-muted);
      font-size: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .footer-tagline {
      font-size: 0.7rem;
      letter-spacing: 1px;
      opacity: 0.7;
    }

    @media (max-width: 768px) {
      .footer-inner { grid-template-columns: 1fr; }
    }
  `],
})
export class FooterComponent {}
