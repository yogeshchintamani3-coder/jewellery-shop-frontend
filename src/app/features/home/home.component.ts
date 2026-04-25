import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy, signal, NgZone, ElementRef, AfterViewInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';
import { CursorSparkleDirective } from '../../shared/directives/cursor-sparkle.directive';
import { RippleDirective } from '../../shared/directives/ripple.directive';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ProductCardComponent, ScrollRevealDirective, CursorSparkleDirective, RippleDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="hero" appCursorSparkle>
      <!-- Parallax depth layers -->
      <div class="hero-bg-layer hero-bg-1"></div>
      <div class="hero-bg-layer hero-bg-2"></div>
      <div class="hero-bg-layer hero-bg-3"></div>

      <!-- Floating gold particles -->
      <div class="hero-particles">
        @for (_ of particleSlots; track $index) {
          <span class="particle" [style.left.%]="particlePositions[$index].x"
                [style.top.%]="particlePositions[$index].y"
                [style.animation-delay]="particlePositions[$index].delay + 's'"
                [style.width.px]="particlePositions[$index].size"
                [style.height.px]="particlePositions[$index].size"></span>
        }
      </div>

      <!-- Animated rings -->
      <div class="hero-ring hero-ring-1"></div>
      <div class="hero-ring hero-ring-2"></div>
      <div class="hero-ring hero-ring-3"></div>

      <div class="container hero-content">
        <span class="hero-tagline" appScrollReveal="up">
          <span class="tagline-diamond">&#x2726;</span>
          PRATHAMESH JEWELLERS
          <span class="tagline-diamond">&#x2726;</span>
        </span>
        <h1 class="text-shimmer" appScrollReveal="up" [revealDelay]="100">
          Exquisite Handcrafted<br/>Jewellery
        </h1>
        <p class="hero-subtitle" appScrollReveal="up" [revealDelay]="200">
          Discover timeless elegance in every piece. Crafted with passion, worn with pride.
        </p>
        <div class="hero-cta-group" appScrollReveal="up" [revealDelay]="300">
          <a routerLink="/products" class="btn btn-primary btn-lg hero-cta btn-glow" appRipple>
            <span class="cta-text">Shop Collection</span>
            <span class="cta-arrow">&rarr;</span>
          </a>
          <a routerLink="/products" [queryParams]="{sort: 'newest'}" class="btn btn-secondary btn-lg hero-cta-secondary">
            New Arrivals
          </a>
        </div>

        <!-- Trust badges -->
        <div class="trust-badges" appScrollReveal="up" [revealDelay]="500">
          <div class="trust-item">
            <span class="trust-icon">&#x2728;</span>
            <span>BIS Hallmarked</span>
          </div>
          <div class="trust-item">
            <span class="trust-icon">&#x1F4E6;</span>
            <span>Free Shipping</span>
          </div>
          <div class="trust-item">
            <span class="trust-icon">&#x1F512;</span>
            <span>Secure Checkout</span>
          </div>
        </div>
      </div>

      <div class="hero-scroll-hint" appScrollReveal="up" [revealDelay]="700">
        <span class="scroll-text">Scroll to explore</span>
        <span class="scroll-line"></span>
      </div>
    </section>

    <!-- Scrolling marquee strip -->
    <div class="marquee-strip">
      <div class="marquee-track">
        @for (_ of [1,2]; track $index) {
          <span class="marquee-item">&#x2726; Handcrafted with Love</span>
          <span class="marquee-item">&#x2726; BIS Hallmarked Gold</span>
          <span class="marquee-item">&#x2726; Free Shipping Above &#x20B9;5,000</span>
          <span class="marquee-item">&#x2726; Lifetime Exchange</span>
          <span class="marquee-item">&#x2726; Certified Diamonds</span>
          <span class="marquee-item">&#x2726; 30-Day Returns</span>
        }
      </div>
    </div>

    <section class="categories-section container" appScrollReveal="up">
      <div class="section-header">
        <span class="section-label" appScrollReveal="scale">EXPLORE</span>
        <h2>Shop by Category</h2>
        <div class="section-divider"><span class="section-divider-diamond"></span></div>
      </div>
      <div class="categories-grid">
        @for (cat of productService.categories(); track cat.categoryId; let i = $index) {
          <a [routerLink]="['/products']" [queryParams]="{category: cat.name}" class="cat-card"
             appScrollReveal="scale" [revealDelay]="i * 100">
            <div class="cat-image-wrap">
              @if (cat.imageUrl) {
                <img [src]="cat.imageUrl" [alt]="cat.name" loading="lazy" />
              } @else {
                <div class="cat-placeholder">&#x1F48E;</div>
              }
              <div class="cat-overlay"></div>
              <div class="cat-shine"></div>
            </div>
            <span class="cat-name">{{ cat.name }}</span>
            <span class="cat-arrow">&rarr;</span>
          </a>
        }
      </div>
    </section>

    <section class="featured-section container" appScrollReveal="up">
      <div class="section-header">
        <span class="section-label" appScrollReveal="scale">CURATED FOR YOU</span>
        <h2>Featured Collection</h2>
        <div class="section-divider"><span class="section-divider-diamond"></span></div>
      </div>
      @if (productService.loading()) {
        <div class="shimmer-grid">
          @for (_ of [1,2,3,4]; track _) {
            <div class="shimmer-card">
              <div class="shimmer-line" style="aspect-ratio:1;width:100%"></div>
              <div style="padding:1rem;display:flex;flex-direction:column;gap:0.5rem">
                <div class="shimmer-line" style="height:12px;width:40%"></div>
                <div class="shimmer-line" style="height:16px;width:80%"></div>
                <div class="shimmer-line" style="height:14px;width:50%"></div>
                <div class="shimmer-line" style="height:36px;width:100%;margin-top:0.5rem;border-radius:var(--radius-md)"></div>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="products-grid">
          @for (product of productService.featured(); track product.productId; let i = $index) {
            <div appScrollReveal="up" [revealDelay]="i * 80">
              <app-product-card [product]="product" (addToCart)="onAddToCart($event)" />
            </div>
          } @empty {
            <p class="empty-text">No featured products available yet.</p>
          }
        </div>
      }
    </section>

    <!-- Virtual Try-On CTA -->
    <section class="tryon-cta container" appScrollReveal="scale">
      <div class="tryon-content">
        <div class="tryon-text">
          <span class="tryon-badge">&#x2728; NEW FEATURE</span>
          <h2>Virtual Try-On</h2>
          <p>See how our jewellery looks on you! Use your camera or upload a selfie to try on necklaces, earrings, and rings virtually.</p>
          <a routerLink="/try-on" class="btn btn-primary btn-lg">Try It Now &rarr;</a>
        </div>
        <div class="tryon-visual">
          <div class="tryon-phone">
            <div class="tryon-screen">
              <span class="tryon-emoji">&#x1F4F7;</span>
              <span class="tryon-ring">&#x1F48D;</span>
              <span class="tryon-necklace">&#x1F4FF;</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="promo-banner container" appScrollReveal="scale">
      <div class="promo-content" appCursorSparkle>
        <div class="promo-particles">
          @for (_ of [1,2,3,4,5,6]; track $index) {
            <span class="promo-particle"></span>
          }
        </div>
        <span class="promo-tag float-badge">LIMITED TIME</span>
        <h2>Special Offers</h2>
        <p>Get up to 30% off on selected pieces. Limited time offer.</p>
        <a routerLink="/products" [queryParams]="{sort: 'price_asc'}" class="btn btn-secondary" appRipple>View Offers</a>
      </div>
    </section>
  `,
  styles: [`
    /* ======= HERO SECTION – Full luxury immersive ======= */
    .hero {
      background: linear-gradient(160deg, var(--color-bg-secondary) 0%, var(--color-primary-light) 50%, var(--color-bg-secondary) 100%);
      padding: 8rem 0 5rem;
      text-align: center;
      position: relative;
      overflow: hidden;
      min-height: 90vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .hero::before {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse at 50% 0%, rgba(183, 110, 121, 0.12) 0%, transparent 70%);
      pointer-events: none;
    }

    /* Parallax depth layers */
    .hero-bg-layer {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }
    .hero-bg-1 {
      background: radial-gradient(circle at 20% 80%, rgba(183, 110, 121, 0.06) 0%, transparent 50%);
      animation: parallax-drift-1 12s ease-in-out infinite alternate;
    }
    .hero-bg-2 {
      background: radial-gradient(circle at 80% 20%, rgba(183, 110, 121, 0.08) 0%, transparent 40%);
      animation: parallax-drift-2 15s ease-in-out infinite alternate;
    }
    .hero-bg-3 {
      background: radial-gradient(circle at 50% 50%, rgba(242, 217, 220, 0.05) 0%, transparent 60%);
      animation: parallax-drift-3 10s ease-in-out infinite alternate;
    }
    @keyframes parallax-drift-1 {
      from { transform: translate(-3%, 2%); }
      to { transform: translate(3%, -2%); }
    }
    @keyframes parallax-drift-2 {
      from { transform: translate(2%, -3%) scale(1); }
      to { transform: translate(-2%, 3%) scale(1.05); }
    }
    @keyframes parallax-drift-3 {
      from { transform: scale(1) rotate(0deg); }
      to { transform: scale(1.1) rotate(3deg); }
    }

    /* Animated decorative rings */
    .hero-ring {
      position: absolute;
      border-radius: 50%;
      border: 1px solid rgba(183, 110, 121, 0.1);
      pointer-events: none;
    }
    .hero-ring-1 {
      width: 400px; height: 400px;
      top: -100px; right: -100px;
      animation: ring-rotate 20s linear infinite;
    }
    .hero-ring-2 {
      width: 300px; height: 300px;
      bottom: -80px; left: -80px;
      animation: ring-rotate 25s linear infinite reverse;
      border-style: dashed;
    }
    .hero-ring-3 {
      width: 200px; height: 200px;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      animation: ring-pulse 4s ease-in-out infinite;
      border-color: rgba(183, 110, 121, 0.06);
    }
    @keyframes ring-rotate { to { transform: rotate(360deg); } }
    @keyframes ring-pulse {
      0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
      50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.6; }
    }

    /* Floating particles (many more, varied) */
    .hero-particles {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }
    .particle {
      position: absolute;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(242, 217, 220, 0.9), rgba(183, 110, 121, 0.4));
      opacity: 0;
      animation: float-sparkle-enhanced 5s ease-in-out infinite;
      box-shadow: 0 0 8px rgba(183, 110, 121, 0.3);
    }
    @keyframes float-sparkle-enhanced {
      0%, 100% { transform: translateY(0) scale(1) rotate(0deg); opacity: 0; }
      10% { opacity: 0.7; }
      50% { transform: translateY(-40px) scale(1.4) rotate(180deg); opacity: 0.9; }
      90% { opacity: 0.6; }
    }
    @keyframes cursor-sparkle-fade {
      from { opacity: 1; transform: scale(1); }
      to { opacity: 0; transform: scale(0) translateY(-20px); }
    }

    .hero-content {
      max-width: 700px;
      margin: 0 auto;
      position: relative;
      z-index: 1;
    }
    .hero-tagline {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.7rem;
      letter-spacing: 4px;
      text-transform: uppercase;
      color: var(--color-primary-dark);
      margin-bottom: 1.5rem;
      font-weight: 500;
      animation: tagline-fade 1s ease-out 0.3s both;
    }
    .tagline-diamond {
      display: inline-block;
      animation: diamond-spin 3s ease-in-out infinite;
      color: var(--color-primary);
    }
    @keyframes diamond-spin {
      0%, 100% { transform: rotate(0deg) scale(1); }
      50% { transform: rotate(180deg) scale(1.2); }
    }
    @keyframes tagline-fade {
      from { opacity: 0; letter-spacing: 12px; }
      to { opacity: 1; letter-spacing: 4px; }
    }

    .hero-content h1 {
      font-family: var(--font-primary);
      font-size: 3.5rem;
      margin-bottom: 1.25rem;
      line-height: 1.15;
      animation: hero-title-in 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.4s both;
    }
    @keyframes hero-title-in {
      from { opacity: 0; transform: translateY(30px); filter: blur(4px); }
      to { opacity: 1; transform: translateY(0); filter: blur(0); }
    }

    .hero-subtitle {
      color: var(--color-text-secondary);
      font-size: 1.15rem;
      margin-bottom: 2.5rem;
      line-height: 1.7;
      animation: hero-sub-in 1s ease-out 0.6s both;
    }
    @keyframes hero-sub-in {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .hero-cta-group {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      flex-wrap: wrap;
      animation: hero-cta-in 1s ease-out 0.8s both;
    }
    @keyframes hero-cta-in {
      from { opacity: 0; transform: translateY(20px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .hero-cta {
      padding: 1rem 2.5rem;
      font-size: 0.9rem;
      letter-spacing: 1.5px;
      position: relative;
    }
    .cta-text { position: relative; z-index: 1; }
    .cta-arrow {
      display: inline-block;
      transition: transform 0.3s;
      position: relative;
      z-index: 1;
    }
    .hero-cta:hover .cta-arrow { transform: translateX(6px); }
    .hero-cta-secondary {
      padding: 1rem 2rem;
      font-size: 0.9rem;
      letter-spacing: 1px;
    }

    /* Trust badges */
    .trust-badges {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2rem;
      margin-top: 3rem;
      animation: trust-in 1s ease-out 1s both;
    }
    @keyframes trust-in {
      from { opacity: 0; transform: translateY(15px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .trust-item {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.75rem;
      color: var(--color-text-secondary);
      letter-spacing: 0.3px;
    }
    .trust-icon { font-size: 1rem; }

    .hero-scroll-hint {
      position: absolute;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }
    .scroll-text {
      font-size: 0.6rem;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: var(--color-text-muted);
      animation: scroll-text-pulse 2s ease-in-out infinite;
    }
    @keyframes scroll-text-pulse {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 1; }
    }
    .scroll-line {
      display: block;
      width: 1px;
      height: 40px;
      background: linear-gradient(to bottom, var(--color-primary), transparent);
      animation: scroll-pulse 2s ease-in-out infinite;
    }
    @keyframes scroll-pulse {
      0%, 100% { opacity: 0.3; transform: scaleY(0.6); }
      50% { opacity: 1; transform: scaleY(1); }
    }

    /* ======= MARQUEE STRIP ======= */
    .marquee-strip {
      background: var(--color-primary);
      color: #fff;
      padding: 0.75rem 0;
      overflow: hidden;
      position: relative;
    }
    .marquee-strip::before, .marquee-strip::after {
      content: '';
      position: absolute;
      top: 0; bottom: 0;
      width: 60px;
      z-index: 2;
    }
    .marquee-strip::before { left: 0; background: linear-gradient(to right, var(--color-primary), transparent); }
    .marquee-strip::after { right: 0; background: linear-gradient(to left, var(--color-primary), transparent); }
    .marquee-item {
      display: inline-block;
      padding: 0 2.5rem;
      font-size: 0.75rem;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      white-space: nowrap;
      font-weight: 500;
    }

    /* ======= SECTION HEADERS ======= */
    .section-header {
      text-align: center;
      margin-bottom: 3rem;
    }
    .section-label {
      display: inline-block;
      font-size: 0.65rem;
      letter-spacing: 3px;
      color: var(--color-primary);
      text-transform: uppercase;
      margin-bottom: 0.5rem;
      font-weight: 600;
    }
    h2 {
      font-family: var(--font-primary);
      font-size: 2rem;
      color: var(--color-text);
      margin-bottom: 0.75rem;
    }

    /* ======= CATEGORIES ======= */
    .categories-section { padding: 5rem 0; }
    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 1.5rem;
    }
    .cat-card {
      text-align: center;
      text-decoration: none;
      color: var(--color-text);
      background: var(--color-bg-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 1.75rem 1rem 1.25rem;
      transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                  box-shadow 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                  border-color 0.3s;
      position: relative;
      overflow: hidden;
      &:hover {
        transform: translateY(-8px) scale(1.02);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        border-color: var(--color-primary);
      }
    }
    .cat-name { font-weight: 500; display: block; margin-top: 0.75rem; transition: color 0.3s; }
    .cat-card:hover .cat-name { color: var(--color-primary); }
    .cat-arrow {
      display: block;
      font-size: 0.8rem;
      color: var(--color-primary);
      opacity: 0;
      transform: translateX(-8px);
      transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      margin-top: 0.25rem;
    }
    .cat-card:hover .cat-arrow { opacity: 1; transform: translateX(0); }
    .cat-image-wrap {
      position: relative;
      width: 100px;
      height: 100px;
      margin: 0 auto 0.5rem;
      border-radius: 50%;
      overflow: hidden;
      border: 2px solid transparent;
      transition: border-color 0.3s, box-shadow 0.3s;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      }
    }
    .cat-card:hover .cat-image-wrap {
      border-color: var(--color-primary);
      box-shadow: 0 0 20px rgba(183, 110, 121, 0.2);
    }
    .cat-overlay {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle, rgba(183, 110, 121, 0.12), transparent 70%);
      transition: opacity 0.3s;
      opacity: 0;
    }
    .cat-shine {
      position: absolute;
      inset: 0;
      background: linear-gradient(120deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%);
      transform: translateX(-100%);
      transition: transform 0.6s;
    }
    .cat-card:hover .cat-shine { transform: translateX(100%); }
    .cat-card:hover .cat-image-wrap img { transform: scale(1.15) rotate(3deg); }
    .cat-card:hover .cat-overlay { opacity: 1; }
    .cat-placeholder { font-size: 2.5rem; line-height: 100px; }

    /* ======= FEATURED ======= */
    .featured-section { padding: 4rem 0; }
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1.5rem;
    }
    .shimmer-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1.5rem;
    }
    .empty-text { text-align: center; color: var(--color-text-muted); grid-column: 1 / -1; }

    /* ======= VIRTUAL TRY-ON CTA ======= */
    .tryon-cta { padding: 4rem 0; }
    .tryon-content {
      display: grid; grid-template-columns: 1.2fr 1fr; gap: 3rem;
      align-items: center; background: var(--color-bg-card);
      border: 1px solid var(--color-border); border-radius: var(--radius-lg);
      padding: 3rem; overflow: hidden;
    }
    .tryon-badge {
      display: inline-block; font-size: 0.65rem; letter-spacing: 2px;
      color: var(--color-primary); font-weight: 700; margin-bottom: 0.75rem;
      background: var(--color-primary-light); padding: 0.3rem 0.8rem;
      border-radius: 50px;
    }
    .tryon-text h2 { font-family: var(--font-primary); font-size: 1.75rem; margin-bottom: 0.75rem; }
    .tryon-text p { color: var(--color-text-secondary); margin-bottom: 1.5rem; line-height: 1.7; }
    .tryon-visual { display: flex; justify-content: center; }
    .tryon-phone {
      width: 180px; height: 240px; border: 3px solid var(--color-border);
      border-radius: 20px; padding: 0.5rem; background: var(--color-bg-secondary);
      position: relative;
    }
    .tryon-screen {
      width: 100%; height: 100%; background: linear-gradient(135deg, var(--color-primary-light), var(--color-bg-secondary));
      border-radius: 14px; display: flex; align-items: center; justify-content: center;
      position: relative; overflow: hidden;
    }
    .tryon-emoji { font-size: 3rem; animation: tryon-pulse 2s ease-in-out infinite; }
    .tryon-ring {
      position: absolute; bottom: 20px; right: 20px; font-size: 1.5rem;
      animation: tryon-float 3s ease-in-out infinite;
    }
    .tryon-necklace {
      position: absolute; top: 20px; left: 20px; font-size: 1.5rem;
      animation: tryon-float 3s ease-in-out infinite 1s;
    }
    @keyframes tryon-pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    @keyframes tryon-float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }

    /* ======= PROMO BANNER ======= */
    .promo-banner { padding: 4rem 0; }
    .promo-content {
      text-align: center;
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
      padding: 5rem 3rem;
      border-radius: var(--radius-lg);
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 60%);
        animation: promo-glow 6s ease-in-out infinite alternate;
      }
      &::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.06) 50%, transparent 70%);
        transform: translateX(-100%);
        animation: promo-shine 4s ease-in-out infinite;
      }

      h2 { color: #fff; position: relative; z-index: 1; font-size: 2rem; }
      p { color: rgba(255,255,255,0.85); margin-bottom: 2rem; position: relative; z-index: 1; font-size: 1.05rem; }
      .btn-secondary {
        color: #fff;
        border-color: #fff;
        position: relative;
        z-index: 1;
        &:hover { background: #fff; color: var(--color-primary); transform: translateY(-3px); box-shadow: 0 8px 25px rgba(0,0,0,0.2); }
      }
    }
    .promo-particles {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }
    .promo-particle {
      position: absolute;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.4);
      animation: float-sparkle-enhanced 6s ease-in-out infinite;
    }
    .promo-particle:nth-child(1) { left: 10%; top: 20%; animation-delay: 0s; }
    .promo-particle:nth-child(2) { left: 90%; top: 30%; animation-delay: 1s; }
    .promo-particle:nth-child(3) { left: 30%; top: 70%; animation-delay: 2s; }
    .promo-particle:nth-child(4) { left: 70%; top: 80%; animation-delay: 3s; }
    .promo-particle:nth-child(5) { left: 50%; top: 15%; animation-delay: 4s; }
    .promo-particle:nth-child(6) { left: 85%; top: 60%; animation-delay: 5s; }
    .promo-tag {
      display: inline-block;
      font-size: 0.65rem;
      letter-spacing: 3px;
      color: rgba(255,255,255,0.8);
      margin-bottom: 1rem;
      position: relative;
      z-index: 1;
      background: rgba(255,255,255,0.1);
      padding: 0.4rem 1rem;
      border-radius: 50px;
      backdrop-filter: blur(4px);
    }

    @keyframes promo-glow {
      from { transform: translate(-10%, -10%); }
      to { transform: translate(10%, 10%); }
    }
    @keyframes promo-shine {
      0%, 100% { transform: translateX(-100%); }
      50% { transform: translateX(100%); }
    }

    @media (max-width: 768px) {
      .hero { padding: 5rem 0 3rem; min-height: 80vh; }
      .hero-content h1 { font-size: 2.25rem; }
      .hero-ring { display: none; }
      .trust-badges { flex-direction: column; gap: 0.75rem; }
      .hero-cta-group { flex-direction: column; }
      .categories-grid { grid-template-columns: repeat(2, 1fr); }
      .products-grid, .shimmer-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); }
      .promo-content { padding: 3rem 1.5rem; }
      .tryon-content { grid-template-columns: 1fr; padding: 2rem; }
      .tryon-visual { display: none; }
      .marquee-item { padding: 0 1.5rem; }
    }
  `],
})
export class HomeComponent implements OnInit {
  readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);

  readonly particleSlots = Array.from({ length: 15 });
  readonly particlePositions = this.particleSlots.map(() => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 5,
    size: Math.random() * 5 + 2,
  }));

  ngOnInit(): void {
    this.productService.loadFeatured();
    this.productService.loadCategories();
  }

  onAddToCart(productId: string): void {
    this.cartService.addToCart(productId);
  }
}
