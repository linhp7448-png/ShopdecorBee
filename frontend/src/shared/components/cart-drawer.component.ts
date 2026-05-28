import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { IconComponent } from './icon.component';

export interface CartDrawerItem {
  id: number;
  productId: number;
  name: string;
  image?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  isSelected?: boolean;
}

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-[140]">
      <button
        type="button"
        class="absolute inset-0 bg-charcoal/35 backdrop-blur-[2px]"
        aria-label="Đóng giỏ hàng"
        (click)="close.emit()"
      ></button>

      <aside
        class="cart-drawer-panel absolute right-0 top-0 flex h-full w-full max-w-full flex-col border-l border-black/5 bg-white shadow-2xl sm:w-[28rem] xl:w-[33vw]"
        aria-label="Giỏ hàng"
      >
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-gray-100 px-5 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Giỏ hàng của bạn</p>
            <h2 class="mt-1 text-xl font-bold text-charcoal">
              {{ items.length }} sản phẩm
            </h2>
          </div>
          <button
            type="button"
            class="rounded-full border border-gray-200 p-2 text-gray-500 transition-all hover:bg-honey hover:text-white hover:border-honey"
            (click)="close.emit()"
          >
            <app-icon name="close" class="h-5 w-5"></app-icon>
          </button>
        </div>

        <!-- Selection Controls -->
        @if (items.length > 0) {
          <div class="px-5 py-3 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between text-sm">
            <label class="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                class="w-5 h-5 rounded border-gray-300 text-honey focus:ring-honey transition-all"
                [checked]="isAllSelected"
                (change)="toggleSelectAll.emit(!isAllSelected)"
              >
              <span class="font-semibold text-charcoal group-hover:text-honey transition-colors">Chọn tất cả</span>
            </label>
            <span class="text-gray-400">Đã chọn {{ selectedCount }}</span>
          </div>
        }

        <!-- Items List -->
        <div class="flex-1 overflow-y-auto px-5 py-5 custom-scrollbar">
          @if (items.length === 0) {
            <div class="flex h-full flex-col items-center justify-center text-center">
              <div class="rounded-full bg-cream p-6 text-honey animate-bounce">
                <app-icon name="shopping-bag" class="h-10 w-10"></app-icon>
              </div>
              <h3 class="mt-6 text-lg font-bold text-charcoal">Giỏ hàng đang trống</h3>
              <p class="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                Hãy lấp đầy giỏ hàng bằng những món đồ yêu thích của bạn!
              </p>
            </div>
          } @else {
            <div class="space-y-4">
              @for (item of items; track item.productId) {
                <div 
                  class="group relative rounded-2xl border transition-all duration-300 p-3 flex gap-4"
                  [class.border-honey]="item.isSelected"
                  [class.bg-honey/5]="item.isSelected"
                  [class.border-gray-100]="!item.isSelected"
                  [class.bg-white]="!item.isSelected"
                  [class.shadow-sm]="!item.isSelected"
                  [class.shadow-md]="item.isSelected"
                >
                  <!-- Checkbox -->
                  <div class="flex items-center">
                    <input 
                      type="checkbox" 
                      class="w-5 h-5 rounded border-gray-300 text-honey focus:ring-honey"
                      [checked]="item.isSelected"
                      (change)="toggleSelection.emit(item.productId)"
                    >
                  </div>

                  <!-- Product Image -->
                  <div class="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                    <img
                      [src]="item.image || '/assets/images/logo.png'"
                      [alt]="item.name"
                      class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      (error)="onImageError($event)"
                    >
                  </div>

                  <!-- Product Info -->
                  <div class="flex-grow min-w-0 py-1">
                    <h4 class="text-sm font-bold text-charcoal truncate pr-6">{{ item.name }}</h4>
                    <p class="text-xs text-gray-400 mt-1">Sản phẩm chất lượng cao</p>
                    <div class="mt-3 flex items-center justify-between">
                      <div class="flex items-center gap-3">
                        <span class="text-sm font-bold text-honey">{{ item.unitPrice | currency:'VND':'symbol':'1.0-0' }}</span>
                        <span class="text-xs text-gray-400">x {{ item.quantity }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex flex-col justify-between items-end">
                    <button 
                      type="button" 
                      class="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      (click)="remove.emit(item.productId)"
                      title="Gỡ bỏ"
                    >
                      <app-icon name="close" class="h-4 w-4"></app-icon>
                    </button>
                    <p class="text-sm font-bold text-charcoal">{{ item.lineTotal | currency:'VND':'symbol':'1.0-0' }}</p>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Summary -->
        <div class="border-t border-gray-100 bg-[#fcfbf8] px-5 py-6 shadow-[0_-12px_30px_rgba(15,23,42,0.06)]">
          <div class="space-y-3">
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-500">Tạm tính ({{ selectedCount }} món)</span>
              <span class="font-bold text-charcoal">{{ subtotal | currency:'VND':'symbol':'1.0-0' }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-500">Phí vận chuyển</span>
              <span class="font-bold text-charcoal">
                @if (subtotal === 0) {
                  -
                } @else if (shippingFee === 0) {
                  <span class="text-green-600">Miễn phí</span>
                } @else {
                  {{ shippingFee | currency:'VND':'symbol':'1.0-0' }}
                }
              </span>
            </div>
            <div class="pt-3 border-t border-dashed border-gray-200 flex items-center justify-between">
              <span class="text-base font-bold text-charcoal">Tổng thanh toán</span>
              <div class="text-right">
                <p class="text-xl font-black text-honey">{{ grandTotal | currency:'VND':'symbol':'1.0-0' }}</p>
                <p class="text-[10px] text-gray-400 italic">Đã bao gồm VAT</p>
              </div>
            </div>
          </div>

          <div class="mt-6 flex gap-3">
            <button
              type="button"
              class="flex-1 rounded-xl border border-gray-200 px-4 py-4 text-sm font-bold text-charcoal transition-all hover:bg-white hover:border-charcoal hover:shadow-md"
              (click)="close.emit()"
            >
              Tiếp tục mua
            </button>
            <button
              type="button"
              class="flex-[2] inline-flex items-center justify-center gap-2 rounded-xl bg-charcoal px-4 py-4 text-sm font-bold text-white transition-all hover:bg-honey hover:text-charcoal hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
              [disabled]="selectedCount === 0"
              (click)="checkout.emit()"
            >
              Thanh toán ngay
              <app-icon name="arrow-right" class="h-4 w-4"></app-icon>
            </button>
          </div>
        </div>
      </aside>
    </div>
  `,
  styles: [`
    .cart-drawer-panel {
      animation: cartDrawerIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes cartDrawerIn {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #e5e7eb;
      border-radius: 10px;
    }
  `]
})
export class CartDrawerComponent {
  @Input({ required: true }) items: CartDrawerItem[] = [];
  @Input({ required: true }) subtotal = 0;
  @Input({ required: true }) shippingFee = 0;
  @Input({ required: true }) grandTotal = 0;
  @Input({ required: true }) isAllSelected = false;
  @Input({ required: true }) selectedCount = 0;

  @Output() readonly close = new EventEmitter<void>();
  @Output() readonly checkout = new EventEmitter<void>();
  @Output() readonly remove = new EventEmitter<number>();
  @Output() readonly toggleSelection = new EventEmitter<number>();
  @Output() readonly toggleSelectAll = new EventEmitter<boolean>();

  onImageError(event: Event): void {
    const image = event.target as HTMLImageElement | null;
    if (!image || image.src.endsWith('/assets/images/logo.png')) {
      return;
    }

    image.src = '/assets/images/logo.png';
  }
}
