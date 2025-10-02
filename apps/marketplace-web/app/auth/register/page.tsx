'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from '@nextgen-marketplace/ui';
import { useRegister } from '@nextgen-marketplace/api';
import { RegisterData } from '@nextgen-marketplace/types';
import Link from 'next/link';
import { toast } from 'sonner';

const registerSchema = z.object({
  firstName: z.string().min(2, 'نام باید حداقل ۲ کاراکتر باشد'),
  lastName: z.string().min(2, 'نام خانوادگی باید حداقل ۲ کاراکتر باشد'),
  email: z.string().email('ایمیل معتبر وارد کنید'),
  phone: z.string().regex(/^(\+98|0)?9\d{9}$/, 'شماره موبایل معتبر وارد کنید').optional(),
  password: z.string().min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, 'پذیرش شرایط و قوانین الزامی است'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'تکرار رمز عبور مطابقت ندارد',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useRegister({
    onSuccess: () => {
      toast.success('ثبت نام با موفقیت انجام شد');
      router.push('/');
    },
    onError: (error) => {
      toast.error(error.message || 'خطا در ثبت نام');
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 space-x-reverse text-primary hover:text-primary/80 mb-4">
            <ArrowRight className="h-5 w-5" />
            <span>بازگشت به خانه</span>
          </Link>
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-lg bg-primary"></div>
          </div>
          <h1 className="text-2xl font-bold">ثبت نام در نکست‌ژن مارکت</h1>
          <p className="text-muted-foreground mt-2">حساب کاربری جدید ایجاد کنید</p>
        </div>

        {/* Register Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">ثبت نام</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium">
                    نام
                  </label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="نام"
                    rtl
                    {...register('firstName')}
                    className={errors.firstName ? 'border-destructive' : ''}
                    aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                  />
                  {errors.firstName && (
                    <p id="firstName-error" className="text-xs text-destructive" role="alert">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium">
                    نام خانوادگی
                  </label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="نام خانوادگی"
                    rtl
                    {...register('lastName')}
                    className={errors.lastName ? 'border-destructive' : ''}
                    aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                  />
                  {errors.lastName && (
                    <p id="lastName-error" className="text-xs text-destructive" role="alert">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  ایمیل
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  rtl={false}
                  {...register('email')}
                  className={errors.email ? 'border-destructive' : ''}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="text-sm text-destructive" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  شماره موبایل (اختیاری)
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="09123456789"
                  rtl
                  {...register('phone')}
                  className={errors.phone ? 'border-destructive' : ''}
                  aria-describedby={errors.phone ? 'phone-error' : undefined}
                />
                {errors.phone && (
                  <p id="phone-error" className="text-sm text-destructive" role="alert">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  رمز عبور
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="رمز عبور خود را وارد کنید"
                    rtl
                    {...register('password')}
                    className={`pl-10 ${errors.password ? 'border-destructive' : ''}`}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                  />
                  <button
                    type="button"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'پنهان کردن رمز عبور' : 'نمایش رمز عبور'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" className="text-sm text-destructive" role="alert">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  تکرار رمز عبور
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="رمز عبور خود را مجدداً وارد کنید"
                    rtl
                    {...register('confirmPassword')}
                    className={`pl-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                    aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                  />
                  <button
                    type="button"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'پنهان کردن تکرار رمز عبور' : 'نمایش تکرار رمز عبور'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p id="confirmPassword-error" className="text-sm text-destructive" role="alert">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Terms */}
              <div className="space-y-2">
                <label className="flex items-start space-x-2 space-x-reverse text-sm">
                  <input
                    type="checkbox"
                    {...register('acceptTerms')}
                    className="rounded border-gray-300 text-primary focus:ring-primary mt-1"
                  />
                  <span>
                    <Link href="/terms" className="text-primary hover:text-primary/80">شرایط و قوانین</Link>
                    {' '}و{' '}
                    <Link href="/privacy" className="text-primary hover:text-primary/80">حریم خصوصی</Link>
                    {' '}را مطالعه کرده و می‌پذیرم
                  </span>
                </label>
                {errors.acceptTerms && (
                  <p className="text-sm text-destructive" role="alert">
                    {errors.acceptTerms.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || registerMutation.isPending}
              >
                {isSubmitting || registerMutation.isPending ? 'در حال ثبت نام...' : 'ثبت نام'}
              </Button>

              {/* Login Link */}
              <div className="text-center text-sm">
                <span className="text-muted-foreground">قبلاً ثبت نام کرده‌اید؟ </span>
                <Link
                  href="/auth/login"
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  وارد شوید
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}