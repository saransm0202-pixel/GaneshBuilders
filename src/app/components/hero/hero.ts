import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  NgZone,
  OnDestroy,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';

interface Chapter {
  /** start time inside the film (seconds) */
  t: number;
  step: string;
  label: string;
}

@Component({
  selector: 'app-hero',
  standalone: true,
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
  animations: [
    trigger('copyIn', [
      transition(':enter', [
        query(
          '.hero__kicker',
          [
            style({ opacity: 0, transform: 'translateY(18px)' }),
            animate('0.7s cubic-bezier(0.22, 0.61, 0.36, 1)', style({ opacity: 1, transform: 'none' })),
          ],
          { optional: true },
        ),
        query(
          '.hero__title .line',
          [
            style({ transform: 'translateY(112%)' }),
            stagger(
              150,
              animate('1s cubic-bezier(0.19, 1, 0.22, 1)', style({ transform: 'translateY(0%)' })),
            ),
          ],
          { optional: true },
        ),
        query(
          '.hero__text, .hero__cta, .hero__trust',
          [
            style({ opacity: 0, transform: 'translateY(26px)' }),
            stagger(
              140,
              animate('0.85s cubic-bezier(0.22, 0.61, 0.36, 1)', style({ opacity: 1, transform: 'none' })),
            ),
          ],
          { optional: true },
        ),
      ]),
    ]),
  ],
})
export class HeroComponent implements AfterViewInit, OnDestroy {
  readonly duration = 4.74;

  readonly chapters: Chapter[] = [
    { t: 0.0, step: 'The Land', label: 'Empty plot of land' },
    { t: 0.79, step: 'Foundation', label: 'Foundation laid' },
    { t: 1.58, step: 'Structure', label: 'Brick and concrete walls' },
    { t: 2.37, step: 'Roofing', label: 'Roof framing' },
    { t: 3.16, step: 'Finishing', label: 'Roofing completed' },
    { t: 3.95, step: 'Handover', label: 'Finished home with landscaping' },
  ];

  readonly active = signal(this.chapters.length - 1);
  readonly atEnd = signal(false);

  private readonly canvas = viewChild.required<ElementRef<HTMLDivElement>>('canvas');
  private readonly film = viewChild.required<ElementRef<HTMLVideoElement>>('film');
  private readonly fills = viewChildren<ElementRef<HTMLSpanElement>>('fill');
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);

  private rafId = 0;
  private reduceMotion = false;
  private mouseX = 0;
  private mouseY = 0;
  private targetX = 0;
  private targetY = 0;
  private cleanups: Array<() => void> = [];

  constructor() {
    this.reduceMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (this.reduceMotion) {
      this.active.set(this.chapters.length - 1);
      this.atEnd.set(true);
    }
  }

  ngAfterViewInit(): void {
    const video = this.film().nativeElement;

    this.zone.runOutsideAngular(() => {
      if (this.reduceMotion) {
        video.pause();
        video.currentTime = this.duration - 0.05;
        return;
      }

      this.playFilm(video);

      // When the film finishes, hold on the handover poster frame.
      const onEnded = (): void => {
        this.zone.run(() => this.atEnd.set(true));
      };
      video.addEventListener('ended', onEnded);
      this.cleanups.push(() => video.removeEventListener('ended', onEnded));

      // If the browser silently blocks autoplay, retry once on the first
      // interaction — without ever prompting the user.
      const retry = (): void => {
        if (video.paused && !video.ended) {
          this.playFilm(video);
        }
      };
      window.addEventListener('pointerdown', retry, { once: true });
      this.cleanups.push(() => window.removeEventListener('pointerdown', retry));

      this.rafId = requestAnimationFrame(this.tick);

      const onVis = (): void => {
        if (document.hidden) {
          video.pause();
        } else if (!video.ended) {
          this.playFilm(video);
        }
      };
      document.addEventListener('visibilitychange', onVis);
      this.cleanups.push(() => document.removeEventListener('visibilitychange', onVis));

      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(
          (entries) => {
            const visible = entries.some((entry) => entry.isIntersecting);
            if (!visible || document.hidden) {
              video.pause();
            } else if (!video.ended) {
              this.playFilm(video);
            }
          },
          { threshold: 0.08 },
        );
        io.observe(this.host.nativeElement);
        this.cleanups.push(() => io.disconnect());
      }
    });
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.rafId);
    this.cleanups.forEach((fn) => fn());
    this.cleanups = [];
  }

  pad(n: number): string {
    return String(n + 1).padStart(2, '0');
  }

  goTo(index: number): void {
    const video = this.film().nativeElement;
    const i = Math.max(0, Math.min(index, this.chapters.length - 1));
    if (this.atEnd()) {
      this.atEnd.set(false);
    }
    video.currentTime = this.chapters[i].t + 0.001;
    if (!this.reduceMotion && video.paused && !video.ended) {
      this.playFilm(video);
    }
  }

  scrollTo(target: string): void {
    const el = document.getElementById(target);
    if (!el) {
      return;
    }
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: this.reduceMotion ? 'auto' : 'smooth' });
  }

  /** Muted autoplay — allowed everywhere; never prompts the user. */
  private playFilm(video: HTMLVideoElement): void {
    video.muted = true;
    video.play().catch(() => undefined);
  }

  private tick = (): void => {
    this.rafId = requestAnimationFrame(this.tick);

    const video = this.film().nativeElement;
    const ct = video.currentTime || 0;

    let chapter = 0;
    for (let i = 0; i < this.chapters.length; i++) {
      if (ct >= this.chapters[i].t) {
        chapter = i;
      }
    }
    if (chapter !== this.active()) {
      this.zone.run(() => this.active.set(chapter));
    }

    const fills = this.fills();
    for (let i = 0; i < fills.length; i++) {
      const start = this.chapters[i].t;
      const end = i + 1 < this.chapters.length ? this.chapters[i + 1].t : this.duration;
      const frac = Math.max(0, Math.min(1, (ct - start) / (end - start)));
      fills[i].nativeElement.style.transform = `scaleX(${frac.toFixed(4)})`;
    }

    this.mouseX += (this.targetX - this.mouseX) * 0.045;
    this.mouseY += (this.targetY - this.mouseY) * 0.045;
    const sy = window.scrollY || 0;
    this.canvas().nativeElement.style.transform = `translate3d(${(this.mouseX * 12).toFixed(2)}px, ${(
      this.mouseY * 9 +
      sy * 0.16
    ).toFixed(2)}px, 0) scale(1.04)`;

    const hostEl = this.host.nativeElement as HTMLElement;
    const limit = hostEl.offsetHeight || 1;
    if (sy <= limit * 1.25) {
      hostEl.style.setProperty('--sy', `${Math.min(sy, limit)}px`);
      hostEl.style.setProperty('--spo', `${Math.min(1, sy / (limit * 0.72))}`);
    }
  };
}
