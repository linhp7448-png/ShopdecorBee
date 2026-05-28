import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { apiEndpoints } from '@/core/api/api-endpoints';
import { CheckoutFacade } from './checkout.facade';
import { flushCatalogBootstrapRequests } from '@/testing/catalog-test.utils';

describe('CheckoutFacade', () => {
  let facade: CheckoutFacade;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    facade = TestBed.inject(CheckoutFacade);
    httpMock = TestBed.inject(HttpTestingController);
    flushCatalogBootstrapRequests(httpMock);
  });

  afterEach(() => {
    localStorage.clear();
    httpMock.verify();
  });

  it('resolves cart item details from the shared product index', () => {
    facade.addToCart(101, 1);
    facade.addToCart(102, 1);
    const items = facade.cartItemsDetailed();

    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({
      productId: 101,
      quantity: 1,
      unitPrice: 150000,
      lineTotal: 150000
    });
    expect(items[1]).toMatchObject({
      productId: 102,
      quantity: 1,
      unitPrice: 350000,
      lineTotal: 350000
    });
    expect(items[0].name).not.toContain('#101');
    expect(items[1].name).not.toContain('#102');
  });

  it('computes subtotal and shipping from the resolved cart items', () => {
    facade.addToCart(101, 1);
    facade.addToCart(102, 1);
    expect(facade.subtotal()).toBe(500000);
    expect(facade.shippingFee()).toBe(30000);
  });

  it('allows adding products to cart without requiring login', () => {
    facade.addToCart(109, 1);

    expect(facade.cartCount()).toBe(1);
    expect(facade.activeCart().items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          productId: 109,
          quantity: 1
        })
      ])
    );
  });

  it('syncs the local cart, creates an order, and returns a VNPay redirect URL', async () => {
    facade.addToCart(101, 1);
    facade.addToCart(102, 1);
    localStorage.setItem('token', 'test-token');

    const resultPromise = firstValueFrom(
      facade.placeOrder({
        fullName: 'Nguyen Van A',
        phone: '0123456789',
        line1: '123 Nguyen Trai',
        ward: 'Phuong 1',
        district: 'Quan 1',
        city: 'Ho Chi Minh',
        notes: 'Giao gio hanh chinh',
        paymentMethod: 'vnpay'
      })
    );

    const clearRequest = httpMock.expectOne((request) =>
      request.method === 'DELETE' && request.url === apiEndpoints.cart.clear
    );
    expect(clearRequest.request.headers.get('Authorization')).toBe('Bearer test-token');
    clearRequest.flush('');

    const addFirstItemRequest = httpMock.expectOne((request) =>
      request.method === 'POST' && request.url === apiEndpoints.cart.addItem
    );
    expect(addFirstItemRequest.request.body).toEqual({ productId: 101, quantity: 1 });
    addFirstItemRequest.flush({});

    const addSecondItemRequest = httpMock.expectOne((request) =>
      request.method === 'POST' && request.url === apiEndpoints.cart.addItem
    );
    expect(addSecondItemRequest.request.body).toEqual({ productId: 102, quantity: 1 });
    addSecondItemRequest.flush({});

    const orderRequest = httpMock.expectOne((request) =>
      request.method === 'POST' && request.url === apiEndpoints.orders.create
    );
    expect(orderRequest.request.body).toMatchObject({
      fullName: 'Nguyen Van A',
      phone: '0123456789',
      line1: '123 Nguyen Trai',
      ward: 'Phuong 1',
      district: 'Quan 1',
      city: 'Ho Chi Minh',
      notes: 'Giao gio hanh chinh'
    });
    orderRequest.flush({
      id: 900,
      orderNumber: 'ORD-900',
      status: 'pending_payment',
      paymentStatus: 'pending',
      subtotal: 500000,
      shippingFee: 30000,
      totalAmount: 530000,
      fullName: 'Nguyen Van A',
      phone: '0123456789',
      line1: '123 Nguyen Trai',
      ward: 'Phuong 1',
      district: 'Quan 1',
      city: 'Ho Chi Minh',
      notes: 'Giao gio hanh chinh',
      createdAt: '2026-04-07T00:00:00Z',
      updatedAt: '2026-04-07T00:00:00Z',
      items: [
        {
          id: 1,
          productId: 101,
          productName: 'Khay Cam But Go Soi',
          productSku: 'BEE-101',
          productImage: 'https://example.test/101.png',
          unitPrice: 150000,
          quantity: 1,
          lineTotal: 150000
        },
        {
          id: 2,
          productId: 102,
          productName: 'Den Ban Pixar',
          productSku: 'BEE-102',
          productImage: 'https://example.test/102.png',
          unitPrice: 350000,
          quantity: 1,
          lineTotal: 350000
        }
      ]
    });

    const vnpayRequest = httpMock.expectOne((request) =>
      request.method === 'POST' && request.url === apiEndpoints.payments.vnpayUrl
    );
    expect(vnpayRequest.request.body).toEqual({ orderId: 900 });
    vnpayRequest.flush({
      paymentId: 77,
      orderId: 900,
      orderNumber: 'ORD-900',
      amount: 530000,
      transactionCode: 'VNPAY-900-20260407000000000',
      createdAt: '2026-04-07T00:00:00Z',
      paymentUrl: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_TxnRef=VNPAY-900-20260407000000000'
    });

    const result = await resultPromise;
    expect(result).toEqual({
      kind: 'redirect',
      redirectUrl: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_TxnRef=VNPAY-900-20260407000000000'
    });
    expect(facade.activeCart().items).toEqual([]);
  });
});
