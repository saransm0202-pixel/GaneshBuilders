import { Component, inject } from '@angular/core';
import { SiteDataService } from '../../services/site-data.service';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './services.html',
  styleUrl: './services.scss',
})
export class ServicesComponent {
  private readonly data = inject(SiteDataService);

  readonly services = this.data.services;

  readonly icons: Record<string, string> = {
    design:
      'M12 19l7-7 3 3-7 7-3-3z M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z M2 2l7.586 7.586 M13 18l1.5 5.5L20 17',
    structure:
      'M2 20h20 M4 20V8l8-6 8 6v12 M9 20v-6h6v6 M12 8v6',
    construction:
      'm3 21 18-18 M5 21V7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14 M19 21V5 M5 21h14',
    interior:
      'M3 21V7l9-4 9 4v14 M3 11h18 M9 21v-6h6v6',
    wiring:
      'M2 12h4l3-8 6 16 3-8h4 M12 12v2',
    management:
      'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  };

  iconPath(key: string): string {
    return this.icons[key] ?? '';
  }
}
