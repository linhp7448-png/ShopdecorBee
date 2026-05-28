export type PaymentMethod = 'cod' | 'bank_transfer' | 'momo' | 'vnpay';
export type ProcessPaymentMethod = 'cod' | 'bank_transfer' | 'momo';

export interface AddCartItemRequestDto {
  productId: number;
  quantity: number;
}

export interface UpdateCartItemQuantityRequestDto {
  quantity: number;
}

export interface CartItemDto {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  productImage: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  availableStock: number;
  isAvailable: boolean;
}

export interface CartDto {
  id: number;
  userId: number;
  items: CartItemDto[];
  totalQuantity: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlaceOrderRequestDto {
  addressId?: number;
  fullName?: string;
  phone?: string;
  line1?: string;
  ward?: string;
  district?: string;
  city?: string;
  notes?: string;
}

export interface OrderItemDto {
  id: number;
  productId?: number | null;
  productName: string;
  productSku: string;
  productImage: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderDto {
  id: number;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  fullName: string;
  phone: string;
  line1: string;
  ward: string;
  district: string;
  city: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItemDto[];
}

export interface ProcessPaymentRequestDto {
  orderId: number;
  method: ProcessPaymentMethod;
}

export interface PaymentDto {
  id: number;
  orderId: number;
  orderNumber: string;
  method: PaymentMethod;
  status: string;
  amount: number;
  transactionCode: string;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VnPayCreateUrlRequestDto {
  orderId: number;
}

export interface VnPayCreateUrlResponseDto {
  paymentId: number;
  orderId: number;
  orderNumber: string;
  amount: number;
  transactionCode: string;
  createdAt: string;
  paymentUrl: string;
}