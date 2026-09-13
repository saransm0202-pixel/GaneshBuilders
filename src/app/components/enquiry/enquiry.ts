import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SiteDataService } from '../../services/site-data.service';
import { SiteConfigService } from '../../services/site-config.service';
import { ConsultationService } from '../../services/consultation.service';
import { environment } from '../../../environments/environment';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-enquiry',
  standalone: true,
  imports: [ReactiveFormsModule, RevealDirective],
  templateUrl: './enquiry.html',
  styleUrl: './enquiry.scss',
})
export class EnquiryComponent {
  private readonly data = inject(SiteDataService);
  private readonly config = inject(SiteConfigService);
  private readonly consultationService = inject(ConsultationService);

  readonly packages = this.data.packages.map((pkg) => pkg.name);
  readonly phone = this.config.contactNumber;
  readonly phoneHref = this.config.phoneHref;
  readonly whatsappHref = this.config.whatsappHref;
  readonly email = this.config.email;
  readonly address = this.config.address;
  readonly mapHref = this.config.mapHref;

  readonly submitted = signal(false);
  readonly submitting = signal(false);
  readonly submitFailed = signal(false);
  readonly submitMessage = signal('');

  readonly form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    phone: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[0-9+\-\s]{10,15}$/),
    ]),
    email: new FormControl('', [Validators.required, Validators.email]),
    plotLocation: new FormControl('', Validators.required),
    plotArea: new FormControl(''),
    package: new FormControl(''),
    message: new FormControl(''),
  });

  readonly fieldNames: Record<string, string> = {
    name: 'Full name',
    phone: 'Phone number',
    email: 'Email',
    plotLocation: 'Plot location',
    plotArea: 'Plot area',
    package: 'Interested package',
    message: 'Message',
  };

  isInvalid(control: string): boolean {
    const c = this.form.get(control);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  errorFor(control: string): string | null {
    const c = this.form.get(control);
    if (!c || !(c.dirty || c.touched)) {
      return null;
    }
    if (c.hasError('required')) {
      return `${this.fieldNames[control]} is required.`;
    }
    if (c.hasError('email')) {
      return 'Please enter a valid email address.';
    }
    if (c.hasError('minlength')) {
      return `${this.fieldNames[control]} is too short.`;
    }
    if (c.hasError('pattern')) {
      return 'Please enter a valid phone number.';
    }
    return null;
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.submitting()) {
      return;
    }
    const v = this.form.value;
    this.submitting.set(true);
    this.submitFailed.set(false);
    this.submitMessage.set('');
    this.consultationService
      .submit({
        accountId: environment.accountId,
        name: (v.name ?? '').trim(),
        phone: (v.phone ?? '').trim(),
        email: (v.email ?? '').trim(),
        plotLocation: (v.plotLocation ?? '').trim(),
        plotArea: (v.plotArea ?? '').trim(),
        package: (v.package ?? '').trim(),
        message: (v.message ?? '').trim(),
      })
      .subscribe({
        next: (res) => {
          this.submitting.set(false);
          if (res.success) {
            this.submitted.set(true);
          } else {
            this.submitFailed.set(true);
            this.submitMessage.set(res.message || 'Something went wrong. Please try again.');
          }
        },
        error: () => {
          this.submitting.set(false);
          this.submitFailed.set(true);
          this.submitMessage.set('Unable to submit the form right now. Please try again.');
        },
      });
  }

  resetForm(): void {
    this.form.reset({
      name: '',
      phone: '',
      email: '',
      plotLocation: '',
      plotArea: '',
      package: '',
      message: '',
    });
    this.submitting.set(false);
    this.submitFailed.set(false);
    this.submitMessage.set('');
    this.submitted.set(false);
  }
}
