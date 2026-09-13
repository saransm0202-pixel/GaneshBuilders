import { Component, Input, inject, signal } from '@angular/core';
import { SiteConfigService } from '../../services/site-config.service';

@Component({
  selector: 'app-preloader',
  standalone: true,
  templateUrl: './preloader.html',
  styleUrl: './preloader.scss',
  host: {
    '[class.preloader--hidden]': 'dismissed',
  },
})
export class PreloaderComponent {
  @Input() dismissed = false;

  readonly siteConfig = inject(SiteConfigService);

  readonly initial = 'GB';
  readonly tagline = 'Building Dreams · Creating Homes';
  readonly pct = signal(0);

  private timer: ReturnType<typeof setInterval> | null = null;

  get progressText(): string {
    return this.pct().toString().padStart(3, '0');
  }

  ngOnInit(): void {
    let v = 0;
    this.timer = setInterval(() => {
      v = Math.min(100, v + Math.floor(Math.random() * 6) + 2);
      this.pct.set(v);
      if (v >= 100) {
        clearInterval(this.timer!);
        this.timer = null;
      }
    }, 110);
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}