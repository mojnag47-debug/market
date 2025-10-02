import { Test } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import nock from 'nock';

describe('یکپارچه‌سازی درگاه شاپرک', () => {
  let paymentService: PaymentService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [PaymentService],
    }).compile();

    paymentService = moduleRef.get<PaymentService>(PaymentService);
    jest.setTimeout(10000); // شبیه‌سازی تأخیر شبکه ایرانی
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('باید تراکنش موفق را پردازش کند', async () => {
    nock('https://api.shaparak.ir')
      .post('/transaction')
      .delay(2000) // تأخیر 2 ثانیه‌ای
      .reply(200, {status: 'success'});

    const result = await paymentService.processPayment({
      amount: 2500000,
      mobile: '۰۹۱۲۳۴۵۶۷۸۹',
      nationalId: '۰۰۸۵۴۷۶۳۲۱'
    });

    expect(result.status).toBe('success');
  });

  it('باید خطای زمان‌انتظار را مدیریت کند', async () => {
    nock('https://api.shaparak.ir')
      .post('/transaction')
      .delay(8000) // تأخیر بیش از حد مجاز
      .reply(504);

    await expect(paymentService.processPayment({
      amount: 150000,
      mobile: '۰۹۳۵۵۵۵۵۵۵۵'
    })).rejects.toThrow('زمان انتظار به پایان رسید');
  });

  it('باید مبالغ ایرانی را اعتبارسنجی کند', () => {
    const formatted = paymentService.formatIRR(1500000);
    expect(formatted).toBe('۱,۵۰۰,۰۰۰ تومان');
  });
});