import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '@/shared/components/icon.component';

@Component({
  selector: 'app-trust-bar',
  standalone: true,
  imports: [CommonModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="bg-gray-100 py-8 border-b border-gray-200">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          
          <div class="flex flex-col md:flex-row items-center justify-center gap-3 text-center md:text-left group">
            <div class="p-3 bg-white rounded-full text-honey shadow-sm group-hover:scale-110 transition-transform duration-300">
              <app-icon name="truck"></app-icon>
            </div>
            <div>
              <h4 class="font-bold text-charcoal text-sm md:text-base">Giao hàng toàn quốc</h4>
              <p class="text-xs text-gray-500">Nhanh chóng & An toàn</p>
            </div>
          </div>

          <div class="flex flex-col md:flex-row items-center justify-center gap-3 text-center md:text-left group">
            <div class="p-3 bg-white rounded-full text-honey shadow-sm group-hover:scale-110 transition-transform duration-300">
              <app-icon name="refresh"></app-icon>
            </div>
            <div>
              <h4 class="font-bold text-charcoal text-sm md:text-base">Đổi trả 7 ngày</h4>
              <p class="text-xs text-gray-500">Thủ tục đơn giản</p>
            </div>
          </div>

          <div class="flex flex-col md:flex-row items-center justify-center gap-3 text-center md:text-left group">
            <div class="p-3 bg-white rounded-full text-honey shadow-sm group-hover:scale-110 transition-transform duration-300">
              <app-icon name="check-circle"></app-icon>
            </div>
            <div>
              <h4 class="font-bold text-charcoal text-sm md:text-base">Hàng chuẩn 100%</h4>
              <p class="text-xs text-gray-500">Cam kết chất lượng</p>
            </div>
          </div>

          <div class="flex flex-col md:flex-row items-center justify-center gap-3 text-center md:text-left group">
            <div class="p-3 bg-white rounded-full text-honey shadow-sm group-hover:scale-110 transition-transform duration-300">
              <app-icon name="credit-card"></app-icon>
            </div>
            <div>
              <h4 class="font-bold text-charcoal text-sm md:text-base">Thanh toán an toàn</h4>
              <p class="text-xs text-gray-500">Bảo mật tuyệt đối</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  `
})
export class TrustBarComponent {}
