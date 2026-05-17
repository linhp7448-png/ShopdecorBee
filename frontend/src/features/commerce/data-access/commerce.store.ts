import { Injectable, computed, inject, signal } from '@angular/core';
import { Cart, Order, Product, User } from '@/core/models';
import { MOCK_USERS } from '@/core/mock-data/ecommerce.mock';
import { CatalogStore } from '@/features/catalog/data-access/catalog.store';

const guestCartStorageKey = 'guest-cart';

const createEmptyCart = (): Cart => ({
  id: 0,
  userId: 0,
  items: [],
  subtotal: 0,
  updatedAt: new Date().toISOString()
});

@Injectable({ providedIn: 'root' })
export class CommerceStore {
  private readonly catalogStore = inject(CatalogStore);

  readonly users = signal<User[]>(MOCK_USERS);
  readonly orders = signal<Order[]>([]);
  readonly activeCart = signal<Cart>(this.readPersistedGuestCart());

  constructor() {
    this.persistGuestCart(this.activeCart());
  }

  readonly cartCount = computed(() => {
    return this.activeCart().items.reduce((total, item) => total + item.quantity, 0);
  });

  addToCart(productId: number, quantity = 1): void {
    if (quantity <= 0) {
      return;
    }

    const product = this.catalogStore.findProductById(productId);
    if (!product) {
      return;
    }

    this.addProductToCart(product, quantity);
  }

  addProductToCart(product: Product, quantity = 1): void {
    if (quantity <= 0) {
      return;
    }

    this.activeCart.update((cart) => {
      const existingItem = cart.items.find((item) => item.productId === product.id);
      if (existingItem) {
        const nextCart = {
          ...cart,
          items: cart.items.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
          updatedAt: new Date().toISOString()
        };
        this.persistGuestCart(nextCart);
        return nextCart;
      }

      const nextCart = {
        ...cart,
        items: [
          ...cart.items,
          {
            id: Date.now(),
            productId: product.id,
            productName: product.name,
            productImage: product.image,
            quantity,
            unitPrice: product.price
          }
        ],
        updatedAt: new Date().toISOString()
      };
      this.persistGuestCart(nextCart);
      return nextCart;
    });
  }

  removeFromCart(productId: number): void {
    this.activeCart.update((cart) => {
      const nextCart = {
        ...cart,
        items: cart.items.filter((item) => item.productId !== productId),
        updatedAt: new Date().toISOString()
      };
      this.persistGuestCart(nextCart);
      return nextCart;
    });
  }

  clearCart(): void {
    const nextCart = {
      ...this.activeCart(),
      items: [],
      subtotal: 0,
      updatedAt: new Date().toISOString()
    };
    this.activeCart.set(nextCart);
    this.persistGuestCart(nextCart);
  }

  replaceCart(cart: Cart): void {
    this.activeCart.set(cart);
    this.persistGuestCart(cart);
  }

  replaceOrders(orders: Order[]): void {
    this.orders.set(orders);
  }

  recordOrder(order: Order): void {
    this.orders.update((orders) => [
      order,
      ...orders.filter((existing) => existing.id !== order.id)
    ]);
  }

  markOrderAsProcessing(orderId: number): void {
    this.orders.update((orders) =>
      orders.map((order) =>
        order.id === orderId
          ? { ...order, status: 'processing', paymentStatus: 'paid' }
          : order
      )
    );
  }

  replaceOrder(order: Order): void {
    this.orders.update((orders) => [
      order,
      ...orders.filter((existing) => existing.id !== order.id)
    ]);
  }

  resetForGuest(): void {
    this.orders.set([]);
    this.activeCart.set(this.readPersistedGuestCart());
  }

  clearGuestCart(): void {
    const nextCart = createEmptyCart();
    this.activeCart.set(nextCart);
    this.persistGuestCart(nextCart);
  }

  private readPersistedGuestCart(): Cart {
    try {
      const serialized = globalThis.localStorage?.getItem(guestCartStorageKey);
      if (!serialized) {
        return createEmptyCart();
      }

      const parsed = JSON.parse(serialized) as Partial<Cart>;
      if (!Array.isArray(parsed.items)) {
        return createEmptyCart();
      }

      return {
        id: parsed.id ?? 0,
        userId: parsed.userId ?? 0,
        items: parsed.items,
        subtotal: parsed.subtotal ?? 0,
        updatedAt: parsed.updatedAt ?? new Date().toISOString()
      };
    }
    catch {
      return createEmptyCart();
    }
  }

  private persistGuestCart(cart: Cart): void {
    try {
      if (cart.id !== 0 || cart.userId !== 0) {
        globalThis.localStorage?.removeItem(guestCartStorageKey);
        return;
      }

      globalThis.localStorage?.setItem(guestCartStorageKey, JSON.stringify(cart));
    }
    catch {
      // Ignore storage failures and keep the in-memory cart usable.
    }
  }
}
