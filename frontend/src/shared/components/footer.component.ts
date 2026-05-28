import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="bg-[#222222] text-gray-400 pt-16 pb-8">
      <div class="container mx-auto px-4">
        
        <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <!-- Brand -->
          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 bg-white rounded-full flex items-center justify-center text-charcoal font-bold">B</div>
              <span class="text-2xl font-bold text-white">BeeShop</span>
            </div>
            <p class="text-sm leading-relaxed">
              Mang đến những món đồ decor xinh xắn, chất lượng giúp bạn kiến tạo không gian sống mơ ước.
            </p>
            <div class="pt-4 text-sm">
              <p>Hotline: 1900 6688</p>
              <p>Email: hi@beeshop.vn</p>
              <p>Địa chỉ: 123 Tổ Ong, Hà Nội</p>
            </div>
          </div>

          <!-- Policy -->
          <div>
            <h3 class="text-white font-bold mb-6">Chính sách</h3>
            <ul class="space-y-3 text-sm">
              <li><a (click)="goToPolicy('privacy', $event)" href="#" class="hover:text-honey transition-colors cursor-pointer">Chính sách bảo mật</a></li>
              <li><a (click)="goToPolicy('shipping', $event)" href="#" class="hover:text-honey transition-colors cursor-pointer">Chính sách vận chuyển</a></li>
              <li><a (click)="goToPolicy('return', $event)" href="#" class="hover:text-honey transition-colors cursor-pointer">Chính sách đổi trả</a></li>
              <li><a (click)="goToPolicy('payment', $event)" href="#" class="hover:text-honey transition-colors cursor-pointer">Quy định thanh toán</a></li>
            </ul>
          </div>

          <!-- Guide -->
          <div>
            <h3 class="text-white font-bold mb-6">Hướng dẫn</h3>
            <ul class="space-y-3 text-sm">
              <li><a href="#" class="hover:text-honey transition-colors">Hướng dẫn mua hàng</a></li>
              <li><a href="#" class="hover:text-honey transition-colors">Kiểm tra đơn hàng</a></li>
              <li><a href="#" class="hover:text-honey transition-colors">Góc cảm hứng</a></li>
              <li><a href="#" class="hover:text-honey transition-colors">Câu hỏi thường gặp</a></li>
            </ul>
          </div>

          <!-- Newsletter -->
          <div>
             <h3 class="text-white font-bold mb-2">Đăng ký nhận tin</h3>
             <p class="text-xs mb-4">Nhận ngay voucher 10% cho đơn hàng đầu tiên!</p>
             <form class="flex flex-col gap-3">
               <input type="email" placeholder="Nhập email của bạn" class="w-full bg-transparent border border-gray-600 rounded px-4 py-2 text-white focus:border-honey focus:outline-none transition-colors">
               <button type="button" class="w-full bg-honey text-charcoal font-bold py-2 rounded hover:bg-white transition-colors">Đăng ký</button>
             </form>
          </div>

        </div>

        <div class="border-t border-gray-800 pt-8 text-center text-xs">
          &copy; 2026 BeeShop Decor. All rights reserved.
        </div>

      </div>
    </footer>
  `
})
export class FooterComponent {
  private router = inject(Router);

  goToPolicy(tab: string, event: Event) {
    event.preventDefault();
    this.router.navigate(['/policies'], { fragment: tab });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
