import { Component, inject } from '@angular/core';
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
export class AboutComponent {
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

  scrollTo(target: string): void {
    const el = document.getElementById(target);
    if (!el) {
      return;
    }
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}