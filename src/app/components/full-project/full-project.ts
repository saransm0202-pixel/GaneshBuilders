import { Component, OnInit, AfterViewInit, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { IProject } from '../../models/project.model';
import { ProjectCardComponent } from '../project-card/project-card';
import { ProjectPreviewComponent } from '../project-preview/project-preview';

@Component({
  selector: 'app-full-project',
  standalone: true,
  imports: [RouterLink, ProjectCardComponent, ProjectPreviewComponent],
  templateUrl: './full-project.html',
  styleUrl: './full-project.scss',
})
export class FullProjectComponent implements OnInit, AfterViewInit {
  private readonly projectService = inject(ProjectService);
  private readonly title = inject(Title);

  readonly projects = signal<IProject[]>([]);
  readonly loading = signal(true);
  readonly previewProject = signal<IProject | null>(null);

  readonly skeletons = Array.from({ length: 6 });

  ngOnInit(): void {
    this.title.setTitle('All Projects · Ganesh Builders');
    this.projectService.getProjects().subscribe({
      next: (res) => {
        this.projects.set(res.filter((p) => p.isActive !== false));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  ngAfterViewInit(): void {
    window.scrollTo(0, 0);
  }

  closePreview(): void {
    this.previewProject.set(null);
  }
}