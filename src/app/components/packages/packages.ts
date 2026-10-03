import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { SiteDataService } from '../../services/site-data.service';
import { PackageService } from '../../services/package.service';
import { RevealDirective } from '../../directives/reveal.directive';
import { ConstructionPackage } from '../../models/site.models';
import { IPackage } from '../../models/package.model';
import { Router } from '@angular/router';

export type PackageCategory = 'residential' | 'commercial';

const RES_ICONS: ConstructionPackage['icon'][] = ['home', 'spark', 'crown', 'search'];
const COM_ICONS: ConstructionPackage['icon'][] = ['building', 'store', 'tower'];

@Component({
  selector: 'app-packages',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './packages.html',
  styleUrl: './packages.scss',
})
export class PackagesComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly data = inject(SiteDataService);
  private readonly packageService = inject(PackageService);
  private readonly router = inject(Router);

  readonly residential = signal<ConstructionPackage[]>([]);
  readonly commercial = signal<ConstructionPackage[]>([]);
  readonly loading = signal(true);

  readonly category = signal<PackageCategory>('residential');

  readonly bgImage = 'assets/images/packages/homepackagebg.jpg';

  private readonly host: HTMLElement;
  private readonly shot = viewChild<ElementRef<HTMLElement>>('shot');
  private frame?: number;

  constructor(elementRef: ElementRef<HTMLElement>) {
    this.host = elementRef.nativeElement;
  }

  ngOnInit(): void {
    this.packageService.getPackages().subscribe({
      next: (rows) => {
        const active = rows.filter((p) => p.isActive);
        const byType = (wanted: string) =>
          active.filter(
            (p) => (p.constructionType ?? '').toLowerCase() === wanted,
          );
        this.residential.set(this.toCards(byType('residential'), 'residential'));
        this.commercial.set(this.toCards(byType('commercial'), 'commercial'));
        this.loading.set(false);
      },
      error: () => {
        this.residential.set(this.data.packages);
        this.commercial.set(this.data.commercialPackages);
        this.loading.set(false);
      },
    });
  }

  private toCards(rows: IPackage[], category: PackageCategory): ConstructionPackage[] {
    const icons = category === 'residential' ? RES_ICONS : COM_ICONS;
    return rows
      .slice()
      .sort((a, b) => a.packageId - b.packageId)
      .map((p, idx): ConstructionPackage => {
        const priced = p.packagePrice != null;
        return {
          id: `p-${p.packageId}`,
          name: p.packageName,
          tagline: p.description ?? '',
          price: priced ? `₹${p.packagePrice!.toLocaleString('en-IN')}` : "Let's discuss",
          priceNote: priced ? '/ Sq.Ft' : 'Your Plan',
          features: p.features.filter((f) => f.isActive).map((f) => f.feature),
          cta: 'Get Estimate',
          highlighted: rows.length > 1 && idx === 1,
          icon: icons[Math.min(idx, icons.length - 1)],
        };
      });
  }

  ngAfterViewInit(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
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
      const el = this.shot()?.nativeElement;
      if (!el) {
        return;
      }
      const rect = this.host.getBoundingClientRect();
      if (rect.bottom < -200 || rect.top > window.innerHeight + 200) {
        return;
      }
      const drift = (rect.top + rect.height / 2 - window.innerHeight / 2) * -0.16;
      el.style.transform = `translate3d(0, ${drift.toFixed(1)}px, 0)`;
    });
  };

  readonly activePackages = computed(() =>
    this.category() === 'residential' ? this.residential() : this.commercial(),
  );

  readonly switchNote = computed(() =>
    this.category() === 'residential'
      ? 'For your dream home — choose a plan that fits your family and budget.'
      : 'For offices, shops, showrooms & clinics — built to serve your business.',
  );

  setCategory(cat: PackageCategory): void {
    this.category.set(cat);
  }

  onCta(pkg: ConstructionPackage): void {
    if (pkg.id != 'custom') {
      this.router.navigate(['/estimate']);
      return;
    }
    this.scrollTo('contact');
  }

  private scrollTo(target: string): void {
    const el = document.getElementById(target);
    if (!el) {
      return;
    }
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}