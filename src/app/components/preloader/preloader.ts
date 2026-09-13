import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  inject,
  signal,
} from '@angular/core';
import { SiteConfigService } from '../../services/site-config.service';

@Component({
  selector: 'app-preloader',
  standalone: true,
  templateUrl: './preloader.html',
  styleUrl: './preloader.scss',
  host: {
    '[class.preloader--hidden]': 'dismissed',
  },
})
export class PreloaderComponent {
  @Input() dismissed = false;

  @ViewChild('canvas', { static: true })
  private readonly canvasRef?: ElementRef<HTMLCanvasElement>;

  readonly siteConfig = inject(SiteConfigService);

  readonly pct = signal(0);

  private scene: import('./preloader-builder').Preloader3D | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    let v = 0;
    this.timer = setInterval(() => {
      v = Math.min(100, v + Math.floor(Math.random() * 6) + 2);
      this.pct.set(v);
      if (v >= 100) clearInterval(this.timer!);
    }, 110);
  }

  async ngAfterViewInit(): Promise<void> {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) {
      return;
    }
    try {
      const { Preloader3D } = await import('./preloader-builder');
      this.scene = new Preloader3D(canvas, {
        floorCount: 8,
        getPct: () => this.pct(),
      });
    } catch {
      // fall back to the CSS scene absent
    }
  }

  ngOnDestroy(): void {
    this.scene?.dispose();
    this.scene = null;
    if (this.timer) clearInterval(this.timer);
  }
}