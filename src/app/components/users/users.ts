import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { UserService } from '../../services/user.service';
import { IUser, IRole } from '../../models/user.model';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class UsersComponent implements OnInit {
  user: any;
  private readonly userService = inject(UserService);
  private readonly title = inject(Title);

  readonly users = signal<IUser[]>([]);
  readonly roles = signal<IRole[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly panelOpen = signal(false);
  readonly editingUser = signal<IUser | null>(null);
  readonly searchQuery = signal('');
  readonly toastMessage = signal('');
  readonly toastType = signal<'success' | 'error'>('success');
  readonly toastVisible = signal(false);

  readonly form = new FormGroup({
    firstName: new FormControl('', { nonNullable: true, validators: Validators.required }),
    lastName: new FormControl('', { nonNullable: true, validators: Validators.required }),
    email: new FormControl('', { nonNullable: true, validators: Validators.required }),
    phone: new FormControl(''),
    roleId: new FormControl<number | null>(null),
    isActive: new FormControl(true),
  });

  readonly filteredUsers = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const list = this.users();
    if (!q) return list;
    return list.filter(
      (u) =>
        u.firstName?.toLowerCase().includes(q) ||
        u.lastName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.includes(q) ||
        u.roleName?.toLowerCase().includes(q),
    );
  });

  constructor(private authService: AuthService) {
    this.title.setTitle('Team Management | Ganesh Builders');
  }

  ngOnInit(): void {
    this.user = this.authService.getUserFromSession();

    if (!this.user) {
      window.location.href = '/home';
    }
    window.scrollTo(0, 0);
    this.loadUsers();
    this.loadRoles();
  }

  /* ── data ── */

  loadUsers(): void {
    this.loading.set(true);
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast('Failed to load users', 'error');
      },
    });
  }

  loadRoles(): void {
    this.userService.getRoles().subscribe({
      next: (data) => this.roles.set(data),
    });
  }

  /* ── panel ── */

  openAdd(): void {
    this.editingUser.set(null);
    this.form.reset({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      roleId: null,
      isActive: true,
    });
    this.panelOpen.set(true);
  }

  openEdit(user: IUser): void {
    this.editingUser.set(user);
    this.form.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email ?? '',
      phone: user.phone ?? '',
      roleId: user.roleId ?? null,
      isActive: user.isActive,
    });
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
    const payload: Partial<IUser> = {
      id: this.editingUser()?.id ?? 0,
      firstName: v.firstName,
      lastName: v.lastName,
      email: v.email ?? '',
      phone: v.phone ?? '',
      roleId: v.roleId,
      isActive: v.isActive ?? true,
      profilePic: this.editingUser()?.profilePic ?? '',
      accountId: environment.accountId,
    };
    this.userService.saveUser(payload as IUser).subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.statusCode === 1) {
          this.toast(res.message || 'Saved successfully', 'success');
          this.panelOpen.set(false);
          this.loadUsers();
        } else {
          this.toast(res.message || 'Save failed', 'error');
        }
      },
      error: () => {
        this.saving.set(false);
        this.toast('Network error — please try again', 'error');
      },
    });
  }

  /* ── helpers ── */

  initials(u: IUser): string {
    return ((u.firstName?.[0] ?? '') + (u.lastName?.[0] ?? '')).toUpperCase();
  }

  isInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  private toast(msg: string, type: 'success' | 'error'): void {
    this.toastMessage.set(msg);
    this.toastType.set(type);
    this.toastVisible.set(true);
    setTimeout(() => this.toastVisible.set(false), 3500);
  }
}
