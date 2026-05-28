import { InjectionToken, inject } from '@angular/core';
import { Observable } from 'rxjs';
import type { Order, Product, User } from '@/core/models';
import { AdminMockDataSource } from './admin.mock-data-source';

export interface AdminFeedbackItem {
  id: number;
  name: string;
  email: string;
  content: string;
  createdAt: string;
  adminReply?: string;
  repliedAt?: string;
}

export interface AdminDashboardSnapshot {
  products: Product[];
  orders: Order[];
  users: User[];
  feedback: AdminFeedbackItem[];
}

export interface AdminDataSource {
  loadSnapshot(): Observable<AdminDashboardSnapshot>;
  replyToFeedback(feedbackId: number, content: string): Observable<AdminFeedbackItem>;
}

export const ADMIN_DATA_SOURCE = new InjectionToken<AdminDataSource>('ADMIN_DATA_SOURCE', {
  providedIn: 'root',
  factory: () => inject(AdminMockDataSource)
});
