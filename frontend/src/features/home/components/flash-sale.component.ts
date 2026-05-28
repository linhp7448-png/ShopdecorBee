import { Component, ChangeDetectionStrategy, inject, signal, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HomeFacade } from '@/features/home/data-access/home.facade';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-flash-sale',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="py-14 bg-gradient-to-br from-slate-900 via-slate-800 to-black relative overflow-hidden">
      <!-- Background Decorations -->
      <div class="absolute top-0 left-0 w-64 h-64 bg-honey-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div class="absolute bottom-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

      <div class="container mx-auto px-4 relative z-10">
        
        <!-- Header & Timer -->
        <div class="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
          <div class="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-2xl backdrop-blur-sm border border-white/10">
            <h2 class="text-3xl md:text-4xl font-extrabold text-white flex items-center gap-3 drop-shadow-md">
              <span class="text-yellow-400 animate-pulse">⚡</span>
              <span class="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Flash Sale</span>
            </h2>
            <div class="hidden md:block h-8 w-px bg-white/20 mx-2"></div>
            <p class="text-slate-300 italic hidden md:block font-medium">Deal xịn giá hời</p>
          </div>

          <!-- Countdown (Glassmorphism) -->
          <div class="flex items-center gap-3">
            <span class="text-slate-300 text-sm uppercase tracking-[0.2em] font-bold">Kết thúc sau</span>
            <div class="flex items-center gap-2 text-yellow-400 font-mono text-xl md:text-2xl font-bold">
              <div class="bg-white/10 backdrop-blur-md px-3 py-2 rounded-lg border border-white/20 shadow-[0_0_15px_rgba(250,204,21,0.2)] w-12 text-center">{{ hours() }}</div>
              <span class="animate-pulse">:</span>
              <div class="bg-white/10 backdrop-blur-md px-3 py-2 rounded-lg border border-white/20 shadow-[0_0_15px_rgba(250,204,21,0.2)] w-12 text-center">{{ minutes() }}</div>
              <span class="animate-pulse">:</span>
              <div class="bg-white/10 backdrop-blur-md px-3 py-2 rounded-lg border border-white/20 shadow-[0_0_15px_rgba(250,204,21,0.2)] w-12 text-center">{{ seconds() }}</div>
            </div>
          </div>
        </div>

        <!-- Products Slider Area (Grid) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          @for (product of homeFacade.flashSaleProducts(); track product.id) {
            <div 
              [routerLink]="['/product', product.id]"
              class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group cursor-pointer"
            >
              <!-- Image -->
              <div class="relative aspect-square overflow-hidden">
                 <img [src]="product.image" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                 <div class="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                   -{{ calculateDiscount(product.price, product.originalPrice!) }}%
                 </div>
              </div>

              <!-- Product Info -->
              <div class="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 class="text-slate-800 font-bold mb-2 line-clamp-2 leading-tight group-hover:text-red-600 transition-colors">{{ product.name | uppercase }}</h3>
                  
                  <!-- Prices -->
                  <div class="flex items-end gap-2 mb-4 flex-wrap">
                    <span class="text-red-600 font-extrabold text-2xl tracking-tight">{{ product.price | currency:'VND':'symbol':'1.0-0' }}</span>
                    <span class="text-slate-400 text-sm line-through font-medium mb-1">{{ product.originalPrice | currency:'VND':'symbol':'1.0-0' }}</span>
                  </div>
                </div>

                <!-- Progress Bar Premium -->
                <div>
                  <div class="flex justify-between text-xs font-bold text-slate-500 mb-1">
                    <span class="flex items-center gap-1"><span class="text-red-500">🔥</span> Đã bán {{ product.soldPercentage }}%</span>
                    <span>Còn {{ product.stockLeft }}</span>
                  </div>
                  <div class="relative w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      class="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 relative overflow-hidden" 
                      [style.width.%]="product.soldPercentage"
                    >
                      <!-- Shimmer effect inside progress bar -->
                      <div class="absolute top-0 left-0 w-full h-full bg-white/30 skew-x-[-20deg] mix-blend-overlay animate-[shimmer_2s_infinite]"></div>
                    </div>
                  </div>
                </div>
                
              </div>
            </div>
          }
        </div>

      </div>
    </section>
  `,
  styles: [`
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(200%); }
    }
  `]
})
export class FlashSaleComponent implements OnInit, OnDestroy {
  homeFacade = inject(HomeFacade);

  hours = signal('02');
  minutes = signal('45');
  seconds = signal('30');

  private timer: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.startTimer();
    }
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  startTimer() {
    let duration = 3600 * 2 + 60 * 45 + 30; // 2h 45m 30s
    this.timer = setInterval(() => {
      duration--;
      if (duration < 0) duration = 3600 * 3; // Reset loop

      const h = Math.floor(duration / 3600);
      const m = Math.floor((duration % 3600) / 60);
      const s = duration % 60;

      this.hours.set(h.toString().padStart(2, '0'));
      this.minutes.set(m.toString().padStart(2, '0'));
      this.seconds.set(s.toString().padStart(2, '0'));
    }, 1000);
  }

  calculateDiscount(price: number, original: number): number {
    return Math.round(((original - price) / original) * 100);
  }
}
