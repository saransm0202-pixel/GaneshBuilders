import { Component, inject } from '@angular/core';
import { SiteDataService } from '../../services/site-data.service';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-process',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './process.html',
  styleUrl: './process.scss',
})
export class ProcessComponent {
  private readonly data = inject(SiteDataService);

  readonly steps = this.data.processSteps;
}
