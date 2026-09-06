import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { IProject } from '../../models/project.model';
import { ProjectCardComponent } from '../project-card/project-card';
import { ProjectPreviewComponent } from '../project-preview/project-preview';

@Component({
  selector: 'app-home-project',
  standalone: true,
  imports: [RouterLink, ProjectCardComponent, ProjectPreviewComponent],
  templateUrl: './home-project.html',
  styleUrl: './home-project.scss',
})
export class HomeProjectComponent implements OnInit {
  private readonly projectService = inject(ProjectService);

  readonly projects = signal<IProject[]>([]);
  readonly loading = signal(true);
  readonly previewProject = signal<IProject | null>(null);

  readonly skeletons = Array.from({ length: 3 });

  ngOnInit(): void {
    this.projectService.getHomeProjects().subscribe({
      next: (res) => {
        this.projects.set(res);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  closePreview(): void {
    this.previewProject.set(null);
  }
}