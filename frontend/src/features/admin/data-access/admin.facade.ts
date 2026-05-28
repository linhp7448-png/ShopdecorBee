import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ADMIN_DATA_SOURCE, type AdminDashboardSnapshot, type AdminFeedbackItem } from './admin.data-source';
import { AdminOrderService } from './admin-order.service';
import { mapOrderDto } from '@/features/commerce/data-access/commerce.mapper';
import type { OrderDto } from '@/features/commerce/data-access/commerce.api.types';
import type { Order } from '@/core/models';

const createEmptySnapshot = (): AdminDashboardSnapshot => ({
  products: [],
  orders: [],
  users: [],
  feedback: []
});

@Injectable({ providedIn: 'root' })
export class AdminFacade {
  private readonly dataSource = inject(ADMIN_DATA_SOURCE);
  private readonly adminOrderService = inject(AdminOrderService);
  private readonly snapshotSignal = signal<AdminDashboardSnapshot>(createEmptySnapshot());
  private readonly hasErrorSignal = signal(false);
  private readonly realOrdersSignal = signal<Order[]>([]);

  readonly products = computed(() => this.snapshotSignal().products);
  readonly orders = computed(() => this.realOrdersSignal().length > 0 ? this.realOrdersSignal() : this.snapshotSignal().orders);
  readonly users = computed(() => this.snapshotSignal().users);
  readonly feedback = computed(() => this.snapshotSignal().feedback);
  readonly hasError = computed(() => this.hasErrorSignal());

  readonly totalRevenue = computed(() => {
    return this.orders().reduce((sum, order) => sum + order.totalAmount, 0);
  });

  readonly pendingOrders = computed(() => {
    return this.orders().filter((order: any) => order.status?.toLowerCase() === 'pending' || order.status?.toLowerCase() === 'pendingpayment').length;
  });

  constructor() {
    this.loadSnapshot();
    this.loadRealOrders();
  }

  private loadSnapshot(): void {
    this.dataSource.loadSnapshot().subscribe({
      next: (snapshot) => {
        this.snapshotSignal.set(snapshot);
        this.hasErrorSignal.set(false);
      },
      error: () => {
        this.snapshotSignal.set(createEmptySnapshot());
        this.hasErrorSignal.set(true);
      }
    });
  }

  loadRealOrders(): void {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    this.adminOrderService.getOrders().subscribe({
      next: (orders) => {
        // Use standard mapper to ensure property names (like notes, orderCode) are correct
        this.realOrdersSignal.set((orders as any[]).map(o => mapOrderDto(o as OrderDto)));
      },
      error: (err) => {
        console.error('Failed to load real admin orders', err);
      }
    });
  }

  replyToFeedback(feedbackId: number, content: string): Observable<AdminFeedbackItem> {
    return this.dataSource.replyToFeedback(feedbackId, content).pipe(
      tap((updatedItem) => {
        // Update local state in snapshotSignal
        const current = this.snapshotSignal();
        const updatedList = current.feedback.map(f => 
          f.id === feedbackId ? updatedItem : f
        );
        this.snapshotSignal.set({ ...current, feedback: updatedList });
      })
    );
  }
}
