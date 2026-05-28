export interface HeaderSubItem {
  label: string;
  link?: string;
  slug?: string;
  categoryName?: string;
}

export interface HeaderMenuColumn {
  title: string;
  items: HeaderSubItem[];
}

export interface HeaderNavCategory {
  label: string;
  slug?: string;
  type: 'mega' | 'dropdown' | 'link';
  link?: string;
  categoryNames?: string[];
  columns?: HeaderMenuColumn[];
  featuredImage?: { src: string; caption: string };
  items?: HeaderSubItem[];
}
