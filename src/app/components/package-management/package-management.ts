import { Component, OnInit, inject, signal, computed, viewChild, ElementRef } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { PackageService } from '../../services/package.service';
import { IPackage, IConstructionType, IPackageSpecType } from '../../models/package.model';
import { environment } from '../../../environments/environment';

interface FeatureDraft {
  text: string;
}

interface SpecDraft {
  type: IPackageSpecType | null;
  label: string;
  value: string;
}

@Component({
  selector: 'app-package-management',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './package-management.html',
  styleUrl: './package-management.scss',
})
export class PackageManagementComponent implements OnInit {
  private readonly packageService = inject(PackageService);
  private readonly title = inject(Title);

  readonly packages = signal<IPackage[]>([]);
  readonly types = signal<IConstructionType[]>([]);
  readonly specTypes = signal<IPackageSpecType[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly panelOpen = signal(false);
  readonly editingPackage = signal<IPackage | null>(null);
  readonly searchQuery = signal('');
  readonly features = signal<FeatureDraft[]>([{ text: '' }]);
  readonly specs = signal<SpecDraft[]>([]);
  readonly toastMessage = signal('');
  readonly toastType = signal<'success' | 'error'>('success');
  readonly toastVisible = signal(false);

  readonly form = new FormGroup({
    packageName: new FormControl('', { nonNullable: true, validators: Validators.required }),
    description: new FormControl(''),
    packagePrice: new FormControl<number | null>(null),
    constructionTypeId: new FormControl<number | null>(null),
    isActive: new FormControl(true),
  });

  readonly nameField = viewChild<ElementRef<HTMLInputElement>>('nameField');

  readonly previewFeatureList = computed(() =>
    this.features()
      .map((f) => f.text.trim())
      .filter((t) => t.length > 0),
  );

  readonly draftCount = computed(() => this.previewFeatureList().length);

  readonly specDraftCount = computed(
    () => this.specs().filter((s) => s.label.trim().length > 0 && s.value.trim().length > 0).length,
  );

  readonly filteredPackages = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const list = this.packages();
    if (!q) return list;
    return list.filter(
      (p) =>
        p.packageName?.toLowerCase().includes(q) ||
        p.constructionType?.toLowerCase().includes(q) ||
        (p.description ?? '').toLowerCase().includes(q) ||
        p.features.some((f) => f.feature?.toLowerCase().includes(q)) ||
        p.specs.some(
          (s) =>
            s.specLabel?.toLowerCase().includes(q) ||
            s.specValue?.toLowerCase().includes(q),
        ),
    );
  });

  constructor() {
    this.title.setTitle('Package Management | Ganesh Builders');
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.loadPackages();
    this.loadTypes();
    this.loadSpecTypes();
  }

  /* ── data ── */

  loadPackages(): void {
    this.loading.set(true);
    this.packageService.getPackages().subscribe({
      next: (data) => {
        this.packages.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast('Failed to load packages — is the API running?', 'error');
      },
    });
  }

  loadTypes(): void {
    this.packageService.getConstructionTypes().subscribe({
      next: (data) => this.types.set(data),
    });
  }

  loadSpecTypes(): void {
    this.packageService.getPackageSpecTypes().subscribe({
      next: (data) => this.specTypes.set(data),
    });
  }

  /* ── panel ── */

  openAdd(): void {
    this.editingPackage.set(null);
    this.form.reset({
      packageName: '',
      description: '',
      packagePrice: null,
      constructionTypeId: null,
      isActive: true,
    });
    this.features.set([{ text: '' }]);
    this.specs.set([{ type: null, label: '', value: '' }]);
    this.panelOpen.set(true);
    setTimeout(() => this.nameField()?.nativeElement.focus());
  }

  openEdit(pkg: IPackage): void {
    this.editingPackage.set(pkg);
    this.form.patchValue({
      packageName: pkg.packageName,
      description: pkg.description ?? '',
      packagePrice: pkg.packagePrice ?? null,
      constructionTypeId: pkg.constructionTypeId ?? null,
      isActive: pkg.isActive,
    });
    this.features.set(
      pkg.features
        .filter((f) => f.isActive)
        .map((f) => ({ text: f.feature ?? '' })),
    );
    if (this.features().length === 0) {
      this.features.set([{ text: '' }]);
    }
    this.specs.set(
      pkg.specs
        .filter((s) => s.isActive)
        .map((s) => ({
          type: this.specTypes().find((t) => t.packageSpecTypeId === s.specTypeId) ?? null,
          label: s.specLabel ?? '',
          value: s.specValue ?? '',
        })),
    );
    this.panelOpen.set(true);
    setTimeout(() => this.nameField()?.nativeElement.focus());
  }

  closePanel(): void {
    this.panelOpen.set(false);
  }

  addFeature(focusNew = true): void {
    this.features.update((list) => [...list, { text: '' }]);
    if (focusNew) {
      setTimeout(() => this.focusFeature(this.features().length - 1));
    }
  }

  onFeatureKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addFeature();
    }
  }

  private focusFeature(index: number): void {
    if (index < 0) return;
    document.getElementById(`pf-feat-${index}`)?.focus();
  }

  removeFeature(index: number): void {
    this.features.update((list) => list.filter((_, i) => i !== index));
  }

  addSpec(focusNew = true): void {
    this.specs.update((list) => [...list, { type: null, label: '', value: '' }]);
    if (focusNew) {
      setTimeout(() => this.focusSpec(this.specs().length - 1));
    }
  }

  onSpecTypeChange(index: number, type: IPackageSpecType | null): void {
    this.specs.update((list) =>
      list.map((d, i) => (i === index ? { ...d, type } : d)),
    );
  }

  onSpecKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addSpec();
    }
  }

  private focusSpec(index: number): void {
    if (index < 0) return;
    document.getElementById(`pk-spec-${index}`)?.focus();
  }

  removeSpec(index: number): void {
    this.specs.update((list) => list.filter((_, i) => i !== index));
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast('Package name is required', 'error');
      return;
    }
    this.saving.set(true);
    const v = this.form.value;
    const payload: IPackage = {
      packageId: this.editingPackage()?.packageId ?? 0,
      packageName: (v.packageName ?? '').trim(),
      description: (v.description ?? '').trim() || null,
      packagePrice: v.packagePrice ?? null,
      accountId: environment.accountId,
      constructionTypeId: v.constructionTypeId ?? null,
      constructionType: null,
      isActive: v.isActive ?? true,
      createdBy: this.editingPackage()?.createdBy ?? 1,
      createdDate: this.editingPackage()?.createdDate ?? null,
      modifiedBy: null,
      modifiedDate: null,
      features: this.features()
        .map((f) => ({ text: f.text.trim() }))
        .filter((f) => f.text.length > 0)
        .map((f) => ({
          packageFeatureId: 0,
          packageId: 0,
          feature: f.text,
          isActive: true,
        })),
      specs: this.specs()
        .map((s) => ({ type: s.type, label: s.label.trim(), value: s.value.trim() }))
        .filter((s) => s.label.length > 0 && s.value.length > 0)
        .map((s) => ({
          packageSpecId: 0,
          packageId: 0,
          specLabel: s.label,
          specValue: s.value,
          specTypeId: s.type?.packageSpecTypeId ?? null,
          isActive: true,
        })),
    };
    this.packageService.savePackage(payload).subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.statusCode === 1) {
          this.toast(res.message || 'Saved successfully', 'success');
          this.panelOpen.set(false);
          this.loadPackages();
        } else {
          this.toast(res.message || 'Save failed', 'error');
        }
      },
      error: () => {
        this.saving.set(false);
        this.toast('Network error — is the API running?', 'error');
      },
    });
  }

  onDelete(pkg: IPackage): void {
    const ok = window.confirm(
      `Delete package "${pkg.packageName}"? Its features will also be removed.`,
    );
    if (!ok) return;
    this.packageService.deletePackage(pkg.packageId).subscribe({
      next: (res) => {
        if (res.statusCode === 1) {
          this.toast(res.message || 'Package deleted', 'success');
          this.loadPackages();
        } else {
          this.toast(res.message || 'Delete failed', 'error');
        }
      },
      error: () => {
        this.toast('Network error — is the API running?', 'error');
      },
    });
  }

  /* ── helpers ── */

  priceLabel(pkg: IPackage): string {
    return pkg.packagePrice != null
      ? `₹${pkg.packagePrice.toLocaleString('en-IN')} / sqft`
      : '—';
  }

  typeName(id: number | null | undefined): string {
    if (id == null) return '—';
    return this.types().find((t) => t.constructionTypeId === id)?.constructionType ?? '—';
  }

  isInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  /* ── live preview helpers (re-read on each change detection) ── */

  pvName(): string {
    return (this.form.controls.packageName.value ?? '').trim() || 'Package name';
  }

  pvTagline(): string {
    return (this.form.controls.description.value ?? '').trim() || 'Your short tagline will appear here';
  }

  pvPrice(): string {
    const v = this.form.controls.packagePrice.value;
    return v != null ? `₹${v.toLocaleString('en-IN')}` : '₹0';
  }

  pvPriceNote(): string {
    return this.form.controls.packagePrice.value != null ? '/ sqft' : '';
  }

  pvType(): string {
    return this.typeName(this.form.controls.constructionTypeId.value);
  }

  pvActive(): boolean {
    return this.form.controls.isActive.value ?? true;
  }

  private toast(msg: string, type: 'success' | 'error'): void {
    this.toastMessage.set(msg);
    this.toastType.set(type);
    this.toastVisible.set(true);
    setTimeout(() => this.toastVisible.set(false), 3500);
  }
}