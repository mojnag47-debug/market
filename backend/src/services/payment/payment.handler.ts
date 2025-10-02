import { PrismaClient } from '@prisma/client';
import { verifyZarinpalPayment } from '@payment-zarinpal/core';
import {
  PaymentGateway,
  PaymentMethod,
  PaymentStatus,
  type PaymentRequest,
  type PaymentVerification
} from '../shared/types';
import { env } from '../config/env';
import { logger } from '../shared/logger';
import {
  InternalServerError,
  PaymentFailedError,
  InvalidPaymentVerificationError
} from '../shared/errors';
import { validateWithZod } from '../middleware/validation';
import { paymentRequestSchema, paymentVerificationSchema } from './payment.schema';

const prisma = new PrismaClient();

/**
 * Initiates Zarinpal payment process with secure credential handling
 */
export async function initiateZarinpalPayment(paymentData: PaymentRequest) {
  validateWithZod(paymentRequestSchema, paymentData);

  try {
    const payment = await prisma.payment.create({
      data: {
        amount: paymentData.amount,
        currency: paymentData.currency || 'IRR',
        method: PaymentMethod.ZARINPAL,
        gateway: PaymentGateway.ZARINPAL,
        userId: paymentData.userId,
        orderId: paymentData.orderId,
        description: paymentData.description,
        status: PaymentStatus.PENDING
      }
    });

    const paymentResult = await verifyZarinpalPayment({
      merchantId: env.ZARINPAL_MERCHANT_ID,
      amount: paymentData.amount,
      currency: paymentData.currency,
      callbackUrl: env.ZARINPAL_CALLBACK_URL,
      description: paymentData.description,
      metadata: {
        paymentId: payment.id,
        orderId: paymentData.orderId
      }
    }, {
      sandbox: env.ZARINPAL_SANDBOX === 'true'
    });

    if (!paymentResult.success) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED }
      });
      throw new PaymentFailedError('Zarinpal payment initiation failed');
    }

    return {
      paymentId: payment.id,
      gatewayUrl: paymentResult.gatewayUrl,
      transactionId: paymentResult.transactionId
    };
  } catch (error) {
    logger.error('Payment initiation error', { error, paymentData });
    throw new InternalServerError('Payment processing failed');
  }
}

/**
 * Verifies Zarinpal payment with idempotency checks and transaction validation
 */
export async function verifyPayment(verificationData: PaymentVerification) {
  validateWithZod(paymentVerificationSchema, verificationData);

  try {
    const existingPayment = await prisma.payment.findUnique({
      where: { transactionId: verificationData.transactionId }
    });

    if (existingPayment?.status === PaymentStatus.COMPLETED) {
      return { status: 'already_verified', payment: existingPayment };
    }

    const verification = await verifyZarinpalPayment({
      transactionId: verificationData.transactionId,
      amount: verificationData.amount
    });

    if (!verification.success) {
      await prisma.payment.update({
        where: { transactionId: verificationData.transactionId },
        data: { status: PaymentStatus.FAILED }
      });
      throw new PaymentFailedError('Payment verification failed');
    }

    const updatedPayment = await prisma.payment.update({
      where: { transactionId: verificationData.transactionId },
      data: {
        status: PaymentStatus.COMPLETED,
        gatewayPaymentId: verification.gatewayTransactionId,
        completedAt: new Date()
      }
    });

    return { status: 'verified', payment: updatedPayment };
  } catch (error) {
    logger.error('Payment verification error', { error, verificationData });
    throw new InvalidPaymentVerificationError('Invalid payment verification request');
  }
}

/**
 * Handles Zarinpal webhook events with HMAC signature verification
 */
export async function handlePaymentWebhook(eventPayload: unknown) {
  try {
    const signature = eventPayload.headers['x-zarinpal-signature'];
    const isValid = verifyZarinpalSignature(
      JSON.stringify(eventPayload.body),
      env.ZARINPAL_WEBHOOK_SECRET,
      signature
    );

    if (!isValid) {
      throw new InvalidPaymentVerificationError('Invalid webhook signature');
    }

    // Process webhook event types
    switch (eventPayload.event) {
      case 'payment.refunded':
        await handleRefundEvent(eventPayload);
        break;
      case 'payment.failed':
        await handleFailedPayment(eventPayload);
        break;
      default:
        logger.warn('Unhandled webhook event', { event: eventPayload.event });
    }

    return { success: true };
  } catch (error) {
    logger.error('Webhook processing error', { error });
    throw new InternalServerError('Webhook handling failed');
  }
}

async processPayment(amount: number, currency: string, idempotencyKey: string) {
  if (!idempotencyKey) throw new BadRequestException('Idempotency key required');

  const redisClient = this.redisService.getClient();
  const existingPayment = await redisClient.get(`idempotency:${idempotencyKey}`);
  if (existingPayment) return JSON.parse(existingPayment);

  try {
    const paymentIntent = await this.createPaymentIntent(amount, currency);
    await redisClient.setEx(
      `idempotency:${idempotencyKey}`,
      IDEMPOTENCY_KEY_TTL,
      JSON.stringify(paymentIntent)
    );
    return paymentIntent;
  } catch (error) {
    throw new InternalServerError('Payment processing failed');
  }
}