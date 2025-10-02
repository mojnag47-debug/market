import { IsString, IsNumber, IsArray, IsOptional, IsEnum, Min } from 'class-validator';
import { OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';

export class CreateOrderDto {
  @IsArray()
  items: OrderItemDto[];

  @IsString()
  shippingAddressId: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;
}

export class OrderItemDto {
  @IsString()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  price: number;
}

export class OrderResponseDto {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  userId: string;
  shippingAddressId: string;
  paymentMethod?: PaymentMethod;
  paymentStatus: PaymentStatus;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItemResponseDto[];
}

export class OrderItemResponseDto {
  id: string;
  quantity: number;
  price: number;
  productId: string;
  createdAt: Date;
}