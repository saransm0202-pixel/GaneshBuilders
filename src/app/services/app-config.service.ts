import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { IAppConfig } from '../models/app-config.model';

export interface ILogoUploadResponse {
  statusCode: number;
  imageUrl: string;
}

@Injectable({ providedIn: 'root' })
export class AppConfigService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/AppConfigAPI`;

  getAppConfig(accountId: number): Observable<IAppConfig> {
    return this.http.get<IAppConfig>(`${this.base}/getAppConfig`, {
      params: { accountId },
    });
  }

  saveAppConfig(config: IAppConfig): Observable<IAppConfig> {
    return this.http.post<IAppConfig>(`${this.base}/InsertUpdateConfig`, config);
  }

  uploadAppLogo(accountId: number, file: File): Observable<ILogoUploadResponse> {
    const form = new FormData();
    form.append('accountId', String(accountId));
    form.append('logoFile', file, file.name);
    return this.http.post<ILogoUploadResponse>(`${this.base}/UploadAppLogo`, form);
  }
}