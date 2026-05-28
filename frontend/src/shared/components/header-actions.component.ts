import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { IconComponent } from './icon.component';
import { WalletWidgetComponent } from './wallet-widget.component';

@Component({
  selector: 'app-header-actions',
  standalone: true,
  imports: [CommonModule, IconComponent, WalletWidgetComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center gap-3 flex-shrink-0 z-[101]">
      <!-- Wallet widget (shown only when authenticated, managed internally) -->
      <app-wallet-widget class="hidden sm:block" />

      <div class="relative hidden sm:block">
        <button
          type="button"
          (click)="toggleUserMenu.emit()"
          class="action-btn header-icon transition-all duration-300 hover:text-honey group-hover/header:text-[#333]"
          [ngClass]="solidStyle ? 'text-[#333]' : 'text-white'"
        >
          <app-icon name="user" class="w-6 h-6"></app-icon>
        </button>

        @if (userMenuOpen) {
          <div class="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[110] animate-dropdown origin-top-right">
            @if (isAuthenticated) {
              <div class="px-4 py-3 border-b border-gray-100 bg-cream">
                <p class="text-sm font-bold text-charcoal truncate">{{ currentUserName }}</p>
                <p class="text-xs text-gray-500">{{ currentUserEmail }}</p>
              </div>

              <a
                (click)="goToOrders.emit()"
                class="flex items-center gap-2 px-4 py-3 text-sm text-charcoal hover:bg-honey/10 hover:text-honey cursor-pointer transition-colors"
              >
                <app-icon name="shopping-bag" class="w-4 h-4"></app-icon>
                Theo dõi đơn
              </a>

              @if (isAdmin) {
                <a
                  (click)="goToAdmin.emit()"
                  class="flex items-center gap-2 px-4 py-3 text-sm text-charcoal hover:bg-honey/10 hover:text-honey cursor-pointer transition-colors"
                >
                  <app-icon name="grid" class="w-4 h-4"></app-icon>
                  Trang quản trị
                </a>
              }

              <button
                type="button"
                (click)="logout.emit()"
                class="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
              >
                <app-icon name="close" class="w-4 h-4"></app-icon>
                Đăng xuất
              </button>
            } @else {
              <a
                (click)="goToLogin.emit()"
                class="flex items-center gap-2 px-4 py-3 text-sm text-charcoal hover:bg-honey/10 hover:text-honey cursor-pointer transition-colors"
              >
                <app-icon name="user" class="w-4 h-4"></app-icon>
                Đăng nhập
              </a>
            }
          </div>
        }
      </div>

      <button
        type="button"
        (click)="openCart.emit()"
        class="action-btn header-icon relative transition-all duration-300 hover:text-honey group-hover/header:text-[#333]"
        [ngClass]="solidStyle ? 'text-[#333]' : 'text-white'"
      >
        <app-icon name="shopping-bag" class="w-6 h-6"></app-icon>
        @if (cartCount > 0) {
          <span class="cart-badge absolute -top-1.5 -right-1.5 w-5 h-5 bg-honey text-charcoal text-[10px] font-bold flex items-center justify-center rounded-full">
            {{ cartCount }}
          </span>
        }
      </button>

      <button
        type="button"
        class="xl:hidden action-btn header-icon transition-all duration-300 hover:text-honey group-hover/header:text-[#333]"
        [ngClass]="solidStyle ? 'text-[#333]' : 'text-white'"
      >
        <app-icon name="list" class="w-6 h-6"></app-icon>
      </button>
    </div>
  `,
  styles: [`
    .action-btn {
      position: relative;
      transition: color 0.3s, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .action-btn:hover {
      transform: scale(1.15);
    }

    .action-btn:active {
      transform: scale(0.92);
    }

    .cart-badge {
      animation: badgePop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-shadow: 0 2px 8px rgba(246, 195, 36, 0.4);
    }

    .animate-dropdown {
      animation: dropdownIn 0.35s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }

    @keyframes badgePop {
      0% { transform: scale(0); }
      60% { transform: scale(1.3); }
      100% { transform: scale(1); }
    }

    @keyframes dropdownIn {
      from { opacity: 0; transform: translateY(-8px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
  `]
})
export class HeaderActionsComponent {
  @Input({ required: true }) solidStyle = false;
  @Input({ required: true }) userMenuOpen = false;
  @Input({ required: true }) isAuthenticated = false;
  @Input({ required: true }) isAdmin = false;
  @Input({ required: true }) cartCount = 0;
  @Input() currentUserName: string | null = null;
  @Input() currentUserEmail: string | null = null;

  @Output() readonly toggleUserMenu = new EventEmitter<void>();
  @Output() readonly goToLogin = new EventEmitter<void>();
  @Output() readonly goToOrders = new EventEmitter<void>();
  @Output() readonly goToAdmin = new EventEmitter<void>();
  @Output() readonly logout = new EventEmitter<void>();
  @Output() readonly openCart = new EventEmitter<void>();
}
