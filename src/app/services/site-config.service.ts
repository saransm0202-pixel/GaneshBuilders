import { Injectable, computed, inject, signal } from '@angular/core';
import { AppConfigService } from './app-config.service';
import { environment } from '../../environments/environment';

export interface SiteSocial {
  name: string;
  href: string;
}

@Injectable({ providedIn: 'root' })
export class SiteConfigService {
  private readonly appConfigService = inject(AppConfigService);

  readonly loaded = signal(false);

  readonly appName = signal('Ganesh Builders');
  readonly appDescription = signal('Building Dreams · Creating Homes');
  readonly appLogo = signal('');
  readonly contactNumber = signal('');
  readonly contactMail = signal('');
  readonly accountAddress = signal('');
  readonly locationLink = signal('');

  readonly enableWhatsapp = signal(false);
  readonly whatsappLink = signal('');
  readonly enableFacebook = signal(false);
  readonly facebookLink = signal('');
  readonly enableInstagram = signal(false);
  readonly instagramLink = signal('');
  readonly enableYoutube = signal(false);
  readonly youtubeLink = signal('');

  readonly brandParts = computed(() => {
    const name = this.appName().trim() || 'Ganesh Builders';
    const parts = name.split(/\s+/);
    return {
      first: parts[0] ?? 'Ganesh',
      rest: parts.slice(1).join(' ') || 'Builders',
    };
  });

  readonly logoResolved = computed(() => this.resolve(this.appLogo()));

  readonly phoneDigits = computed(() => this.contactNumber().replace(/\D/g, ''));

  readonly phoneHref = computed(() =>
    this.phoneDigits() ? `tel:${this.phoneDigits()}` : '#',
  );

  readonly waHref = computed(() => {
    const raw = (this.whatsappLink() || '').trim();
    if (!raw) {
      return this.phoneDigits() ? `https://wa.me/${this.phoneDigits()}` : '#';
    }
    if (/^https?:\/\//i.test(raw)) return raw;
    if (/^[0-9+()\-\s]+$/.test(raw)) {
      return `https://wa.me/${raw.replace(/\D/g, '')}`;
    }
    return raw;
  });

  readonly whatsappHref = this.waHref;

  readonly email = computed(() => this.contactMail() || 'hello@ganeshhomes.in');

  readonly address = computed(() => this.accountAddress().trim());

  readonly mapHref = computed(() => {
    const custom = (this.locationLink() || '').trim();
    if (custom) {
      return /^https?:\/\//i.test(custom) ? custom : `https://${custom}`;
    }
    const a = this.address();
    if (!a) return '';
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a)}`;
  });

  readonly socials = computed<SiteSocial[]>(() => {
    const list: SiteSocial[] = [];
    if (this.enableInstagram() && this.instagramLink()) {
      list.push({ name: 'Instagram', href: this.instagramLink()! });
    }
    if (this.enableFacebook() && this.facebookLink()) {
      list.push({ name: 'Facebook', href: this.facebookLink()! });
    }
    if (this.enableYoutube() && this.youtubeLink()) {
      list.push({ name: 'YouTube', href: this.youtubeLink()! });
    }
    if (this.enableWhatsapp() && this.waHref() !== '#') {
      list.push({ name: 'WhatsApp', href: this.waHref() });
    }
    const unique = new Map(list.map((s) => [s.name, s]));
    return [...unique.values()];
  });

  load(): void {
    this.appConfigService.getAppConfig(environment.accountId).subscribe({
      next: (c) => {
        this.appName.set(c.appName || 'Ganesh Builders');
        this.appDescription.set(c.appDescription || '');
        this.appLogo.set(c.appLogo || '');
        this.contactNumber.set(c.contactNumber || '');
        this.contactMail.set(c.contactMail || '');
        this.accountAddress.set(c.accountAddress || '');
        this.locationLink.set(c.locationLink || '');
        this.enableWhatsapp.set(!!c.enableWhatsapp);
        this.whatsappLink.set(c.whatsappLink || '');
        this.enableFacebook.set(!!c.enableFacebook);
        this.facebookLink.set(c.facebookLink || '');
        this.enableInstagram.set(!!c.enableInstagram);
        this.instagramLink.set(c.instagramLink || '');
        this.enableYoutube.set(!!c.enableYoutube);
        this.youtubeLink.set(c.youtubeLink || '');
        this.loaded.set(true);
      },
      error: () => {
        this.loaded.set(false);
      },
    });
  }

  private resolve(url: string): string {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    return `${environment.apiOrigin}${url.startsWith('/') ? url : `/${url}`}`;
  }
}