import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnDestroy,
  ElementRef,
  viewChild,
  AfterViewInit,
  NgZone,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';
import { CurrencyPipe } from '@angular/common';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';

type JewellerySlot = 'necklace' | 'earring-left' | 'earring-right' | 'ring';

interface TryOnPlacement {
  readonly slot: JewellerySlot;
  readonly product: Product;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

@Component({
  selector: 'app-virtual-try-on',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, ScrollRevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container page">
      <div class="page-header" appScrollReveal="up">
        <span class="section-label">VIRTUAL EXPERIENCE</span>
        <h1>Try On Jewellery</h1>
        <p class="subtitle">See how our jewellery looks on you using your camera</p>
        <div class="section-divider"><span class="section-divider-diamond"></span></div>
      </div>

      <div class="try-on-layout">
        <!-- Camera / Photo area -->
        <div class="camera-area" appScrollReveal="left">
          <div class="camera-viewport" #viewport>
            @if (!cameraActive() && !uploadedImage()) {
              <div class="camera-placeholder">
                <span class="placeholder-icon">&#x1F4F7;</span>
                <h3>Virtual Try-On</h3>
                <p>Use your camera or upload a photo to try on jewellery virtually</p>
                <div class="camera-actions">
                  <button class="btn btn-primary" (click)="startCamera()">
                    &#x1F3A5; Open Camera
                  </button>
                  <label class="btn btn-secondary upload-label">
                    &#x1F4C1; Upload Photo
                    <input type="file" accept="image/*" (change)="onFileUpload($event)" hidden />
                  </label>
                </div>
              </div>
            }

            @if (cameraActive()) {
              <video #videoEl autoplay playsinline class="camera-feed"></video>
            }

            @if (uploadedImage()) {
              <img [src]="uploadedImage()" alt="Uploaded photo" class="uploaded-photo" #photoEl />
            }

            <canvas #overlayCanvas class="overlay-canvas"></canvas>

            <!-- Draggable jewellery overlays -->
            @for (placement of placements(); track placement.slot) {
              <div class="jewellery-overlay"
                   [style.left.px]="placement.x"
                   [style.top.px]="placement.y"
                   [style.width.px]="placement.width"
                   [style.height.px]="placement.height"
                   [style.transform]="'rotate(' + placement.rotation + 'deg)'"
                   (mousedown)="startDrag($event, placement)"
                   (touchstart)="startTouchDrag($event, placement)">
                @if (placement.product.imageUrls?.length) {
                  <img [src]="placement.product.imageUrls[0]" [alt]="placement.product.name" draggable="false" />
                } @else {
                  <div class="overlay-placeholder">&#x1F48E;</div>
                }
                <div class="overlay-controls">
                  <button class="ctrl-btn" (click)="resizePlacement(placement, -10)" title="Smaller">&#x2796;</button>
                  <button class="ctrl-btn" (click)="resizePlacement(placement, 10)" title="Bigger">&#x2795;</button>
                  <button class="ctrl-btn" (click)="rotatePlacement(placement)" title="Rotate">&#x1F504;</button>
                  <button class="ctrl-btn remove" (click)="removePlacement(placement)" title="Remove">&times;</button>
                </div>
              </div>
            }
          </div>

          <div class="camera-toolbar">
            @if (cameraActive()) {
              <button class="btn btn-secondary btn-sm" (click)="capturePhoto()">&#x1F4F8; Capture</button>
              <button class="btn btn-secondary btn-sm" (click)="stopCamera()">&#x23F9; Stop Camera</button>
            }
            @if (uploadedImage() || cameraActive()) {
              <button class="btn btn-secondary btn-sm" (click)="takeScreenshot()">&#x1F4BE; Save Look</button>
              <button class="btn btn-secondary btn-sm" (click)="clearAll()">&#x1F5D1; Clear All</button>
            }
          </div>
        </div>

        <!-- Product selector panel -->
        <div class="selector-panel" appScrollReveal="right">
          <h3>Select Jewellery</h3>
          <p class="panel-hint">Tap a product to place it on your photo. Drag to reposition.</p>

          <div class="category-tabs">
            @for (cat of ['All', 'Necklaces', 'Earrings', 'Rings', 'Bracelets']; track cat) {
              <button class="tab"
                      [class.active]="selectedCategory() === cat"
                      (click)="selectedCategory.set(cat)">
                {{ cat }}
              </button>
            }
          </div>

          <div class="product-list-scroll">
            @for (product of filteredProducts(); track product.productId) {
              <button class="product-pick-card" (click)="addProduct(product)">
                <div class="pick-image">
                  @if (product.imageUrls?.length) {
                    <img [src]="product.imageUrls[0]" [alt]="product.name" loading="lazy" />
                  } @else {
                    <span class="pick-placeholder">&#x1F48E;</span>
                  }
                </div>
                <div class="pick-info">
                  <span class="pick-name">{{ product.name }}</span>
                  <span class="pick-category">{{ product.category }}</span>
                  <span class="pick-price">
                    @if (product.discountPrice > 0) {
                      {{ product.discountPrice | currency:'INR' }}
                    } @else {
                      {{ product.price | currency:'INR' }}
                    }
                  </span>
                </div>
                <span class="pick-add">+</span>
              </button>
            } @empty {
              <p class="empty-msg">No products found for this category.</p>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 2rem 1rem; animation: page-enter 0.5s ease-out; }
    .page-header { text-align: center; margin-bottom: 2.5rem; }
    .page-header h1 { font-family: var(--font-primary); margin-bottom: 0.5rem; }
    .section-label {
      display: inline-block; font-size: 0.65rem; letter-spacing: 3px;
      color: var(--color-primary); text-transform: uppercase; margin-bottom: 0.5rem; font-weight: 600;
    }
    .subtitle { color: var(--color-text-secondary); font-size: 1rem; margin-bottom: 1rem; }

    .try-on-layout {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 2rem;
      align-items: start;
    }

    .camera-area { display: flex; flex-direction: column; gap: 1rem; }
    .camera-viewport {
      position: relative;
      aspect-ratio: 4/3;
      background: var(--color-bg-secondary);
      border: 2px dashed var(--color-border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      cursor: crosshair;
    }
    .camera-placeholder {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      height: 100%; gap: 1rem; padding: 2rem; text-align: center;
      h3 { font-family: var(--font-primary); }
      p { color: var(--color-text-muted); font-size: 0.85rem; }
    }
    .placeholder-icon { font-size: 4rem; opacity: 0.3; }
    .camera-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; justify-content: center; }
    .upload-label { cursor: pointer; }

    .camera-feed, .uploaded-photo {
      width: 100%; height: 100%; object-fit: cover; display: block;
    }
    .overlay-canvas {
      position: absolute; inset: 0; pointer-events: none; z-index: 5;
    }

    .jewellery-overlay {
      position: absolute; z-index: 10; cursor: grab;
      user-select: none; touch-action: none;
      transition: box-shadow 0.2s;
      &:hover { box-shadow: 0 0 0 2px var(--color-primary), 0 4px 20px rgba(183, 110, 121, 0.3); }
      img { width: 100%; height: 100%; object-fit: contain; pointer-events: none; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.3)); }
    }
    .overlay-placeholder {
      width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
      font-size: 2rem; background: rgba(183, 110, 121, 0.1); border-radius: 50%;
    }
    .overlay-controls {
      position: absolute; bottom: -28px; left: 50%; transform: translateX(-50%);
      display: flex; gap: 4px; opacity: 0; transition: opacity 0.2s;
      background: var(--color-bg-card); border-radius: 20px; padding: 2px 6px;
      box-shadow: var(--shadow-md);
    }
    .jewellery-overlay:hover .overlay-controls { opacity: 1; }
    .ctrl-btn {
      width: 22px; height: 22px; border: none; border-radius: 50%; cursor: pointer;
      font-size: 0.6rem; display: flex; align-items: center; justify-content: center;
      background: var(--color-bg-secondary); color: var(--color-text); transition: all 0.2s;
      &:hover { background: var(--color-primary); color: #fff; }
      &.remove:hover { background: var(--color-error); }
    }

    .camera-toolbar { display: flex; gap: 0.5rem; flex-wrap: wrap; }

    .selector-panel {
      background: var(--color-bg-card); border: 1px solid var(--color-border);
      border-radius: var(--radius-lg); padding: 1.5rem; position: sticky; top: 120px;
      h3 { font-family: var(--font-primary); margin-bottom: 0.25rem; }
    }
    .panel-hint { font-size: 0.75rem; color: var(--color-text-muted); margin-bottom: 1rem; }

    .category-tabs {
      display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem;
    }
    .tab {
      padding: 0.4rem 0.75rem; border: 1px solid var(--color-border);
      border-radius: 50px; font-size: 0.7rem; background: var(--color-bg);
      color: var(--color-text-secondary); cursor: pointer; transition: all 0.3s;
      font-weight: 500; letter-spacing: 0.3px;
      &:hover { border-color: var(--color-primary); color: var(--color-primary); }
      &.active { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }
    }

    .product-list-scroll {
      max-height: 55vh; overflow-y: auto; display: flex; flex-direction: column; gap: 0.5rem;
      padding-right: 0.25rem;
      &::-webkit-scrollbar { width: 4px; }
      &::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 4px; }
    }

    .product-pick-card {
      display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem;
      border: 1px solid var(--color-border); border-radius: var(--radius-md);
      background: var(--color-bg); cursor: pointer; text-align: left;
      transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94); width: 100%;
      &:hover { border-color: var(--color-primary); background: var(--color-bg-secondary); transform: translateX(4px); }
    }
    .pick-image {
      width: 50px; height: 50px; border-radius: var(--radius-sm);
      overflow: hidden; flex-shrink: 0; background: var(--color-bg-secondary);
      img { width: 100%; height: 100%; object-fit: cover; }
    }
    .pick-placeholder { font-size: 1.5rem; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; }
    .pick-info { flex: 1; display: flex; flex-direction: column; gap: 0.1rem; }
    .pick-name { font-size: 0.8rem; font-weight: 500; color: var(--color-text); }
    .pick-category { font-size: 0.6rem; text-transform: uppercase; letter-spacing: 1px; color: var(--color-primary); }
    .pick-price { font-size: 0.75rem; font-weight: 600; color: var(--color-text); }
    .pick-add {
      width: 28px; height: 28px; border-radius: 50%; background: var(--color-primary);
      color: #fff; display: flex; align-items: center; justify-content: center;
      font-size: 1rem; flex-shrink: 0; transition: transform 0.2s;
      opacity: 0; transform: scale(0.8);
    }
    .product-pick-card:hover .pick-add { opacity: 1; transform: scale(1); }

    .empty-msg { text-align: center; color: var(--color-text-muted); font-size: 0.8rem; padding: 2rem; }

    @media (max-width: 768px) {
      .try-on-layout { grid-template-columns: 1fr; }
      .selector-panel { position: static; }
    }
  `],
})
export class VirtualTryOnComponent implements AfterViewInit, OnDestroy {
  readonly productService = inject(ProductService);
  private readonly zone = inject(NgZone);

  readonly videoRef = viewChild<ElementRef<HTMLVideoElement>>('videoEl');
  readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('overlayCanvas');
  readonly viewportRef = viewChild<ElementRef<HTMLDivElement>>('viewport');

  readonly cameraActive = signal(false);
  readonly uploadedImage = signal<string | null>(null);
  readonly placements = signal<TryOnPlacement[]>([]);
  readonly selectedCategory = signal('All');

  private stream: MediaStream | null = null;
  private dragState: { placement: TryOnPlacement; offsetX: number; offsetY: number } | null = null;
  private boundMouseMove: ((e: MouseEvent) => void) | null = null;
  private boundMouseUp: (() => void) | null = null;
  private boundTouchMove: ((e: TouchEvent) => void) | null = null;
  private boundTouchEnd: (() => void) | null = null;

  ngAfterViewInit(): void {
    this.productService.loadProducts({});
    this.productService.loadCategories();
  }

  ngOnDestroy(): void {
    this.stopCamera();
    this.cleanupDragListeners();
  }

  filteredProducts(): Product[] {
    const cat = this.selectedCategory();
    const products = this.productService.products();
    if (cat === 'All') return products;
    return products.filter(p => p.category === cat);
  }

  async startCamera(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } },
      });
      this.cameraActive.set(true);
      this.uploadedImage.set(null);

      setTimeout(() => {
        const videoEl = this.videoRef()?.nativeElement;
        if (videoEl) {
          videoEl.srcObject = this.stream;
        }
      }, 50);
    } catch {
      this.cameraActive.set(false);
    }
  }

  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
    this.cameraActive.set(false);
  }

  capturePhoto(): void {
    const videoEl = this.videoRef()?.nativeElement;
    if (!videoEl) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoEl, 0, 0);
      this.uploadedImage.set(canvas.toDataURL('image/png'));
      this.stopCamera();
    }
  }

  onFileUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.uploadedImage.set(reader.result as string);
      this.stopCamera();
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  addProduct(product: Product): void {
    const slot = this.getSlotForCategory(product.category);
    const viewport = this.viewportRef()?.nativeElement;
    const vpWidth = viewport?.clientWidth ?? 400;
    const vpHeight = viewport?.clientHeight ?? 300;

    const defaultSize = this.getDefaultSize(slot, vpWidth);

    const placement: TryOnPlacement = {
      slot,
      product,
      x: (vpWidth - defaultSize.w) / 2,
      y: slot === 'necklace' ? vpHeight * 0.55 : slot.startsWith('earring') ? vpHeight * 0.3 : vpHeight * 0.7,
      width: defaultSize.w,
      height: defaultSize.h,
      rotation: 0,
    };

    this.placements.update(list => [...list, placement]);
  }

  removePlacement(placement: TryOnPlacement): void {
    this.placements.update(list => list.filter(p => p !== placement));
  }

  resizePlacement(placement: TryOnPlacement, delta: number): void {
    placement.width = Math.max(30, placement.width + delta);
    placement.height = Math.max(30, placement.height + delta);
    this.placements.update(list => [...list]);
  }

  rotatePlacement(placement: TryOnPlacement): void {
    placement.rotation = (placement.rotation + 15) % 360;
    this.placements.update(list => [...list]);
  }

  startDrag(e: MouseEvent, placement: TryOnPlacement): void {
    e.preventDefault();
    const rect = (e.target as HTMLElement).closest('.jewellery-overlay')?.getBoundingClientRect();
    if (!rect) return;

    this.dragState = {
      placement,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    };

    this.zone.runOutsideAngular(() => {
      this.boundMouseMove = (ev: MouseEvent) => this.onDragMove(ev);
      this.boundMouseUp = () => this.onDragEnd();
      document.addEventListener('mousemove', this.boundMouseMove);
      document.addEventListener('mouseup', this.boundMouseUp);
    });
  }

  startTouchDrag(e: TouchEvent, placement: TryOnPlacement): void {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = (e.target as HTMLElement).closest('.jewellery-overlay')?.getBoundingClientRect();
    if (!rect) return;

    this.dragState = {
      placement,
      offsetX: touch.clientX - rect.left,
      offsetY: touch.clientY - rect.top,
    };

    this.zone.runOutsideAngular(() => {
      this.boundTouchMove = (ev: TouchEvent) => this.onTouchMove(ev);
      this.boundTouchEnd = () => this.onDragEnd();
      document.addEventListener('touchmove', this.boundTouchMove, { passive: false });
      document.addEventListener('touchend', this.boundTouchEnd);
    });
  }

  takeScreenshot(): void {
    const viewport = this.viewportRef()?.nativeElement;
    if (!viewport) return;

    const canvas = document.createElement('canvas');
    canvas.width = viewport.clientWidth;
    canvas.height = viewport.clientHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = viewport.querySelector('img, video') as HTMLImageElement | HTMLVideoElement | null;
    if (img) {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }

    for (const p of this.placements()) {
      if (p.product.imageUrls?.length) {
        const jewImg = new Image();
        jewImg.crossOrigin = 'anonymous';
        jewImg.src = p.product.imageUrls[0];
        ctx.save();
        ctx.translate(p.x + p.width / 2, p.y + p.height / 2);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.drawImage(jewImg, -p.width / 2, -p.height / 2, p.width, p.height);
        ctx.restore();
      }
    }

    const link = document.createElement('a');
    link.download = 'prathamesh-jewellers-tryon.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  clearAll(): void {
    this.placements.set([]);
    this.uploadedImage.set(null);
    this.stopCamera();
  }

  private onDragMove(e: MouseEvent): void {
    if (!this.dragState) return;
    const viewport = this.viewportRef()?.nativeElement;
    if (!viewport) return;

    const rect = viewport.getBoundingClientRect();
    this.dragState.placement.x = e.clientX - rect.left - this.dragState.offsetX;
    this.dragState.placement.y = e.clientY - rect.top - this.dragState.offsetY;
    this.placements.update(list => [...list]);
  }

  private onTouchMove(e: TouchEvent): void {
    e.preventDefault();
    if (!this.dragState) return;
    const viewport = this.viewportRef()?.nativeElement;
    if (!viewport) return;

    const touch = e.touches[0];
    const rect = viewport.getBoundingClientRect();
    this.dragState.placement.x = touch.clientX - rect.left - this.dragState.offsetX;
    this.dragState.placement.y = touch.clientY - rect.top - this.dragState.offsetY;
    this.placements.update(list => [...list]);
  }

  private onDragEnd(): void {
    this.dragState = null;
    this.cleanupDragListeners();
  }

  private cleanupDragListeners(): void {
    if (this.boundMouseMove) document.removeEventListener('mousemove', this.boundMouseMove);
    if (this.boundMouseUp) document.removeEventListener('mouseup', this.boundMouseUp);
    if (this.boundTouchMove) document.removeEventListener('touchmove', this.boundTouchMove);
    if (this.boundTouchEnd) document.removeEventListener('touchend', this.boundTouchEnd);
    this.boundMouseMove = null;
    this.boundMouseUp = null;
    this.boundTouchMove = null;
    this.boundTouchEnd = null;
  }

  private getSlotForCategory(category: string): JewellerySlot {
    const cat = category.toLowerCase();
    if (cat.includes('necklace') || cat.includes('pendant')) return 'necklace';
    if (cat.includes('earring')) return Math.random() > 0.5 ? 'earring-left' : 'earring-right';
    if (cat.includes('ring') || cat.includes('bracelet') || cat.includes('anklet')) return 'ring';
    return 'necklace';
  }

  private getDefaultSize(slot: JewellerySlot, vpWidth: number): { w: number; h: number } {
    const scale = vpWidth / 600;
    switch (slot) {
      case 'necklace': return { w: 160 * scale, h: 100 * scale };
      case 'earring-left':
      case 'earring-right': return { w: 50 * scale, h: 70 * scale };
      case 'ring': return { w: 60 * scale, h: 60 * scale };
    }
  }
}
