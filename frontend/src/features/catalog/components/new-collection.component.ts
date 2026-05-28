import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogFacade } from '@/features/catalog/data-access/catalog.facade';
import { IconComponent } from '@/shared/components/icon.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-new-collection',
  standalone: true,
  imports: [CommonModule, IconComponent, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white min-h-screen">
      
      <!-- 1. Hero Banner: Video Loop -->
      <section class="relative h-[80vh] w-full overflow-hidden">
        <!-- Using a video background or high quality GIF as placeholder for video -->
        <video 
          autoplay muted loop playsinline
          class="absolute inset-0 w-full h-full object-cover"
          poster="https://picsum.photos/id/366/1920/1080"
        >
          <source src="https://videos.pexels.com/video-files/3205626/3205626-uhd_2560_1440_25fps.mp4" type="video/mp4">
          Your browser does not support the video tag.
        </video>
        
        <!-- Overlay -->
        <div class="absolute inset-0 bg-black/30 flex items-center justify-center text-center">
          <div class="max-w-3xl px-6 animate-fade-in-up">
            <h1 class="text-4xl md:text-6xl font-extralight text-white font-serif mb-4 tracking-wide leading-tight">
              BST Tháng 10: <br/>
              <span class="font-bold">Chút Bình Yên Mới Về</span>
            </h1>
            <p class="text-white/90 text-lg md:text-xl font-light">
              Khám phá những trạm dừng chân tĩnh lặng cho tổ ấm của bạn. <br/> Hàng mới cập bến, số lượng giới hạn.
            </p>
          </div>
        </div>

        <!-- Scroll Indicator -->
        <div class="absolute bottom-8 left-1/2 -translate-x-1/2 text-white animate-bounce">
           <app-icon name="chevron-down" class="w-8 h-8"></app-icon>
        </div>
      </section>

      <!-- 2. Curator's Note -->
      <section class="py-20 px-6 bg-white">
        <div class="max-w-2xl mx-auto text-center space-y-6">
          <div class="w-16 h-px bg-charcoal mx-auto"></div>
          <p class="text-xl md:text-2xl font-serif text-charcoal leading-relaxed italic text-gray-700">
            "Lần cập bến này, BeeShop chọn những chất liệu thô mộc như gốm, gỗ và vải linen. Mong rằng chúng sẽ giúp góc nhỏ của bạn thêm phần ấm áp sau những ngày dài tất bật..."
          </p>
          <div class="flex items-center justify-center gap-2">
             <div class="w-8 h-8 bg-honey rounded-full flex items-center justify-center text-white font-bold text-xs">B</div>
             <span class="font-bold text-sm text-charcoal tracking-widest uppercase">BeeShop Team</span>
          </div>
        </div>
      </section>

      <!-- 3. Tạp chí Không gian (Lookbook) -->
      <section class="py-12 bg-cream/30">
        <div class="container mx-auto px-4">
          @for (look of catalogFacade.lookbookItems(); track look.id) {
            <div class="flex flex-col lg:flex-row gap-8 lg:items-center mb-24 last:mb-0">
              
              <!-- Text & Product (Left on Desktop) -->
              <div class="lg:w-1/3 space-y-8 order-2 lg:order-1">
                <div>
                  <h3 class="text-3xl font-serif font-bold text-charcoal mb-2">{{ look.name }}</h3>
                  <p class="text-gray-600 leading-relaxed">{{ look.description }}</p>
                </div>
                
                <!-- Extract Products from Hotspots for display -->
                <div class="space-y-4">
                  @for (spot of look.hotspots; track spot.id) {
                    <div class="flex items-center gap-4 group cursor-pointer" [routerLink]="['/product', spot.product.id]">
                      <img [src]="spot.product.image" (error)="handleImageError($event)" class="w-20 h-24 object-cover shadow-sm">
                      <div>
                        <h4 class="font-bold text-charcoal group-hover:text-honey transition-colors">{{ spot.product.name }}</h4>
                        <p class="text-honey font-semibold">{{ spot.product.price | currency:'VND':'symbol':'1.0-0' }}</p>
                        <button (click)="catalogFacade.addToCart(spot.product.id); $event.stopPropagation()" class="text-xs underline mt-1 text-gray-500 hover:text-charcoal">Thêm vào giỏ</button>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- Big Lifestyle Image (Right on Desktop) -->
              <div class="lg:w-2/3 relative order-1 lg:order-2 group">
                <img [src]="look.image" class="w-full h-auto object-cover shadow-2xl rounded-sm">
                
                <!-- Hotspots -->
                @for (spot of look.hotspots; track spot.id) {
                  <div 
                    class="absolute" 
                    [style.top.%]="spot.y" 
                    [style.left.%]="spot.x"
                  >
                    <div class="absolute -inset-4 bg-white/30 rounded-full animate-ping"></div>
                    <button 
                      (click)="toggleHotspot(spot.id)"
                      class="relative w-8 h-8 bg-white/90 backdrop-blur text-charcoal rounded-full shadow-lg flex items-center justify-center hover:bg-honey hover:text-white transition-colors z-10"
                    >
                      <app-icon name="plus" class="w-4 h-4"></app-icon>
                    </button>
                     <!-- Popover (clickable to go to product) -->
                    @if (activeHotspot() === spot.id) {
                       <div 
                         [routerLink]="['/product', spot.product.id]"
                         class="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-40 bg-white p-3 shadow-2xl z-20 animate-fade-in origin-bottom text-center cursor-pointer hover:bg-cream"
                       >
                          <h4 class="font-bold text-xs text-charcoal mb-1">{{ spot.product.name }}</h4>
                          <p class="text-honey text-xs font-bold">{{ spot.product.price | currency:'VND':'symbol':'1.0-0' }}</p>
                       </div>
                    }
                  </div>
                }
              </div>

            </div>
          }
        </div>
      </section>

      <!-- 4. Shopping Grid (Lưới Mua Sắm) -->
      <section class="py-20 bg-white">
        <div class="container mx-auto px-4">
          <h2 class="text-center text-3xl font-serif text-charcoal mb-12">Bộ Sưu Tập Mới</h2>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            @for (product of catalogFacade.newCollectionProducts(); track product.id) {
              <div 
                class="group relative"
                (mouseenter)="hoveredProduct.set(product.id)"
                (mouseleave)="hoveredProduct.set(null)"
              >
                <!-- Image/Video Container -->
                <div 
                  class="relative w-full aspect-[4/5] overflow-hidden bg-gray-100 cursor-pointer"
                  [routerLink]="['/product', product.id]"
                >
                  <!-- Static Image -->
                  <img 
                    [src]="product.image" 
                    (error)="handleImageError($event)"
                    class="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
                    [class.opacity-0]="hoveredProduct() === product.id && product.videoUrl"
                  >
                  
                  <!-- Video/Hover Image -->
                   @if (product.videoUrl) {
                      <video 
                        [src]="product.videoUrl"
                        [muted]="true"
                        [loop]="true"
                        [autoplay]="true"
                        class="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 opacity-0"
                        [class.opacity-100]="hoveredProduct() === product.id"
                      ></video>
                   } @else {
                      <img 
                        [src]="product.hoverImage" 
                        (error)="handleImageError($event)"
                        class="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      >
                   }

                  <!-- Just Arrived Tag (Animated) -->
                  <div class="absolute top-3 right-3 w-16 h-16 pointer-events-none">
                     <div class="w-full h-full border-2 border-honey rounded-full flex items-center justify-center animate-spin-slow bg-white/10 backdrop-blur-sm">
                        <svg viewBox="0 0 100 100" width="100%" height="100%">
                          <defs>
                            <path id="circle" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
                          </defs>
                          <text font-size="12" font-weight="bold" fill="#F6C324">
                            <textPath xlink:href="#circle">
                              JUST ARRIVED • JUST ARRIVED •
                            </textPath>
                          </text>
                        </svg>
                     </div>
                  </div>

                  <!-- Quick Add Slide Up -->
                  <div class="absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20">
                     <button (click)="catalogFacade.addToCart(product.id); $event.stopPropagation()" class="w-full bg-white text-charcoal font-bold py-3 hover:bg-honey hover:text-white transition-colors shadow-lg">
                       Thêm vào giỏ
                     </button>
                  </div>
                </div>

                <!-- Info -->
                <div class="mt-4 text-center cursor-pointer" [routerLink]="['/product', product.id]">
                  <h3 class="font-bold text-lg text-charcoal group-hover:text-honey transition-colors">{{ product.name | uppercase }}</h3>
                  <p class="text-gray-500 italic mb-1">{{ product.category }}</p>
                  <p class="text-charcoal font-semibold">{{ product.price | currency:'VND':'symbol':'1.0-0' }}</p>
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- 5. Trạm Cứu Nét (Best Sellers Carousel) -->
      <section class="py-16 bg-gray-50 border-t border-gray-200">
        <div class="container mx-auto px-4">
          <div class="flex justify-between items-end mb-8">
             <div>
               <h2 class="text-2xl font-bold text-charcoal mb-2">Trạm Cứu Nét</h2>
               <p class="text-gray-500 italic">Nếu bạn chưa tìm thấy chân ái, thử xem những món đồ ai cũng mê này nhé!</p>
             </div>
             <a href="#" class="hidden md:block text-sm font-bold text-charcoal border-b border-charcoal hover:text-honey hover:border-honey transition-colors">Xem tất cả Best Seller</a>
          </div>

          <!-- Simple Horizontal Scroll -->
          <div class="flex overflow-x-auto gap-6 pb-8 snap-x">
             @for (product of catalogFacade.categoryProducts(); track product.id) {
               @if (product.tag === 'Best Seller' || product.rating! >= 4.8) {
                 <div class="min-w-[280px] snap-center bg-white rounded shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow group">
                    <div class="relative w-full aspect-square mb-4 overflow-hidden rounded bg-gray-100">
                      <img [src]="product.image" (error)="handleImageError($event)" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
                      <div class="absolute top-2 left-2 bg-charcoal text-white text-[10px] font-bold px-2 py-1">BEST SELLER</div>
                    </div>
                    <h4 class="font-bold text-charcoal mb-1 truncate">{{ product.name }}</h4>
                    <div class="flex justify-between items-center">
                      <span class="text-honey font-bold">{{ product.price | currency:'VND':'symbol':'1.0-0' }}</span>
                      <div class="flex text-yellow-400 text-xs">
                         <app-icon name="star-filled" class="w-3 h-3"></app-icon>
                         <span class="ml-1 text-gray-400">({{product.reviews}})</span>
                      </div>
                    </div>
                 </div>
               }
             }
          </div>
        </div>
      </section>

    </div>
  `,
  styles: [`
    .animate-spin-slow {
      animation: spin 10s linear infinite;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .animate-fade-in-up {
      animation: fadeInUp 1s ease-out forwards;
      opacity: 0;
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.3s ease-out forwards;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translate(-50%, 10px); }
      to { opacity: 1; transform: translate(-50%, 0); }
    }
    /* Hide scrollbar for horizontal scroll */
    .snap-x::-webkit-scrollbar {
      display: none; 
    }
    .snap-x {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `]
})
export class NewCollectionComponent {
  catalogFacade = inject(CatalogFacade);

  activeHotspot = signal<number | null>(null);
  hoveredProduct = signal<number | null>(null);

  handleImageError(event: any) {
    event.target.src = 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop';
  }

  toggleHotspot(id: number) {
    if (this.activeHotspot() === id) {
      this.activeHotspot.set(null);
    } else {
      this.activeHotspot.set(id);
    }
  }
}
