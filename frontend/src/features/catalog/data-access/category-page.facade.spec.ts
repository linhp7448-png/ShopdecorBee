import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { CategoryPageFacade } from './category-page.facade';
import { flushCatalogBootstrapRequests, toProductListResultDto } from '@/testing/catalog-test.utils';
import { apiEndpoints } from '@/core/api/api-endpoints';
import { MOCK_CATEGORY_PRODUCTS } from '@/core/mock-data/ecommerce.mock';

describe('CategoryPageFacade', () => {
  let facade: CategoryPageFacade;
  let httpMock: HttpTestingController;

  const decorProducts = MOCK_CATEGORY_PRODUCTS.filter((product) => product.category === 'Decor');

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CategoryPageFacade, provideHttpClient(), provideHttpClientTesting()]
    });
    facade = TestBed.inject(CategoryPageFacade);
    httpMock = TestBed.inject(HttpTestingController);
    flushCatalogBootstrapRequests(httpMock);
    facade.loadCategory('decor');
    httpMock.expectOne(`${apiEndpoints.products.list}?category=decor&pageSize=200`)
      .flush(toProductListResultDto(decorProducts));
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('filters category products by the selected style', () => {
    facade.toggleFilter('style', 'Minimalist');

    expect(facade.filteredProducts().length).toBeGreaterThan(0);
    expect(facade.filteredProducts().every((product) => product.style === 'Minimalist')).toBe(true);
  });

  it('sorts filtered products by ascending price', () => {
    facade.sort('price_asc', 'Giá: Thấp - Cao');

    const prices = facade.filteredProducts().map((product) => product.price);
    const sortedPrices = [...prices].sort((a, b) => a - b);

    expect(prices).toEqual(sortedPrices);
  });

  it('resets pagination to the first page when a filter changes', () => {
    facade.loadMore();
    expect(facade.displayCount()).toBe(16);

    facade.togglePriceFilter('under200');

    expect(facade.displayCount()).toBe(8);
    expect(facade.filteredProducts().every((product) => product.price < 200000)).toBe(true);
  });
});
