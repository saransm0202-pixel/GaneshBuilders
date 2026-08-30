import { Component, HostListener, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { SiteDataService } from '../../services/site-data.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class NavbarComponent {
  private readonly data = inject(SiteDataService);
  private readonly router = inject(Router);

  readonly links = this.data.navLinks;
  readonly phone = this.data.phone;
  readonly phoneHref = this.data.phoneHref;

  readonly scrolled = signal(false);
  readonly menuOpen = signal(false);
  readonly isHome = signal(this.router.url === '/' || this.router.url === '');

  constructor() {
    this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        this.isHome.set(e.urlAfterRedirects === '/' || e.urlAfterRedirects === '');
      }
    });
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 40);
  }

  scrollTo(target: string): void {
    this.menuOpen.set(false);
    const el = document.getElementById(target);
    if (!el) {
      return;
    }
    const top = el.getBoundingClientRect().top + window.scrollY - 82;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }
}
