import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MOCK_CATEGORY_PRODUCTS, MOCK_ORDERS, MOCK_USERS } from '@/core/mock-data/ecommerce.mock';
import { AdminDashboardSnapshot, AdminDataSource, AdminFeedbackItem } from './admin.data-source';

const MOCK_ADMIN_FEEDBACK: AdminFeedbackItem[] = [
  { 
    id: 1, 
    name: 'Linh Trần', 
    email: 'linh.tran@email.com',
    content: 'Cần thêm mẫu mới cho danh mục đèn trang trí.',
    createdAt: '2026-04-10T14:30:00Z'
  },
  { 
    id: 2, 
    name: 'Minh Khánh', 
    email: 'khanh.m@email.com',
    content: 'Website thanh toán rất nhanh và mượt.',
    createdAt: '2026-04-12T09:15:00Z'
  }
];

@Injectable({ providedIn: 'root' })
export class AdminMockDataSource implements AdminDataSource {
  loadSnapshot(): Observable<AdminDashboardSnapshot> {
    return of({
      products: MOCK_CATEGORY_PRODUCTS.map((product) => ({ ...product })),
      orders: MOCK_ORDERS.map((order) => ({
        ...order,
        items: order.items.map((item) => ({ ...item }))
      })),
      users: MOCK_USERS.map((user) => ({
        ...user,
        addresses: user.addresses.map((address) => ({ ...address }))
      })),
      feedback: MOCK_ADMIN_FEEDBACK.map((item) => ({ ...item }))
    });
  }

  replyToFeedback(feedbackId: number, content: string): Observable<AdminFeedbackItem> {
    const item = MOCK_ADMIN_FEEDBACK.find(f => f.id === feedbackId);
    if (item) {
      item.adminReply = content;
      item.repliedAt = new Date().toISOString();
      return of({ ...item });
    }
    throw new Error('Feedback not found');
  }
}
