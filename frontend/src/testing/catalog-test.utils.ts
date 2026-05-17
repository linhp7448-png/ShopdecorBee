import { HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { apiEndpoints } from '@/core/api/api-endpoints';
import {
  Category,
  CategoryViewDto,
  Product,
  ProductListResultDto,
  ProductViewDto
} from '@/core/models';
import {
  MOCK_CATEGORIES,
  MOCK_CATEGORY_PRODUCTS,
  MOCK_FLASH_SALE_PRODUCTS,
  MOCK_NEW_ARRIVALS_PRODUCTS,
  MOCK_NEW_COLLECTION_PRODUCTS,
  MOCK_TRENDING_PRODUCTS
} from '@/core/mock-data/ecommerce.mock';

const resolveCategorySlug = (categoryId: number, fallbackCategory: string): string => {
  return MOCK_CATEGORIES.find((category) => category.id === categoryId)?.slug
    ?? fallbackCategory.toLowerCase().replace(/\s+/g, '-');
};

export const toCategoryViewDto = (category: Category): CategoryViewDto => ({
  id: category.id,
  name: category.name,
  slug: category.slug,
  isActive: category.isActive,
  group: category.group
    ? {
        id: category.group.id,
        name: category.group.name,
        slug: category.group.slug,
        isActive: category.group.isActive,
        displayOrder: category.group.displayOrder
      }
    : undefined
});

export const toProductViewDto = (product: Product): ProductViewDto => ({
  productId: product.id,
  sku: product.sku,
  productName: product.name,
  slug: product.slug,
  price: product.price,
  oldPrice: product.originalPrice,
  categoryId: product.categoryId,
  category: product.category,
  image: product.image,
  hoverImage: product.hoverImage,
  videoUrl: product.videoUrl,
  tag: product.tag,
  soldPercentage: product.soldPercentage,
  stockLeft: product.stockLeft ?? 0,
  rating: product.rating ?? 0,
  reviews: product.reviews ?? 0,
  brand: product.brand ?? '',
  color: product.color ?? '',
  material: product.material ?? '',
  style: product.style ?? '',
  inStock: product.inStock ?? product.tag !== 'Sold Out',
  isActive: product.isActive,
  createdAt: product.createdAt,
  description: undefined,
  categoryNavigation: {
    id: product.categoryId,
    name: product.category,
    slug: resolveCategorySlug(product.categoryId, product.category),
  }
});

export const toProductListResultDto = (items: Product[], sortBy = 'relevance'): ProductListResultDto => ({
  items: items.map(toProductViewDto),
  total: items.length,
  page: 1,
  pageSize: items.length,
  sortBy
});

const flushProductRequest = (request: TestRequest): void => {
  const url = request.request.urlWithParams;

  if (url.includes('sort=best_selling') && url.includes('pageSize=12')) {
    request.flush(toProductListResultDto(MOCK_CATEGORY_PRODUCTS, 'best_selling'));
    return;
  }

  if (url.includes('sort=best_selling')) {
    request.flush(toProductListResultDto(MOCK_TRENDING_PRODUCTS, 'best_selling'));
    return;
  }

  if (url.includes('onSale=true')) {
    request.flush(toProductListResultDto(MOCK_FLASH_SALE_PRODUCTS, 'relevance'));
    return;
  }

  if (url.includes('sort=newest') && url.includes('pageSize=12')) {
    request.flush(toProductListResultDto(MOCK_NEW_COLLECTION_PRODUCTS, 'newest'));
    return;
  }

  if (url.includes('sort=newest')) {
    request.flush(toProductListResultDto(MOCK_NEW_ARRIVALS_PRODUCTS, 'newest'));
    return;
  }

  if (url.includes('category=decor')) {
    request.flush(
      toProductListResultDto(MOCK_CATEGORY_PRODUCTS.filter((product) => product.category === 'Decor'), 'relevance')
    );
    return;
  }

  request.flush(toProductListResultDto(MOCK_CATEGORY_PRODUCTS, 'relevance'));
};

export const flushCatalogBootstrapRequests = (httpMock: HttpTestingController): void => {
  const requests = httpMock.match(
    (request) =>
      request.url === apiEndpoints.categories.list
      || request.urlWithParams.startsWith(apiEndpoints.products.list)
  );

  requests.forEach((request) => {
    if (request.request.url === apiEndpoints.categories.list) {
      request.flush(MOCK_CATEGORIES.map(toCategoryViewDto));
      return;
    }

    flushProductRequest(request);
  });
};

export const flushProductListRequest = (httpMock: HttpTestingController, items: Product[]): void => {
  const request = httpMock.expectOne((req) => req.url === apiEndpoints.products.list);
  request.flush(toProductListResultDto(items));
};

export const flushProductDetailRequest = (httpMock: HttpTestingController, item: Product): void => {
  const request = httpMock.expectOne(apiEndpoints.products.detail(item.id));
  request.flush(toProductViewDto(item));
};
