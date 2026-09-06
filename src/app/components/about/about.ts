import { Component, inject } from '@angular/core';
import { SiteConfigService } from '../../services/site-config.service';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class AboutComponent {
  readonly highlights = [
    'Quality Materials',
    'Experienced Professionals',
    'Transparent Pricing',
    'Timely Completion',
  ];

  readonly phone = inject(SiteConfigService).contactNumber;
  readonly phoneHref = inject(SiteConfigService).phoneHref;

  scrollTo(target: string): void {
    const el = document.getElementById(target);
    if (!el) {
      return;
    }
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}
