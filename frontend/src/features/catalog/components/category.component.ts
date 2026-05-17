import { Component, ChangeDetectionStrategy, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Product } from '@/core/models';
import { CatalogFacade } from '@/features/catalog/data-access/catalog.facade';
import {
  CategoryFilterType,
  CategoryPageFacade,
  CategoryPriceFilter,
  CategorySort
} from '@/features/catalog/data-access/category-page.facade';
import { IconComponent } from '@/shared/components/icon.component';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, IconComponent, RouterLink],
  providers: [CategoryPageFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-cream min-h-screen pb-12">
      <div class="relative bg-white border-b border-gray-200">
        <div class="absolute inset-0 overflow-hidden opacity-10">
          <img src="https://picsum.photos/id/366/1920/400" class="w-full h-full object-cover filter blur-sm">
        </div>

        <div class="container mx-auto px-4 py-8 relative z-10">
          <nav class="text-xs text-gray-500 mb-4 flex gap-2">
            <span class="hover:text-honey cursor-pointer" (click)="goHome()">Trang chủ</span>
            <span>></span>
            <span class="font-bold text-charcoal">{{ currentCategoryName() }}</span>
          </nav>

          <h1 class="text-3xl md:text-4xl font-extrabold text-charcoal mb-3">{{ currentCategoryName() }}</h1>
          <p class="text-gray-600 max-w-2xl leading-relaxed">
            Khám phá các sản phẩm nổi bật thuộc danh mục {{ currentCategoryName() | lowercase }} chất lượng, giá ưu đãi.
          </p>
        </div>
      </div>

      <div class="container mx-auto px-4 py-8">
        <div class="flex flex-col lg:flex-row gap-8">
          <aside class="w-full lg:w-64 flex-shrink-0">
            <div class="lg:sticky lg:top-24 space-y-6">
              <div class="border-b border-gray-200 pb-6">
                <h3 class="font-bold text-charcoal mb-4 flex justify-between cursor-pointer">
                  Khoảng giá
                  <app-icon name="chevron-down" class="w-4 h-4"></app-icon>
                </h3>
                <div class="space-y-2">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" class="accent-honey w-4 h-4" (change)="togglePriceFilter('under200')">
                    <span class="text-sm text-gray-600">Dưới 200k</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" class="accent-honey w-4 h-4" (change)="togglePriceFilter('200to500')">
                    <span class="text-sm text-gray-600">200k - 500k</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" class="accent-honey w-4 h-4" (change)="togglePriceFilter('above500')">
                    <span class="text-sm text-gray-600">Trên 500k</span>
                  </label>
                </div>
              </div>

              <div class="border-b border-gray-200 pb-6">
                <h3 class="font-bold text-charcoal mb-4">Phong cách</h3>
                <div class="space-y-2">
                  @for (style of styles; track style) {
                    <label class="flex items-center gap-2 cursor-pointer hover:text-honey transition-colors">
                      <input type="checkbox" class="accent-honey w-4 h-4" (change)="toggleFilter('style', style)">
                      <span class="text-sm text-gray-600">{{ style }}</span>
                    </label>
                  }
                </div>
              </div>

              <div class="border-b border-gray-200 pb-6">
                <h3 class="font-bold text-charcoal mb-4">Màu sắc</h3>
                <div class="flex flex-wrap gap-2">
                  @for (color of colors; track color.hex) {
                    <div
                      class="w-8 h-8 rounded-full border border-gray-200 cursor-pointer shadow-sm hover:scale-110 transition-transform relative"
                      [style.background-color]="color.hex"
                      [title]="color.name"
                      (click)="toggleFilter('color', color.hex)"
                    >
                      @if (isColorSelected(color.hex)) {
                        <div class="absolute inset-0 flex items-center justify-center text-white drop-shadow-md">
                          <app-icon name="check-circle" class="w-5 h-5"></app-icon>
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>

              <div class="border-b border-gray-200 pb-6">
                <h3 class="font-bold text-charcoal mb-4">Chất liệu</h3>
                <div class="space-y-2">
                  @for (mat of materials; track mat) {
                    <label class="flex items-center gap-2 cursor-pointer hover:text-honey transition-colors">
                      <input type="checkbox" class="accent-honey w-4 h-4" (change)="toggleFilter('material', mat)">
                      <span class="text-sm text-gray-600">{{ mat }}</span>
                    </label>
                  }
                </div>
              </div>
            </div>
          </aside>

          <main class="flex-grow">
            <div class="bg-white p-4 rounded shadow-sm mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <span class="text-sm text-gray-500">
                Hiển thị <span class="font-bold text-charcoal">1 - {{ displayCount() > filteredProducts().length ? filteredProducts().length : displayCount() }}</span> trên <span class="font-bold text-charcoal">{{ totalFromApi() }}</span> sản phẩm
              </span>

              <div class="flex items-center gap-4">
                <div class="relative group">
                  <button class="flex items-center gap-2 text-sm font-bold text-charcoal hover:text-honey">
                    Sắp xếp: {{ currentSortLabel() }}
                    <app-icon name="chevron-down" class="w-4 h-4"></app-icon>
                  </button>
                  <div class="absolute right-0 top-full mt-2 w-48 bg-white shadow-xl rounded z-20 hidden group-hover:block animate-fade-in origin-top-right border border-gray-100">
                    <div class="py-1">
                      <button (click)="sort('newest', 'Mới nhất')" class="block w-full text-left px-4 py-2 text-sm hover:bg-honey hover:text-white">Mới nhất</button>
                      <button (click)="sort('best_selling', 'Bán chạy nhất')" class="block w-full text-left px-4 py-2 text-sm hover:bg-honey hover:text-white">Bán chạy nhất</button>
                      <button (click)="sort('price_asc', 'Giá: Thấp - Cao')" class="block w-full text-left px-4 py-2 text-sm hover:bg-honey hover:text-white">Giá: Thấp - Cao</button>
                      <button (click)="sort('price_desc', 'Giá: Cao - Thấp')" class="block w-full text-left px-4 py-2 text-sm hover:bg-honey hover:text-white">Giá: Cao - Thấp</button>
                    </div>
                  </div>
                </div>

                <div class="flex items-center border border-gray-200 rounded overflow-hidden">
                  <button
                    (click)="viewMode.set('grid')"
                    class="p-2 transition-colors"
                    [class.bg-honey]="viewMode() === 'grid'"
                    [class.text-white]="viewMode() === 'grid'"
                    [class.bg-white]="viewMode() !== 'grid'"
                  >
                    <app-icon name="grid" class="w-4 h-4"></app-icon>
                  </button>
                  <div class="w-px h-8 bg-gray-200"></div>
                  <button
                    (click)="viewMode.set('list')"
                    class="p-2 transition-colors"
                    [class.bg-honey]="viewMode() === 'list'"
                    [class.text-white]="viewMode() === 'list'"
                    [class.bg-white]="viewMode() !== 'list'"
                  >
                    <app-icon name="list" class="w-4 h-4"></app-icon>
                  </button>
                </div>
              </div>
            </div>

            @if (isLoading()) {
              <div class="rounded-xl bg-white px-6 py-20 text-center shadow-sm">
                <app-icon name="loader" class="w-8 h-8 animate-spin mx-auto mb-4 text-honey"></app-icon>
                <p class="text-lg text-gray-600">Dang tai san pham...</p>
              </div>
            } @else if (hasError()) {
              <div class="rounded-xl border border-red-200 bg-red-50 px-6 py-20 text-center">
                <h2 class="text-2xl font-bold text-charcoal mb-3">Khong the tai danh muc</h2>
                <p class="text-gray-600 mb-6">{{ errorMessage() ?? 'Da xay ra loi khi tai danh sach san pham.' }}</p>
                <button
                  class="px-6 py-3 rounded-full bg-charcoal text-white font-bold hover:bg-honey hover:text-charcoal transition-colors"
                  (click)="reloadCategory()"
                >
                  Thu lai
                </button>
              </div>
            } @else if (filteredProducts().length > 0) {
              <div
                [class.grid]="viewMode() === 'grid'"
                [class.grid-cols-2]="viewMode() === 'grid'"
                [class.md:grid-cols-3]="viewMode() === 'grid'"
                [class.lg:grid-cols-3]="viewMode() === 'grid'"
                [class.xl:grid-cols-4]="viewMode() === 'grid'"
                [class.gap-6]="viewMode() === 'grid'"
                [class.flex]="viewMode() === 'list'"
                [class.flex-col]="viewMode() === 'list'"
                [class.space-y-4]="viewMode() === 'list'"
              >
                @for (product of visibleProducts(); track product.id) {
                  @if (viewMode() === 'grid') {
                    <div class="group relative bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300">
                      <div class="relative w-full aspect-[4/5] overflow-hidden rounded-t-lg bg-gray-100 cursor-pointer" [routerLink]="['/product', product.id]">
                        <img [src]="product.image" class="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0">
                        <img [src]="product.hoverImage" class="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100">

                        <div class="absolute top-2 left-2 flex flex-col gap-1">
                          @if (product.tag) {
                            <span
                              class="text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase text-white"
                              [class.bg-honey-600]="product.tag === 'NEW'"
                              [class.bg-red-500]="product.tag.includes('-') || product.tag.includes('Sale')"
                              [class.bg-gray-800]="product.tag === 'Best Seller'"
                              [class.bg-gray-400]="product.tag === 'Sold Out'"
                            >
                              {{ product.tag }}
                            </span>
                          }
                        </div>

                        <div class="absolute right-2 top-2 flex flex-col gap-2 translate-x-10 group-hover:translate-x-0 transition-transform duration-300">
                          <button class="w-8 h-8 bg-white rounded-full flex items-center justify-center text-charcoal hover:bg-red-50 hover:text-red-500 shadow-md transition-colors" title="Thêm vào yêu thích">
                            <app-icon name="heart" class="w-4 h-4"></app-icon>
                          </button>
                        </div>

                        <button (click)="addToCart(product, $event)" class="absolute bottom-0 left-0 w-full bg-charcoal text-white py-3 font-bold text-sm translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center gap-2 hover:bg-honey hover:text-charcoal">
                          <app-icon name="plus" class="w-4 h-4"></app-icon> Thêm vào giỏ
                        </button>
                      </div>

                      <div class="p-4">
                        <h3 class="font-semibold text-charcoal hover:text-honey cursor-pointer line-clamp-2 min-h-[3rem] mb-1" [routerLink]="['/product', product.id]">{{ product.name }}</h3>

                        <div class="flex items-baseline gap-2 mb-2">
                          <span class="text-lg font-extrabold tracking-tight text-[var(--catalog-price-color)]">{{ product.price | currency:'VND':'symbol':'1.0-0' }}</span>
                          @if (product.originalPrice) {
                            <span class="text-xs font-medium text-gray-400 line-through">{{ product.originalPrice | currency:'VND':'symbol':'1.0-0' }}</span>
                          }
                        </div>

                        <div class="flex items-center gap-1.5 mt-1">
                          <app-icon name="star-filled" class="w-2.5 h-2.5 text-yellow-500 translate-y-[1.5px]"></app-icon>
                          <span class="text-[11px] text-gray-500 font-medium leading-none">
                            {{ product.rating || 4.5 }} • ({{ product.reviews }} đánh giá)
                          </span>
                        </div>
                      </div>
                    </div>
                  }

                  @if (viewMode() === 'list') {
                    <div class="group flex gap-4 bg-white p-4 rounded-lg shadow-sm border border-transparent hover:border-honey transition-all">
                      <div class="w-32 h-32 flex-shrink-0 relative overflow-hidden rounded bg-gray-100 cursor-pointer" [routerLink]="['/product', product.id]">
                        <img [src]="product.image" class="w-full h-full object-cover">
                      </div>
                      <div class="flex-grow flex flex-col justify-center">
                        <div class="flex justify-between items-start">
                          <div>
                            <h3 class="font-bold text-lg text-charcoal mb-1 cursor-pointer hover:text-honey" [routerLink]="['/product', product.id]">{{ product.name }}</h3>
                          </div>
                          <button class="text-gray-400 hover:text-red-500"><app-icon name="heart" class="w-6 h-6"></app-icon></button>
                        </div>
                        <p class="text-sm text-gray-500 mb-3 line-clamp-2">Sản phẩm decor tinh tế, chất liệu {{ product.material }}, phù hợp phong cách {{ product.style }}.</p>
                        <div class="flex items-center justify-between mt-auto">
                          <div class="flex flex-col gap-1">
                            <div class="flex items-baseline gap-2">
                              <span class="text-xl font-extrabold tracking-tight text-[var(--catalog-price-color)]">{{ product.price | currency:'VND':'symbol':'1.0-0' }}</span>
                              @if (product.originalPrice) {
                                <span class="text-sm font-medium text-gray-400 line-through">{{ product.originalPrice | currency:'VND':'symbol':'1.0-0' }}</span>
                              }
                            </div>
                            <div class="flex items-center gap-1.5">
                              <app-icon name="star-filled" class="w-2.5 h-2.5 text-yellow-500 translate-y-[0.5px]"></app-icon>
                              <span class="text-[11px] text-gray-500 font-medium leading-none">
                                {{ product.rating || 4.5 }} • ({{ product.reviews }} đánh giá)
                              </span>
                            </div>
                          </div>
                          <button (click)="addToCart(product, $event)" class="px-6 py-2 bg-charcoal text-white rounded font-bold hover:bg-honey hover:text-charcoal transition-colors">Thêm vào giỏ</button>
                        </div>
                      </div>
                    </div>
                  }
                }
              </div>

              @if (displayCount() < filteredProducts().length) {
                <div class="mt-12 text-center">
                  <p class="text-sm text-gray-500 mb-4">Đã hiển thị {{ displayCount() > filteredProducts().length ? filteredProducts().length : displayCount() }} trên {{ totalFromApi() }} sản phẩm</p>
                  <div class="w-64 h-1 bg-gray-200 rounded-full mx-auto mb-6 overflow-hidden">
                    <div class="h-full bg-honey" [style.width.%]="(displayCount() / filteredProducts().length) * 100"></div>
                  </div>
                  <button (click)="loadMore()" class="px-8 py-3 border-2 border-charcoal text-charcoal font-bold rounded-full hover:bg-charcoal hover:text-white transition-all transform hover:scale-105">
                    Xem thêm sản phẩm
                  </button>
                </div>
              }
            } @else {
              <div class="text-center py-20">
                <p class="text-gray-500 text-lg">Không tìm thấy sản phẩm nào phù hợp với bộ lọc.</p>
                <button (click)="resetFilters()" class="mt-4 text-honey font-bold underline">Xóa bộ lọc</button>
              </div>
            }

            <div class="mt-20 pt-10 border-t border-gray-200">
              <h2 class="text-xl font-bold text-charcoal mb-4">Mua phụ kiện bàn làm việc đẹp, giá tốt ở đâu?</h2>
              <div class="text-sm text-gray-600 space-y-3 leading-relaxed">
                <p>
                  Góc làm việc không chỉ là nơi để kiếm tiền mà còn là không gian thể hiện cá tính và khơi nguồn cảm hứng sáng tạo.
                  Tại <strong>BeeShop</strong>, chúng tôi mang đến bộ sưu tập <a href="#" class="text-honey font-bold">phụ kiện bàn làm việc</a>
                  đa dạng từ phong cách Minimalist (Tối giản) đến Vintage (Cổ điển).
                </p>
                <p>
                  Các sản phẩm như <em>kệ gỗ, khay đựng bút, đèn bàn</em> đều được tuyển chọn kỹ lưỡng về chất liệu và độ hoàn thiện.
                  BeeShop cam kết mang lại trải nghiệm mua sắm tuyệt vời với chính sách đổi trả linh hoạt và giao hàng hỏa tốc.
                </p>
                <p>
                  Hãy biến góc làm việc nhàm chán trở nên sinh động ngay hôm nay với những món đồ decor nhỏ xinh từ BeeShop!
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>

      @if (cartNotice()) {
        <div class="pointer-events-none fixed bottom-6 right-6 z-[120] max-w-sm">
          <div class="rounded-2xl border border-emerald-200 bg-white/95 px-4 py-3 shadow-2xl backdrop-blur">
            <p class="text-sm font-semibold text-charcoal">{{ cartNotice() }}</p>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      --catalog-price-color: #9a5a16;
    }

    .accent-honey {
      accent-color: #F6C324;
    }
  `]
})
export class CategoryComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly categoryPageFacade = inject(CategoryPageFacade);
  private cartNoticeTimer: ReturnType<typeof setTimeout> | null = null;
  readonly catalogFacade = inject(CatalogFacade);
  readonly cartNotice = signal<string | null>(null);

  readonly currentCategoryName = this.categoryPageFacade.currentCategoryName;
  readonly viewMode = this.categoryPageFacade.viewMode;
  readonly displayCount = this.categoryPageFacade.displayCount;
  readonly currentSortLabel = this.categoryPageFacade.currentSortLabel;
  readonly styles = this.categoryPageFacade.styles;
  readonly materials = this.categoryPageFacade.materials;
  readonly colors = this.categoryPageFacade.colors;
  readonly isLoading = this.categoryPageFacade.isLoading;
  readonly hasError = this.categoryPageFacade.hasError;
  readonly errorMessage = this.categoryPageFacade.errorMessage;
  readonly filteredProducts = this.categoryPageFacade.filteredProducts;
  readonly visibleProducts = this.categoryPageFacade.visibleProducts;
  readonly totalFromApi = this.categoryPageFacade.totalFromApi;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.categoryPageFacade.currentSlug.set(slug);
      }
    });
  }

  goHome() {
    this.router.navigate(['/']);
  }

  loadMore() {
    this.categoryPageFacade.loadMore();
  }

  addToCart(product: Product, event?: Event) {
    event?.preventDefault();
    event?.stopPropagation();

    this.catalogFacade.addProductToCart(product);
    this.showCartNotice(`Đã thêm "${product.name}" vào giỏ hàng.`);
  }

  sort(type: CategorySort, label: string) {
    this.categoryPageFacade.sort(type, label);
  }

  toggleFilter(type: CategoryFilterType, value: string) {
    this.categoryPageFacade.toggleFilter(type, value);
  }

  togglePriceFilter(value: CategoryPriceFilter) {
    this.categoryPageFacade.togglePriceFilter(value);
  }

  isColorSelected(hex: string) {
    return this.categoryPageFacade.isColorSelected(hex);
  }

  resetFilters() {
    this.categoryPageFacade.resetFilters();
  }

  reloadCategory() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.categoryPageFacade.loadCategory(slug);
    }
  }

  ngOnDestroy() {
    if (this.cartNoticeTimer) {
      clearTimeout(this.cartNoticeTimer);
    }
  }

  private showCartNotice(message: string) {
    this.cartNotice.set(message);

    if (this.cartNoticeTimer) {
      clearTimeout(this.cartNoticeTimer);
    }

    this.cartNoticeTimer = setTimeout(() => {
      this.cartNotice.set(null);
      this.cartNoticeTimer = null;
    }, 2200);
  }
}
