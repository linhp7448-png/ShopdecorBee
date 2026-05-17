import { Injectable, computed, signal, inject, DestroyRef } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, tap } from 'rxjs';

interface FeedbackItem {
  feedbackId: number;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  adminReply?: string;
  repliedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class ContactFacade {
  private apiService = inject(ApiService);
  private destroyRef = inject(DestroyRef);
  private readonly feedbackSignal = signal<FeedbackItem[]>([]);

  readonly feedbackList = computed(() => this.feedbackSignal());

  constructor() {
    this.loadFeedbacks();
  }

  private loadFeedbacks(): void {
    this.apiService.getFeedbacks()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(list => this.feedbackSignal.set(list));
  }

  submitFeedback(name: string, email: string, message: string): Observable<any> {
    const newFeedback = { name, email, message, createdAt: new Date().toISOString() };
    return this.apiService.postFeedback(newFeedback)
      .pipe(
        tap(() => this.loadFeedbacks())
      );
  }
}
