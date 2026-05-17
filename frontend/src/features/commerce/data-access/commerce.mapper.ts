import type { Cart, CartItem, Order, OrderItem } from '@/core/models';
import type { CartDto, CartItemDto, OrderDto, OrderItemDto, PaymentDto } from './commerce.api.types';

export interface PaymentRecord {
  id: number;
  orderId: number;
  orderNumber: string;
  method: string;
  status: string;
  amount: number;
  transactionCode: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

function mapOrderStatus(status: string): Order['status'] {
  switch (status.toLowerCase()) {
    case 'processing':
      return 'processing';
    case 'shipping':
    case 'shipped':
      return 'shipping';
    case 'completed':
      return 'completed';
    case 'cancelled':
      return 'cancelled';
    case 'refund_requested':
      return 'refund_requested';
    case 'refunded':
      return 'refunded';
    case 'pending_payment':
    default:
      return 'pending';
  }
}

export function mapCartItemDto(dto: CartItemDto): CartItem {
  return {
    id: dto.id,
    productId: dto.productId,
    productName: dto.productName,
    productImage: dto.productImage,
    quantity: dto.quantity,
    unitPrice: dto.unitPrice,
    lineTotal: dto.lineTotal,
    availableStock: dto.availableStock,
    isAvailable: dto.isAvailable
  };
}

export function mapCartDto(dto: CartDto): Cart {
  return {
    id: dto.id,
    userId: dto.userId,
    items: dto.items.map(mapCartItemDto),
    subtotal: dto.subtotal,
    updatedAt: dto.updatedAt
  };
}

export function mapOrderItemDto(dto: OrderItemDto): OrderItem {
  return {
    id: dto.id,
    productId: dto.productId ?? 0,
    productName: dto.productName,
    quantity: dto.quantity,
    unitPrice: dto.unitPrice,
    productSku: dto.productSku,
    productImage: dto.productImage,
    lineTotal: dto.lineTotal
  };
}

export function mapOrderDto(dto: OrderDto): Order {
  return {
    id: dto.id,
    orderCode: dto.orderNumber,
    userId: 0,
    items: dto.items.map(mapOrderItemDto),
    subtotal: dto.subtotal,
    shippingFee: dto.shippingFee,
    totalAmount: dto.totalAmount,
    status: mapOrderStatus(dto.status),
    paymentStatus: dto.paymentStatus.toLowerCase() as NonNullable<Order['paymentStatus']>,
    fullName: dto.fullName,
    phone: dto.phone,
    line1: dto.line1,
    ward: dto.ward,
    district: dto.district,
    city: dto.city,
    notes: dto.notes ?? (dto as any)['Notes'] ?? undefined,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt
  };
}

export function mapPaymentDto(dto: PaymentDto): PaymentRecord {
  return {
    id: dto.id,
    orderId: dto.orderId,
    orderNumber: dto.orderNumber,
    method: dto.method,
    status: dto.status,
    amount: dto.amount,
    transactionCode: dto.transactionCode,
    paidAt: dto.paidAt ?? undefined,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt
  };
}
