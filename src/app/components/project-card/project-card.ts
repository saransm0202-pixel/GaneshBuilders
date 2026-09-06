import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RevealDirective } from '../../directives/reveal.directive';
import { IProject, projectImageUrl } from '../../models/project.model';

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './project-card.html',
  styleUrl: './project-card.scss',
})
export class ProjectCardComponent {
  @Input({ required: true }) project!: IProject;
  @Input() delay = 0;
  @Output() preview = new EventEmitter<IProject>();

  imageUrl(): string {
    return projectImageUrl(this.project.imageUrl);
  }

  areaLabel(area: number | null | undefined): string {
    return area ? `${area.toLocaleString()} Sq.Ft` : '';
  }

  statusClass(status: string): string {
    switch ((status || '').toLowerCase()) {
      case 'completed':
        return 'pc--completed';
      case 'ongoing':
        return 'pc--ongoing';
      case 'on hold':
        return 'pc--hold';
      case 'planning':
      default:
        return 'pc--planning';
    }
  }
}