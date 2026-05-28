import { Injectable, computed, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, concatMap, forkJoin, from, map, Observable, of, switchMap, tap, toArray } from 'rxjs';
import { apiConfig } from '@/core/api/api.config';
import { apiEndpoints } from '@/core/api/api-endpoints';
import { Product } from '@/core/models';
import { CatalogStore } from '@/features/catalog/data-access/catalog.store';
import { CommerceStore } from '@/features/commerce/data-access/commerce.store';
import { mapCartDto, mapOrderDto } from '@/features/commerce/data-access/commerce.mapper';
import type {
  AddCartItemRequestDto,
  CartDto,
  OrderDto,
  PaymentDto,
  PlaceOrderRequestDto,
  ProcessPaymentMethod,
  ProcessPaymentRequestDto,
  VnPayCreateUrlRequestDto,
  VnPayCreateUrlResponseDto
} from '@/features/commerce/data-access/commerce.api.types';
import { WalletFacade } from '@/features/commerce/data-access/wallet.facade';

export type CheckoutPaymentMethod = 'cod' | 'bank' | 'vnpay' | 'wallet';

export interface CheckoutSubmission {
  addressId?: number | null;
  fullName?: string;
  phone?: string;
  line1?: string;
  ward?: string;
  district?: string;
  city?: string;
  notes?: string;
  paymentMethod: CheckoutPaymentMethod;
}

export type CheckoutResult =
  | { kind: 'success'; message: string }
  | { kind: 'redirect'; redirectUrl: string }
  | { kind: 'error'; message: string };

interface ProblemDetailsPayload {
  detail?: string;
  message?: string;
  title?: string;
  errors?: Record<string, string[]>;
}

@Injectable({ providedIn: 'root' })
export class CheckoutFacade {
  private static readonly fallbackCartImage = '/assets/images/logo.png';

  private readonly http = inject(HttpClient);
  private readonly commerceStore = inject(CommerceStore);
  private readonly catalogStore = inject(CatalogStore);
  private readonly walletFacade = inject(WalletFacade);

  readonly users = this.commerceStore.users;
  readonly orders = this.commerceStore.orders;
  readonly activeCart = this.commerceStore.activeCart;
  readonly cartCount = this.commerceStore.cartCount;
  readonly cartItemsDetailed = computed(() => {
    return this.activeCart().items.map((item) => {
      const product = this.catalogStore.findProductById(item.productId);
      const unitPrice = product?.price ?? item.unitPrice;
      const image = product?.image?.trim()
        || product?.hoverImage?.trim()
        || item.productImage?.trim()
        || CheckoutFacade.fallbackCartImage;

      return {
        id: item.id,
        productId: item.productId,
        name: product?.name ?? item.productName ?? `San pham #${item.productId}`,
        image,
        quantity: item.quantity,
        unitPrice,
        lineTotal: unitPrice * item.quantity
      };
    });
  });
  readonly subtotal = computed(() => {
    return this.cartItemsDetailed().reduce((sum, item) => sum + item.lineTotal, 0);
  });
  readonly shippingFee = computed(() => {
    if (this.cartItemsDetailed().length === 0) {
      return 0;
    }

    return 30000;
  });

  addToCart(productId: number, quantity = 1): void {
    const token = this.readToken();
    if (token) {
      const headers = this.createAuthHeaders(token);
      const payload: AddCartItemRequestDto = { productId, quantity };
      this.http.post<CartDto>(apiEndpoints.cart.addItem, payload, { headers }).pipe(
        map((cart) => mapCartDto(cart)),
        catchError(() => of(null))
      ).subscribe((cart) => {
        if (cart) {
          this.commerceStore.replaceCart(cart);
        }
      });
      return;
    }

    this.commerceStore.addToCart(productId, quantity);
  }

  addProductToCart(product: Product, quantity = 1): void {
    const token = this.readToken();
    if (token) {
      this.addToCart(product.id, quantity);
      return;
    }

    this.commerceStore.addProductToCart(product, quantity);
  }

  removeFromCart(productId: number): void {
    const token = this.readToken();
    const cartItem = this.activeCart().items.find((item) => item.productId === productId);
    if (token && cartItem && this.activeCart().id > 0) {
      const headers = this.createAuthHeaders(token);
      this.http.delete(apiEndpoints.cart.removeItem(cartItem.id), { headers, responseType: 'text' }).pipe(
        switchMap(() => this.http.get<CartDto>(apiEndpoints.cart.detail, { headers })),
        map((cart) => mapCartDto(cart)),
        catchError(() => of(null))
      ).subscribe((cart) => {
        if (cart) {
          this.commerceStore.replaceCart(cart);
        }
      });
      return;
    }

    this.commerceStore.removeFromCart(productId);
  }

  bootstrapAuthenticatedState(options: { mergeGuestCart?: boolean } = {}): void {
    const token = this.readToken();
    if (!token) {
      return;
    }

    const headers = this.createAuthHeaders(token);
    const currentCart = this.activeCart();
    const guestItems = currentCart.id === 0 && currentCart.userId === 0
      ? [...currentCart.items]
      : [];
    const mergeGuestCart = options.mergeGuestCart ?? true;
    const syncSource = mergeGuestCart && guestItems.length > 0
      ? this.syncCartToServer(headers, guestItems)
      : of(undefined);

    syncSource.pipe(
      switchMap(() => forkJoin({
        cart: this.http.get<CartDto>(apiEndpoints.cart.detail, { headers }),
        orders: this.http.get<OrderDto[]>(apiEndpoints.orders.list, { headers })
      })),
      tap(({ cart, orders }) => {
        this.commerceStore.replaceCart(mapCartDto(cart));
        this.commerceStore.replaceOrders(orders.map(mapOrderDto));
      }),
      catchError(() => of(null))
    ).subscribe();
  }

  refreshOrders(): Observable<boolean> {
    const token = this.readToken();
    if (!token) {
      return of(false);
    }

    const headers = this.createAuthHeaders(token);
    return this.http.get<OrderDto[]>(apiEndpoints.orders.list, { headers }).pipe(
      tap((orders) => {
        this.commerceStore.replaceOrders(orders.map(mapOrderDto));
      }),
      map(() => true),
      catchError(() => of(false))
    );
  }

  cancelOrder(orderId: number): Observable<CheckoutResult> {
    const token = this.readToken();
    if (!token) {
      return of({ kind: 'error', message: 'Vui long dang nhap de quan ly don hang.' });
    }

    const headers = this.createAuthHeaders(token);
    return this.http.post<OrderDto>(apiEndpoints.orders.cancel(orderId), {}, { headers }).pipe(
      map((order) => {
        this.commerceStore.replaceOrder(mapOrderDto(order));
        return {
          kind: 'success' as const,
          message: `Don hang ${order.orderNumber} da duoc huy.`
        };
      }),
      catchError((error) => of({
        kind: 'error' as const,
        message: this.readProblemMessage(error, 'Khong the huy don hang luc nay.')
      }))
    );
  }

  createVnPayUrl(orderId: number): Observable<CheckoutResult> {
    const token = this.readToken();
    if (!token) {
      return of({ kind: 'error', message: 'Vui long dang nhap de thanh toan.' });
    }

    const headers = this.createAuthHeaders(token);
    const payload: VnPayCreateUrlRequestDto = { orderId };
    return this.http.post<VnPayCreateUrlResponseDto>(apiEndpoints.payments.vnpayUrl, payload, { headers }).pipe(
      map((response) => ({ kind: 'redirect' as const, redirectUrl: response.paymentUrl })),
      catchError((error) => of({
        kind: 'error' as const,
        message: this.readProblemMessage(error, 'Khong tao duoc link VNPay.')
      }))
    );
  }

  resetForGuest(): void {
    this.commerceStore.resetForGuest();
  }

  placeOrder(input: CheckoutSubmission): Observable<CheckoutResult> {
    const token = this.readToken();
    if (!token) {
      return of({ kind: 'error', message: 'Vui long dang nhap de dat hang.' });
    }

    if (this.activeCart().items.length === 0) {
      return of({ kind: 'error', message: 'Gio hang dang trong.' });
    }

    const headers = this.createAuthHeaders(token);
    const payload: PlaceOrderRequestDto = this.buildOrderPayload(input);

    return this.syncCartToServer(headers).pipe(
      switchMap(() => this.http.post<OrderDto>(apiEndpoints.orders.create, payload, { headers })),
      switchMap((orderDto) => {
        const order = mapOrderDto(orderDto);
        this.commerceStore.recordOrder(order);
        this.commerceStore.clearCart();

        return this.handlePayment(orderDto, input.paymentMethod, headers);
      }),
      catchError((error) => of({
        kind: 'error' as const,
        message: this.readProblemMessage(error, 'Khong the dat hang luc nay.')
      }))
    );
  }

  private handlePayment(
    order: OrderDto,
    paymentMethod: CheckoutPaymentMethod,
    headers: HttpHeaders
  ): Observable<CheckoutResult> {
    if (paymentMethod === 'vnpay') {
      const payload: VnPayCreateUrlRequestDto = { orderId: order.id };
      return this.http.post<VnPayCreateUrlResponseDto>(apiEndpoints.payments.vnpayUrl, payload, { headers }).pipe(
        map((response) => ({ kind: 'redirect' as const, redirectUrl: response.paymentUrl })),
        catchError((error) => of({
          kind: 'error' as const,
          message: `Don hang ${order.orderNumber} da duoc tao, nhung khong tao duoc link VNPay. ${this.readProblemMessage(error, 'Thu lai sau.')}`
        }))
      );
    }

    if (paymentMethod === 'wallet') {
      return this.walletFacade.payOrder(order.id).pipe(
        map((result) => {
          if (result.kind === 'success') {
            this.commerceStore.markOrderAsProcessing(order.id);
            return {
              kind: 'success' as const,
              message: `Don hang ${order.orderNumber} da duoc thanh toan bang vi thanh cong.`
            };
          }
          return { kind: 'error' as const, message: result.message };
        })
      );
    }

    const method: ProcessPaymentMethod = paymentMethod === 'cod' ? 'cod' : 'bank_transfer';
    const payload: ProcessPaymentRequestDto = {
      orderId: order.id,
      method
    };

    return this.http.post<PaymentDto>(apiEndpoints.payments.process, payload, { headers }).pipe(
      map(() => {
        this.commerceStore.markOrderAsProcessing(order.id);
        return {
          kind: 'success' as const,
          message: `Don hang ${order.orderNumber} da duoc tao thanh cong.`
        };
      }),
      catchError((error) => of({
        kind: 'error' as const,
        message: `Don hang ${order.orderNumber} da duoc tao, nhung khong cap nhat thanh toan duoc. ${this.readProblemMessage(error, 'Thu lai sau.')}`
      }))
    );
  }

  private buildOrderPayload(input: CheckoutSubmission): PlaceOrderRequestDto {
    const payload: PlaceOrderRequestDto = {
      notes: this.normalizeOptional(input.notes)
    };

    if (typeof input.addressId === 'number' && input.addressId > 0) {
      payload.addressId = input.addressId;
      return payload;
    }

    payload.fullName = input.fullName?.trim();
    payload.phone = input.phone?.trim();
    payload.line1 = input.line1?.trim();
    payload.ward = input.ward?.trim();
    payload.district = input.district?.trim();
    payload.city = input.city?.trim();
    return payload;
  }

  private syncCartToServer(headers: HttpHeaders, items = this.activeCart().items): Observable<void> {

    return this.http.delete(apiEndpoints.cart.clear, { headers, responseType: 'text' }).pipe(
      switchMap(() => {
        if (items.length === 0) {
          return of(undefined);
        }

        return from(items).pipe(
          concatMap((item) => {
            const payload: AddCartItemRequestDto = {
              productId: item.productId,
              quantity: item.quantity
            };

            return this.http.post(apiEndpoints.cart.addItem, payload, { headers });
          }),
          toArray(),
          map(() => undefined)
        );
      })
    );
  }

  private createAuthHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      [apiConfig.authorizationHeader]: `${apiConfig.bearerPrefix}${token}`,
      [apiConfig.authTokenHeader]: token
    });
  }

  private readToken(): string {
    return localStorage.getItem('token')?.trim() ?? '';
  }

  private normalizeOptional(value?: string): string | undefined {
    const normalized = value?.trim();
    return normalized ? normalized : undefined;
  }

  private readProblemMessage(error: unknown, fallbackMessage: string): string {
    if (!error || typeof error !== 'object' || !('error' in error)) {
      return fallbackMessage;
    }

    const payload = (error as { error?: unknown }).error;
    if (!payload || typeof payload !== 'object') {
      return fallbackMessage;
    }

    const details = payload as ProblemDetailsPayload;
    if (typeof details.detail === 'string' && details.detail.trim()) {
      return details.detail.trim();
    }

    if (typeof details.message === 'string' && details.message.trim()) {
      return details.message.trim();
    }

    const validationMessages = details.errors
      ? Object.values(details.errors).flat().filter((message) => message.trim().length > 0)
      : [];

    if (validationMessages.length > 0) {
      return validationMessages.join(' ');
    }

    if (typeof details.title === 'string' && details.title.trim()) {
      return details.title.trim();
    }

    return fallbackMessage;
  }
}
