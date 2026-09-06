import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { IUser, IRole, IResponseMsg } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  getUsers(): Observable<IUser[]> {
    return this.http.get<IUser[]>(
      `${this.base}/UserAPI/getUsers?accountId=${environment.accountId}`,
    );
  }

  getRoles(): Observable<IRole[]> {
    return this.http.get<IRole[]>(`${this.base}/UserAPI/getRoles`);
  }

  saveUser(user: Partial<IUser>): Observable<IResponseMsg> {
    return this.http.post<IResponseMsg>(`${this.base}/UserAPI/InsertUpdateUser`, user);
  }
}
