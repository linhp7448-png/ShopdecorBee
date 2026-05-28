export interface CartItem {
  id: number;
  productId: number;
  productName?: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  lineTotal?: number;
  availableStock?: number;
  isAvailable?: boolean;
}

export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  subtotal?: number;
  updatedAt: string;
}
