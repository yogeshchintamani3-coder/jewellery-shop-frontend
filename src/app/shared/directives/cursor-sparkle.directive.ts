import {
  Directive,
  ElementRef,
  inject,
  OnInit,
  OnDestroy,
  NgZone,
} from '@angular/core';

@Directive({
  selector: '[appCursorSparkle]',
  standalone: true,
})
export class CursorSparkleDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef);
  private readonly zone = inject(NgZone);
  private boundHandler: ((e: MouseEvent) => void) | null = null;
  private throttleTimer = 0;

  ngOnInit(): void {
    this.zone.runOutsideAngular(() => {
      this.boundHandler = (e: MouseEvent) => this.onMouseMove(e);
      this.el.nativeElement.addEventListener('mousemove', this.boundHandler, { passive: true });
    });
  }

  ngOnDestroy(): void {
    if (this.boundHandler) {
      this.el.nativeElement.removeEventListener('mousemove', this.boundHandler);
    }
  }

  private onMouseMove(e: MouseEvent): void {
    const now = Date.now();
    if (now - this.throttleTimer < 50) return;
    this.throttleTimer = now;

    const rect = this.el.nativeElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.createSparkle(x, y);
  }

  private createSparkle(x: number, y: number): void {
    const sparkle = document.createElement('span');
    const size = Math.random() * 6 + 3;
    const offsetX = (Math.random() - 0.5) * 20;
    const offsetY = (Math.random() - 0.5) * 20;

    sparkle.style.cssText = `
      position: absolute;
      left: ${x + offsetX}px;
      top: ${y + offsetY}px;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(242, 217, 220, 0.9), rgba(183, 110, 121, 0.6));
      pointer-events: none;
      z-index: 999;
      animation: cursor-sparkle-fade 0.8s ease-out forwards;
      box-shadow: 0 0 ${size * 2}px rgba(183, 110, 121, 0.5);
    `;

    this.el.nativeElement.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 800);
  }
}
