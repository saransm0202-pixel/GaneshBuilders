import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ProjectService } from '../../services/project.service';
import { NotificationService } from '../../services/notification.service';
import { IProject } from '../../models/project.model';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';

const STATUS_OPTIONS = ['Planning', 'Ongoing', 'Completed', 'On Hold'];
const TYPE_OPTIONS = [
  'Independent House',
  'Duplex Villa',
  'Individual Villa',
  'Apartment',
  'Commercial',
  'Other',
];

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
})
export class ProjectsComponent implements OnInit {
  user: any;
  private readonly projectService = inject(ProjectService);
  private readonly notify = inject(NotificationService);
  private readonly title = inject(Title);

  readonly projects = signal<IProject[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly panelOpen = signal(false);
  readonly editingProject = signal<IProject | null>(null);
  readonly searchQuery = signal('');

  /* image state */
  readonly previewUrl = signal('');
  readonly selectedImage = signal<File | null>(null);

  readonly statusOptions = STATUS_OPTIONS;
  readonly typeOptions = TYPE_OPTIONS;
  readonly acceptedTypes = ACCEPTED_TYPES.join(',');

  readonly form = new FormGroup({
    projectName: new FormControl('', { nonNullable: true, validators: Validators.required }),
    projectType: new FormControl('', { nonNullable: true, validators: Validators.required }),
    projectStatus: new FormControl('Planning', { nonNullable: true }),
    projectLocation: new FormControl('', { nonNullable: true, validators: Validators.required }),
    projectArea: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(1)],
    }),
    description: new FormControl(''),
    imageUrl: new FormControl(''),
    isActive: new FormControl(true),
  });

  readonly filteredProjects = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const list = this.projects();
    if (!q) return list;
    return list.filter(
      (p) =>
        p.projectName?.toLowerCase().includes(q) ||
        p.projectLocation?.toLowerCase().includes(q) ||
        p.projectType?.toLowerCase().includes(q) ||
        p.projectStatus?.toLowerCase().includes(q) ||
        String(p.projectArea ?? '').includes(q),
    );
  });

  readonly isDragOver = signal(false);

  constructor(private authService: AuthService) {
    this.title.setTitle('Project Management | Ganesh Builders');
  }

  ngOnInit(): void {
    this.user = this.authService.getUserFromSession();

    if (!this.user) {
      window.location.href = '/home';
    }
    window.scrollTo(0, 0);
    this.loadProjects();
  }

  /* ── data ── */

  loadProjects(): void {
    this.loading.set(true);
    this.projectService.getProjects().subscribe({
      next: (data) => {
        this.projects.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notify.show('Failed to load projects', 'error');
      },
    });
  }

  /* ── image helpers ── */

  /** Stable URL for an image across the app (prepends backend origin when relative). */
  imageSrc(url: string | undefined | null): string {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    return `${environment.apiOrigin}${url.startsWith('/') ? url : '/' + url}`;
  }

  hasImage(): boolean {
    return !!this.previewUrl();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.setImageFile(file);
    input.value = '';
  }

  onDropImage(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) this.setImageFile(file);
  }

  private setImageFile(file: File): void {
    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.match(/\.(png|jpe?g|webp|gif)$/i)) {
      this.notify.show('Please choose a PNG, JPG, WEBP or GIF image.', 'error');
      return;
    }
    this.revokePreview();
    this.selectedImage.set(file);
    this.previewUrl.set(URL.createObjectURL(file));
  }

  removeImage(): void {
    this.resetImageState();
    this.form.patchValue({ imageUrl: '' });
  }

  /** Clear only the "new uploaded file" state — keeps the existing image URL intact. */
  private resetImageState(): void {
    this.revokePreview();
    this.selectedImage.set(null);
    this.previewUrl.set('');
  }

  private revokePreview(): void {
    const current = this.previewUrl();
    if (current && current.startsWith('blob:')) {
      URL.revokeObjectURL(current);
    }
  }

  /* ── panel ── */

  openAdd(): void {
    this.editingProject.set(null);
    this.form.reset({
      projectName: '',
      projectType: '',
      projectStatus: 'Planning',
      projectLocation: '',
      projectArea: null,
      description: '',
      imageUrl: '',
      isActive: true,
    });
    this.resetImageState();
    this.panelOpen.set(true);
  }

  openEdit(project: IProject): void {
    this.editingProject.set(project);
    this.form.patchValue({
      projectName: project.projectName,
      projectType: project.projectType,
      projectStatus: project.projectStatus,
      projectLocation: project.projectLocation,
      projectArea: project.projectArea,
      description: project.description ?? '',
      imageUrl: project.imageUrl ?? '',
      isActive: project.isActive,
    });
    this.resetImageState();
    if (project.imageUrl) {
      this.previewUrl.set(this.imageSrc(project.imageUrl));
    }
    this.panelOpen.set(true);
  }

  closePanel(): void {
    this.panelOpen.set(false);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const v = this.form.value;
    const payload: Partial<IProject> = {
      projectId: this.editingProject()?.projectId ?? 0,
      projectName: v.projectName,
      projectType: v.projectType ?? '',
      projectStatus: v.projectStatus ?? 'Planning',
      projectLocation: v.projectLocation,
      projectArea: v.projectArea ?? 0,
      description: v.description ?? '',
      imageUrl: v.imageUrl ?? '',
      isActive: v.isActive ?? true,
      accountId: environment.accountId,
    };
    this.projectService.saveProjectWithImage(payload, this.selectedImage()).subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.statusCode === 1) {
          this.notify.show(res.message || 'Saved successfully', 'success');
          this.panelOpen.set(false);
          this.removeImage();
          this.loadProjects();
        } else {
          this.notify.show(res.message || 'Save failed', 'error');
        }
      },
      error: () => {
        this.saving.set(false);
        this.notify.show('Network error — please try again', 'error');
      },
    });
  }

  /* ── helpers ── */

  isInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  statusClass(status: string): string {
    switch ((status || '').toLowerCase()) {
      case 'completed':
        return 'prj--completed';
      case 'ongoing':
        return 'prj--ongoing';
      case 'on hold':
        return 'prj--hold';
      case 'planning':
      default:
        return 'prj--planning';
    }
  }
}