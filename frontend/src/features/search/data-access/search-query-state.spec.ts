import {
  normalizeSearchText,
  parseSearchQueryState,
  serializeSearchQueryState
} from './search-query-state';

describe('search-query-state helpers', () => {
  it('normalizes accented text and trims duplicate spaces', () => {
    expect(normalizeSearchText('  Khay   Cắm Bút  Gỗ Sồi  ')).toBe('khay cam but go soi');
  });

  it('parses query params and falls back to supported defaults', () => {
    expect(
      parseSearchQueryState({
        q: ' den ngu ',
        category: 'Lighting,Decor',
        brand: 'LumiHome',
        style: 'Minimalist',
        minPrice: '200000',
        maxPrice: '900000',
        inStock: '1',
        onSale: 'true',
        ratingGte: '4.9',
        sort: 'unsupported-sort'
      })
    ).toEqual({
      query: 'den ngu',
      selectedCategories: ['Lighting', 'Decor'],
      selectedBrands: ['LumiHome'],
      selectedStyles: ['Minimalist'],
      minPrice: 200000,
      maxPrice: 900000,
      inStockOnly: true,
      onSaleOnly: true,
      ratingGte: 4,
      sortBy: 'relevance'
    });
  });

  it('serializes only the active search state fields', () => {
    expect(
      serializeSearchQueryState({
        query: ' den ngu ',
        selectedCategories: ['Lighting'],
        selectedBrands: ['LumiHome'],
        selectedStyles: [],
        minPrice: 200000,
        maxPrice: null,
        inStockOnly: true,
        onSaleOnly: false,
        ratingGte: 4,
        sortBy: 'price-desc'
      })
    ).toEqual({
      q: 'den ngu',
      category: 'Lighting',
      brand: 'LumiHome',
      minPrice: 200000,
      inStock: 'true',
      ratingGte: 4,
      sort: 'price-desc'
    });
  });
});
