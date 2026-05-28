import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CheckoutFacade } from '@/features/checkout/data-access/checkout.facade';
import { SearchFacade, SearchSort } from '@/features/search/data-access/search.facade';
import { IconComponent } from '@/shared/components/icon.component';
import { SearchActiveChipsComponent } from './search-active-chips.component';
import { SearchFilterPanelComponent } from './search-filter-panel.component';
import { SearchResultsContentComponent } from './search-results-content.component';
import { SearchFilterChip, SearchQuickPriceRange } from './search-results.types';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [
    CommonModule,
    IconComponent,
    SearchActiveChipsComponent,
    SearchFilterPanelComponent,
    SearchResultsContentComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-cream min-h-screen pb-12">
      <div class="bg-white border-b border-gray-200">
        <div class="container mx-auto px-4 py-8 space-y-4">
          <nav class="text-xs text-gray-500 flex gap-2">
            <span class="hover:text-honey cursor-pointer" (click)="goHome()">Trang chủ</span>
            <span>></span>
            <span class="font-bold text-charcoal">Tìm kiếm</span>
          </nav>

          <div class="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div class="flex-1">
              <label class="mb-2 block text-xs uppercase tracking-wide text-gray-500">Tìm sản phẩm</label>
              <div class="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3">
                <app-icon name="search" class="h-4 w-4 text-gray-400"></app-icon>
                <input
                  [value]="searchFacade.query()"
                  (input)="onSearchInput($event)"
                  placeholder="Tên sản phẩm, mã SKU, chất liệu..."
                  class="w-full bg-transparent text-sm text-charcoal outline-none"
                >
                @if (searchFacade.query()) {
                  <button class="text-xs text-gray-500 hover:text-charcoal" (click)="clearQuery()">Xóa</button>
                }
              </div>
            </div>

            <div class="w-full lg:w-64">
              <label class="mb-2 block text-xs uppercase tracking-wide text-gray-500">Sắp xếp</label>
              <select
                class="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm"
                [value]="searchFacade.sortBy()"
                (change)="onSortChange($event)"
              >
                @for (option of sortOptions; track option.value) {
                  <option [value]="option.value">{{ option.label }}</option>
                }
              </select>
            </div>
          </div>

          <h1 class="text-xl font-bold text-charcoal md:text-2xl">
            @if (searchFacade.results().length > 0) {
              Tìm thấy <span class="text-honey">{{ searchFacade.results().length }}</span> sản phẩm phù hợp
            } @else {
              Không tìm thấy sản phẩm phù hợp
            }
          </h1>

          @if (activeFilterChips().length > 0) {
            <app-search-active-chips
              [chips]="activeFilterChips()"
              (removeChip)="removeChip($event)"
              (clearAll)="clearAllFilters()"
            />
          }
        </div>
      </div>

      <div class="container mx-auto px-4 py-8">
        <div class="flex flex-col gap-8 lg:flex-row">
          <aside class="w-full flex-shrink-0 space-y-4 lg:w-72">
            <app-search-filter-panel
              [availableCategories]="searchFacade.availableCategories()"
              [availableBrands]="searchFacade.availableBrands()"
              [availableStyles]="searchFacade.availableStyles()"
              [availableMaterials]="searchFacade.availableMaterials()"
              [availableColors]="searchFacade.availableColors()"
              [selectedCategories]="searchFacade.selectedCategories()"
              [selectedBrands]="searchFacade.selectedBrands()"
              [selectedStyles]="searchFacade.selectedStyles()"
              [selectedMaterials]="searchFacade.selectedMaterials()"
              [selectedColors]="searchFacade.selectedColors()"
              [minPriceInput]="minPriceInput()"
              [maxPriceInput]="maxPriceInput()"
              [quickPriceRanges]="quickPriceRanges"
              [inStockOnly]="searchFacade.inStockOnly()"
              [onSaleOnly]="searchFacade.onSaleOnly()"
              [ratingGte]="searchFacade.ratingGte()"
              (toggleCategoryRequested)="toggleCategory($event)"
              (toggleBrandRequested)="toggleBrand($event)"
              (toggleStyleRequested)="toggleStyle($event)"
              (toggleMaterialRequested)="toggleMaterial($event)"
              (toggleColorRequested)="toggleColor($event)"
              (priceInputChanged)="onPriceInputChange($event.type, $event.value)"
              (applyPriceRangeRequested)="applyPriceRange()"
              (applyQuickPriceRequested)="applyQuickPrice($event.min, $event.max)"
              (toggleInStockOnlyRequested)="toggleInStockOnly($event)"
              (toggleOnSaleOnlyRequested)="toggleOnSaleOnly($event)"
              (setRatingRequested)="setRatingGte($event)"
            />
          </aside>

          <main class="flex-grow">
            <app-search-results-content
              [isSearching]="searchFacade.isSearching()"
              [results]="searchFacade.results()"
              [bestSellers]="bestSellers()"
              (addToCartRequested)="addToCart($event)"
            />
          </main>
        </div>
      </div>
    </div>
  `
})
export class SearchResultsComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly searchFacade = inject(SearchFacade);
  readonly checkoutFacade = inject(CheckoutFacade);

  readonly minPriceInput = signal('');
  readonly maxPriceInput = signal('');

  readonly activeFilterChips = computed(() => {
    const chips: SearchFilterChip[] = [];

    this.searchFacade.selectedCategories().forEach((item) => {
      chips.push({ type: 'category', value: item, label: `Danh mục: ${item}` });
    });
    this.searchFacade.selectedBrands().forEach((item) => {
      chips.push({ type: 'brand', value: item, label: `Thương hiệu: ${item}` });
    });
    this.searchFacade.selectedStyles().forEach((item) => {
      chips.push({ type: 'style', value: item, label: `Phong cách: ${item}` });
    });
    this.searchFacade.selectedMaterials().forEach((item) => {
      chips.push({ type: 'material', value: item, label: `Chất liệu: ${item}` });
    });
    this.searchFacade.selectedColors().forEach((item) => {
      chips.push({ type: 'color', value: item, label: `Màu sắc: ${item}` });
    });

    if (this.searchFacade.minPrice() !== null) {
      chips.push({
        type: 'minPrice',
        label: `Giá từ ${Number(this.searchFacade.minPrice()).toLocaleString('vi-VN')}đ`
      });
    }

    if (this.searchFacade.maxPrice() !== null) {
      chips.push({
        type: 'maxPrice',
        label: `Giá đến ${Number(this.searchFacade.maxPrice()).toLocaleString('vi-VN')}đ`
      });
    }

    if (this.searchFacade.inStockOnly()) {
      chips.push({ type: 'inStock', label: 'Chỉ còn hàng' });
    }
    if (this.searchFacade.onSaleOnly()) {
      chips.push({ type: 'onSale', label: 'Đang khuyến mại' });
    }
    if (this.searchFacade.ratingGte() > 0) {
      chips.push({ type: 'rating', label: `Từ ${this.searchFacade.ratingGte()} sao` });
    }

    return chips;
  });

  readonly quickPriceRanges: SearchQuickPriceRange[] = [
    { label: 'Dưới 200k', min: null, max: 200000 },
    { label: '200k - 500k', min: 200000, max: 500000 },
    { label: 'Trên 500k', min: 500000, max: null }
  ];

  readonly sortOptions: Array<{ label: string; value: SearchSort }> = [
    { label: 'Liên quan nhất', value: 'relevance' },
    { label: 'Mới nhất', value: 'newest' },
    { label: 'Giá tăng dần', value: 'price-asc' },
    { label: 'Giá giảm dần', value: 'price-desc' },
    { label: 'Đánh giá cao nhất', value: 'rating-desc' }
  ];

  readonly bestSellers = computed(() => this.searchFacade.bestSellerProducts());

  private routeSub?: Subscription;
  private syncingFromRoute = false;

  ngOnInit(): void {
    this.searchFacade.ensureSearchIndexLoaded();
    this.routeSub = this.route.queryParamMap.subscribe((queryParamMap) => {
      this.syncingFromRoute = true;
      this.searchFacade.hydrateFromQueryParams({
        q: queryParamMap.get('q') ?? undefined,
        category: queryParamMap.get('category') ?? undefined,
        brand: queryParamMap.get('brand') ?? undefined,
        style: queryParamMap.get('style') ?? undefined,
        material: queryParamMap.get('material') ?? undefined,
        color: queryParamMap.get('color') ?? undefined,
        minPrice: queryParamMap.get('minPrice') ?? undefined,
        maxPrice: queryParamMap.get('maxPrice') ?? undefined,
        inStock: queryParamMap.get('inStock') ?? undefined,
        onSale: queryParamMap.get('onSale') ?? undefined,
        ratingGte: queryParamMap.get('ratingGte') ?? undefined,
        sort: queryParamMap.get('sort') ?? undefined
      });
      this.syncPriceInputsFromState();
      this.syncingFromRoute = false;
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.commitSearchStateChange(() => this.searchFacade.setQuery(value));
  }

  clearQuery(): void {
    this.commitSearchStateChange(() => this.searchFacade.clearQuery());
  }

  onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as SearchSort;
    this.commitSearchStateChange(() => this.searchFacade.setSortBy(value));
  }

  toggleCategory(category: string): void {
    this.commitSearchStateChange(() => this.searchFacade.toggleCategory(category));
  }

  toggleBrand(brand: string): void {
    this.commitSearchStateChange(() => this.searchFacade.toggleBrand(brand));
  }

  toggleStyle(style: string): void {
    this.commitSearchStateChange(() => this.searchFacade.toggleStyle(style));
  }

  toggleMaterial(material: string): void {
    this.commitSearchStateChange(() => this.searchFacade.toggleMaterial(material));
  }

  toggleColor(color: string): void {
    this.commitSearchStateChange(() => this.searchFacade.toggleColor(color));
  }

  toggleInStockOnly(enabled: boolean): void {
    this.commitSearchStateChange(() => this.searchFacade.setInStockOnly(enabled));
  }

  toggleOnSaleOnly(enabled: boolean): void {
    this.commitSearchStateChange(() => this.searchFacade.setOnSaleOnly(enabled));
  }

  setRatingGte(value: number): void {
    this.commitSearchStateChange(() => this.searchFacade.setRatingGte(value));
  }

  onPriceInputChange(type: 'min' | 'max', rawValue: string): void {
    if (type === 'min') {
      this.minPriceInput.set(rawValue);
      return;
    }

    this.maxPriceInput.set(rawValue);
  }

  applyPriceRange(): void {
    const min = this.minPriceInput().trim() ? Number(this.minPriceInput()) : null;
    const max = this.maxPriceInput().trim() ? Number(this.maxPriceInput()) : null;

    this.commitSearchStateChange(
      () =>
        this.searchFacade.setPriceRange(
          min !== null && Number.isFinite(min) ? min : null,
          max !== null && Number.isFinite(max) ? max : null
        ),
      true
    );
  }

  applyQuickPrice(min: number | null, max: number | null): void {
    this.commitSearchStateChange(() => this.searchFacade.setPriceRange(min, max), true);
  }

  removeChip(chip: SearchFilterChip): void {
    this.commitSearchStateChange(() => {
      switch (chip.type) {
        case 'category':
          if (chip.value) {
            this.searchFacade.toggleCategory(chip.value);
          }
          break;
        case 'brand':
          if (chip.value) {
            this.searchFacade.toggleBrand(chip.value);
          }
          break;
        case 'style':
          if (chip.value) {
            this.searchFacade.toggleStyle(chip.value);
          }
          break;
        case 'material':
          if (chip.value) {
            this.searchFacade.toggleMaterial(chip.value);
          }
          break;
        case 'color':
          if (chip.value) {
            this.searchFacade.toggleColor(chip.value);
          }
          break;
        case 'minPrice':
        case 'maxPrice':
        case 'inStock':
        case 'onSale':
        case 'rating':
          this.searchFacade.removeFilterChip(chip.type);
          break;
        default:
          break;
      }
    }, true);
  }

  clearAllFilters(): void {
    this.commitSearchStateChange(() => this.searchFacade.clearAllFilters(), true);
  }

  addToCart(productId: number): void {
    this.checkoutFacade.addToCart(productId, 1);
  }

  private syncPriceInputsFromState(): void {
    this.minPriceInput.set(this.searchFacade.minPrice() === null ? '' : String(this.searchFacade.minPrice()));
    this.maxPriceInput.set(this.searchFacade.maxPrice() === null ? '' : String(this.searchFacade.maxPrice()));
  }

  private commitSearchStateChange(change: () => void, syncPriceInputs = false): void {
    change();
    if (syncPriceInputs) {
      this.syncPriceInputsFromState();
    }
    this.syncUrlState();
  }

  private syncUrlState(): void {
    if (this.syncingFromRoute) {
      return;
    }

    const queryParams: Params = this.searchFacade.toQueryParams();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      replaceUrl: true
    });
  }
}
