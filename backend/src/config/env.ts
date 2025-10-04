export const env = {
  ZARINPAL_MERCHANT_ID: process.env.ZARINPAL_MERCHANT_ID || '',
  ZARINPAL_CALLBACK_URL: process.env.ZARINPAL_CALLBACK_URL || '',
  ZARINPAL_SANDBOX: process.env.ZARINPAL_SANDBOX || 'true',
  ZARINPAL_WEBHOOK_SECRET: process.env.ZARINPAL_WEBHOOK_SECRET || '',
  REDIS_URL: process.env.REDIS_URL || '',
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || '',
};

export default env;
