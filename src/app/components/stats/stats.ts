import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  signal,
} from '@angular/core';
import { SiteDataService } from '../../services/site-data.service';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './stats.html',
  styleUrl: './stats.scss',
})
export class StatsComponent implements AfterViewInit, OnDestroy {
  private readonly data = inject(SiteDataService);
  private readonly host: HTMLElement;

  readonly stats = this.data.stats;
  readonly displayed = signal<number[]>(this.stats.map(() => 0));

  private observer?: IntersectionObserver;
  private frame?: number;

  constructor(elementRef: ElementRef<HTMLElement>) {
    this.host = elementRef.nativeElement;
  }

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          this.animate();
          this.observer?.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    this.observer.observe(this.host);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    if (this.frame) {
      cancelAnimationFrame(this.frame);
    }
  }

  private animate(): void {
    const duration = 1800;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.displayed.set(this.stats.map((stat) => Math.round(stat.value * eased)));
      if (progress < 1) {
        this.frame = requestAnimationFrame(tick);
      }
    };
    this.frame = requestAnimationFrame(tick);
  }
}
