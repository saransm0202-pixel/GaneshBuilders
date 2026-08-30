import { Component, inject } from '@angular/core';
import { SiteDataService } from '../../services/site-data.service';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-why-choose-us',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './why-choose-us.html',
  styleUrl: './why-choose-us.scss',
})
export class WhyChooseUsComponent {
  private readonly data = inject(SiteDataService);

  readonly advantages = this.data.advantages;

  readonly icons: Record<string, string> = {
    quality:
      'M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 7.7l5.4-.8L12 2z',
    transparent:
      'M12 3a9 9 0 1 0 9 9 M12 7v5l3 3',
    team:
      'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
    delivery:
      'M13 2 3 14h7l-1 8 10-12h-7l1-8z',
    complete:
      'M3 21V7l9-4 9 4v14 M3 11h18 M9 21v-6h6v6',
    customer:
      'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  };

  iconPath(key: string): string {
    return this.icons[key] ?? '';
  }
}
