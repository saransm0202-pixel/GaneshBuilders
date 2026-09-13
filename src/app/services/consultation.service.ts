import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { IConsultationRequest, IConsultationResponse } from '../models/consultation.model';

@Injectable({ providedIn: 'root' })
export class ConsultationService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/EnquiryAPI`;

  submit(request: IConsultationRequest): Observable<IConsultationResponse> {
    return this.http.post<IConsultationResponse>(`${this.base}/SubmitConsultation`, request);
  }
}