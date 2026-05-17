import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '@/core/models';
import { IconComponent } from '@/shared/components/icon.component';

import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-search-results-content',
  standalone: true,
  imports: [CommonModule, IconComponent, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isSearching) {
      <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        @for (_ of skeletonItems; track _) {
          <div class="bg-white rounded-lg p-3 animate-pulse">
            <div class="w-full aspect-[4/5] bg-gray-200 rounded mb-3"></div>
            <div class="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        }
      </div>
    } @else if (results.length === 0) {
      <div class="bg-white rounded-xl border border-gray-100 p-8">
        <h2 class="text-xl font-bold text-charcoal mb-2">Không có kết quả khớp</h2>
        <p class="text-gray-500 mb-6">Thử từ khóa khác hoặc xóa bớt bộ lọc để mở rộng kết quả.</p>
        <h3 class="font-bold text-charcoal mb-3">Gợi ý sản phẩm nổi bật</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (product of bestSellers; track product.id) {
            <div 
              class="border border-gray-100 rounded-lg p-3 bg-white hover:shadow-sm transition-shadow cursor-pointer"
              [routerLink]="['/product', product.id]"
            >
              <img [src]="product.image" class="w-full aspect-[4/5] object-cover rounded mb-2">
              <p class="text-xs text-gray-500 uppercase">{{ product.category }}</p>
              <h4 class="font-semibold text-charcoal truncate">{{ product.name | uppercase }}</h4>
              <div class="flex items-center justify-between mt-2">
                <span class="text-honey font-bold text-sm">{{ product.price | currency:'VND':'symbol':'1.0-0' }}</span>
                <button class="text-xs bg-honey text-charcoal rounded px-2 py-1 font-semibold" (click)="addToCartRequested.emit(product.id); $event.stopPropagation()">Thêm</button>
              </div>
            </div>
          }
        </div>
      </div>
    } @else {
      <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        @for (product of results; track product.id) {
          <article 
            [routerLink]="['/product', product.id]"
            class="group relative bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
          >
            <div class="relative w-full aspect-[4/5] overflow-hidden rounded-t-lg bg-gray-100">
              <img [src]="product.image" class="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0">
              <img [src]="product.hoverImage" class="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              @if ((product.originalPrice ?? 0) > product.price) {
                <span class="absolute top-2 left-2 text-[10px] font-bold px-2 py-1 rounded bg-red-500 text-white">SALE</span>
              }
              <button
                (click)="addToCartRequested.emit(product.id); $event.stopPropagation()"
                class="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-charcoal hover:bg-honey hover:text-white transition-colors"
              >
                <app-icon name="plus" class="w-5 h-5"></app-icon>
              </button>
            </div>
            <div class="p-4">
              <p class="text-[11px] text-gray-500 uppercase tracking-wide">{{ product.category }} · {{ product.brand ?? 'BeeShop' }}</p>
              <h3 class="font-bold text-charcoal truncate group-hover:text-honey transition-colors mb-1">{{ product.name | uppercase }}</h3>
              
              <div class="flex items-center gap-2 mb-2">
                <p class="text-honey font-bold text-lg">{{ product.price | currency:'VND':'symbol':'1.0-0' }}</p>
                @if ((product.originalPrice ?? 0) > product.price) {
                  <p class="text-xs text-gray-400 line-through">{{ product.originalPrice | currency:'VND':'symbol':'1.0-0' }}</p>
                }
              </div>

              <div class="flex items-center gap-1.5 mt-1">
                <app-icon name="star-filled" class="w-2.5 h-2.5 text-yellow-500 translate-y-[1.5px]"></app-icon>
                <span class="text-[11px] text-gray-500 font-medium leading-none">
                  {{ product.rating || 4.5 }} • Còn {{ product.stockLeft ?? 0 }} sp
                </span>
              </div>
            </div>
          </article>
        }
      </div>
    }
  `
})
export class SearchResultsContentComponent {
  readonly skeletonItems = [1, 2, 3, 4, 5, 6, 7, 8];

  @Input({ required: true }) isSearching = false;
  @Input({ required: true }) results: Product[] = [];
  @Input({ required: true }) bestSellers: Product[] = [];

  @Output() readonly addToCartRequested = new EventEmitter<number>();

  getStarIcon(star: number, rating: number): string {
    if (star <= rating) return 'star-filled';
    if (star - 0.5 <= rating) return 'star-half';
    return 'star-outline';
  }
}
