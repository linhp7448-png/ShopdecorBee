import { TestBed } from '@angular/core/testing';
import { convertToParamMap, ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { CategoryComponent } from './category.component';
import { flushCatalogBootstrapRequests, toProductListResultDto } from '@/testing/catalog-test.utils';
import { apiEndpoints } from '@/core/api/api-endpoints';
import { MOCK_CATEGORY_PRODUCTS } from '@/core/mock-data/ecommerce.mock';

describe('CategoryComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: Router,
          useValue: {
            navigate: vi.fn().mockResolvedValue(true)
          }
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ slug: 'decor' })
            },
            paramMap: of(convertToParamMap({ slug: 'decor' }))
          }
        }
      ]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('creates the catalog category page', () => {
    const fixture = TestBed.createComponent(CategoryComponent);
    flushCatalogBootstrapRequests(httpMock);
    fixture.detectChanges();
    httpMock.expectOne(`${apiEndpoints.products.list}?category=decor&pageSize=200`)
      .flush(toProductListResultDto(MOCK_CATEGORY_PRODUCTS.filter((product) => product.category === 'Decor')));
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
