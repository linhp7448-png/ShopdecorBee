import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  inject,
  signal
} from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WalletFacade } from '@/features/commerce/data-access/wallet.facade';
import { AuthFacade } from '@/features/auth/data-access/auth.facade';

type WalletTab = 'balance' | 'deposit' | 'withdraw' | 'history';

@Component({
  selector: 'app-wallet-widget',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isAuthenticated()) {
      <div class="relative" id="wallet-widget">
        <!-- Wallet trigger button -->
        <button
          id="wallet-toggle-btn"
          type="button"
          (click)="togglePanel()"
          class="wallet-btn flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold text-sm transition-all duration-300"
          [class]="solidStyle() ?
            'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100' :
            'bg-white/15 text-white border border-white/20 hover:bg-white/25'"
          [title]="'Ví: ' + (balance() | currency:'VND':'symbol':'1.0-0')"
        >
          <!-- Wallet icon -->
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="5" width="20" height="14" rx="2"/>
            <path d="M16 12h2"/>
            <path d="M2 10h20"/>
          </svg>
          <span class="hidden sm:inline font-bold tabular-nums">{{ balance() | currency:'VND':'symbol':'1.0-0' }}</span>
        </button>

        <!-- Dropdown panel -->
        @if (panelOpen()) {
          <div
            id="wallet-panel"
            class="wallet-panel absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[200] animate-wallet-down"
          >
            <!-- Header -->
            <div class="wallet-header px-5 py-4 bg-gradient-to-r from-amber-500 to-amber-400 text-white">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="5" width="20" height="14" rx="2"/>
                    <path d="M16 12h2"/>
                    <path d="M2 10h20"/>
                  </svg>
                  <span class="font-bold text-sm">Ví của tôi</span>
                </div>
                <button (click)="panelOpen.set(false)" class="text-white/70 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6 6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              <div class="mt-3">
                <p class="text-white/70 text-xs uppercase tracking-wider">Số dư hiện tại</p>
                <p class="text-2xl font-bold mt-0.5 tabular-nums">{{ balance() | currency:'VND':'symbol':'1.0-0' }}</p>
              </div>
            </div>

            <!-- Tabs -->
            <div class="flex border-b border-gray-100">
              @for (tab of tabs; track tab.id) {
                <button
                  [id]="'wallet-tab-' + tab.id"
                  (click)="activeTab.set(tab.id)"
                  class="flex-1 py-2.5 text-xs font-semibold transition-colors"
                  [class]="activeTab() === tab.id
                    ? 'text-amber-600 border-b-2 border-amber-500 bg-amber-50/50'
                    : 'text-gray-500 hover:text-gray-700'"
                >
                  {{ tab.label }}
                </button>
              }
            </div>

            <!-- Tab content -->
            <div class="p-5">
              <!-- Balance info tab -->
              @if (activeTab() === 'balance') {
                <div class="space-y-3">
                  <div class="bg-amber-50 rounded-xl p-4 text-center">
                    <p class="text-xs text-amber-700/70 mb-1">Bạn có thể dùng ví để thanh toán đơn hàng</p>
                    <p class="text-amber-800 font-semibold text-sm">Chọn "Thanh toán bằng ví" khi đặt hàng</p>
                  </div>
                  <button
                    (click)="activeTab.set('deposit')"
                    class="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
                  >
                    + Nạp tiền vào ví
                  </button>
                  <button
                    (click)="activeTab.set('withdraw')"
                    class="w-full bg-white border border-gray-200 hover:border-amber-300 text-gray-700 font-semibold py-2.5 rounded-xl text-sm transition-colors"
                  >
                    Rút tiền ra
                  </button>
                </div>
              }

              <!-- Deposit tab -->
              @if (activeTab() === 'deposit') {
                <div class="space-y-4">
                  <p class="text-sm text-gray-600">Nhập số tiền muốn nạp vào ví:</p>
                  <div class="grid grid-cols-3 gap-2">
                    @for (preset of depositPresets; track preset) {
                      <button
                        (click)="depositAmount = preset"
                        class="py-2 rounded-lg border text-xs font-bold transition-colors"
                        [class]="depositAmount === preset
                          ? 'bg-amber-500 text-white border-amber-500'
                          : 'border-gray-200 text-gray-700 hover:border-amber-300'"
                      >{{ preset | currency:'VND':'symbol':'1.0-0' }}</button>
                    }
                  </div>
                  <input
                    type="number"
                    [(ngModel)]="depositAmount"
                    placeholder="Hoặc nhập số tiền..."
                    min="1000"
                    class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  >
                  @if (opMessage()) {
                    <p class="text-xs rounded-lg px-3 py-2"
                       [class]="opSuccess() ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'">
                      {{ opMessage() }}
                    </p>
                  }
                  <button
                    (click)="doDeposit()"
                    [disabled]="isSubmitting()"
                    class="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
                  >
                    {{ isSubmitting() ? 'Đang xử lý...' : 'Nạp tiền' }}
                  </button>
                </div>
              }

              <!-- Withdraw tab -->
              @if (activeTab() === 'withdraw') {
                <div class="space-y-4">
                  <div class="bg-gray-50 rounded-xl p-3 flex justify-between items-center">
                    <span class="text-xs text-gray-500">Số dư khả dụng</span>
                    <span class="font-bold text-gray-800 text-sm">{{ balance() | currency:'VND':'symbol':'1.0-0' }}</span>
                  </div>
                  <p class="text-sm text-gray-600">Nhập số tiền muốn rút:</p>
                  <input
                    type="number"
                    [(ngModel)]="withdrawAmount"
                    placeholder="Số tiền rút..."
                    min="1000"
                    [max]="balance()"
                    class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  >
                  @if (opMessage()) {
                    <p class="text-xs rounded-lg px-3 py-2"
                       [class]="opSuccess() ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'">
                      {{ opMessage() }}
                    </p>
                  }
                  <button
                    (click)="doWithdraw()"
                    [disabled]="isSubmitting() || balance() <= 0"
                    class="w-full bg-gray-700 hover:bg-gray-800 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
                  >
                    {{ isSubmitting() ? 'Đang xử lý...' : 'Rút tiền' }}
                  </button>
                </div>
              }

              <!-- History tab -->
              @if (activeTab() === 'history') {
                <div class="space-y-2 max-h-56 overflow-y-auto pr-1">
                  @if (walletFacade.transactions().length === 0) {
                    <p class="text-sm text-gray-400 text-center py-4">Chưa có giao dịch nào</p>
                  } @else {
                    @for (tx of walletFacade.transactions(); track tx.id) {
                      <div class="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div>
                          <p class="text-xs font-semibold text-gray-700">{{ txLabel(tx.type) }}</p>
                          <p class="text-[11px] text-gray-400">{{ tx.createdAt | date:'dd/MM/yy HH:mm' }}</p>
                          @if (tx.reference) {
                            <p class="text-[10px] text-gray-400">{{ tx.reference }}</p>
                          }
                        </div>
                        <span class="text-sm font-bold tabular-nums"
                              [class]="tx.type === 'Payment' || tx.type === 'Withdraw' ? 'text-red-500' : 'text-green-600'">
                          {{ tx.type === 'Payment' || tx.type === 'Withdraw' ? '-' : '+' }}{{ tx.amount | currency:'VND':'symbol':'1.0-0' }}
                        </span>
                      </div>
                    }
                  }
                </div>
              }
            </div>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .wallet-btn {
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .wallet-btn:active {
      transform: scale(0.95);
    }

    .animate-wallet-down {
      animation: walletDown 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }
    @keyframes walletDown {
      from { opacity: 0; transform: translateY(-10px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    .wallet-header {
      background: linear-gradient(135deg, #f59e0b 0%, #f6c90e 100%);
    }

    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
  `]
})
export class WalletWidgetComponent {
  readonly walletFacade = inject(WalletFacade);
  private readonly authFacade = inject(AuthFacade);

  readonly panelOpen = signal(false);
  readonly activeTab = signal<WalletTab>('balance');
  readonly isSubmitting = signal(false);
  readonly opMessage = signal('');
  readonly opSuccess = signal(false);
  readonly solidStyle = signal(true);

  readonly isAuthenticated = this.authFacade.isAuthenticated;
  readonly balance = this.walletFacade.balance;

  depositAmount: number | null = null;
  withdrawAmount: number | null = null;

  readonly tabs: Array<{ id: WalletTab; label: string }> = [
    { id: 'balance', label: 'Ví' },
    { id: 'deposit', label: 'Nạp' },
    { id: 'withdraw', label: 'Rút' },
    { id: 'history', label: 'Lịch sử' }
  ];

  readonly depositPresets = [50000, 100000, 200000, 500000, 1000000, 2000000];

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('#wallet-widget')) {
      this.panelOpen.set(false);
    }
  }

  togglePanel() {
    const willOpen = !this.panelOpen();
    this.panelOpen.set(willOpen);
    if (willOpen) {
      this.opMessage.set('');
      this.walletFacade.loadWallet();
      this.walletFacade.loadTransactions();
    }
  }

  doDeposit() {
    const amount = Number(this.depositAmount);
    if (!amount || amount < 1000) {
      this.showMessage('Số tiền nạp tối thiểu là 1.000 VND.', false);
      return;
    }

    this.isSubmitting.set(true);
    this.opMessage.set('');
    this.walletFacade.getDepositVnpayUrl(amount).subscribe((result) => {
      this.isSubmitting.set(false);
      if (result.kind === 'success') {
        // Redirect to VNPay payment page
        window.location.href = result.paymentUrl;
      } else {
        this.showMessage(result.message, false);
      }
    });
  }

  doWithdraw() {
    const amount = Number(this.withdrawAmount);
    if (!amount || amount < 1000) {
      this.showMessage('Số tiền rút tối thiểu là 1.000 VND.', false);
      return;
    }

    if (amount > this.balance()) {
      this.showMessage('Số dư không đủ.', false);
      return;
    }

    this.isSubmitting.set(true);
    this.opMessage.set('');
    this.walletFacade.withdraw(amount).subscribe((result) => {
      this.isSubmitting.set(false);
      if (result.kind === 'success') {
        this.withdrawAmount = null;
        this.showMessage(`Rút ${amount.toLocaleString('vi-VN')}₫ thành công!`, true);
      } else {
        this.showMessage(result.message, false);
      }
    });
  }

  txLabel(type: string): string {
    const map: Record<string, string> = {
      Deposit: 'Nạp tiền',
      Withdraw: 'Rút tiền',
      Payment: 'Thanh toán đơn hàng',
      Refund: 'Hoàn tiền'
    };
    return map[type] ?? type;
  }

  private showMessage(msg: string, success: boolean) {
    this.opSuccess.set(success);
    this.opMessage.set(msg);
  }
}
