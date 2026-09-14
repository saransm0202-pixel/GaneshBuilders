import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { SiteDataService } from '../../services/site-data.service';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-process',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './process.html',
  styleUrl: './process.scss',
})
export class ProcessComponent {
  private readonly data = inject(SiteDataService);

  readonly steps = this.data.processSteps;

  readonly activeNode = signal(-1);

  private readonly trackRef = viewChild.required<ElementRef<HTMLElement>>('track');

  private track?: HTMLElement;
  private lineDraw?: HTMLElement;
  private spark?: HTMLElement;
  private trail?: HTMLElement;
  private frame?: number;

  ngAfterViewInit(): void {
    const track = this.trackRef().nativeElement;
    this.track = track;
    this.lineDraw = track.querySelector('.process__line-draw') as HTMLElement;
    this.spark = track.querySelector('.process__spark') as HTMLElement;
    this.trail = track.querySelector('.process__trail') as HTMLElement;

    if (!this.lineDraw) {
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.lineDraw.style.transform = 'scaleY(1)';
      this.activeNode.set(this.steps.length - 1);
      return;
    }

    window.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('resize', this.onScroll);
    this.onScroll();
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onScroll);
    if (this.frame !== undefined) {
      cancelAnimationFrame(this.frame);
    }
  }

  private readonly onScroll = (): void => {
    if (this.frame !== undefined || !this.track) {
      return;
    }
    this.frame = requestAnimationFrame(() => {
      this.frame = undefined;

      const vh = window.innerHeight;
      const rect = this.track!.getBoundingClientRect();
      let p = (vh - rect.top) / (rect.height + vh);
      p = Math.min(1, Math.max(0, p));

      this.lineDraw!.style.transform = `scaleY(${p})`;

      const yPx = p * rect.height;
      this.spark!.style.transform = `translateY(${yPx.toFixed(1)}px)`;
      this.trail!.style.transform = `translateY(${Math.max(yPx - 60, 0).toFixed(1)}px)`;

      const n = this.steps.length;
      let active = -1;
      for (let i = 0; i < n; i++) {
        if ((i + 0.5) / n <= p) {
          active = i;
        }
      }
      this.activeNode.set(active);
    });
  };
}