import { Product } from './product.model';

export interface Hotspot {
  id: number;
  x: number;
  y: number;
  product: Product;
}

export interface ShopLook {
  id: number;
  name: string;
  description: string;
  image: string;
  hotspots: Hotspot[];
}

export interface BlogPost {
  id: number;
  title: string;
  date: string;
  image: string;
  summary: string;
}
