import { Component, OnInit, effect, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar';
import { FooterComponent } from './components/footer/footer';
import { NotificationComponent } from './components/notification/notification';
import { PreloaderComponent } from './components/preloader/preloader';
import { SiteConfigService } from './services/site-config.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, NotificationComponent, PreloaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private readonly siteConfig = inject(SiteConfigService);

  readonly preloaderHidden = signal(false);

  private readonly startedAt = Date.now();
  private revealed = false;

  constructor() {
    effect(() => {
      this.siteConfig.loaded();
      this.reveal();
    });

    setTimeout(() => this.reveal(), 7000);
  }

  ngOnInit(): void {
    this.siteConfig.load();
  }

  private reveal(): void {
    if (this.revealed) {
      return;
    }
    const elapsed = Date.now() - this.startedAt;
    const remaining = 1600 - elapsed;
    if (remaining > 0) {
      setTimeout(() => this.reveal(), remaining);
      return;
    }
    this.revealed = true;
    this.preloaderHidden.set(true);
  }
}