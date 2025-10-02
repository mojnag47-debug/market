'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from '@nextgen-marketplace/ui';
import { useLogin } from '@nextgen-marketplace/api';
import { LoginCredentials } from '@nextgen-marketplace/types';
import Link from 'next/link';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('ایمیل معتبر وارد کنید'),
  password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
  remember: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useLogin({
    onSuccess: (data) => {
      toast.success('با موفقیت وارد شدید');
      // Redirect based on user role
      switch (data.user.role) {
        case 'admin':
          router.push('/admin');
          break;
        case 'seller':
          router.push('/seller');
          break;
        default:
          router.push('/');
      }
    },
    onError: (error) => {
      toast.error(error.message || 'خطا در ورود');
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    loginMutation.mutate(data);
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
          <h1 className="text-2xl font-bold">ورود به نکست‌ژن مارکت</h1>
          <p className="text-muted-foreground mt-2">به حساب کاربری خود وارد شوید</p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">ورود</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

              {/* Remember & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 space-x-reverse">
                  <input
                    type="checkbox"
                    {...register('remember')}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span>مرا به خاطر بسپار</span>
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-primary hover:text-primary/80"
                >
                  فراموشی رمز عبور
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || loginMutation.isPending}
              >
                {isSubmitting || loginMutation.isPending ? 'در حال ورود...' : 'ورود'}
              </Button>

              {/* Sign Up Link */}
              <div className="text-center text-sm">
                <span className="text-muted-foreground">حساب کاربری ندارید؟ </span>
                <Link
                  href="/auth/register"
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  ثبت نام کنید
                </Link>
              </div>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">یا</span>
              </div>
            </div>

            {/* Demo Accounts */}
            <div className="space-y-2">
              <p className="text-sm text-center text-muted-foreground mb-3">
                حساب‌های آزمایشی:
              </p>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="bg-muted/50 p-2 rounded">
                  <strong>مشتری:</strong> customer@test.com | 123456
                </div>
                <div className="bg-muted/50 p-2 rounded">
                  <strong>فروشنده:</strong> seller@test.com | 123456
                </div>
                <div className="bg-muted/50 p-2 rounded">
                  <strong>مدیر:</strong> admin@test.com | 123456
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}