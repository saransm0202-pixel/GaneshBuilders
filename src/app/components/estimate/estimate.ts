import { Title } from '@angular/platform-browser';
import {
  Component,
  HostListener,
  NgZone,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SiteConfigService } from '../../services/site-config.service';
import { NotificationService } from '../../services/notification.service';
import { EstimateReportService } from '../../services/estimate-report.service';
import type { EstimatePdfData } from './estimate.pdf';
import {
  ESTIMATE_PACKAGES,
  EXTRA_ITEMS,
  FLOOR_CONFIGS,
  PACKAGE_SPECS,
  PHASE_SPLITS,
  EstimatePackage,
  PhaseSplit,
  SpecRow,
} from '../../models/estimate.model';
import { PackageService } from '../../services/package.service';
import { IPackage, IPackageSpecType } from '../../models/package.model';

type PkgCategory = 'residential' | 'commercial';

interface SpecSection {
  heading: string;
  items: SpecRow[];
}

interface PackageDraft {
  id: string;
  name: string;
  rate: number;
  tier: string;
  icon: string;
  category: PkgCategory;
  tagline?: string;
  highlighted?: boolean;
  features: string[];
  specSections: SpecSection[];
}

const RES_TIERS = ['Smart Budget', 'Most Chosen', 'Premium Build', 'Bespoke Fit'];
const COM_TIERS = ['Smart Value', 'Best Value', 'Flagship Build', 'Bespoke Fit'];
const RES_ICONS = ['🏠', '✨', '👑', '🎨'];
const COM_ICONS = ['🏢', '🏬', '🏛️', '🏗️'];

@Component({
  selector: 'app-estimate',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './estimate.html',
  styleUrl: './estimate.scss',
})
export class EstimateComponent implements OnInit {
  private readonly title = inject(Title);
  private readonly zone = inject(NgZone);
  private readonly siteConfig = inject(SiteConfigService);
  private readonly reportService = inject(EstimateReportService);
  private readonly notifications = inject(NotificationService);
  private readonly packageService = inject(PackageService);

  readonly extrasList = EXTRA_ITEMS;
  readonly phases = PHASE_SPLITS;
  readonly floorOptions = FLOOR_CONFIGS;

  readonly category = signal<PkgCategory>('residential');

  private readonly dbPackages = signal<IPackage[]>([]);
  private readonly specTypes = signal<IPackageSpecType[]>([]);
  readonly loaded = signal(false);
  readonly loadError = signal(false);

  private staticDrafts(list: EstimatePackage[]): PackageDraft[] {
    return list.map((p) => {
      const ps = PACKAGE_SPECS[p.id];
      return {
        id: p.id,
        name: p.name,
        rate: p.rate,
        tier: p.tier,
        icon: p.icon,
        category: p.category ?? 'residential',
        tagline: p.tagline,
        highlighted: p.highlighted,
        features: ps.includes,
        specSections: [
          { heading: 'Structure', items: ps.structure },
          { heading: 'Finishes', items: ps.finishes },
          { heading: 'Fittings', items: ps.fittings },
        ],
      };
    });
  }

  private dbDrafts(category: PkgCategory): PackageDraft[] {
    const icons = category === 'residential' ? RES_ICONS : COM_ICONS;
    const tiers = category === 'residential' ? RES_TIERS : COM_TIERS;
    const wanted = category === 'residential' ? 'residential' : 'commercial';
    const rows = this.dbPackages()
      .filter((p) => p.isActive && (p.constructionType ?? '').toLowerCase() === wanted)
      .slice()
      .sort((a, b) => a.packageId - b.packageId);
    return rows.map((p, idx): PackageDraft => {
      const groups = new Map<number, SpecSection>();
      for (const s of p.specs.filter((x) => x.isActive && x.specLabel && x.specValue)) {
        const key = s.specTypeId ?? 0;
        if (!groups.has(key)) {
          const type = this.specTypes().find(
            (t) => t.packageSpecTypeId === s.specTypeId,
          );
          groups.set(key, { heading: type?.packageSpecType ?? '', items: [] });
        }
        groups.get(key)!.items.push({
          label: s.specLabel.trim(),
          value: s.specValue.trim(),
        });
      }
      return {
        id: `p-${p.packageId}`,
        name: p.packageName,
        rate: p.packagePrice ?? 0,
        tier: tiers[Math.min(idx, tiers.length - 1)],
        icon: icons[Math.min(idx, icons.length - 1)],
        category,
        tagline: p.description ?? '',
        highlighted: rows.length > 1 && idx === 1,
        features: p.features.filter((f) => f.isActive).map((f) => f.feature),
        specSections: [...groups.values()],
      };
    });
  }

  readonly residentialPackages = computed<PackageDraft[]>(() =>
    this.loadError()
      ? this.staticDrafts(ESTIMATE_PACKAGES.filter((p) => (p.category ?? 'residential') === 'residential'))
      : this.dbDrafts('residential'),
  );
  readonly commercialPackages = computed<PackageDraft[]>(() =>
    this.loadError()
      ? this.staticDrafts(ESTIMATE_PACKAGES.filter((p) => p.category === 'commercial'))
      : this.dbDrafts('commercial'),
  );
  readonly activePackages = computed(() =>
    this.category() === 'residential' ? this.residentialPackages() : this.commercialPackages(),
  );

  readonly switchNote = computed(() =>
    this.category() === 'residential'
      ? 'For your dream home — houses, villas, duplexes & row houses.'
      : 'For offices, shops, showrooms, clinics & godowns — built for business.',
  );

  readonly step = signal(1);
  readonly errorText = signal('');

  readonly plotArea = signal<number | null>(null);
  readonly builtUpArea = signal<number | null>(null);
  readonly parkingArea = signal<number | null>(null);
  readonly floorId = signal('G');
  readonly packageId = signal<string | null>(null);
  readonly specTab = signal(0);
  readonly extrasState = signal<Record<string, number | string | true>>({});

  readonly displayedTotal = signal(0);
  readonly reportBusy = signal(false);
  readonly showContactModal = signal(false);
  readonly reportAction = signal<'download' | 'whatsapp'>('download');
  readonly contactName = signal('');
  readonly contactPhone = signal('');
  readonly contactError = signal('');
  readonly reportShield = signal(false);

  /* Animated (count-up) displays for step 1 */
  readonly plotDisp = signal(0);
  readonly builtDisp = signal(0);
  readonly parkDisp = signal(0);

  private readonly dispTargets = { plot: 0, built: 0, park: 0 };
  private dispRafId = 0;

  private rafId = 0;

  readonly selectedFloor = computed(
    () => this.floorOptions.find((f) => f.id === this.floorId()) ?? this.floorOptions[0],
  );

  readonly selectedPackage = computed(
    () => this.activePackages().find((p) => p.id === this.packageId()) ?? null,
  );

  readonly progressPct = computed(() =>
    this.step() === 5 ? 100 : ((this.step() - 1) / 4) * 100,
  );

  readonly stepLabel = computed(
    () =>
      [
        'Step 1 of 4 — Plot & Built-up Area',
        'Step 2 of 4 — Number of Floors',
        'Step 3 of 4 — Construction Package',
        'Step 4 of 4 — Extra Requirements',
        'Your Estimate Is Ready',
      ][this.step() - 1],
  );

  readonly totalBuiltUp = computed(
    () => (this.builtUpArea() ?? 0) * this.selectedFloor().count + (this.parkingArea() ?? 0),
  );

  readonly parkingCars = computed(() => Math.floor((this.parkingArea() ?? 0) / 200));
  readonly parkingCost = computed(() => (this.parkingArea() ?? 0) * 1800);

  readonly baseCost = computed(() => {
    const pkg = this.selectedPackage();
    return pkg ? this.totalBuiltUp() * pkg.rate : 0;
  });

  readonly extrasCost = computed(() => {
    const state = this.extrasState();
    let total = 0;
    for (const ex of this.extrasList) {
      const v = state[ex.id];
      if (v === undefined) continue;
      total += ex.fixed ? ex.rate : (Number(v) || 0) * ex.rate;
    }
    return total;
  });

  readonly grandTotal = computed(() => this.baseCost() + this.extrasCost());

  readonly durationMonths = computed(() => this.selectedFloor().months);

  readonly emiMonthly = computed(() => this.emi(this.grandTotal()));

  readonly monthlyOutflow = computed(() => this.grandTotal() / Math.max(this.durationMonths(), 1));

  readonly chosenExtras = computed(() => {
    const state = this.extrasState();
    return this.extrasList.filter((ex) => state[ex.id] !== undefined);
  });

  readonly donutGradient = computed(() => {
    let acc = 0;
    const stops = this.phases.map((ph) => {
      const from = acc;
      acc += ph.pct;
      return `${ph.color} ${from}% ${acc}%`;
    });
    return `conic-gradient(${stops.join(', ')})`;
  });

  readonly whatsappHref = computed(() => {
    const pkg = this.selectedPackage();
    const msg =
      `Hi Ganesh Builders, I used your free estimator and got an estimate of ` +
      `${this.fmt(this.grandTotal())}` +
      (pkg ? ` for the ${pkg.name} package` : '') +
      `. I would like to discuss further.`;
    return `https://wa.me/${this.siteConfig.phoneDigits()}?text=${encodeURIComponent(msg)}`;
  });

  readonly whatsappReportHref = computed(() => {
    const msg =
      `Hi Ganesh Builders, I just generated my construction cost estimate (approx. ` +
      `${this.fmt(this.grandTotal())}` +
      `) and emailed the report to your team. ` +
      `Please share my report with me here on WhatsApp.`;
    return `https://wa.me/${this.siteConfig.phoneDigits()}?text=${encodeURIComponent(msg)}`;
  });

  constructor() {
    this.title.setTitle('Free Construction Cost Estimator | Ganesh Builders Chennai');
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.packageService.getPackages().subscribe({
      next: (rows) => {
        this.dbPackages.set(rows);
        this.loaded.set(true);
      },
      error: () => {
        this.loadError.set(true);
        this.loaded.set(true);
      },
    });
    this.packageService.getPackageSpecTypes().subscribe({
      next: (rows) => this.specTypes.set(rows),
    });
  }

  /* ---------- report screenshot protection ---------- */

  @HostListener('window:blur')
  onWindowBlur(): void {
    if (this.step() === 5 && !this.showContactModal()) this.reportShield.set(true);
  }

  @HostListener('window:focus')
  onWindowFocus(): void {
    this.reportShield.set(false);
  }

  @HostListener('document:visibilitychange')
  onVisibilityChange(): void {
    this.reportShield.set(document.hidden);
  }

  /* ---------- customer name & phone popup ---------- */

  openContactModal(mode: 'download' | 'whatsapp'): void {
    if (this.reportBusy()) return;
    this.reportAction.set(mode);
    this.contactName.set('');
    this.contactPhone.set('');
    this.contactError.set('');
    this.showContactModal.set(true);
  }

  closeContactModal(): void {
    if (this.reportBusy()) return;
    this.showContactModal.set(false);
  }

  submitContact(): void {
    const name = this.contactName().trim();
    if (!name) {
      this.contactError.set('Please enter your name.');
      return;
    }
    const digits = this.contactPhone().replace(/\D/g, '');
    const match = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
    if (!/^[6-9]\d{9}$/.test(match)) {
      this.contactError.set('Please enter a valid 10-digit mobile number.');
      return;
    }
    this.contactError.set('');
    this.showContactModal.set(false);
    this.generateReport(this.reportAction() === 'whatsapp', { name, phone: match });
  }

  /* ---------- formatting ---------- */

  fmt(n: number): string {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
    return `₹${Math.round(n).toLocaleString('en-IN')}`;
  }

  fmtFull(n: number): string {
    return `₹${Math.round(n).toLocaleString('en-IN')}`;
  }

  yards(n: number | null): string {
    return n ? (n / 9).toFixed(2) : '—';
  }

  cents(n: number | null): string {
    return n ? (n / 435.6).toFixed(3) : '—';
  }

  inr(n: number | null): string {
    return n ? n.toLocaleString('en-IN') : '—';
  }

  pad(i: number): string {
    return String(i).padStart(2, '0');
  }

  slabs(n: number): number[] {
    return Array.from({ length: Math.max(n, 1) });
  }

  phaseAmount(ph: PhaseSplit): number {
    return Math.round((this.baseCost() * ph.pct) / 100);
  }

  extraCost(id: string): number {
    const ex = this.extrasList.find((e) => e.id === id);
    const v = this.extrasState()[id];
    if (!ex || v === undefined) return 0;
    return ex.fixed ? ex.rate : (Number(v) || 0) * ex.rate;
  }  emi(principal: number, ratePA = 7.1, years = 20): number {
    if (principal <= 0) return 0;
    const r = ratePA / 100 / 12;
    const n = years * 12;
    return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }

  /* ---------- interactions ---------- */

  /** Ease displayed numbers toward their targets — the "counting up" effect. */
  private animateField(field: 'plot' | 'built' | 'park', target: number): void {
    this.dispTargets[field] = target;
    if (this.dispRafId) {
      return;
    }
    const signalsMap = {
      plot: this.plotDisp,
      built: this.builtDisp,
      park: this.parkDisp,
    };
    this.zone.runOutsideAngular(() => {
      const tick = (): void => {
        let busy = false;
        for (const key of Object.keys(signalsMap) as Array<'plot' | 'built' | 'park'>) {
          const sig = signalsMap[key];
          const goal = this.dispTargets[key];
          const cur = sig();
          const diff = goal - cur;
          if (Math.abs(diff) < 0.6) {
            if (cur !== goal) {
              sig.set(goal);
            }
            continue;
          }
          busy = true;
          sig.set(cur + diff * 0.16);
        }
        if (busy) {
          this.dispRafId = requestAnimationFrame(tick);
        } else {
          cancelAnimationFrame(this.dispRafId);
          this.dispRafId = 0;
        }
      };
      this.dispRafId = requestAnimationFrame(tick);
    });
  }

  setPlot(value: string): void {
    const n = parseFloat(value);
    const v = Number.isFinite(n) && n > 0 ? n : 0;
    this.plotArea.set(v || null);
    this.animateField('plot', v);
  }

  setBuiltUp(value: string): void {
    const n = parseFloat(value);
    const v = Number.isFinite(n) && n > 0 ? n : 0;
    this.builtUpArea.set(v || null);
    this.animateField('built', v);
  }

  setParking(value: string): void {
    const n = parseFloat(value);
    const v = Number.isFinite(n) && n > 0 ? n : 0;
    this.parkingArea.set(v || null);
    this.animateField('park', v);
  }

  quickPlot(sqft: number): void {
    this.plotArea.set(sqft);
    this.animateField('plot', sqft);
  }

  quickBuiltUp(sqft: number): void {
    this.builtUpArea.set(sqft);
    this.animateField('built', sqft);
  }

  quickParking(sqft: number): void {
    this.parkingArea.set(sqft);
    this.animateField('park', sqft);
  }

  chooseFloors(id: string): void {
    this.floorId.set(id);
  }

  choosePackage(id: string): void {
    this.packageId.set(id);
    this.specTab.set(0);
  }

  setCategory(cat: PkgCategory): void {
    if (this.category() === cat) {
      return;
    }
    this.category.set(cat);
    this.packageId.set(null);
    this.specTab.set(0);
  }

  toggleExtra(id: string, checked: boolean): void {
    this.extrasState.update((state) => {
      const next = { ...state };
      if (checked) {
        const ex = this.extrasList.find((e) => e.id === id);
        if (ex?.fixed) next[id] = true;
      } else {
        delete next[id];
      }
      return next;
    });
  }

  setExtraQty(id: string, value: string): void {
    this.extrasState.update((state) => ({ ...state, [id]: value }));
  }

  isExtraChecked(id: string): boolean {
    return this.extrasState()[id] !== undefined;
  }

  next(): void {
    const step = this.step();
    if (step === 1) {
      if (!this.plotArea() || !this.builtUpArea()) {
        this.errorText.set('Please enter both plot area and built-up area per floor to continue.');
        return;
      }
      if (this.totalBuiltUp() <= 0) {
        this.errorText.set('Total built-up area cannot be zero. Please check your inputs.');
        return;
      }
    }
    if (step === 3 && !this.packageId()) {
      this.errorText.set('Please select a construction package to continue.');
      return;
    }
    this.errorText.set('');
    if (step === 4) {
      this.step.set(5);
      this.animateTotal();
    } else {
      this.step.set(step + 1);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  back(): void {
    this.errorText.set('');
    this.step.update((s) => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  reset(): void {
    cancelAnimationFrame(this.rafId);
    cancelAnimationFrame(this.dispRafId);
    this.dispRafId = 0;
    this.step.set(1);
    this.errorText.set('');
    this.plotArea.set(null);
    this.builtUpArea.set(null);
    this.parkingArea.set(null);
    this.floorId.set('G');
    this.packageId.set(null);
    this.category.set('residential');
    this.extrasState.set({});
    this.displayedTotal.set(0);
    this.plotDisp.set(0);
    this.builtDisp.set(0);
    this.parkDisp.set(0);
    this.dispTargets.plot = 0;
    this.dispTargets.built = 0;
    this.dispTargets.park = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------- report download & email ---------- */

  private reportId(): string {
    const d = new Date();
    return `EST-${d.getFullYear()}${this.pad(d.getMonth() + 1)}${this.pad(d.getDate())}-${Math.floor(
      1000 + Math.random() * 9000,
    )}`;
  }

  private reportDate(): string {
    const d = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${this.pad(d.getDate())} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  private pdfData(estimateId: string): EstimatePdfData {
    const pkg = this.selectedPackage();
    return {
      company: this.siteConfig.appName(),
      estimateId,
      date: this.reportDate(),
      category: this.category() === 'commercial' ? 'Commercial' : 'Residential',
      packageName: pkg?.name ?? '—',
      packageTier: pkg?.tier ?? '—',
      ratePerSqft: pkg?.rate ?? 0,
      plotAreaSqft: this.plotArea() ?? 0,
      builtUpPerFloorSqft: this.builtUpArea() ?? 0,
      parkingSqft: this.parkingArea() ?? 0,
      totalBuiltUpSqft: this.totalBuiltUp(),
      configuration: this.selectedFloor().label,
      durationMonths: this.durationMonths(),
      baseCost: this.baseCost(),
      extrasCost: this.extrasCost(),
      grandTotal: this.grandTotal(),
      emiMonthly: this.emiMonthly(),
      monthlyOutflow: this.monthlyOutflow(),
      phases: this.phases.map((ph) => ({ ...ph, amount: this.phaseAmount(ph) })),
      extras: this.chosenExtras().map((ex) => ({ label: ex.label, amount: this.extraCost(ex.id) })),
      packages: this.activePackages().map((p) => ({
        name: p.name,
        tier: p.tier,
        rate: p.rate,
        total: Math.round(this.totalBuiltUp() * p.rate),
        selected: this.packageId() === p.id,
      })),
      disclaimer:
        'Please note: Figures are indicative estimates for Chennai metro and vary with site conditions, ' +
        'soil type and material prices. Government approvals, architect fees, EB / water connection ' +
        'charges and interior furnishing are not included. Your final quote after a free site visit ' +
        'will be exact.',
    };
  }

  generateReport(sendToWa: boolean, contact: { name: string; phone: string }): void {
    if (this.reportBusy()) {
      return;
    }
    this.reportBusy.set(true);
    if (sendToWa) {
      window.open(this.whatsappReportHref(), '_blank', 'noopener');
    }
    void this.buildAndEmail(contact);
  }

  private async buildAndEmail(contact: { name: string; phone: string }): Promise<void> {
    try {
      const estimateId = this.reportId();
      const pdfData = this.pdfData(estimateId);
      const { buildEstimatePdf } = await import('./estimate.pdf');
      const doc = buildEstimatePdf(pdfData);
      const fileName = `GaneshBuilders-Estimate-${estimateId}.pdf`;
      this.emailReport(doc.output('blob'), pdfData, fileName, contact);
    } catch {
      this.reportBusy.set(false);
      this.notifications.show('Could not generate the PDF. Please try again.', 'error');
    }
  }

  private emailReport(
    pdf: Blob,
    data: EstimatePdfData,
    fileName: string,
    contact: { name: string; phone: string },
  ): void {
    this.reportService
      .sendToAdmins(pdf, {
        customerName: contact.name,
        customerPhone: contact.phone,
        category: data.category,
        packageName: `${data.packageName} — ${data.packageTier}`,
        ratePerSqft: data.ratePerSqft,
        plotAreaSqft: data.plotAreaSqft,
        totalBuiltUpSqft: data.totalBuiltUpSqft,
        configuration: data.configuration,
        durationMonths: data.durationMonths,
        baseCost: data.baseCost,
        extrasCost: data.extrasCost,
        totalCost: data.grandTotal,
        emiMonthly: data.emiMonthly,
        fileName,
      })
      .subscribe({
        next: (res) => {
          this.reportBusy.set(false);
          if (res?.success) {
            this.notifications.show('Report emailed to our team. Ask for it on WhatsApp!', 'success', 6000);
          } else {
            this.notifications.show(`PDF ready. ${res?.message ?? 'Email not sent.'}`, 'error', 6000);
          }
        },
        error: () => {
          this.reportBusy.set(false);
          this.notifications.show(
            'PDF ready. Could not email it — our team may be offline. Try again.',
            'error',
            6000,
          );
        },
      });
  }

  private animateTotal(): void {
    this.zone.runOutsideAngular(() => {
      cancelAnimationFrame(this.rafId);
      const target = this.grandTotal();
      const start = performance.now();
      const dur = 1200;
      const tick = (now: number): void => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        this.zone.run(() => this.displayedTotal.set(Math.round(eased * target)));
        if (p < 1) {
          this.rafId = requestAnimationFrame(tick);
        }
      };
      this.rafId = requestAnimationFrame(tick);
    });
  }
}
