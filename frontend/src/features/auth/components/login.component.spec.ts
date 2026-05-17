import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthFacade } from '@/features/auth/data-access/auth.facade';
import { CheckoutFacade } from '@/features/checkout/data-access/checkout.facade';

describe('LoginComponent', () => {
  let currentUser: { role: 'admin' | 'customer'; fullName: string } | null;

  const authFacade = {
    currentUser: vi.fn(() => currentUser),
    isAuthenticated: vi.fn(() => currentUser !== null),
    loginState$: of({ isSubmitting: false, errorMessage: '' }),
    submitLogin: vi.fn(),
    resetLoginFlow: vi.fn(),
    logout: vi.fn()
  };

  const checkoutFacade = {
    resetForGuest: vi.fn()
  };

  beforeEach(async () => {
    currentUser = null;
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: AuthFacade, useValue: authFacade },
        { provide: CheckoutFacade, useValue: checkoutFacade }
      ]
    }).compileComponents();
  });

  it('resets login flow on init and delegates submit to the auth facade', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();
    component.email = 'customer@example.com';
    component.password = 'secret';
    component.submitLogin();

    expect(authFacade.resetLoginFlow).toHaveBeenCalled();
    expect(authFacade.submitLogin).toHaveBeenCalledWith('customer@example.com', 'secret');
  });

  it('logs out and resets guest checkout state', () => {
    currentUser = { role: 'customer', fullName: 'Customer User' };

    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();

    fixture.componentInstance.logout();

    expect(authFacade.logout).toHaveBeenCalled();
    expect(checkoutFacade.resetForGuest).toHaveBeenCalled();
  });
});
