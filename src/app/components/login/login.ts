import { Component, EventEmitter, NgZone, Output, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { ILoggedInUser } from '../../models/auth.model';
import { environment } from '../../../environments/environment';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly zone = inject(NgZone);
  private readonly notify = inject(NotificationService);

  @Output() closed = new EventEmitter<void>();
  @Output() loggedIn = new EventEmitter<ILoggedInUser>();

  /* ── state ── */
  readonly visible = signal(true);
  readonly isSignup = signal(false);
  readonly step = signal<'email' | 'otp'>('email');

  /* ── step 1 fields ── */
  email = '';
  name = '';
  phone = '';

  /* ── step 2 fields ── */
  otpCode = '';

  /* ── ui flags ── */
  readonly sendingOtp = signal(false);
  readonly verifying = signal(false);
  readonly countdown = signal(180);

  private countdownTimer: ReturnType<typeof setInterval> | null = null;

  /* ═══════════════ Step 1: send OTP ═══════════════ */

  submit(): void {
    if (this.isSignup()) {
      if (!this.name.trim() || !this.phone.trim() || !this.email.trim()) {
        this.notify.show('Please fill all fields.', 'error');
        return;
      }
    }
    if (!this.email.trim()) {
      this.notify.show('Email is required.', 'error');
      return;
    }
    this.sendOtp();
  }

  private sendOtp(): void {
    this.sendingOtp.set(true);
    this.auth.sendOtp(this.email.trim()).subscribe({
      next: (res) => {
        this.sendingOtp.set(false);
        if (res.success) {
          this.step.set('otp');
          this.startCountdown();
        } else {
          this.notify.show(res.message || 'Failed to send OTP.', 'error');
          this.close();
        }
      },
      error: () => {
        this.sendingOtp.set(false);
        this.notify.show('Error sending OTP. Try again.', 'error');
      },
    });
  }

  /* ═══════════════ Step 2: verify OTP ═══════════════ */

  verifyOtp(): void {
    if (!this.otpCode.trim()) {
      this.notify.show('Please enter the OTP code.', 'error');
      return;
    }
    this.verifying.set(true);
    this.auth.verifyOtp(this.email.trim(), this.otpCode.trim()).subscribe({
      next: (res) => {
        this.verifying.set(false);
        if (res.success) {
          this.finalizeLogin();
        } else {
          this.notify.show(res.message || 'Invalid or expired OTP.', 'error');
        }
      },
      error: () => {
        this.verifying.set(false);
        this.notify.show('Error verifying OTP.', 'error');
      },
    });
  }

  private finalizeLogin(): void {
    const user = {
      id: this.isSignup() ? 0 : -1,
      firstName: this.name.trim() ? this.name.split(' ')[0] : '',
      lastName: this.name.trim() ? this.name.split(' ').slice(1).join(' ') : '',
      email: this.email.trim(),
      phone: this.phone.trim(),
      roleId: 2,
      roleName: 'User',
      isActive: true,
      accountId: environment.accountId,
    };
    this.auth.login(user).subscribe({
      next: (res) => {
        this.zone.run(() => {
          if (!res?.user || res.user.id === -1) {
            this.notify.show(res?.user?.loginMsg || 'Unauthorized. Contact admin.', 'error');
            this.close();
          } else {
            this.auth.setSession(
              {
                id: res.user.id,
                firstName: res.user.firstName,
                lastName: res.user.lastName,
                email: res.user.email,
                phone: res.user.phone,
                profilePic: res.user.profilePic,
                roleId: res.user.roleId,
                roleName: res.user.roleName,
                isActive: res.user.isActive,
              },
              res.accessToken,
              res.refreshToken,
            );
            this.notify.show('Welcome back, ' + res.user.firstName + '!', 'success');
            this.loggedIn.emit(this.auth.currentUser()!);
            this.close();
          }
        });
      },
      error: () => {
        this.zone.run(() => {
          this.notify.show('Login failed. Please try again.', 'error');
          this.close();
        });
      },
    });
  }

  /* ═══════════════ Google Sign-In ═══════════════ */

  signInWithGoogle(): void {
    try {
      const client = google.accounts.oauth2.initTokenClient({
        client_id:
          '432278272815-sskdjbbmmptpu43ifv7fmo0jb20prfu5.apps.googleusercontent.com',
        scope: 'profile email',
        callback: (response: { access_token?: string }) => {
          if (response.access_token) {
            fetch(
              `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${response.access_token}`,
            )
              .then((r) => r.json())
              .then((info) => {
                const user = {
                  id: 1,
                  firstName: info.given_name || '',
                  lastName: info.family_name || '',
                  email: info.email || '',
                  phone: '',
                  roleId: 2,
                  roleName: 'User',
                  isActive: true,
                  accountId: environment.accountId,
                };
                this.auth.login(user).subscribe({
                  next: (res) => {
                    this.zone.run(() => {
                      if (!res?.user || res.user.id === -1) {
                        this.notify.show(
                          res?.user?.loginMsg || 'Unauthorized. Contact admin.',
                          'error',
                        );
                        this.close();
                      } else {
                        this.auth.setSession(
                          {
                            id: res.user.id,
                            firstName: res.user.firstName,
                            lastName: res.user.lastName,
                            email: res.user.email,
                            phone: res.user.phone,
                            profilePic: res.user.profilePic,
                            roleId: res.user.roleId,
                            roleName: res.user.roleName,
                            isActive: res.user.isActive,
                          },
                          res.accessToken,
                          res.refreshToken,
                        );
                        this.notify.show('Welcome, ' + res.user.firstName + '!', 'success');
                        this.loggedIn.emit(this.auth.currentUser()!);
                        this.close();
                      }
                    });
                  },
                  error: () => {
                    this.zone.run(() => {
                      this.notify.show('Google login failed.', 'error');
                      this.close();
                    });
                  },
                });
              });
          }
        },
      });
      client.requestAccessToken();
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      this.notify.show('Google Sign-In unavailable.', 'error');
      this.close();
    }
  }

  /* ═══════════════ Countdown ═══════════════ */

  private startCountdown(): void {
    this.countdown.set(180);
    this.clearCountdown();
    this.countdownTimer = setInterval(() => {
      const next = this.countdown() - 1;
      this.countdown.set(next);
      if (next <= 0) {
        this.clearCountdown();
        this.notify.show('OTP expired. Please request a new one.', 'error');
        this.step.set('email');
      }
    }, 1000);
  }

  resendOtp(): void {
    this.clearCountdown();
    this.sendOtp();
  }

  private clearCountdown(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
  }

  /* ═══════════════ Navigation ═══════════════ */

  toggleSignup(): void {
    this.isSignup.update((v) => !v);
    this.resetFields();
  }

  backToEmail(): void {
    this.clearCountdown();
    this.step.set('email');
    this.otpCode = '';
  }

  close(): void {
    this.clearCountdown();
    this.visible.set(false);
    this.resetFields();
    this.closed.emit();
  }

  private resetFields(): void {
    this.email = '';
    this.name = '';
    this.phone = '';
    this.otpCode = '';
  }

  countdownFormatted(): string {
    const s = this.countdown();
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }
}
