import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthFacade } from '@/features/auth/data-access/auth.facade';
import { CheckoutFacade } from '@/features/checkout/data-access/checkout.facade';
import { CommerceOrderService } from '@/features/commerce/data-access/order.service';
import type { Order } from '@/core/models';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="min-h-[70vh] bg-cream py-12">
      <div class="container mx-auto px-4 max-w-5xl space-y-6">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold text-charcoal">Theo dõi đơn hàng</h1>
            <p class="text-sm text-gray-500 mt-2">Xem trạng thái thanh toán, địa chỉ giao hàng và thao tác với đơn chờ xử lý.</p>
          </div>
          <a routerLink="/checkout" class="text-sm font-semibold text-honey hover:underline">Quay lại thanh toán</a>
        </div>

        @if (!authFacade.isAuthenticated() && !authFacade.isRestoring()) {
          <div class="rounded-xl bg-white shadow p-6 text-center space-y-3">
            <p class="text-charcoal font-semibold">Bạn cần đăng nhập để xem lịch sử đơn hàng.</p>
            <a routerLink="/login" class="inline-flex items-center justify-center rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-white hover:bg-honey hover:text-charcoal">
              Đăng nhập
            </a>
          </div>
        } @else {
          @if (statusMessage()) {
            <div class="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{{ statusMessage() }}</div>
          }

          @if (errorMessage()) {
            <div class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ errorMessage() }}</div>
          }

          @if (isLoading()) {
            <div class="rounded-xl bg-white shadow p-6 text-sm text-gray-500">Đang tải đơn hàng...</div>
          } @else if (orders().length === 0) {
            <div class="rounded-xl bg-white shadow p-6 text-center space-y-3">
              <p class="text-charcoal font-semibold">Chưa có đơn hàng nào.</p>
              <a routerLink="/" class="inline-flex items-center justify-center rounded-full bg-honey px-5 py-3 text-sm font-semibold text-charcoal">
                Tiếp tục mua sắm
              </a>
            </div>
          } @else {
            <div class="space-y-4">
              @for (order of orders(); track order.id) {
                <article class="rounded-xl bg-white shadow p-5 space-y-4">
                  <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p class="text-xs uppercase tracking-[0.2em] text-gray-500">Đơn hàng</p>
                      <h2 class="text-xl font-bold text-charcoal mt-1">{{ order.orderCode }}</h2>
                      <p class="text-sm text-gray-500 mt-1">Đặt lúc {{ order.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
                    </div>

                    <div class="flex flex-wrap gap-2">
                      <span class="rounded-full px-3 py-1 text-xs font-semibold" [ngClass]="statusClass(order.status)">
                        {{ statusLabel(order.status) }}
                      </span>
                      <span class="rounded-full px-3 py-1 text-xs font-semibold" [ngClass]="paymentStatusClass(order.paymentStatus ?? 'pending')">
                        {{ paymentStatusLabel(order.paymentStatus ?? 'pending') }}
                      </span>
                    </div>
                  </div>

                  <div class="grid md:grid-cols-3 gap-3 text-sm">
                    <div class="rounded-lg border border-gray-100 bg-[#fcfbf8] p-3">
                      <p class="text-gray-500">Tổng tiền</p>
                      <p class="mt-1 font-bold text-charcoal">{{ order.totalAmount | currency:'VND':'symbol':'1.0-0' }}</p>
                    </div>
                    <div class="rounded-lg border border-gray-100 bg-[#fcfbf8] p-3">
                      <p class="text-gray-500">Người nhận</p>
                      <p class="mt-1 font-semibold text-charcoal">{{ order.fullName || '-' }}</p>
                    </div>
                    <div class="rounded-lg border border-gray-100 bg-[#fcfbf8] p-3">
                      <p class="text-gray-500">Điện thoại</p>
                      <p class="mt-1 font-semibold text-charcoal">{{ order.phone || '-' }}</p>
                    </div>
                  </div>

                  <div class="flex flex-wrap gap-3">
                    @if (canRetryVnPay(order)) {
                      <button
                        type="button"
                        class="rounded-full bg-honey px-4 py-2 text-sm font-semibold text-charcoal disabled:opacity-60"
                        [disabled]="isActionRunning()"
                        (click)="retryVnPay(order.id)">
                        Thanh toán VNPay
                      </button>
                    }

                    @if (canCancel(order)) {
                      <button
                        type="button"
                        class="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 disabled:opacity-60"
                        [disabled]="isActionRunning()"
                        (click)="cancelOrder(order.id)">
                        Huỷ đơn
                      </button>
                    }

                    @if (canRequestRefund(order)) {
                      <button
                        type="button"
                        class="rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-60"
                        [disabled]="isActionRunning()"
                        (click)="requestRefund(order.id)">
                        Khiếu nại/Trả hàng
                      </button>
                    }

                    <button
                      type="button"
                      class="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-charcoal"
                      (click)="toggleExpanded(order.id)">
                      {{ expandedOrderId() === order.id ? 'Ẩn chi tiết' : 'Xem chi tiết' }}
                    </button>
                  </div>

                  @if (expandedOrderId() === order.id) {
                    <div class="border-t border-gray-100 pt-4 space-y-4">
                      <div class="text-sm">
                        <p class="font-semibold text-charcoal">Địa chỉ giao hàng</p>
                        <p class="mt-1 text-gray-600">{{ formatOrderAddress(order) }}</p>
                        @if (order.notes || order['Notes']) {
                          <p class="mt-2 text-gray-500">Ghi chú: {{ order.notes || order['Notes'] }}</p>
                        }
                      </div>

                      <div class="space-y-2">
                        @for (item of order.items; track item.id) {
                          <div class="flex items-center justify-between rounded-lg border border-gray-100 p-3 text-sm">
                            <div>
                              <p class="font-semibold text-charcoal">{{ item.productName }}</p>
                              <p class="text-gray-500">SL {{ item.quantity }}</p>
                            </div>
                            <p class="font-bold text-charcoal">{{ (item.lineTotal ?? (item.unitPrice * item.quantity)) | currency:'VND':'symbol':'1.0-0' }}</p>
                          </div>
                        }
                      </div>
                    </div>
                  }
                </article>
              }
            </div>
          }
        }
      </div>

      <!-- Professional Refund Modal -->
      @if (showRefundModal()) {
        <div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-charcoal/60 backdrop-blur-sm transition-opacity" (click)="closeRefundModal()"></div>
          
          <!-- Modal Content -->
          <div class="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] bg-white shadow-2xl transition-all scale-100 animate-in fade-in zoom-in duration-300">
            <div class="p-8 md:p-12">
              <div class="mb-8 flex items-center justify-between">
                <div>
                  <h3 class="text-2xl font-black text-charcoal tracking-tight">Gửi khiếu nại</h3>
                  <p class="text-sm text-gray-400 font-medium mt-1">Vui lòng cung cấp lý do chi tiết để chúng tôi hỗ trợ tốt nhất</p>
                </div>
                <button (click)="closeRefundModal()" class="rounded-full p-2 text-gray-400 hover:bg-gray-100 transition-colors">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>

              <div class="space-y-6">
                  <label class="block text-xs font-black text-charcoal uppercase tracking-widest mb-3">Chọn lý do khiếu nại</label>
                  <div class="space-y-2 mb-4">
                    @for (reason of refundReasons(); track reason) {
                      <label class="flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all"
                             [ngClass]="selectedReason() === reason ? 'border-honey bg-honey/5' : 'border-gray-100 hover:border-gray-200'"
                             (click)="selectedReason.set(reason)">
                        <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                             [ngClass]="selectedReason() === reason ? 'border-honey' : 'border-gray-300'">
                          @if (selectedReason() === reason) {
                            <div class="w-2.5 h-2.5 rounded-full bg-honey animate-in zoom-in duration-200"></div>
                          }
                        </div>
                        <span class="text-sm font-bold text-charcoal">{{ reason }}</span>
                      </label>
                    }
                  </div>

                  @if (selectedReason() === 'Lý do khác') {
                    <textarea 
                      [(ngModel)]="otherRefundReason"
                      placeholder="Vui lòng mô tả chi tiết lý do của bạn..."
                      class="w-full h-32 rounded-[1.5rem] border-2 border-gray-100 bg-gray-50/50 p-5 text-sm font-medium focus:border-honey focus:bg-white focus:outline-none transition-all placeholder:text-gray-300 resize-none animate-in fade-in slide-in-from-top-2 duration-300"
                    ></textarea>
                  }
                </div>

                <div class="flex flex-col gap-3">
                  <button 
                    (click)="submitRefundRequest()"
                    [disabled]="isActionRunning() || !selectedReason() || (selectedReason() === 'Lý do khác' && !otherRefundReason().trim())"
                    class="w-full flex items-center justify-center gap-2 rounded-2xl bg-charcoal py-4 text-sm font-black text-white hover:bg-honey hover:text-charcoal transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-charcoal/10"
                  >
                    @if (isActionRunning()) {
                      <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    }
                    Xác nhận gửi yêu cầu
                  </button>
                  <button (click)="closeRefundModal()" class="w-full py-2 text-xs font-bold text-gray-400 hover:text-charcoal transition-colors uppercase tracking-widest">Bỏ qua</button>
                </div>
            </div>
          </div>
        </div>
      }

      <!-- Professional Toast Notifications -->
      <div class="fixed bottom-8 right-8 z-[110] flex flex-col gap-3">
        @if (toast()) {
          <div [ngClass]="toast()?.type === 'success' ? 'bg-green-600' : 'bg-red-600'" 
               class="flex items-center gap-3 px-6 py-4 rounded-2xl text-white shadow-2xl animate-in slide-in-from-right-full duration-500">
            @if (toast()?.type === 'success') {
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            } @else {
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            }
            <p class="text-sm font-black">{{ toast()?.message }}</p>
            <button (click)="hideToast()" class="ml-2 hover:opacity-70 transition-opacity">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        }
      </div>
    </section>
  `
})
export class OrdersComponent implements OnInit {
  readonly authFacade = inject(AuthFacade);
  private readonly checkoutFacade = inject(CheckoutFacade);
  private readonly orderService = inject(CommerceOrderService);
  private readonly route = inject(ActivatedRoute);

  readonly orders = computed(() => this.checkoutFacade.orders());
  readonly expandedOrderId = signal<number | null>(null);
  readonly isLoading = signal(false);
  readonly isActionRunning = signal(false);
  readonly statusMessage = signal('');
  readonly errorMessage = signal('');

  // Refund Modal State
  readonly showRefundModal = signal(false);
  readonly selectedOrderId = signal<number | null>(null);
  readonly selectedReason = signal('');
  readonly otherRefundReason = signal('');
  readonly refundReasons = signal([
    'Sản phẩm không giống mô tả',
    'Sản phẩm bị hư hỏng/vỡ khi vận chuyển',
    'Giao sai sản phẩm',
    'Sản phẩm hết hạn sử dụng/kém chất lượng',
    'Lý do khác'
  ]);

  // Professional Toast State
  readonly toast = signal<{ message: string, type: 'success' | 'error' } | null>(null);
  private toastTimeout: any;

  ngOnInit(): void {
    this.readCallbackMessage();
    if (this.authFacade.isAuthenticated() || this.authFacade.isRestoring() || !!localStorage.getItem('token')) {
      this.loadOrders();
    }
  }

  toggleExpanded(orderId: number): void {
    this.expandedOrderId.update((current) => current === orderId ? null : orderId);
  }

  retryVnPay(orderId: number): void {
    this.isActionRunning.set(true);
    this.errorMessage.set('');

    this.checkoutFacade.createVnPayUrl(orderId).subscribe({
      next: (result) => {
        this.isActionRunning.set(false);
        if (result.kind === 'redirect') {
          window.location.assign(result.redirectUrl);
          return;
        }

        if (result.kind === 'error') {
          this.errorMessage.set(result.message);
        }
      },
      error: () => {
        this.isActionRunning.set(false);
        this.errorMessage.set('Không tạo được liên kết VNPay.');
      }
    });
  }

  cancelOrder(orderId: number): void {
    this.isActionRunning.set(true);
    this.errorMessage.set('');
    this.statusMessage.set('');

    this.checkoutFacade.cancelOrder(orderId).subscribe({
      next: (result) => {
        this.isActionRunning.set(false);
        if (result.kind === 'success') {
          this.statusMessage.set(result.message);
          return;
        }

        if (result.kind === 'error') {
          this.errorMessage.set(result.message);
        }
      },
      error: () => {
        this.isActionRunning.set(false);
        this.errorMessage.set('Không thể huỷ đơn hàng lúc này.');
      }
    });
  }

  canCancel(order: Order): boolean {
    return order.status === 'pending' && order.paymentStatus === 'pending';
  }

  canRetryVnPay(order: Order): boolean {
    return order.status === 'pending' && order.paymentStatus === 'pending';
  }

  canRequestRefund(order: Order): boolean {
    const status = order.status?.toLowerCase();
    const paymentStatus = order.paymentStatus?.toLowerCase();
    
    // Only allow refund if paid and not already requested/refunded/cancelled
    return paymentStatus === 'paid' && 
           status !== 'refund_requested' && 
           status !== 'refunded' && 
           status !== 'cancelled';
  }

  requestRefund(orderId: number): void {
    this.selectedOrderId.set(orderId);
    this.selectedReason.set('');
    this.otherRefundReason.set('');
    this.showRefundModal.set(true);
  }

  closeRefundModal(): void {
    this.showRefundModal.set(false);
    this.selectedOrderId.set(null);
    this.selectedReason.set('');
    this.otherRefundReason.set('');
  }

  submitRefundRequest(): void {
    const orderId = this.selectedOrderId();
    const mainReason = this.selectedReason();
    const otherDetails = this.otherRefundReason().trim();

    if (!orderId || !mainReason) return;

    const finalReason = mainReason === 'Lý do khác' ? otherDetails : mainReason;
    if (!finalReason) return;

    this.isActionRunning.set(true);

    this.orderService.requestRefund(orderId, finalReason).subscribe({
      next: () => {
        this.isActionRunning.set(false);
        this.closeRefundModal();
        this.showToast('Gửi khiếu nại thành công! Admin sẽ phản hồi sớm nhất.', 'success');
        this.loadOrders();
      },
      error: (err) => {
        this.isActionRunning.set(false);
        this.showToast(err.error?.detail || 'Không thể gửi khiếu nại. Vui lòng thử lại.', 'error');
      }
    });
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.toast.set({ message, type });
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => this.hideToast(), 5000);
  }

  hideToast(): void {
    this.toast.set(null);
  }

  formatOrderAddress(order: Order): string {
    return [order.line1, order.ward, order.district, order.city].filter(Boolean).join(', ') || '-';
  }

  statusLabel(status: Order['status']): string {
    switch (status) {
      case 'processing':
        return 'Đang xử lý';
      case 'shipping':
        return 'Đang giao hàng';
      case 'completed':
        return 'Hoàn tất';
      case 'cancelled':
        return 'Đã huỷ';
      case 'refund_requested':
        return 'Yêu cầu khiếu nại';
      case 'refunded':
        return 'Đã hoàn tiền';
      default:
        return 'Chờ thanh toán';
    }
  }

  paymentStatusLabel(status: NonNullable<Order['paymentStatus']>): string {
    switch (status) {
      case 'paid':
        return 'Đã thanh toán';
      case 'failed':
        return 'Thanh toán lỗi';
      case 'cancelled':
        return 'Thanh toán huỷ';
      case 'refunded':
        return 'Đã hoàn tiền';
      default:
        return 'Chờ thanh toán';
    }
  }

  statusClass(status: Order['status']): string {
    switch (status) {
      case 'processing':
      case 'shipping':
        return 'bg-blue-50 text-blue-700';
      case 'completed':
        return 'bg-emerald-50 text-emerald-700';
      case 'cancelled':
        return 'bg-red-50 text-red-700';
      case 'refund_requested':
        return 'bg-purple-50 text-purple-700';
      case 'refunded':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-amber-50 text-amber-700';
    }
  }

  paymentStatusClass(status: NonNullable<Order['paymentStatus']>): string {
    switch (status) {
      case 'paid':
        return 'bg-emerald-50 text-emerald-700';
      case 'failed':
        return 'bg-red-50 text-red-700';
      case 'cancelled':
        return 'bg-gray-100 text-gray-700';
      case 'refunded':
        return 'bg-purple-50 text-purple-700';
      default:
        return 'bg-amber-50 text-amber-700';
    }
  }

  private loadOrders(): void {
    this.isLoading.set(true);
    this.checkoutFacade.refreshOrders().subscribe({
      next: (success) => {
        this.isLoading.set(false);
        if (!success) {
          this.errorMessage.set('Không tải được danh sách đơn hàng.');
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Không tải được danh sách đơn hàng.');
      }
    });
  }

  private readCallbackMessage(): void {
    const payment = this.route.snapshot.queryParamMap.get('payment');
    const orderNumber = this.route.snapshot.queryParamMap.get('orderNumber');

    if (payment === 'processed') {
      this.statusMessage.set('Đơn hàng đã được tạo và xử lý thanh toán thành công.');
      return;
    }

    if (payment === 'success') {
      this.statusMessage.set(orderNumber ? `Thanh toán VNPay thành công cho đơn ${orderNumber}.` : 'Thanh toán VNPay thành công.');
      return;
    }

    if (payment === 'failed') {
      this.errorMessage.set(orderNumber ? `Thanh toán VNPay không thành công cho đơn ${orderNumber}.` : 'Thanh toán VNPay không thành công.');
    }
  }
}
