import {
  Directive,
  ElementRef,
  inject,
  OnInit,
  OnDestroy,
  NgZone,
  input,
} from '@angular/core';

@Directive({
  selector: '[appTilt]',
  standalone: true,
})
export class TiltDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef);
  private readonly zone = inject(NgZone);

  maxTilt = input<number>(8);

  private moveHandler: ((e: MouseEvent) => void) | null = null;
  private leaveHandler: (() => void) | null = null;

  ngOnInit(): void {
    const host = this.el.nativeElement as HTMLElement;
    host.style.perspective = '800px';
    host.style.transformStyle = 'preserve-3d';

    this.zone.runOutsideAngular(() => {
      this.moveHandler = (e: MouseEvent) => {
        const rect = host.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * this.maxTilt();
        const rotateX = ((centerY - e.clientY) / (rect.height / 2)) * this.maxTilt();

        host.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
        host.style.transition = 'transform 0.1s ease-out';
      };

      this.leaveHandler = () => {
        host.style.transform = 'rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        host.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      };

      host.addEventListener('mousemove', this.moveHandler, { passive: true });
      host.addEventListener('mouseleave', this.leaveHandler, { passive: true });
    });
  }

  ngOnDestroy(): void {
    const host = this.el.nativeElement;
    if (this.moveHandler) host.removeEventListener('mousemove', this.moveHandler);
    if (this.leaveHandler) host.removeEventListener('mouseleave', this.leaveHandler);
  }
}
