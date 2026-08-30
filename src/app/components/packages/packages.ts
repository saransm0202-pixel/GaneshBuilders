import { Component, inject } from '@angular/core';
import { SiteDataService } from '../../services/site-data.service';
import { RevealDirective } from '../../directives/reveal.directive';
import { ConstructionPackage } from '../../models/site.models';

@Component({
  selector: 'app-packages',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './packages.html',
  styleUrl: './packages.scss',
})
export class PackagesComponent {
  private readonly data = inject(SiteDataService);

  readonly packages = this.data.packages;

  scrollTo(target: string): void {
    const el = document.getElementById(target);
    if (!el) {
      return;
    }
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  onCta(pkg: ConstructionPackage): void {
    this.scrollTo('contact');
  }
}
