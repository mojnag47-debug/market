import { Test } from '@nestjs/testing';
// auth.service may not be built in this environment; import as type for tests to compile in CI
describe('سرویس احراز هویت', () => {
  let authService: any;

  beforeEach(async () => {
    // require the service at runtime so TypeScript build won't fail if the implementation isn't emitted yet
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { AuthService: RuntimeAuthService } = require('./auth.service');
    const moduleRef = await Test.createTestingModule({
      providers: [RuntimeAuthService],
    }).compile();

    authService = moduleRef.get(RuntimeAuthService);
  });

  it('باید شماره موبایل فارسی را تایید کند', () => {
    const mobile = '+۹۸۹۱۲۳۴۵۶۷۸۹';
    expect(authService.validateIranianMobile(mobile)).toBeTruthy();
  });

  it('باید کد تایید ۶ رقمی ایجاد کند', () => {
    const code = authService.generateVerificationCode();
    expect(code).toMatch(/^\d{6}$/);
    expect(parseInt(code)).toBeLessThanOrEqual(999999);
  });

  it('باید تاریخ انقضای کد را به شکل شمسی ثبت کند', () => {
    const expiry = authService.getCodeExpiryDate();
    // Use a Unicode-friendly loose match for Persian/Arabic-Indic digits (year/month/day)
    expect(expiry).toMatch(/^[\p{N}]{4}\/\p{N}{1,2}\/\p{N}{1,2}$/u);
  });
});