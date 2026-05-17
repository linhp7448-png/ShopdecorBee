import { Component, ChangeDetectionStrategy, effect, inject, untracked, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from '@/shared/components/header.component';
import { FooterComponent } from '@/shared/components/footer.component';
import { FloatingActionsComponent } from '@/shared/components/floating-actions.component';
import { AuthFacade } from '@/features/auth/data-access/auth.facade';
import { CheckoutFacade } from '@/features/checkout/data-access/checkout.facade';
import { WalletFacade } from '@/features/commerce/data-access/wallet.facade';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    FloatingActionsComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html',
  styles: [`
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(100px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
    }
    :host ::ng-deep .animate-slideIn {
      animation: slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }
  `]
})
export class AppComponent {
  private readonly router = inject(Router);
  private readonly authFacade = inject(AuthFacade);
  private readonly checkoutFacade = inject(CheckoutFacade);
  private readonly walletFacade = inject(WalletFacade);
  private bootstrappedToken = '';

  readonly toastVisible = signal(false);
  readonly toastType = signal<'success' | 'error'>('success');
  readonly toastTitle = signal('');
  readonly toastMessage = signal('');

  constructor() {
    this.authFacade.restoreSession();
    this.handleWalletDepositReturn();

    effect(() => {
      const token = this.authFacade.currentUser()?.token ?? '';
      if (!token) {
        this.bootstrappedToken = '';
        return;
      }

      if (token === this.bootstrappedToken) {
        return;
      }

      this.bootstrappedToken = token;
      untracked(() => {
        this.checkoutFacade.bootstrapAuthenticatedState({ mergeGuestCart: true });
        // Load wallet immediately on login for faster display
        this.walletFacade.loadWallet();
      });
    });
  }

  isHomePage(): boolean {
    return this.router.url === '/' || this.router.url === '/home';
  }

  isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }

  dismissToast(): void {
    this.toastVisible.set(false);
  }

  private showToast(type: 'success' | 'error', title: string, message: string): void {
    this.toastType.set(type);
    this.toastTitle.set(title);
    this.toastMessage.set(message);
    this.toastVisible.set(true);

    setTimeout(() => this.toastVisible.set(false), 5000);
  }

  private handleWalletDepositReturn(): void {
    const params = new URLSearchParams(window.location.search);
    const walletDeposit = params.get('walletDeposit');
    if (!walletDeposit) return;

    const url = new URL(window.location.href);
    url.searchParams.delete('walletDeposit');
    url.searchParams.delete('txn');
    window.history.replaceState({}, '', url.pathname || '/');

    setTimeout(() => {
      if (walletDeposit === 'success') {
        this.walletFacade.loadWallet();
        this.showToast('success', 'Nạp tiền thành công!', 'Số dư ví đã được cập nhật. Bạn có thể sử dụng ví để thanh toán đơn hàng.');
      } else {
        this.showToast('error', 'Nạp tiền thất bại', 'Giao dịch không thành công. Vui lòng thử lại sau.');
      }
    }, 300);
  }
}
