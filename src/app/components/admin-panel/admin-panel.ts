import { Component, AfterViewInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.scss',
})
export class AdminPanelComponent implements AfterViewInit {
  readonly auth = inject(AuthService);

  ngAfterViewInit(): void {
    window.scrollTo(0, 0);
  }

  onTilt(event: MouseEvent): void {
    const el = event.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    const px = (event.clientX - r.left) / r.width;
    const py = (event.clientY - r.top) / r.height;
    const rx = (0.5 - py) * 12;
    const ry = (px - 0.5) * 12;
    el.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
    el.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
    el.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`);
    el.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`);
    el.classList.add('ap-module__3d--live');
  }

  resetTilt(event: MouseEvent): void {
    const el = event.currentTarget as HTMLElement;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
    el.style.removeProperty('--gx');
    el.style.removeProperty('--gy');
    el.classList.remove('ap-module__3d--live');
  }
}