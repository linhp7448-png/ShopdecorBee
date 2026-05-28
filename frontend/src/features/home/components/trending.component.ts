import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeFacade } from '@/features/home/data-access/home.facade';
import { IconComponent } from '@/shared/components/icon.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-trending',
  standalone: true,
  imports: [CommonModule, IconComponent, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="py-16 bg-white">
      <div class="container mx-auto px-4">
        
        <!-- Header -->
        <div class="flex items-center justify-center gap-3 mb-10">
          <span class="text-honey">
            <app-icon name="crown"></app-icon>
          </span>
          <h2 class="text-3xl font-bold text-charcoal">Góc Tổ Ong</h2>
          <span class="text-honey">
            <app-icon name="crown"></app-icon>
          </span>
        </div>
 
        <!-- Grid -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          @for (product of homeFacade.trendingProducts(); track product.id) {
            <div class="group relative">
              
              <!-- Image Container -->
              <div class="relative w-full aspect-[4/5] bg-gray-50 rounded-lg overflow-hidden mb-3 cursor-pointer"
                   [routerLink]="['/product', product.id]">
                <!-- Main Image -->
                <img [src]="product.image" [alt]="product.name" class="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0">
                
                <!-- Hover Image -->
                <img [src]="product.hoverImage" [alt]="product.name" class="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100">

                <!-- Tags -->
                @if (product.tag) {
                  <div class="absolute top-2 left-2 bg-honey text-charcoal text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-sm z-10">
                    {{ product.tag }}
                  </div>
                }

                <!-- Add to Cart Slide Up (Hide on simple mobile) -->
                <div class="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20 hidden md:block"
                     (click)="$event.stopPropagation()">
                  <button (click)="homeFacade.addToCart(product.id)" class="w-full bg-charcoal text-white py-2 text-sm font-semibold rounded shadow-lg hover:bg-honey hover:text-charcoal transition-colors flex items-center justify-center gap-2">
                    <app-icon name="plus" class="w-4 h-4"></app-icon> Thêm
                  </button>
                </div>
              </div>

              <!-- Info -->
              <div class="space-y-1" [routerLink]="['/product', product.id]">
                <p class="text-[10px] text-gray-500 uppercase tracking-wide truncate">{{ product.category }}</p>
                <h3 class="text-sm md:text-lg font-semibold text-charcoal group-hover:text-honey transition-colors cursor-pointer line-clamp-1 capitalize">{{ product.name.toLowerCase() }}</h3>
                
                <div class="flex items-center gap-3 pt-0.5">
                  <p class="text-honey font-bold text-base md:text-lg">{{ product.price | currency:'VND':'symbol':'1.0-0' }}</p>
                  @if (product.originalPrice && product.originalPrice > product.price) {
                    <p class="text-gray-300 text-xs line-through font-medium">{{ product.originalPrice | currency:'VND':'symbol':'1.0-0' }}</p>
                  }
                </div>

                <div class="flex items-center gap-1 mt-1">
                  <app-icon name="star-filled" class="w-2.5 h-2.5 text-yellow-500 translate-y-[1.5px]"></app-icon>
                  <span class="text-[10px] md:text-[11px] text-gray-400 font-medium leading-none">
                    {{ product.rating || 4.5 }} • ({{ product.reviews || 0 }})
                  </span>
                </div>
              </div>

            </div>
          }
        </div>
        
        <div class="text-center mt-12">
            <a [routerLink]="['/search']" class="inline-flex items-center gap-2 text-charcoal font-bold border-b-2 border-honey pb-1 hover:text-honey transition-colors cursor-pointer">
                Xem tất cả sản phẩm
                <app-icon name="arrow-right"></app-icon>
            </a>
        </div>

      </div>
    </section>
  `
})
export class TrendingComponent {
  homeFacade = inject(HomeFacade);
}
