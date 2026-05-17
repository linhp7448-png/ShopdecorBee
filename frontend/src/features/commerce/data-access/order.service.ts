import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderView } from '@/features/admin/data-access/admin-order.service';

export interface PlaceOrderInput {
  addressId?: number;
  fullName?: string;
  phone?: string;
  line1?: string;
  ward?: string;
  district?: string;
  city?: string;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class CommerceOrderService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5020/api/orders';

  getMyOrders(): Observable<OrderView[]> {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.get<OrderView[]>(this.baseUrl, { headers });
  }

  getOrderById(id: number): Observable<OrderView> {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.get<OrderView>(`${this.baseUrl}/${id}`, { headers });
  }

  placeOrder(input: PlaceOrderInput): Observable<OrderView> {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.post<OrderView>(this.baseUrl, input, { headers });
  }

  cancelOrder(id: number): Observable<OrderView> {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.post<OrderView>(`${this.baseUrl}/${id}/cancel`, {}, { headers });
  }

  requestRefund(id: number, reason: string): Observable<OrderView> {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.post<OrderView>(`${this.baseUrl}/${id}/request-refund`, { reason }, { headers });
  }
}
