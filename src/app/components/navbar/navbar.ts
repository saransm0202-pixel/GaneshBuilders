import { Component, HostListener, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { SiteDataService } from '../../services/site-data.service';
import { AuthService } from '../../services/auth.service';
import { SiteConfigService } from '../../services/site-config.service';
import { LoginComponent } from '../login/login';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, LoginComponent],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class NavbarComponent {
  private readonly data = inject(SiteDataService);
  private readonly router = inject(Router);
  readonly auth = inject(AuthService);

  readonly links = this.data.navLinks;
  readonly appLogo = inject(SiteConfigService).logoResolved;
  readonly brandParts = inject(SiteConfigService).brandParts;

  readonly scrolled = signal(false);
  readonly menuOpen = signal(false);
  readonly isHome = signal(this.router.url === '/' || this.router.url === '');
  readonly showLogin = signal(false);
  readonly userMenuOpen = signal(false);

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

  @HostListener('document:click')
  onDocClick(): void {
    this.userMenuOpen.set(false);
  }

  scrollTo(target: string): void {
    this.menuOpen.set(false);
    this.userMenuOpen.set(false);
    if (!this.isHome()) {
      this.router.navigate(['/']).then(() => {
        requestAnimationFrame(() => this.scrollToId(target));
      });
      return;
    }
    requestAnimationFrame(() => this.scrollToId(target));
  }

  private scrollToId(target: string): void {
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

  toggleUserMenu(): void {
    this.userMenuOpen.update((v) => !v);
  }

  openLogin(): void {
    this.menuOpen.set(false);
    this.showLogin.set(true);
  }

  closeLogin(): void {
    this.showLogin.set(false);
  }

  logout(): void {
    this.userMenuOpen.set(false);
    this.auth.logout();
  }
}
