import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { IPackage, IConstructionType, IPackageSpecType } from '../models/package.model';

export interface IPackageResponse {
  statusCode: number;
  message: string;
  id?: number;
}

@Injectable({ providedIn: 'root' })
export class PackageService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/PackageAPI`;

  getPackages(): Observable<IPackage[]> {
    return this.http.get<IPackage[]>(`${this.base}/getPackages`, {
      params: { accountId: environment.accountId },
    });
  }

  getConstructionTypes(): Observable<IConstructionType[]> {
    return this.http.get<IConstructionType[]>(`${this.base}/getConstructionTypes`);
  }

  getPackageSpecTypes(): Observable<IPackageSpecType[]> {
    return this.http.get<IPackageSpecType[]>(`${this.base}/getPackageSpecTypes`);
  }

  savePackage(pkg: IPackage): Observable<IPackageResponse> {
    return this.http.post<IPackageResponse>(`${this.base}/SavePackage`, pkg);
  }

  deletePackage(packageId: number): Observable<IPackageResponse> {
    return this.http.post<IPackageResponse>(
      `${this.base}/DeletePackage`,
      null,
      { params: { packageId } },
    );
  }
}