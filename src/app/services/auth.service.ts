import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { IUser } from '../models/user.model';
import { ISendOtpReq, IVerifyOtpReq, IOtpResponse, IAuthResponse, ILoggedInUser } from '../models/auth.model';

const STORAGE_KEYS = {
  user: 'gb_user',
  token: 'gb_access_token',
  refresh: 'gb_refresh_token',
} as const;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  readonly currentUser = signal<ILoggedInUser | null>(this.loadUser());

  /* ── API calls ── */

  sendOtp(email: string): Observable<IOtpResponse> {
    const body: ISendOtpReq = { email, accountId: environment.accountId };
    return this.http.post<IOtpResponse>(`${this.base}/LoginAPI/SendOTP`, body);
  }

  verifyOtp(email: string, otp: string): Observable<IOtpResponse> {
    const body: IVerifyOtpReq = { email, otp, accountId: environment.accountId };
    return this.http.post<IOtpResponse>(`${this.base}/LoginAPI/VerifyOTP`, body);
  }

  login(user: Partial<IUser>): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(`${this.base}/LoginAPI/LoginSignupUsers`, user);
  }

  /* ── Session persistence ── */

  setSession(user: ILoggedInUser, token: string, refreshToken: string): void {
    localStorage.setItem(STORAGE_KEYS.token, token);
    localStorage.setItem(STORAGE_KEYS.refresh, refreshToken);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    this.currentUser.set(user);
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.refresh);
    localStorage.removeItem(STORAGE_KEYS.user);
    this.currentUser.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.token);
  }

  isLoggedIn(): boolean {
    return !!this.currentUser();
  }

  userInitials(): string {
    const u = this.currentUser();
    if (!u) return '';
    return ((u.firstName?.[0] ?? '') + (u.lastName?.[0] ?? '')).toUpperCase();
  }
  getUserFromSession(): any | null {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      // const userJson = sessionStorage.getItem('user');
      const userJson = localStorage.getItem('gb_user');;
      return userJson ? JSON.parse(userJson) : null;
    }
    return null;
  }
  /* ── internal ── */

  private loadUser(): ILoggedInUser | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.user);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as ILoggedInUser;
      if (parsed && parsed.id && parsed.id !== -1) return parsed;
      return null;
    } catch {
      return null;
    }
  }
}
