import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { CatalogStore } from './catalog.store';
import { flushCatalogBootstrapRequests } from '@/testing/catalog-test.utils';

describe('CatalogStore', () => {
  let store: CatalogStore;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    store = TestBed.inject(CatalogStore);
    httpMock = TestBed.inject(HttpTestingController);
    flushCatalogBootstrapRequests(httpMock);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('loads catalog collections from API responses', () => {
    expect(store.categories().length).toBeGreaterThan(0);
    expect(store.categoryProducts().length).toBeGreaterThan(0);
    expect(store.newCollectionProducts().length).toBeGreaterThan(0);
    expect(store.categoryProductsState().hasError).toBe(false);
    expect(store.categoryProductsState().isLoaded).toBe(true);
  });

  it('builds a shared product index across catalog collections', () => {
    const productIds = store.allProducts().map((product) => product.id);

    expect(productIds).toContain(1);
    expect(productIds).toContain(9);
    expect(productIds).toContain(101);
    expect(productIds).toContain(501);
    expect(new Set(productIds).size).toBe(productIds.length);
  });

  it('finds products from multiple catalog collections by id', () => {
    expect(store.findProductById(101)?.slug).toBe('khay-cam-but-go-soi');
    expect(store.findProductById(501)?.slug).toBe('lo-hoa-gom-moc');
    expect(store.findProductById(1)?.slug).toBe('honeycomb-wall-shelf');
  });
});
