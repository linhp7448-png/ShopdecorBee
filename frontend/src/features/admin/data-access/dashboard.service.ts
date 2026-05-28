import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChartDataItem {
  date: string;
  revenue: number;
}

export interface DashboardStats {
  totalRevenue: number;
  revenueGrowthPercentage: number;
  newOrdersToday: number;
  pendingOrdersCount: number;
  newCustomersMonth: number;
  revenueChart: ChartDataItem[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5020/api/admin/dashboard';

  getStats(): Observable<DashboardStats> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`, { headers });
  }
}
