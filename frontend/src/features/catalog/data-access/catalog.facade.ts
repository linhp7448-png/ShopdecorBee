import { Injectable, inject } from '@angular/core';
import { Product } from '@/core/models';
import { CatalogStore } from '@/features/catalog/data-access/catalog.store';
import { ContentStore } from '@/features/content/data-access/content.store';
import { CheckoutFacade } from '@/features/checkout/data-access/checkout.facade';

@Injectable({ providedIn: 'root' })
export class CatalogFacade {
  private readonly catalogStore = inject(CatalogStore);
  private readonly contentStore = inject(ContentStore);
  private readonly checkoutFacade = inject(CheckoutFacade);

  readonly categoryProducts = this.catalogStore.categoryProducts;
  readonly categoryProductsState = this.catalogStore.categoryProductsState;
  readonly newCollectionProducts = this.catalogStore.newCollectionProducts;
  readonly newCollectionProductsState = this.catalogStore.newCollectionProductsState;
  readonly lookbookItems = this.contentStore.lookbookItems;

  addToCart(productId: number, quantity = 1): void {
    this.checkoutFacade.addToCart(productId, quantity);
  }

  addProductToCart(product: Product, quantity = 1): void {
    this.checkoutFacade.addProductToCart(product, quantity);
  }
}
