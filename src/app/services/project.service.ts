import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { IProject, IProjectResponse } from '../models/project.model';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  getProjects(): Observable<IProject[]> {
    return this.http.get<IProject[]>(
      `${this.base}/ProjectAPI/getProjects?accountId=${environment.accountId}`,
    );
  }

  /** Top 3 active projects for the home page showcase. */
  getHomeProjects(): Observable<IProject[]> {
    return this.http.get<IProject[]>(
      `${this.base}/ProjectAPI/getHomeProjects?accountId=${environment.accountId}`,
    );
  }

  saveProject(project: Partial<IProject>): Observable<IProjectResponse> {
    return this.http.post<IProjectResponse>(
      `${this.base}/ProjectAPI/InsertUpdateProject`,
      project,
    );
  }

  /** Multipart save: project fields + optional image file. Backend keeps ONE image per project. */
  saveProjectWithImage(project: Partial<IProject>, imageFile?: File | null): Observable<IProjectResponse> {
    const fd = new FormData();
    fd.append('ProjectId', String(project.projectId ?? 0));
    fd.append('ProjectName', project.projectName ?? '');
    fd.append('Description', project.description ?? '');
    fd.append('ImageUrl', project.imageUrl ?? '');
    fd.append('ProjectStatus', project.projectStatus ?? 'Planning');
    fd.append('ProjectLocation', project.projectLocation ?? '');
    fd.append('ProjectType', project.projectType ?? '');
    fd.append('ProjectArea', String(project.projectArea ?? 0));
    fd.append('IsActive', String(project.isActive ?? true));
    fd.append('AccountId', String(project.accountId ?? environment.accountId));
    if (imageFile) {
      fd.append('imageFile', imageFile, imageFile.name);
    }
    return this.http.post<IProjectResponse>(
      `${this.base}/ProjectAPI/SaveProject`,
      fd,
    );
  }

  uploadProjectImage(projectId: number, imageFile: File): Observable<{ statusCode: number; imageUrl: string }> {
    const fd = new FormData();
    fd.append('projectId', String(projectId));
    fd.append('imageFile', imageFile, imageFile.name);
    return this.http.post<{ statusCode: number; imageUrl: string }>(
      `${this.base}/ProjectAPI/UploadProjectImage`,
      fd,
    );
  }
}