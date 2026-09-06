import { Component, OnInit, AfterViewInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { AppConfigService } from '../../services/app-config.service';
import { NotificationService } from '../../services/notification.service';
import { IAppConfig } from '../../models/app-config.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './app-config.html',
  styleUrl: './app-config.scss',
})
export class AppConfigComponent implements OnInit, AfterViewInit {
  private readonly configService = inject(AppConfigService);
  private readonly notify = inject(NotificationService);
  private readonly titleService = inject(Title);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly uploading = signal(false);
  readonly loadedConfig = signal<IAppConfig | null>(null);
  readonly logoSrc = signal('');

  readonly form = new FormGroup({
    appName: new FormControl('', { nonNullable: true, validators: Validators.required }),
    appDescription: new FormControl(''),
    contactNumber: new FormControl(''),
    contactMail: new FormControl(''),
    enableFacebook: new FormControl(false),
    facebookLink: new FormControl(''),
    enableWhatsapp: new FormControl(false),
    whatsappLink: new FormControl(''),
    enableInstagram: new FormControl(false),
    instagramLink: new FormControl(''),
    enableYoutube: new FormControl(false),
    youtubeLink: new FormControl(''),
  });

  ngOnInit(): void {
    this.titleService.setTitle('App Configuration · Ganesh Builders');
    this.load();
  }

  ngAfterViewInit(): void {
    window.scrollTo(0, 0);
  }

  load(): void {
    this.loading.set(true);
    this.configService.getAppConfig(environment.accountId).subscribe({
      next: (config) => {
        this.loadedConfig.set(config);
        if (config.appLogo) {
          this.logoSrc.set(this.resolveImage(config.appLogo));
        }
        this.form.patchValue({
          appName: config.appName ?? '',
          appDescription: config.appDescription ?? '',
          contactNumber: config.contactNumber ?? '',
          contactMail: config.contactMail ?? '',
          enableFacebook: config.enableFacebook ?? false,
          facebookLink: config.facebookLink ?? '',
          enableWhatsapp: config.enableWhatsapp ?? false,
          whatsappLink: config.whatsappLink ?? '',
          enableInstagram: config.enableInstagram ?? false,
          instagramLink: config.instagramLink ?? '',
          enableYoutube: config.enableYoutube ?? false,
          youtubeLink: config.youtubeLink ?? '',
        });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notify.show('Failed to load app configuration', 'error');
      },
    });
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.notify.show('Please choose an image file', 'error');
      return;
    }

    const preview = URL.createObjectURL(file);
    this.logoSrc.set(preview);

    this.uploading.set(true);
    this.configService.uploadAppLogo(environment.accountId, file).subscribe({
      next: (res) => {
        this.uploading.set(false);
        if (res.statusCode === 1 && res.imageUrl) {
          const url = this.resolveImage(res.imageUrl);
          this.logoSrc.set(url);
          this.notify.show('App logo uploaded successfully', 'success');
        } else {
          this.notify.show('Logo upload failed — please try again', 'error');
        }
      },
      error: () => {
        this.uploading.set(false);
        this.notify.show('Logo upload failed — is the API running?', 'error');
      },
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notify.show('App Name is required', 'error');
      return;
    }
    this.saving.set(true);
    const v = this.form.value;
    const payload: IAppConfig = {
      appConfigId: this.loadedConfig()?.appConfigId ?? 0,
      accountId: environment.accountId,
      appName: (v.appName ?? '').trim(),
      appDescription: v.appDescription ?? '',
      appLogo: this.logoSrc() || null,
      contactNumber: v.contactNumber ?? '',
      contactMail: v.contactMail ?? '',
      enableFacebook: v.enableFacebook ?? false,
      facebookLink: v.facebookLink ?? '',
      enableWhatsapp: v.enableWhatsapp ?? false,
      whatsappLink: v.whatsappLink ?? '',
      enableInstagram: v.enableInstagram ?? false,
      instagramLink: v.instagramLink ?? '',
      enableYoutube: v.enableYoutube ?? false,
      youtubeLink: v.youtubeLink ?? '',
    };
    this.configService.saveAppConfig(payload).subscribe({
      next: (res) => {
        this.saving.set(false);
        this.loadedConfig.set(res);
        if (res.appLogo) {
          this.logoSrc.set(this.resolveImage(res.appLogo));
        }
        this.notify.show('App configuration saved successfully', 'success');
      },
      error: () => {
        this.saving.set(false);
        this.notify.show('Failed to save — please try again', 'error');
      },
    });
  }

  isInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  private resolveImage(url: string): string {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    return `${environment.apiOrigin}${url.startsWith('/') ? url : `/${url}`}`;
  }
}