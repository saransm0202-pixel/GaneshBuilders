import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteDataService } from '../../services/site-data.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class FooterComponent {
  private readonly data = inject(SiteDataService);

  readonly phone = this.data.phone;
  readonly phoneHref = this.data.phoneHref;
  readonly whatsappHref = this.data.whatsappHref;
  readonly email = this.data.email;
  readonly socials = this.data.socials;

  readonly quickLinks = this.data.navLinks;
  readonly serviceLinks = [
    { label: 'Architecture', target: 'services' },
    { label: 'Construction', target: 'packages' },
    { label: 'Interiors', target: 'services' },
    { label: 'Structural Design', target: 'services' },
  ];

  readonly year = new Date().getFullYear();

  scrollTo(target: string): void {
    const el = document.getElementById(target);
    if (!el) {
      return;
    }
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  socialIcon(name: string): string {
    switch (name) {
      case 'Instagram':
        return 'M16 3H8a5 5 0 0 0-5 5v8a5 5 0 0 0 5 5h8a5 5 0 0 0 5-5V8a5 5 0 0 0-5-5Zm-4 12.5A3.5 3.5 0 1 1 15.5 12 3.5 3.5 0 0 1 12 15.5Zm5.2-7.3a1 1 0 1 1 1-1 1 1 0 0 1-1 1Z';
      case 'Facebook':
        return 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3Z';
      case 'YouTube':
        return 'M22.5 7.5a3 3 0 0 0-2.1-2.1C18.5 5 12 5 12 5s-6.5 0-8.4.4A3 3 0 0 0 1.5 7.5 32 32 0 0 0 1 12a32 32 0 0 0 .5 4.5 3 3 0 0 0 2.1 2.1c1.9.4 8.4.4 8.4.4s6.5 0 8.4-.4a3 3 0 0 0 2.1-2.1A32 32 0 0 0 23 12a32 32 0 0 0-.5-4.5ZM10 15.5v-7l6 3.5Z';
      case 'WhatsApp':
        return 'M17.5 14.4c-.3-.1-1.8-.9-2-1s-.5-.2-.7.1-.8 1-.9 1.2-.3.2-.6.1a7.6 7.6 0 0 1-3.2-2A11.9 11.9 0 0 1 8.6 10.6c-.1-.3 0-.5.1-.6l.5-.5a.9.9 0 0 0 .2-.5c0-.1-.4-1.7-.5-2.3s-.3-.5-.4-.5h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2A5.2 5.2 0 0 0 7.7 12a11.6 11.6 0 0 0 4.5 4.1 5.6 5.6 0 0 0 2.3.7 3 3 0 0 0 2-.9 2.8 2.8 0 0 0 .5-.7 1.3 1.3 0 0 0 0-.8Zm1.9-5.8A10.5 10.5 0 0 0 12 2a10.3 10.3 0 0 0-8.9 15.4L2 22l4.7-1.2A10.3 10.3 0 1 0 19.4 8.6ZM12 20.4a8.3 8.3 0 0 1-4.2-1.2l-.3-.2-2.8.7.7-2.7-.2-.3A8.3 8.3 0 1 1 12 20.4Z';
      default:
        return '';
    }
  }
}
