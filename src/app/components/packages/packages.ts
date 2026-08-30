import { Component, computed, inject, signal } from '@angular/core';
import { SiteDataService } from '../../services/site-data.service';
import { RevealDirective } from '../../directives/reveal.directive';
import { ConstructionPackage } from '../../models/site.models';

export type PackageCategory = 'residential' | 'commercial';

@Component({
  selector: 'app-packages',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './packages.html',
  styleUrl: './packages.scss',
})
export class PackagesComponent {
  private readonly data = inject(SiteDataService);

  readonly residential = this.data.packages;
  readonly commercial = this.data.commercialPackages;

  readonly category = signal<PackageCategory>('residential');

  readonly activePackages = computed(() =>
    this.category() === 'residential' ? this.residential : this.commercial,
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