import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { IProject, projectImageUrl } from '../../models/project.model';

@Component({
  selector: 'app-project-preview',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './project-preview.html',
  styleUrl: './project-preview.scss',
})
export class ProjectPreviewComponent {
  @Input({ required: true }) project!: IProject;
  @Output() close = new EventEmitter<void>();

  readonly estimateUrl = '/estimate';

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close.emit();
  }

  imageUrl(): string {
    return projectImageUrl(this.project.imageUrl);
  }

  area(area: number | null | undefined): string {
    return area ? `${area.toLocaleString()} Sq.Ft` : '—';
  }

  statusClass(status: string): string {
    switch ((status || '').toLowerCase()) {
      case 'completed':
        return 'pv--completed';
      case 'ongoing':
        return 'pv--ongoing';
      case 'on hold':
        return 'pv--hold';
      case 'planning':
      default:
        return 'pv--planning';
    }
  }
}