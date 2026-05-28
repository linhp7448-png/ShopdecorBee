export type SearchFilterChipType =
  | 'category'
  | 'brand'
  | 'style'
  | 'material'
  | 'color'
  | 'minPrice'
  | 'maxPrice'
  | 'inStock'
  | 'onSale'
  | 'rating';

export interface SearchFilterChip {
  type: SearchFilterChipType;
  value?: string;
  label: string;
}

export interface SearchQuickPriceRange {
  label: string;
  min: number | null;
  max: number | null;
}

export interface SearchPriceInputChange {
  type: 'min' | 'max';
  value: string;
}
