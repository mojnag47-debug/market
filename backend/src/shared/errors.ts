import { AppError } from './types';

export class InternalServerError extends AppError {
  constructor(message = 'Internal Server Error') {
    super(message, 500);
  }
}

export class PaymentFailedError extends AppError {
  constructor(message = 'Payment failed') {
    super(message, 502);
  }
}

export class InvalidPaymentVerificationError extends AppError {
  constructor(message = 'Invalid payment verification') {
    super(message, 400);
  }
}

export class ProductNotFoundError extends AppError {
  constructor(message = 'Product not found') {
    super(message, 404);
  }
}

export default {
  InternalServerError,
  PaymentFailedError,
  InvalidPaymentVerificationError,
  ProductNotFoundError,
};
