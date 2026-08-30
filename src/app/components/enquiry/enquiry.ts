import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SiteDataService } from '../../services/site-data.service';
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

  readonly packages = this.data.packages.map((pkg) => pkg.name);
  readonly phone = this.data.phone;
  readonly whatsappHref = this.data.whatsappHref;
  readonly email = this.data.email;

  readonly submitted = signal(false);

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
    if (this.form.invalid) {
      return;
    }
    this.submitted.set(true);
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
    this.submitted.set(false);
  }
}
