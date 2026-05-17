import { Params } from '@angular/router';

export const SEARCH_SORTS = ['relevance', 'newest', 'price-asc', 'price-desc', 'rating-desc'] as const;

export type SearchSort = (typeof SEARCH_SORTS)[number];

export type SearchQueryStateSnapshot = {
  query: string;
  selectedCategories: string[];
  selectedBrands: string[];
  selectedStyles: string[];
  selectedMaterials: string[];
  selectedColors: string[];
  minPrice: number | null;
  maxPrice: number | null;
  inStockOnly: boolean;
  onSaleOnly: boolean;
  ratingGte: number;
  sortBy: SearchSort;
};

export function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function serializeSearchQueryState(state: SearchQueryStateSnapshot): Params {
  const queryParams: Params = {};
  const query = state.query.trim();

  if (query) queryParams.q = query;
  if (state.selectedCategories.length) queryParams.category = state.selectedCategories.join(',');
  if (state.selectedBrands.length) queryParams.brand = state.selectedBrands.join(',');
  if (state.selectedStyles.length) queryParams.style = state.selectedStyles.join(',');
  if (state.selectedMaterials.length) queryParams.material = state.selectedMaterials.join(',');
  if (state.selectedColors.length) queryParams.color = state.selectedColors.join(',');
  if (state.minPrice !== null) queryParams.minPrice = state.minPrice;
  if (state.maxPrice !== null) queryParams.maxPrice = state.maxPrice;
  if (state.inStockOnly) queryParams.inStock = 'true';
  if (state.onSaleOnly) queryParams.onSale = 'true';
  if (state.ratingGte > 0) queryParams.ratingGte = state.ratingGte;
  if (state.sortBy !== 'relevance') queryParams.sort = state.sortBy;

  return queryParams;
}

export function parseSearchQueryState(
  params: Record<string, string | undefined>
): SearchQueryStateSnapshot {
  return {
    query: (params.q ?? '').trim(),
    selectedCategories: parseListParam(params.category),
    selectedBrands: parseListParam(params.brand),
    selectedStyles: parseListParam(params.style),
    selectedMaterials: parseListParam(params.material),
    selectedColors: parseListParam(params.color),
    minPrice: parseNumberParam(params.minPrice),
    maxPrice: parseNumberParam(params.maxPrice),
    inStockOnly: parseBooleanParam(params.inStock),
    onSaleOnly: parseBooleanParam(params.onSale),
    ratingGte: clampRating(parseNumberParam(params.ratingGte)),
    sortBy: normalizeSearchSort(params.sort)
  };
}

function parseListParam(value?: string): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseNumberParam(value?: string): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return parsed;
}

function parseBooleanParam(value?: string): boolean {
  return value === 'true' || value === '1';
}

function clampRating(value: number | null): number {
  if (value === null) {
    return 0;
  }

  return Math.max(0, Math.min(5, Math.floor(value)));
}

function normalizeSearchSort(value?: string): SearchSort {
  return SEARCH_SORTS.includes(value as SearchSort) ? (value as SearchSort) : 'relevance';
}
