import {
  Directive,
  ElementRef,
  inject,
  input,
  OnInit,
  OnDestroy,
  Renderer2,
} from '@angular/core';

@Directive({
  selector: '[appScrollReveal]',
  standalone: true,
})
export class ScrollRevealDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);

  appScrollReveal = input<'up' | 'left' | 'right' | 'scale'>('up');
  revealDelay = input<number>(0);

  private observer: IntersectionObserver | null = null;

  ngOnInit(): void {
    const direction = this.appScrollReveal();
    const cssClass =
      direction === 'left'
        ? 'reveal-left'
        : direction === 'right'
          ? 'reveal-right'
          : direction === 'scale'
            ? 'reveal-scale'
            : 'reveal';

    this.renderer.addClass(this.el.nativeElement, cssClass);

    const delay = this.revealDelay();
    if (delay > 0) {
      this.renderer.setStyle(
        this.el.nativeElement,
        'transitionDelay',
        `${delay}ms`
      );
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.renderer.addClass(entry.target, 'visible');
            this.observer?.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
