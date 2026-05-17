import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import { apiErrorCodes } from '@/core/api-error-codes';
import { apiEndpoints } from '@/core/api/api-endpoints';
import type {
  AuthResultDto,
  AuthSession,
  ConfirmEmailResponseDto,
  LoginRequestDto,
  RegisterRequestDto
} from './auth.api.types';
import { mapAuthResultDto, readProblemDetailsCode, readProblemDetailsMessage } from './auth.mapper';

interface LoginFlowState {
  isSubmitting: boolean;
  errorMessage: string;
}

interface RegisterFlowState {
  isSubmitting: boolean;
  isRegistered: boolean;
  errorMessage: string;
}

interface ConfirmEmailFlowState {
  isLoading: boolean;
  isSuccess: boolean;
  message: string;
}

const createLoginFlowState = (): LoginFlowState => ({
  isSubmitting: false,
  errorMessage: ''
});

const createRegisterFlowState = (): RegisterFlowState => ({
  isSubmitting: false,
  isRegistered: false,
  errorMessage: ''
});

const createConfirmEmailFlowState = (): ConfirmEmailFlowState => ({
  isLoading: true,
  isSuccess: false,
  message: ''
});

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly currentUserSignal = signal<AuthSession | null>(null);
  private readonly isRestoringSignal = signal(false);
  private readonly loginStateSubject = new BehaviorSubject<LoginFlowState>(createLoginFlowState());
  private readonly registerStateSubject = new BehaviorSubject<RegisterFlowState>(createRegisterFlowState());
  private readonly confirmEmailStateSubject = new BehaviorSubject<ConfirmEmailFlowState>(createConfirmEmailFlowState());

  readonly currentUser = computed(() => this.currentUserSignal());
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);
  readonly isAdmin = computed(() => this.currentUserSignal()?.role === 'admin');
  readonly addresses = computed(() => this.currentUserSignal()?.addresses ?? []);
  readonly isRestoring = computed(() => this.isRestoringSignal());
  readonly loginState$ = this.loginStateSubject.asObservable();
  readonly registerState$ = this.registerStateSubject.asObservable();
  readonly confirmEmailState$ = this.confirmEmailStateSubject.asObservable();

  restoreSession(): void {
    const token = localStorage.getItem('token')?.trim();
    if (!token || this.isRestoringSignal()) {
      return;
    }

    this.isRestoringSignal.set(true);
    this.http.get<AuthResultDto['user']>(apiEndpoints.account.profile, {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Auth-Token': token
      }
    }).pipe(
      tap((user) => {
        if (this.readStoredToken() !== token) {
          return;
        }

        this.currentUserSignal.set({
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          createdAt: user.createdAt,
          addresses: user.addresses.map((address) => ({
            id: address.id,
            fullName: address.fullName,
            phone: address.phone,
            line1: address.line1,
            ward: address.ward,
            district: address.district,
            city: address.city,
            isDefault: address.isDefault
          })),
          role: user.role === 'admin' ? 'admin' : 'customer',
          token
        });
      }),
      catchError(() => {
        if (this.readStoredToken() === token) {
          this.logout();
        }

        return of(null);
      })
    ).subscribe({
      complete: () => this.isRestoringSignal.set(false)
    });
  }

  resetLoginFlow(): void {
    this.loginStateSubject.next(createLoginFlowState());
  }

  resetRegisterFlow(): void {
    this.registerStateSubject.next(createRegisterFlowState());
  }

  submitLogin(email: string, password: string): void {
    if (!email.trim() || !password) {
      return;
    }

    if (this.loginStateSubject.value.isSubmitting) {
      return;
    }

    const payload: LoginRequestDto = { email, password };

    this.loginStateSubject.next({
      isSubmitting: true,
      errorMessage: ''
    });

    this.http.post<AuthResultDto>(apiEndpoints.auth.login, payload).pipe(
      tap((result) => {
        const authSession = mapAuthResultDto(result);
        localStorage.setItem('token', authSession.token);
        this.currentUserSignal.set(authSession);
        this.loginStateSubject.next(createLoginFlowState());
        void this.router.navigate([authSession.role === 'admin' ? '/admin' : '/']);
      }),
      catchError((error) => {
        const code = readProblemDetailsCode(error);
        const message = code === apiErrorCodes.emailNotConfirmed
          ? 'Tai khoan chua xac nhan email.'
          : code === apiErrorCodes.invalidCredentials
            ? 'Sai email hoac mat khau.'
            : readProblemDetailsMessage(error, 'Sai email hoac mat khau.');

        this.loginStateSubject.next({
          isSubmitting: false,
          errorMessage: message
        });
        return of(null);
      })
    ).subscribe();
  }

  submitRegister(data: RegisterRequestDto): void {
    if (this.registerStateSubject.value.isSubmitting) {
      return;
    }

    this.registerStateSubject.next({
      isSubmitting: true,
      isRegistered: false,
      errorMessage: ''
    });

    this.http.post<AuthResultDto>(apiEndpoints.auth.register, data).pipe(
      tap(() => {
        this.registerStateSubject.next({
          isSubmitting: false,
          isRegistered: true,
          errorMessage: ''
        });
      }),
      catchError((error) => {
        const code = readProblemDetailsCode(error);
        const message = code === apiErrorCodes.emailAlreadyExists
          ? 'Email da ton tai trong he thong.'
          : readProblemDetailsMessage(error, 'Dang ky that bai.');

        this.registerStateSubject.next({
          isSubmitting: false,
          isRegistered: false,
          errorMessage: message
        });
        return of(null);
      })
    ).subscribe();
  }

  initializeConfirmEmailFlow(token: string | null): void {
    const normalizedToken = token?.trim() ?? '';

    if (!normalizedToken) {
      this.confirmEmailStateSubject.next({
        isLoading: false,
        isSuccess: false,
        message: 'Ma xac nhan khong hop le.'
      });
      return;
    }

    this.confirmEmailStateSubject.next({
      isLoading: true,
      isSuccess: false,
      message: ''
    });

    this.requestConfirmEmail(normalizedToken).subscribe((message) => {
      this.confirmEmailStateSubject.next({
        isLoading: false,
        isSuccess: this.isConfirmEmailSuccessMessage(message),
        message
      });
    });
  }

  logout(): void {
    this.currentUserSignal.set(null);
    localStorage.removeItem('token');
  }

  private requestConfirmEmail(token: string): Observable<string> {
    return this.http
      .get<ConfirmEmailResponseDto>(apiEndpoints.auth.confirmEmail, { params: { token } })
      .pipe(
        map((response) => response.message || 'Xac nhan email thanh cong.'),
        catchError((error) => {
          const code = readProblemDetailsCode(error);
          const message = code === apiErrorCodes.emailConfirmationTokenInvalid
            ? 'Token xac nhan email khong hop le hoac da het han.'
            : readProblemDetailsMessage(error, 'Loi xac nhan email.');

          return of(message);
        })
      );
  }

  private isConfirmEmailSuccessMessage(message: string): boolean {
    const normalizedMessage = message.trim().toLowerCase();
    return (
      !normalizedMessage.includes('loi') &&
      !normalizedMessage.includes('lỗi') &&
      !normalizedMessage.includes('khong hop le') &&
      !normalizedMessage.includes('không hợp lệ')
    );
  }

  private readStoredToken(): string {
    return localStorage.getItem('token')?.trim() ?? '';
  }
}
