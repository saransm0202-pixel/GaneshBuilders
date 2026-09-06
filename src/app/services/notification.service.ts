import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly message = signal('');
  readonly type = signal<ToastType>('success');
  readonly visible = signal(false);

  private timer: ReturnType<typeof setTimeout> | null = null;

  show(message: string, type: ToastType = 'success', duration = 4000): void {
    this.clear();
    this.message.set(message);
    this.type.set(type);
    this.visible.set(true);
    this.timer = setTimeout(() => this.visible.set(false), duration);
  }

  dismiss(): void {
    this.clear();
    this.visible.set(false);
  }

  private clear(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
