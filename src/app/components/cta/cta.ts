import { Component, inject } from '@angular/core';
import { SiteConfigService } from '../../services/site-config.service';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-cta',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './cta.html',
  styleUrl: './cta.scss',
})
export class CtaComponent {
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
