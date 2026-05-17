import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserView {
  userId: number;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  createdAt: string;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminUserService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5020/api/users';

  getUsers(): Observable<UserView[]> {
    return this.http.get<UserView[]>(this.baseUrl);
  }

  updateUserRole(userId: number, role: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${userId}/role`, { role });
  }

  toggleUserStatus(userId: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${userId}/status`, {});
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${userId}`);
  }
}
