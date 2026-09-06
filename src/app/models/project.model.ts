import { environment } from '../../environments/environment';

export interface IProject {
  projectId: number;
  projectName: string;
  description?: string;
  imageUrl?: string;
  projectStatus: string;
  projectLocation: string;
  projectType: string;
  projectArea: number;
  isActive: boolean;
  accountId?: number;
}

export interface IProjectResponse {
  statusCode: number;
  message: string;
}

const PROJECT_DEFAULT_IMAGE = 'assets/images/projects/project1.png';

/** Resolve a project image to a loadable URL, falling back to the site default image. */
export function projectImageUrl(url: string | undefined | null): string {
  if (url && !/^https?:\/\//i.test(url)) {
    url = `${environment.apiOrigin}${url.startsWith('/') ? url : '/' + url}`;
  }
  return url || PROJECT_DEFAULT_IMAGE;
}
