import { AfterViewInit, Directive, ElementRef, Input, OnDestroy } from '@angular/core';

export type RevealVariant = 'up' | 'fade' | 'left' | 'right' | 'scale';

@Directive({
  selector: '[appReveal]',
  standalone: true,
})
export class RevealDirective implements AfterViewInit, OnDestroy {
  @Input() appReveal: RevealVariant = 'up';
  @Input() delay = 0;

  private observer?: IntersectionObserver;

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    const el = this.elementRef.nativeElement;
    el.classList.add('reveal', `reveal-${this.appReveal}`);
    if (this.delay) {
      el.style.transitionDelay = `${this.delay}ms`;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add('is-visible');
            this.observer?.unobserve(el);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );

    this.observer.observe(el);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
