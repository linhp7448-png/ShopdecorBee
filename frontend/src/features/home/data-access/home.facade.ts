import { Injectable, inject } from '@angular/core';
import { Product } from '@/core/models';
import { CatalogStore } from '@/features/catalog/data-access/catalog.store';
import { ContentStore } from '@/features/content/data-access/content.store';
import { CheckoutFacade } from '@/features/checkout/data-access/checkout.facade';

@Injectable({ providedIn: 'root' })
export class HomeFacade {
  private readonly catalogStore = inject(CatalogStore);
  private readonly contentStore = inject(ContentStore);
  private readonly checkoutFacade = inject(CheckoutFacade);

  constructor() {
    this.catalogStore.ensureCategoryProductsLoaded();
    this.catalogStore.ensureTrendingProductsLoaded();
    this.catalogStore.ensureFlashSaleProductsLoaded();
    this.catalogStore.ensureNewArrivalsLoaded();
  }

  readonly trendingProducts = this.catalogStore.trendingProducts;
  readonly trendingProductsState = this.catalogStore.trendingProductsState;
  readonly flashSaleProducts = this.catalogStore.flashSaleProducts;
  readonly flashSaleProductsState = this.catalogStore.flashSaleProductsState;
  readonly newArrivals = this.catalogStore.newArrivals;
  readonly newArrivalsState = this.catalogStore.newArrivalsState;
  readonly categoryProducts = this.catalogStore.categoryProducts;
  readonly categoryProductsState = this.catalogStore.categoryProductsState;

  readonly blogPosts = this.contentStore.blogPosts;
  readonly shopLooks = this.contentStore.shopLooks;
  readonly lookbookItems = this.contentStore.lookbookItems;
  readonly instagramFeed = this.contentStore.instagramFeed;

  addToCart(productId: number, quantity = 1): void {
    this.checkoutFacade.addToCart(productId, quantity);
  }

  addProductToCart(product: Product, quantity = 1): void {
    this.checkoutFacade.addProductToCart(product, quantity);
  }
}
