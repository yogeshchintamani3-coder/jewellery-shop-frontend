import {
  Directive,
  ElementRef,
  inject,
  OnInit,
  OnDestroy,
  NgZone,
} from '@angular/core';

@Directive({
  selector: '[appRipple]',
  standalone: true,
})
export class RippleDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef);
  private readonly zone = inject(NgZone);
  private clickHandler: ((e: MouseEvent) => void) | null = null;

  ngOnInit(): void {
    const host = this.el.nativeElement as HTMLElement;
    host.style.position = host.style.position || 'relative';
    host.style.overflow = 'hidden';

    this.zone.runOutsideAngular(() => {
      this.clickHandler = (e: MouseEvent) => this.createRipple(e);
      host.addEventListener('click', this.clickHandler);
    });
  }

  ngOnDestroy(): void {
    if (this.clickHandler) {
      this.el.nativeElement.removeEventListener('click', this.clickHandler);
    }
  }

  private createRipple(e: MouseEvent): void {
    const host = this.el.nativeElement as HTMLElement;
    const rect = host.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = document.createElement('span');

    ripple.style.cssText = `
      position: absolute;
      left: ${e.clientX - rect.left - size / 2}px;
      top: ${e.clientY - rect.top - size / 2}px;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: rgba(183, 110, 121, 0.25);
      transform: scale(0);
      animation: ripple-expand 0.6s ease-out;
      pointer-events: none;
    `;

    host.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }
}
