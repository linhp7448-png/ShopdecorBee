import {
  MOCK_CATEGORY_PRODUCTS,
  MOCK_CATEGORIES,
  MOCK_CARTS,
  MOCK_ORDERS,
  MOCK_USERS
} from './ecommerce.mock';

describe('Ecommerce mock data contract', () => {
  it('keeps required e-commerce entities populated', () => {
    expect(MOCK_CATEGORIES.length).toBeGreaterThan(0);
    expect(MOCK_CATEGORY_PRODUCTS.length).toBeGreaterThan(0);
    expect(MOCK_USERS.length).toBeGreaterThan(0);
    expect(MOCK_CARTS.length).toBeGreaterThan(0);
    expect(MOCK_ORDERS.length).toBeGreaterThan(0);
  });

  it('keeps product entity fields aligned with domain model', () => {
    const product = MOCK_CATEGORY_PRODUCTS[0];
    expect(product.id).toBeDefined();
    expect(product.sku).toBeTruthy();
    expect(product.slug).toBeTruthy();
    expect(product.categoryId).toBeDefined();
    expect(product.createdAt).toBeTruthy();
  });
});
