import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  inject,
  signal,
  viewChildren,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { IProject } from '../../models/project.model';
import { ProjectCardComponent } from '../project-card/project-card';
import { ProjectPreviewComponent } from '../project-preview/project-preview';

@Component({
  selector: 'app-home-project',
  standalone: true,
  imports: [RouterLink, ProjectCardComponent, ProjectPreviewComponent],
  templateUrl: './home-project.html',
  styleUrl: './home-project.scss',
})
export class HomeProjectComponent implements AfterViewInit, OnDestroy {
  private readonly projectService = inject(ProjectService);

  readonly projects = signal<IProject[]>([]);
  readonly loading = signal(true);
  readonly previewProject = signal<IProject | null>(null);

  readonly skeletons = Array.from({ length: 3 });

  private readonly host = inject(ElementRef).nativeElement as HTMLElement;
  private readonly rails = viewChildren<ElementRef<HTMLElement>>('rail');

  private cfg: ScrollRail[] = [];
  private frame?: number;
  private seen = false;

  constructor() {
    this.projectService.getHomeProjects().subscribe({
      next: (res) => {
        this.projects.set(res);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  ngAfterViewInit(): void {
    for (const ref of this.rails()) {
      const rail = ref.nativeElement;
      const svg = rail.querySelector('svg') as SVGSVGElement;
      const path = rail.querySelector('.hp__path') as SVGPathElement;
      if (!svg || !path) continue;
      const len = path.getTotalLength();
      path.style.strokeDasharray = `${len}`;
      this.cfg.push({
        svg,
        path,
        len,
        dot: rail.querySelector('.hp__dot') as HTMLElement | null,
        trailA: rail.querySelector('.hp__trail--a') as HTMLElement | null,
        trailB: rail.querySelector('.hp__trail--b') as HTMLElement | null,
        isTop: rail.classList.contains('hp__curve--tl'),
      });
    }

    if (!this.cfg.length) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      for (const c of this.cfg) c.path.style.strokeDashoffset = '0';
      this.seen = true;
      return;
    }

    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || this.seen) return;
        this.seen = true;
        obs.disconnect();
        this.onScroll();
      },
      { threshold: 0.1 },
    );
    obs.observe(this.host);
    window.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('resize', this.onScroll);
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onScroll);
    if (this.frame !== undefined) cancelAnimationFrame(this.frame);
  }

  private readonly onScroll = (): void => {
    if (this.frame !== undefined) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = undefined;
      const vh = window.innerHeight;
      const rect = this.host.getBoundingClientRect();

      for (const c of this.cfg) {
        const edge = c.isTop ? rect.top : rect.bottom;
        const end = c.isTop ? vh * 0.35 : vh * 0.2;
        let p = (vh - edge) / (vh - end);
        p = Math.min(1, Math.max(0, p));

        c.path.style.strokeDashoffset = `${c.len * (1 - p)}`;

        const vb = c.svg.viewBox.baseVal;
        const place = (el: HTMLElement | null, t: number) => {
          if (!el) return;
          const pt = c.path.getPointAtLength(Math.min(Math.max(t, 0), c.len));
          const x = (pt.x / vb.width) * c.svg.clientWidth;
          const y = (pt.y / vb.height) * c.svg.clientHeight;
          el.style.transform = `translate(calc(-50% + ${x.toFixed(1)}px), calc(-50% + ${y.toFixed(1)}px))`;
        };

        const d = c.len * p;
        place(c.dot, d);
        place(c.trailA, d - c.len * 0.03);
        place(c.trailB, d - c.len * 0.08);
      }
    });
  };

  closePreview(): void {
    this.previewProject.set(null);
  }
}

interface ScrollRail {
  svg: SVGSVGElement;
  path: SVGPathElement;
  len: number;
  dot: HTMLElement | null;
  trailA: HTMLElement | null;
  trailB: HTMLElement | null;
  isTop: boolean;
}
