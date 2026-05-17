export interface CategoryGroupSummary {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
  displayOrder: number;
}

export interface Category {
  id: number;
  slug: string;
  name: string;
  description?: string;
  parentCategoryId?: number;
  image?: string;
  isActive: boolean;
  group?: CategoryGroupSummary;
}
