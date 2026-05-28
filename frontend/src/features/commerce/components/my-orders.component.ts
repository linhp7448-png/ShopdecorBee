import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommerceStore } from '@/features/commerce/data-access/commerce.store';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="min-h-screen bg-[#FDFCF8] py-16 font-sans">
      <div class="container mx-auto px-4 max-w-5xl">
        <div class="flex justify-between items-end mb-10">
          <div>
            <h1 class="text-4xl font-black text-[#2D2D2D] tracking-tight">Đơn hàng của tôi</h1>
            <p class="text-[#888888] mt-2 font-medium">Theo dõi và quản lý các đơn hàng bạn đã đặt</p>
          </div>
          <a routerLink="/" class="text-sm font-bold text-[#2D2D2D] hover:text-[#FFC107] transition-colors flex items-center gap-2 group">
            <svg class="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Tiếp tục mua sắm
          </a>
        </div>

        <div class="space-y-6">
          @for (order of orders(); track order.id) {
            <div class="bg-white rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-[#F0F0EE] overflow-hidden hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-500 group">
              <div class="p-8">
                <div class="flex flex-wrap justify-between items-start gap-4 mb-8">
                  <div class="space-y-1">
                    <div class="flex items-center gap-3">
                      <span class="text-xs font-black text-[#FFC107] uppercase tracking-widest">Mã đơn hàng</span>
                      <h3 class="text-xl font-black text-[#2D2D2D]">#{{ order.orderNumber }}</h3>
                    </div>
                    <p class="text-sm text-[#888888] font-medium">Ngày đặt: {{ order.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
                  </div>
                  
                  <div class="flex flex-col items-end gap-2">
                    <span [ngClass]="getStatusClass(order.status)" class="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
                      {{ formatStatus(order.status) }}
                    </span>
                    <p class="text-2xl font-black text-[#2D2D2D]">{{ order.totalAmount | number:'1.0-0' }}đ</p>
                    @if (order.paymentStatus?.toLowerCase() === 'paid' && order.status?.toLowerCase() !== 'refund_requested' && order.status?.toLowerCase() !== 'refunded' && order.status?.toLowerCase() !== 'cancelled') {
                      <button (click)="requestRefund(order.id)" class="mt-2 text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Khiếu nại
                      </button>
                    }
                  </div>
                </div>

                <div class="border-t border-[#F0F0EE] pt-8">
                  <div class="grid md:grid-cols-2 gap-8">
                    <div class="space-y-4">
                      <h4 class="text-[10px] font-black text-[#888888] uppercase tracking-widest mb-4">Sản phẩm</h4>
                      @for (item of order.items; track item.id) {
                        <div class="flex items-center gap-4 group/item">
                          <div class="w-16 h-16 rounded-2xl overflow-hidden border border-[#F0F0EE] bg-[#F9F9F7] flex-shrink-0 group-hover:shadow-md transition-shadow">
                            <img [src]="item.productImage" class="w-full h-full object-cover">
                          </div>
                          <div class="flex-1 min-w-0">
                            <p class="font-bold text-[#2D2D2D] text-sm truncate group-hover/item:text-[#FFC107] transition-colors">{{ item.productName }}</p>
                            <p class="text-xs text-[#888888] font-medium">SL: {{ item.quantity }} × {{ item.unitPrice | number:'1.0-0' }}đ</p>
                          </div>
                          <div class="text-right">
                            <p class="font-black text-[#2D2D2D] text-sm">{{ item.lineTotal | number:'1.0-0' }}đ</p>
                          </div>
                        </div>
                      }
                    </div>

                    <div class="bg-[#FDFCF8] rounded-[1.5rem] p-6 border border-[#F0F0EE]">
                      <h4 class="text-[10px] font-black text-[#888888] uppercase tracking-widest mb-4">Thông tin nhận hàng</h4>
                      <div class="space-y-3">
                        <div class="flex items-center gap-3">
                          <div class="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                            <svg class="w-4 h-4 text-[#2D2D2D]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                          </div>
                          <p class="text-sm font-bold text-[#2D2D2D]">{{ order.fullName }}</p>
                        </div>
                        <div class="flex items-center gap-3">
                          <div class="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                            <svg class="w-4 h-4 text-[#2D2D2D]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                          </div>
                          <p class="text-sm font-bold text-[#2D2D2D]">{{ order.phone }}</p>
                        </div>
                        <div class="flex items-start gap-3">
                          <div class="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm mt-0.5">
                            <svg class="w-4 h-4 text-[#2D2D2D]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                          </div>
                          <p class="text-sm font-medium text-[#2D2D2D] leading-relaxed">{{ order.line1 }}, {{ order.ward }}, {{ order.district }}, {{ order.city }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          } @empty {
            <div class="text-center py-24 bg-white rounded-[3rem] border border-dashed border-[#E0E0E0]">
              <div class="w-24 h-24 bg-[#FDFCF8] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg class="w-12 h-12 text-[#E0E0E0]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
              </div>
              <h2 class="text-2xl font-black text-[#2D2D2D]">Bạn chưa có đơn hàng nào</h2>
              <p class="text-[#888888] mt-2 mb-8 font-medium">Hãy khám phá bộ sưu tập của chúng tôi và chọn cho mình những món đồ ưng ý nhé!</p>
              <button routerLink="/" class="bg-[#2D2D2D] text-white px-8 py-4 rounded-2xl font-black hover:bg-[#FFC107] hover:text-[#2D2D2D] transition-all duration-300 shadow-xl shadow-[#2D2D2D]/10">
                Khám phá ngay
              </button>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: []
})
export class MyOrdersComponent implements OnInit {
  private readonly commerceStore = inject(CommerceStore);
  private readonly orderService = inject(CommerceOrderService);
  
  readonly orders = this.commerceStore.orders;

  ngOnInit() {
    this.fetchOrders();
  }

  fetchOrders() {
    this.orderService.getMyOrders().subscribe({
      next: (orders) => {
        this.commerceStore.replaceOrders(orders as any);
      },
      error: (err) => console.error('Failed to fetch orders:', err)
    });
  }

  requestRefund(id: number) {
    if (confirm('Bạn có chắc chắn muốn khiếu nại đơn hàng này và yêu cầu hoàn tiền?')) {
      this.orderService.requestRefund(id).subscribe({
        next: (order) => {
          this.commerceStore.replaceOrder(order as any);
          alert('Đã gửi yêu cầu khiếu nại thành công!');
        },
        error: (err) => {
          console.error(err);
          alert(err.error?.detail || 'Không thể khiếu nại đơn hàng này.');
        }
      });
    }
  }

  formatStatus(status: string): string {
    switch (status) {
      case 'pending_payment': return 'Chờ thanh toán';
      case 'processing': return 'Đang xử lý';
      case 'shipped': return 'Đang giao hàng';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      case 'refund_requested': return 'Yêu cầu khiếu nại';
      case 'refunded': return 'Đã hoàn tiền';
      default: return status;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'completed': return 'bg-green-50 text-green-600';
      case 'cancelled': return 'bg-red-50 text-red-600';
      case 'shipped': return 'bg-blue-50 text-blue-600';
      case 'processing': return 'bg-orange-50 text-orange-600';
      case 'refund_requested': return 'bg-purple-50 text-purple-600';
      case 'refunded': return 'bg-gray-200 text-gray-800';
      default: return 'bg-gray-50 text-gray-600';
    }
  }
}
