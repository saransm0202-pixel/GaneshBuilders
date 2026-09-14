import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  signal,
  viewChildren,
} from '@angular/core';
import { SiteConfigService } from '../../services/site-config.service';
import { SiteDataService } from '../../services/site-data.service';
import { RevealDirective } from '../../directives/reveal.directive';
import { BlueprintRevealComponent } from '../blueprint-reveal/blueprint-reveal';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RevealDirective, BlueprintRevealComponent],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class AboutComponent implements AfterViewInit, OnDestroy {
  private readonly data = inject(SiteDataService);

  readonly phone = inject(SiteConfigService).contactNumber;
  readonly phoneHref = inject(SiteConfigService).phoneHref;

  readonly aboutImage = 'assets/images/about/aboutus.png';
  readonly stackImage = 'assets/images/projects/project1.png';

  readonly principles = [
    'End-to-end delivery — from planning and approvals to construction and handover.',
    'Dedicated site supervision with transparent milestone-based billing at every stage.',
    'Quality materials and engineering precision that stand the test of time.',
  ];

  readonly miniStats = this.data.stats.slice(0, 3);

  readonly nodeFractions = [0.24, 0.44, 0.64, 0.84];

  readonly activeCount = signal(0);

  private readonly host: HTMLElement;
  private readonly rails = viewChildren<ElementRef<HTMLElement>>('rail');

  private cfg: ScrollRail[] = [];
  private frame?: number;

  constructor(elementRef: ElementRef<HTMLElement>) {
    this.host = elementRef.nativeElement;
  }

  ngAfterViewInit(): void {
    this.cfg = [];
    for (const ref of this.rails()) {
      const rail = ref.nativeElement;
      const svg = rail.querySelector('svg') as SVGSVGElement | null;
      const path = svg?.querySelector('.about__path') as SVGPathElement | null;
      if (!svg || !path) {
        continue;
      }
      const len = path.getTotalLength();
      path.style.strokeDasharray = `${len}`;
      this.cfg.push({
        svg,
        path,
        len,
        dot: rail.querySelector('.about__dot') as HTMLElement | null,
        trailA: rail.querySelector('.about__trail--a') as HTMLElement | null,
        trailB: rail.querySelector('.about__trail--b') as HTMLElement | null,
        nodes: Array.from(rail.querySelectorAll('.about__node') as NodeListOf<HTMLElement>),
      });
    }

    if (!this.cfg.length) {
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      for (const c of this.cfg) {
        c.path.style.strokeDashoffset = '0';
      }
      this.activeCount.set(this.nodeFractions.length);
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
    if (this.frame !== undefined) {
      return;
    }
    this.frame = requestAnimationFrame(() => {
      this.frame = undefined;

      const vh = window.innerHeight;
      const rect = this.host.getBoundingClientRect();
      let p = (vh - rect.top) / (rect.height + vh);
      p = Math.min(1, Math.max(0, p));
      const drawn = p;

      let on = 0;
      for (const frac of this.nodeFractions) {
        if (frac <= drawn) {
          on++;
        }
      }
      this.activeCount.set(on);

      for (const c of this.cfg) {
        c.path.style.strokeDashoffset = `${c.len * (1 - p)}`;

        const vb = c.svg.viewBox.baseVal;
        const place = (el: HTMLElement | null, along: number) => {
          if (!el) {
            return;
          }
          const span = Math.min(Math.max(along, 0), c.len);
          const pt = c.path.getPointAtLength(span);
          const x = ((pt.x / vb.width) * c.svg.clientWidth).toFixed(1);
          const y = ((pt.y / vb.height) * c.svg.clientHeight).toFixed(1);
          el.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
        };

        const drawnLen = c.len * p;
        place(c.dot, drawnLen);
        place(c.trailA, drawnLen - c.len * 0.015);
        place(c.trailB, drawnLen - c.len * 0.045);
        c.nodes.forEach((node, i) => {
          place(node, c.len * this.nodeFractions[i]);
        });
      }
    });
  };

  scrollTo(target: string): void {
    const el = document.getElementById(target);
    if (!el) {
      return;
    }
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

interface ScrollRail {
  svg: SVGSVGElement;
  path: SVGPathElement;
  len: number;
  dot: HTMLElement | null;
  trailA: HTMLElement | null;
  trailB: HTMLElement | null;
  nodes: HTMLElement[];
}