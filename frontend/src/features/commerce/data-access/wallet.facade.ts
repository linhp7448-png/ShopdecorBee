import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { apiConfig } from '@/core/api/api.config';
import { apiEndpoints } from '@/core/api/api-endpoints';

export interface WalletDto {
  id: number;
  userId: number;
  balance: number;
  updatedAt: string;
}

export interface WalletTransactionDto {
  id: number;
  walletId: number;
  amount: number;
  type: string;
  status: string;
  reference: string | null;
  description: string | null;
  createdAt: string;
}

export type WalletOperationResult =
  | { kind: 'success'; wallet: WalletDto }
  | { kind: 'error'; message: string };

export type WalletDepositUrlResult =
  | { kind: 'success'; paymentUrl: string; reference: string }
  | { kind: 'error'; message: string };

@Injectable({ providedIn: 'root' })
export class WalletFacade {
  private readonly http = inject(HttpClient);

  private readonly _wallet = signal<WalletDto | null>(null);
  private readonly _transactions = signal<WalletTransactionDto[]>([]);
  private readonly _loading = signal(false);

  readonly wallet = this._wallet.asReadonly();
  readonly balance = computed(() => this._wallet()?.balance ?? 0);
  readonly transactions = this._transactions.asReadonly();
  readonly isLoading = this._loading.asReadonly();

  loadWallet(): void {
    const token = this.readToken();
    if (!token) {
      this._wallet.set(null);
      return;
    }

    const headers = this.createAuthHeaders(token);
    this._loading.set(true);
    this.http.get<WalletDto>(apiEndpoints.wallet.get, { headers }).pipe(
      catchError(() => of(null))
    ).subscribe((wallet) => {
      this._wallet.set(wallet);
      this._loading.set(false);
    });
  }

  loadTransactions(): void {
    const token = this.readToken();
    if (!token) return;
    const headers = this.createAuthHeaders(token);
    this.http.get<WalletTransactionDto[]>(apiEndpoints.wallet.transactions, { headers }).pipe(
      catchError(() => of([]))
    ).subscribe((txs) => this._transactions.set(txs));
  }

  deposit(amount: number): Observable<WalletOperationResult> {
    const token = this.readToken();
    if (!token) return of({ kind: 'error', message: 'Vui lòng đăng nhập trước.' });

    const headers = this.createAuthHeaders(token);
    return this.http.post<WalletDto>(apiEndpoints.wallet.deposit, { amount }, { headers }).pipe(
      tap((wallet) => this._wallet.set(wallet)),
      map((wallet) => ({ kind: 'success' as const, wallet })),
      catchError((error) => of({ kind: 'error' as const, message: this.readErrorMessage(error, 'Nạp tiền thất bại.') }))
    );
  }

  getDepositVnpayUrl(amount: number): Observable<WalletDepositUrlResult> {
    const token = this.readToken();
    if (!token) return of({ kind: 'error', message: 'Vui lòng đăng nhập trước.' });

    const headers = this.createAuthHeaders(token);
    return this.http.post<{ reference: string; paymentUrl: string }>(apiEndpoints.wallet.depositVnpayUrl, { amount }, { headers }).pipe(
      map((res) => ({ kind: 'success' as const, paymentUrl: res.paymentUrl, reference: res.reference })),
      catchError((error) => of({ kind: 'error' as const, message: this.readErrorMessage(error, 'Không thể tạo liên kết thanh toán VNPay.') }))
    );
  }

  withdraw(amount: number): Observable<WalletOperationResult> {
    const token = this.readToken();
    if (!token) return of({ kind: 'error', message: 'Vui lòng đăng nhập trước.' });

    const headers = this.createAuthHeaders(token);
    return this.http.post<WalletDto>(apiEndpoints.wallet.withdraw, { amount }, { headers }).pipe(
      tap((wallet) => this._wallet.set(wallet)),
      map((wallet) => ({ kind: 'success' as const, wallet })),
      catchError((error) => of({ kind: 'error' as const, message: this.readErrorMessage(error, 'Rút tiền thất bại.') }))
    );
  }

  payOrder(orderId: number): Observable<WalletOperationResult> {
    const token = this.readToken();
    if (!token) return of({ kind: 'error', message: 'Vui lòng đăng nhập trước.' });

    const headers = this.createAuthHeaders(token);
    return this.http.post<WalletDto>(apiEndpoints.wallet.pay, { orderId }, { headers }).pipe(
      tap((wallet) => this._wallet.set(wallet)),
      map((wallet) => ({ kind: 'success' as const, wallet })),
      catchError((error) => of({ kind: 'error' as const, message: this.readErrorMessage(error, 'Thanh toán bằng ví thất bại.') }))
    );
  }

  clearWallet(): void {
    this._wallet.set(null);
    this._transactions.set([]);
  }

  private readToken(): string {
    return localStorage.getItem('token')?.trim() ?? '';
  }

  private createAuthHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      [apiConfig.authorizationHeader]: `${apiConfig.bearerPrefix}${token}`,
      [apiConfig.authTokenHeader]: token
    });
  }

  private readErrorMessage(error: unknown, fallback: string): string {
    if (!error || typeof error !== 'object' || !('error' in error)) return fallback;
    const payload = (error as { error?: unknown }).error;
    if (!payload || typeof payload !== 'object') return fallback;
    const d = payload as { detail?: string; message?: string; title?: string };
    return d.detail?.trim() || d.message?.trim() || d.title?.trim() || fallback;
  }
}
