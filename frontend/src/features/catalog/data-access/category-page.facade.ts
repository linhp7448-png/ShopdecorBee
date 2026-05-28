import { Injectable, computed, inject, signal, effect } from '@angular/core';
import { Product, mapProductViewDtoToProduct, ProductListResultDto } from '@/core/models';
import { CatalogStore } from '@/features/catalog/data-access/catalog.store';
import { HttpClient } from '@angular/common/http';
import { apiEndpoints } from '@/core/api/api-endpoints';

export type CategoryViewMode = 'grid' | 'list';
export type CategorySort = 'newest' | 'best_selling' | 'price_asc' | 'price_desc';
export type CategoryFilterType = 'style' | 'color' | 'material';
export type CategoryPriceFilter = 'under200' | '200to500' | 'above500';
export type CategoryColorOption = { name: string; hex: string };

@Injectable()
export class CategoryPageFacade {
  private readonly catalogStore = inject(CatalogStore);
  private readonly http = inject(HttpClient);

  readonly currentSlug = signal<string | null>(null);
  private readonly loadedCategoryProducts = signal<Product[]>([]);
  readonly totalFromApi = signal<number>(0);
  readonly isLoading = signal(false);
  readonly hasError = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly currentCategoryName = computed(() => {
    const slug = this.currentSlug();
    if (!slug) return 'Danh mục';
    const cat = this.catalogStore.categories().find((c) => c.slug === slug);
    return cat ? cat.name : 'Danh mục sản phẩm';
  });

  readonly viewMode = signal<CategoryViewMode>('grid');
  readonly displayCount = signal(8);
  readonly currentSort = signal<CategorySort>('newest');
  readonly currentSortLabel = signal('Mới nhất');

  readonly selectedPrices = signal<CategoryPriceFilter[]>([]);
  readonly selectedStyles = signal<string[]>([]);
  readonly selectedColors = signal<string[]>([]);
  readonly selectedMaterials = signal<string[]>([]);

  readonly styles = ['Minimalist', 'Vintage', 'Hiện đại', 'Dễ thương'];
  readonly materials = ['Gỗ', 'Kim loại', 'Vải', 'Gốm sứ', 'Nhựa', 'Da'];
  readonly colors: CategoryColorOption[] = [
    { name: 'Nâu Gỗ', hex: '#8B4513' },
    { name: 'Đen', hex: '#333333' },
    { name: 'Trắng', hex: '#FFFFFF' },
    { name: 'Xanh Lá', hex: '#4CAF50' },
    { name: 'Be', hex: '#D2B48C' }
  ];

  constructor() {
    effect(() => {
      const slug = this.currentSlug();
      if (!slug) {
        this.loadedCategoryProducts.set([]);
        this.isLoading.set(false);
        this.hasError.set(false);
        this.errorMessage.set(null);
        return;
      }
      this.loadCategory(slug);
    });
  }

  loadCategory(slug: string): void {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.errorMessage.set(null);

    this.http.get<ProductListResultDto>(`${apiEndpoints.products.list}?category=${encodeURIComponent(slug)}&pageSize=200`)
      .subscribe({
        next: (res) => {
          this.loadedCategoryProducts.set(res.items.map(mapProductViewDtoToProduct));
          this.totalFromApi.set(res.total);
          this.displayCount.set(8);
          this.isLoading.set(false);
        },
        error: () => {
          this.loadedCategoryProducts.set([]);
          this.displayCount.set(8);
          this.isLoading.set(false);
          this.hasError.set(true);
          this.errorMessage.set('Khong tai duoc danh sach san pham cho danh muc nay.');
        }
      });
  }

  readonly filteredProducts = computed(() => {
    let products = this.loadedCategoryProducts();

    if (this.selectedStyles().length > 0) {
      products = products.filter((product) => product.style && this.selectedStyles().includes(product.style));
    }

    if (this.selectedMaterials().length > 0) {
      products = products.filter((product) => product.material && this.selectedMaterials().includes(product.material));
    }

    if (this.selectedColors().length > 0) {
      products = products.filter((product) => product.color && this.selectedColors().includes(product.color));
    }

    if (this.selectedPrices().length > 0) {
      products = products.filter((product) => this.matchesSelectedPrice(product));
    }

    return [...products].sort((a, b) => this.compareProducts(a, b));
  });

  readonly visibleProducts = computed(() => {
    return this.filteredProducts().slice(0, this.displayCount());
  });

  loadMore(): void {
    this.displayCount.update((count) => count + 8);
  }

  sort(type: CategorySort, label: string): void {
    this.currentSort.set(type);
    this.currentSortLabel.set(label);
  }

  toggleFilter(type: CategoryFilterType, value: string): void {
    const state =
      type === 'style'
        ? this.selectedStyles
        : type === 'color'
          ? this.selectedColors
          : this.selectedMaterials;

    state.update((list) => {
      if (list.includes(value)) {
        return list.filter((item) => item !== value);
      }

      return [...list, value];
    });

    this.displayCount.set(8);
  }

  togglePriceFilter(value: CategoryPriceFilter): void {
    this.selectedPrices.update((list) => {
      if (list.includes(value)) {
        return list.filter((item) => item !== value);
      }

      return [...list, value];
    });

    this.displayCount.set(8);
  }

  isColorSelected(hex: string): boolean {
    return this.selectedColors().includes(hex);
  }

  resetFilters(): void {
    this.selectedStyles.set([]);
    this.selectedMaterials.set([]);
    this.selectedColors.set([]);
    this.selectedPrices.set([]);
  }

  private matchesSelectedPrice(product: Product): boolean {
    let match = false;

    if (this.selectedPrices().includes('under200') && product.price < 200000) match = true;
    if (this.selectedPrices().includes('200to500') && product.price >= 200000 && product.price <= 500000) match = true;
    if (this.selectedPrices().includes('above500') && product.price > 500000) match = true;

    return match;
  }

  private compareProducts(a: Product, b: Product): number {
    switch (this.currentSort()) {
      case 'price_asc':
        return a.price - b.price;
      case 'price_desc':
        return b.price - a.price;
      case 'best_selling':
        return (b.reviews || 0) - (a.reviews || 0);
      default:
        return b.id - a.id;
    }
  }
}
