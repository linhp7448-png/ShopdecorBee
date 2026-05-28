import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { firstValueFrom, skip } from 'rxjs';
import { AuthFacade } from './auth.facade';
import { apiEndpoints } from '@/core/api/api-endpoints';

describe('AuthFacade', () => {
  let facade: AuthFacade;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    facade = TestBed.inject(AuthFacade);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('submits login, stores the session, and routes admins to /admin', async () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const loginStatePromise = firstValueFrom(facade.loginState$.pipe(skip(2)));

    facade.submitLogin('admin@example.com', 'secret');

    const request = httpMock.expectOne(apiEndpoints.auth.login);
    expect(request.request.method).toBe('POST');
    request.flush({
      token: 'token-admin',
      user: {
        id: 99,
        email: 'admin@example.com',
        fullName: 'Admin User',
        phone: '0900000000',
        role: 'admin',
        createdAt: '2026-04-10T00:00:00.000Z',
        addresses: []
      }
    });

    await expect(loginStatePromise).resolves.toEqual({
      isSubmitting: false,
      errorMessage: ''
    });
    expect(facade.currentUser()?.role).toBe('admin');
    expect(localStorage.getItem('token')).toBe('token-admin');
    expect(navigateSpy).toHaveBeenCalledWith(['/admin']);
  });

  it('marks register flow as successful after a successful registration', async () => {
    const registerStatePromise = firstValueFrom(facade.registerState$.pipe(skip(2)));

    facade.submitRegister({
      fullName: 'New User',
      email: 'new@example.com',
      phone: '0900000001',
      password: 'secret',
      role: 'customer'
    });

    const request = httpMock.expectOne(apiEndpoints.auth.register);
    expect(request.request.method).toBe('POST');
    request.flush({
      token: 'unused-token',
      user: {
        id: 100,
        email: 'new@example.com',
        fullName: 'New User',
        phone: '0900000001',
        role: 'customer',
        createdAt: '2026-04-10T00:00:00.000Z',
        addresses: []
      }
    });

    await expect(registerStatePromise).resolves.toEqual({
      isSubmitting: false,
      isRegistered: true,
      errorMessage: ''
    });
  });

  it('resolves confirm email locally when the token is missing', async () => {
    const statePromise = firstValueFrom(facade.confirmEmailState$.pipe(skip(1)));

    facade.initializeConfirmEmailFlow(null);

    await expect(statePromise).resolves.toEqual({
      isLoading: false,
      isSuccess: false,
      message: 'Ma xac nhan khong hop le.'
    });
  });
});
