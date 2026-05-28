import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import { Params } from '@angular/router';
import { CatalogStore } from '@/features/catalog/data-access/catalog.store';
import { Product } from '@/core/models';
import {
  normalizeSearchText,
  parseSearchQueryState,
  serializeSearchQueryState,
  type SearchSort
} from './search-query-state';

export type { SearchSort } from './search-query-state';

@Injectable({ providedIn: 'root' })
export class SearchFacade {
  private readonly catalogStore = inject(CatalogStore);
  private readonly destroyRef = inject(DestroyRef);

  readonly query = signal('');
  readonly selectedCategories = signal<string[]>([]);
  readonly selectedBrands = signal<string[]>([]);
  readonly selectedStyles = signal<string[]>([]);
  readonly selectedMaterials = signal<string[]>([]);
  readonly selectedColors = signal<string[]>([]);
  readonly minPrice = signal<number | null>(null);
  readonly maxPrice = signal<number | null>(null);
  readonly inStockOnly = signal(false);
  readonly onSaleOnly = signal(false);
  readonly ratingGte = signal(0);
  readonly sortBy = signal<SearchSort>('relevance');
  readonly isSearching = signal(false);
  private readonly fallbackKeywords = [
    'den ngu',
    'den tha tran',
    'go decor',
    'nen thom',
    'khay go',
    'tranh treo tuong',
    'guong trang tri',
    'tham phong khach'
  ];

  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      this.query();
      this.selectedCategories();
      this.selectedBrands();
      this.selectedStyles();
      this.selectedMaterials();
      this.selectedColors();
      this.minPrice();
      this.maxPrice();
      this.inStockOnly();
      this.onSaleOnly();
      this.ratingGte();
      this.sortBy();

      this.isSearching.set(true);
      if (this.searchTimer) {
        clearTimeout(this.searchTimer);
      }
      this.searchTimer = setTimeout(() => {
        this.isSearching.set(false);
      }, 180);
    });

    this.destroyRef.onDestroy(() => {
      if (this.searchTimer) {
        clearTimeout(this.searchTimer);
      }
    });
  }

  private toBrand(product: Product): string {
    return (product.brand ?? 'BeeShop').trim();
  }

  private isInStock(product: Product): boolean {
    if (typeof product.inStock === 'boolean') {
      return product.inStock;
    }
    return product.tag !== 'Sold Out';
  }

  private isOnSale(product: Product): boolean {
    return (product.originalPrice ?? 0) > product.price;
  }

  private getRelevanceScore(product: Product, normalizedQuery: string): number {
    if (!normalizedQuery) {
      return 0;
    }

    const name = normalizeSearchText(product.name);
    const sku = normalizeSearchText(product.sku);
    const category = normalizeSearchText(product.category);
    const brand = normalizeSearchText(this.toBrand(product));
    const style = normalizeSearchText(product.style ?? '');
    const material = normalizeSearchText(product.material ?? '');

    let score = 0;
    if (name === normalizedQuery) score += 120;
    if (name.startsWith(normalizedQuery)) score += 75;
    if (name.includes(normalizedQuery)) score += 55;
    if (sku === normalizedQuery) score += 100;
    if (sku.includes(normalizedQuery)) score += 50;
    if (brand.includes(normalizedQuery)) score += 30;
    if (category.includes(normalizedQuery)) score += 22;
    if (style.includes(normalizedQuery)) score += 12;
    if (material.includes(normalizedQuery)) score += 10;

    score += (product.rating ?? 0) * 3;
    score += Math.min(product.reviews ?? 0, 150) * 0.15;
    if (this.isInStock(product)) score += 3;

    return score;
  }

  readonly allProducts = this.catalogStore.allProducts;

  readonly availableCategories = computed(() => {
    return Array.from(new Set(this.allProducts().map((item) => item.category))).sort((a, b) => a.localeCompare(b));
  });

  readonly availableBrands = computed(() => {
    return Array.from(new Set(this.allProducts().map((item) => this.toBrand(item)))).sort((a, b) => a.localeCompare(b));
  });

  readonly availableStyles = computed(() => {
    return Array.from(
      new Set(
        this.allProducts()
          .map((item) => item.style)
          .filter((style): style is string => !!style)
      )
    ).sort((a, b) => a.localeCompare(b));
  });

  readonly availableMaterials = computed(() => {
    return Array.from(
      new Set(
        this.allProducts()
          .map((item) => item.material)
          .filter((m): m is string => !!m)
      )
    ).sort((a, b) => a.localeCompare(b));
  });

  readonly availableColors = computed(() => {
    return Array.from(
      new Set(
        this.allProducts()
          .map((item) => item.color)
          .filter((c): c is string => !!c)
      )
    ).sort((a, b) => a.localeCompare(b));
  });

  readonly hasActiveFilters = computed(() => {
    return (
      this.selectedCategories().length > 0 ||
      this.selectedBrands().length > 0 ||
      this.selectedStyles().length > 0 ||
      this.selectedMaterials().length > 0 ||
      this.selectedColors().length > 0 ||
      this.minPrice() !== null ||
      this.maxPrice() !== null ||
      this.inStockOnly() ||
      this.onSaleOnly() ||
      this.ratingGte() > 0
    );
  });

  readonly filteredProducts = computed(() => {
    const q = normalizeSearchText(this.query());
    return this.allProducts().filter((product) => {
      const text = normalizeSearchText(
        `${product.name} ${product.sku} ${product.category} ${this.toBrand(product)} ${product.style ?? ''} ${product.material ?? ''} ${product.color ?? ''}`
      );

      if (q && !text.includes(q)) {
        return false;
      }

      if (this.selectedCategories().length > 0) {
        const lowerSelected = this.selectedCategories().map(c => c.toLowerCase());
        if (!lowerSelected.includes(product.category.toLowerCase())) {
          return false;
        }
      }

      if (this.selectedBrands().length > 0 && !this.selectedBrands().includes(this.toBrand(product))) {
        return false;
      }

      if (
        this.selectedStyles().length > 0 &&
        (!product.style || !this.selectedStyles().includes(product.style))
      ) {
        return false;
      }

      if (
        this.selectedMaterials().length > 0 &&
        (!product.material || !this.selectedMaterials().includes(product.material))
      ) {
        return false;
      }

      if (
        this.selectedColors().length > 0 &&
        (!product.color || !this.selectedColors().includes(product.color))
      ) {
        return false;
      }

      if (this.minPrice() !== null && product.price < this.minPrice()!) {
        return false;
      }

      if (this.maxPrice() !== null && product.price > this.maxPrice()!) {
        return false;
      }

      if (this.inStockOnly() && !this.isInStock(product)) {
        return false;
      }

      if (this.onSaleOnly() && !this.isOnSale(product)) {
        return false;
      }

      if ((product.rating ?? 0) < this.ratingGte()) {
        return false;
      }

      return true;
    });
  });

  readonly results = computed(() => {
    const list = [...this.filteredProducts()];
    const q = normalizeSearchText(this.query());

    switch (this.sortBy()) {
      case 'price-asc':
        return list.sort((a, b) => a.price - b.price || b.id - a.id);
      case 'price-desc':
        return list.sort((a, b) => b.price - a.price || b.id - a.id);
      case 'rating-desc':
        return list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || (b.reviews ?? 0) - (a.reviews ?? 0));
      case 'newest':
        return list.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() || b.id - a.id
        );
      default:
        return list.sort((a, b) => {
          const scoreB = this.getRelevanceScore(b, q);
          const scoreA = this.getRelevanceScore(a, q);
          if (scoreB !== scoreA) return scoreB - scoreA;
          if (this.isInStock(a) !== this.isInStock(b)) return this.isInStock(b) ? 1 : -1;
          return (b.reviews ?? 0) - (a.reviews ?? 0) || b.id - a.id;
        });
    }
  });

  readonly suggestions = computed(() => {
    const q = normalizeSearchText(this.query());
    if (!q) {
      return [];
    }
    return this.results().slice(0, 6);
  });

  readonly keywordPool = computed(() => {
    const rawKeywords = [
      ...this.fallbackKeywords,
      ...this.allProducts().map((item) => item.name),
      ...this.allProducts().map((item) => item.category),
      ...this.allProducts().map((item) => this.toBrand(item)),
      ...this.allProducts().map((item) => item.style ?? ''),
      ...this.allProducts().map((item) => item.material ?? '')
    ].filter(Boolean);

    const uniqueKeywordMap = new Map<string, string>();
    rawKeywords.forEach((keyword) => {
      const normalized = normalizeSearchText(keyword);
      if (normalized && !uniqueKeywordMap.has(normalized)) {
        uniqueKeywordMap.set(normalized, keyword.trim());
      }
    });

    return Array.from(uniqueKeywordMap.entries()).map(([normalized, keyword]) => ({
      normalized,
      keyword
    }));
  });

  readonly keywordSuggestions = computed(() => {
    const q = normalizeSearchText(this.query());
    const allKeywords = this.keywordPool();

    if (!q) {
      return allKeywords.slice(0, 8).map((item) => item.keyword);
    }

    return allKeywords
      .filter((item) => item.normalized.includes(q) && item.normalized !== q)
      .sort((a, b) => {
        const aStarts = a.normalized.startsWith(q) ? 0 : 1;
        const bStarts = b.normalized.startsWith(q) ? 0 : 1;
        if (aStarts !== bStarts) return aStarts - bStarts;
        return a.keyword.length - b.keyword.length;
      })
      .slice(0, 8)
      .map((item) => item.keyword);
  });

  readonly bestSellerProducts = computed(() => {
    return this.allProducts()
      .filter((product) => (product.rating ?? 0) >= 4.7 || product.tag === 'Best Seller')
      .sort((a, b) => (b.reviews ?? 0) - (a.reviews ?? 0))
      .slice(0, 12);
  });

  ensureSearchIndexLoaded(): void {
    this.catalogStore.ensureProductIndexLoaded();
  }

  setQuery(query: string): void {
    this.query.set(query);
  }

  applySuggestedKeyword(keyword: string): void {
    this.query.set(keyword);
  }

  setSortBy(sortBy: SearchSort): void {
    this.sortBy.set(sortBy);
  }

  toggleCategory(category: string): void {
    this.selectedCategories.update((list) =>
      list.includes(category) ? list.filter((item) => item !== category) : [...list, category]
    );
  }

  toggleBrand(brand: string): void {
    this.selectedBrands.update((list) =>
      list.includes(brand) ? list.filter((item) => item !== brand) : [...list, brand]
    );
  }

  toggleStyle(style: string): void {
    this.selectedStyles.update((list) =>
      list.includes(style) ? list.filter((item) => item !== style) : [...list, style]
    );
  }

  toggleMaterial(material: string): void {
    this.selectedMaterials.update((list) =>
      list.includes(material) ? list.filter((item) => item !== material) : [...list, material]
    );
  }

  toggleColor(color: string): void {
    this.selectedColors.update((list) =>
      list.includes(color) ? list.filter((item) => item !== color) : [...list, color]
    );
  }

  setPriceRange(minPrice: number | null, maxPrice: number | null): void {
    const normalizedMin = typeof minPrice === 'number' && Number.isFinite(minPrice) ? Math.max(minPrice, 0) : null;
    const normalizedMax = typeof maxPrice === 'number' && Number.isFinite(maxPrice) ? Math.max(maxPrice, 0) : null;

    if (normalizedMin !== null && normalizedMax !== null && normalizedMin > normalizedMax) {
      this.minPrice.set(normalizedMax);
      this.maxPrice.set(normalizedMin);
      return;
    }

    this.minPrice.set(normalizedMin);
    this.maxPrice.set(normalizedMax);
  }

  setInStockOnly(enabled: boolean): void {
    this.inStockOnly.set(enabled);
  }

  setOnSaleOnly(enabled: boolean): void {
    this.onSaleOnly.set(enabled);
  }

  setRatingGte(value: number): void {
    this.ratingGte.set(Math.max(0, Math.min(5, value)));
  }

  removeFilterChip(type: 'category' | 'brand' | 'style' | 'material' | 'color' | 'minPrice' | 'maxPrice' | 'inStock' | 'onSale' | 'rating') {
    switch (type) {
      case 'minPrice':
        this.minPrice.set(null);
        break;
      case 'maxPrice':
        this.maxPrice.set(null);
        break;
      case 'inStock':
        this.inStockOnly.set(false);
        break;
      case 'onSale':
        this.onSaleOnly.set(false);
        break;
      case 'rating':
        this.ratingGte.set(0);
        break;
      default:
        break;
    }
  }

  clearAllFilters(): void {
    this.selectedCategories.set([]);
    this.selectedBrands.set([]);
    this.selectedStyles.set([]);
    this.selectedMaterials.set([]);
    this.selectedColors.set([]);
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.inStockOnly.set(false);
    this.onSaleOnly.set(false);
    this.ratingGte.set(0);
    this.sortBy.set('relevance');
  }

  toQueryParams(): Params {
    return serializeSearchQueryState({
      query: this.query(),
      selectedCategories: this.selectedCategories(),
      selectedBrands: this.selectedBrands(),
      selectedStyles: this.selectedStyles(),
      selectedMaterials: this.selectedMaterials(),
      selectedColors: this.selectedColors(),
      minPrice: this.minPrice(),
      maxPrice: this.maxPrice(),
      inStockOnly: this.inStockOnly(),
      onSaleOnly: this.onSaleOnly(),
      ratingGte: this.ratingGte(),
      sortBy: this.sortBy()
    });
  }

  hydrateFromQueryParams(params: Record<string, string | undefined>): void {
    const state = parseSearchQueryState(params);

    this.query.set(state.query);
    this.selectedCategories.set(state.selectedCategories);
    this.selectedBrands.set(state.selectedBrands);
    this.selectedStyles.set(state.selectedStyles);
    this.selectedMaterials.set(state.selectedMaterials);
    this.selectedColors.set(state.selectedColors);
    this.setPriceRange(state.minPrice, state.maxPrice);
    this.inStockOnly.set(state.inStockOnly);
    this.onSaleOnly.set(state.onSaleOnly);
    this.ratingGte.set(state.ratingGte);
    this.sortBy.set(state.sortBy);
  }

  clearQuery(): void {
    this.query.set('');
  }
}
