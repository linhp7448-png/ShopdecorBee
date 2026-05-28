import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AdminFacade } from './admin.facade';
import { ADMIN_DATA_SOURCE, type AdminDashboardSnapshot } from './admin.data-source';

describe('AdminFacade', () => {
  it('loads admin data through the configured data source abstraction', () => {
    const snapshot: AdminDashboardSnapshot = {
      products: [
        {
          id: 1,
          sku: 'SKU-1',
          slug: 'product-1',
          name: 'Product 1',
          price: 100000,
          categoryId: 1,
          category: 'Decor',
          image: 'image-1',
          hoverImage: 'image-1-hover',
          isActive: true,
          createdAt: '2026-04-10T00:00:00.000Z'
        }
      ],
      orders: [
        {
          id: 1,
          orderCode: 'ORD-1',
          userId: 1,
          items: [],
          subtotal: 100000,
          shippingFee: 30000,
          totalAmount: 130000,
          status: 'pending',
          createdAt: '2026-04-10T00:00:00.000Z'
        }
      ],
      users: [
        {
          id: 1,
          email: 'user@example.com',
          fullName: 'User Example',
          phone: '0900000000',
          addresses: [],
          createdAt: '2026-04-10T00:00:00.000Z'
        }
      ],
      feedback: [
        {
          id: 1,
          name: 'Tester',
          content: 'Looks good.'
        }
      ]
    };

    TestBed.configureTestingModule({
      providers: [
        {
          provide: ADMIN_DATA_SOURCE,
          useValue: {
            loadSnapshot: () => of(snapshot)
          }
        }
      ]
    });

    const facade = TestBed.inject(AdminFacade);

    expect(facade.products()).toEqual(snapshot.products);
    expect(facade.orders()).toEqual(snapshot.orders);
    expect(facade.users()).toEqual(snapshot.users);
    expect(facade.feedback()).toEqual(snapshot.feedback);
    expect(facade.totalRevenue()).toBe(130000);
    expect(facade.pendingOrders()).toBe(1);
    expect(facade.hasError()).toBe(false);
  });
});
