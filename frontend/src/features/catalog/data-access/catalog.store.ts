import { Injectable, computed, inject, signal, type WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Category, Product, CategoryViewDto, ProductListResultDto, mapProductViewDtoToProduct } from '@/core/models';
import { apiEndpoints } from '@/core/api/api-endpoints';

interface LoadState {
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string | null;
  isLoaded: boolean;
}

const createIdleState = (): LoadState => ({
  isLoading: false,
  hasError: false,
  errorMessage: null,
  isLoaded: false
});

@Injectable({ providedIn: 'root' })
export class CatalogStore {
  private readonly http = inject(HttpClient);

  readonly categories = signal<Category[]>([]);
  readonly categoryProducts = signal<Product[]>([]);
  readonly trendingProducts = signal<Product[]>([]);
  readonly flashSaleProducts = signal<Product[]>([]);
  readonly newCollectionProducts = signal<Product[]>([]);
  readonly newArrivals = signal<Product[]>([]);
  readonly productIndex = signal<Product[]>([]);
  readonly categoriesState = signal<LoadState>(createIdleState());
  readonly categoryProductsState = signal<LoadState>(createIdleState());
  readonly trendingProductsState = signal<LoadState>(createIdleState());
  readonly flashSaleProductsState = signal<LoadState>(createIdleState());
  readonly newCollectionProductsState = signal<LoadState>(createIdleState());
  readonly newArrivalsState = signal<LoadState>(createIdleState());
  readonly productIndexState = signal<LoadState>(createIdleState());

  readonly allProducts = computed(() => {
    const uniqueById = new Map<number, Product>();

    [
      ...this.productIndex(),
      ...this.categoryProducts(),
      ...this.newCollectionProducts(),
      ...this.trendingProducts(),
      ...this.flashSaleProducts(),
      ...this.newArrivals()
    ].forEach((product) => {
      if (product.isActive) {
        uniqueById.set(product.id, product);
      }
    });

    return Array.from(uniqueById.values()).sort((a, b) => a.id - b.id);
  });

  findProductById(productId: number): Product | undefined {
    return this.allProducts().find((product) => product.id === productId);
  }

  ensureCategoriesLoaded(): void {
    if (!this.shouldLoad(this.categoriesState())) {
      return;
    }

    this.loadCategories();
  }

  ensureCategoryProductsLoaded(): void {
    this.loadProductCollectionIfNeeded(
      `${apiEndpoints.products.list}?sort=best_selling&pageSize=12`,
      this.categoryProducts,
      this.categoryProductsState,
      'Khong tai duoc danh sach best seller.'
    );
  }

  ensureTrendingProductsLoaded(): void {
    this.loadProductCollectionIfNeeded(
      `${apiEndpoints.products.list}?sort=best_selling&pageSize=8`,
      this.trendingProducts,
      this.trendingProductsState,
      'Khong tai duoc danh sach trending.'
    );
  }

  ensureFlashSaleProductsLoaded(): void {
    this.loadProductCollectionIfNeeded(
      `${apiEndpoints.products.list}?onSale=true&pageSize=8`,
      this.flashSaleProducts,
      this.flashSaleProductsState,
      'Khong tai duoc danh sach flash sale.'
    );
  }

  ensureNewCollectionProductsLoaded(): void {
    this.loadProductCollectionIfNeeded(
      `${apiEndpoints.products.list}?sort=newest&pageSize=12`,
      this.newCollectionProducts,
      this.newCollectionProductsState,
      'Khong tai duoc bo suu tap moi.'
    );
  }

  ensureNewArrivalsLoaded(): void {
    this.loadProductCollectionIfNeeded(
      `${apiEndpoints.products.list}?sort=newest&pageSize=100`,
      this.newArrivals,
      this.newArrivalsState,
      'Khong tai duoc danh sach san pham moi.'
    );
  }

  ensureProductIndexLoaded(): void {
    this.loadProductCollectionIfNeeded(
      `${apiEndpoints.products.list}?pageSize=200`,
      this.productIndex,
      this.productIndexState,
      'Khong tai duoc danh sach san pham.'
    );
  }

  private loadCategories(): void {
    this.startLoading(this.categoriesState);

    this.http.get<CategoryViewDto[]>(apiEndpoints.categories.list).subscribe({
      next: (dtos) => {
        this.categories.set(
          dtos
            .map((dto) => ({
              id: dto.id,
              name: dto.name,
              slug: dto.slug,
              isActive: dto.isActive,
              image: '',
              group: dto.group
                ? {
                  id: dto.group.id,
                  name: dto.group.name,
                  slug: dto.group.slug,
                  isActive: dto.group.isActive,
                  displayOrder: dto.group.displayOrder
                }
                : undefined
            }))
            .sort((left, right) => {
              const groupOrder = (left.group?.displayOrder ?? Number.MAX_SAFE_INTEGER)
                - (right.group?.displayOrder ?? Number.MAX_SAFE_INTEGER);

              return groupOrder !== 0
                ? groupOrder
                : left.name.localeCompare(right.name, 'vi');
            })
        );
        this.finishLoading(this.categoriesState);
      },
      error: () => {
        this.categories.set([]);
        this.failLoading(this.categoriesState, 'Khong tai duoc danh muc san pham.');
      }
    });
  }

  private loadProductCollectionIfNeeded(
    url: string,
    target: WritableSignal<Product[]>,
    state: WritableSignal<LoadState>,
    errorMessage: string
  ): void {
    if (!this.shouldLoad(state())) {
      return;
    }

    this.loadProducts(url, target, state, errorMessage);
  }

  private loadProducts(
    url: string,
    target: WritableSignal<Product[]>,
    state: WritableSignal<LoadState>,
    errorMessage: string
  ): void {
    this.startLoading(state);

    this.http.get<ProductListResultDto>(url).subscribe({
      next: (result) => {
        target.set(result.items.map(mapProductViewDtoToProduct));
        this.finishLoading(state);
      },
      error: () => {
        target.set([]);
        this.failLoading(state, errorMessage);
      }
    });
  }

  private startLoading(state: WritableSignal<LoadState>): void {
    state.set({
      isLoading: true,
      hasError: false,
      errorMessage: null,
      isLoaded: false
    });
  }

  private finishLoading(state: WritableSignal<LoadState>): void {
    state.set({
      isLoading: false,
      hasError: false,
      errorMessage: null,
      isLoaded: true
    });
  }

  private failLoading(state: WritableSignal<LoadState>, errorMessage: string): void {
    state.set({
      isLoading: false,
      hasError: true,
      errorMessage,
      isLoaded: true
    });
  }

  private shouldLoad(state: LoadState): boolean {
    return !state.isLoading && (!state.isLoaded || state.hasError);
  }
}
