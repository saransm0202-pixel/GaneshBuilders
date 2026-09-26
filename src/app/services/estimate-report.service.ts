import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface IEstimateReportMail {
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  category: string;
  packageName: string;
  ratePerSqft: number;
  plotAreaSqft: number;
  totalBuiltUpSqft: number;
  configuration: string;
  durationMonths: number;
  baseCost: number;
  extrasCost: number;
  totalCost: number;
  emiMonthly: number;
  fileName: string;
}

@Injectable({ providedIn: 'root' })
export class EstimateReportService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/EstimateAPI`;

  sendToAdmins(reportPdf: Blob, summary: IEstimateReportMail) {
    const fd = new FormData();
    fd.append('reportPdf', reportPdf, summary.fileName);
    fd.append('accountId', String(environment.accountId));
    fd.append('customerName', summary.customerName ?? '');
    fd.append('customerPhone', summary.customerPhone ?? '');
    fd.append('customerEmail', summary.customerEmail ?? '');
    fd.append('category', summary.category);
    fd.append('packageName', summary.packageName);
    fd.append('ratePerSqft', String(summary.ratePerSqft));
    fd.append('plotAreaSqft', String(summary.plotAreaSqft));
    fd.append('totalBuiltUpSqft', String(summary.totalBuiltUpSqft));
    fd.append('configuration', summary.configuration);
    fd.append('durationMonths', String(summary.durationMonths));
    fd.append('baseCost', String(summary.baseCost));
    fd.append('extrasCost', String(summary.extrasCost));
    fd.append('totalCost', String(summary.totalCost));
    fd.append('emiMonthly', String(summary.emiMonthly));
    fd.append('fileName', summary.fileName);
    return this.http.post<{ success: boolean; message: string }>(
      `${this.base}/SendEstimateReport`,
      fd,
    );
  }
}