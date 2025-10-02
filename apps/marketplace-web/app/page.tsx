'use client';

import { useState } from 'react';
import { Search, ShoppingCart, User, Menu, Heart } from 'lucide-react';
import { Button, Input, Card, CardContent, Badge } from '@nextgen-marketplace/ui';
import { useProducts, useCategories, useCart } from '@nextgen-marketplace/api';
import { debounce } from '@nextgen-marketplace/ui';
import Link from 'next/link';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { data: categories } = useCategories();
  const { data: products } = useProducts(1, 12);
  const { data: cart } = useCart();

  const debouncedSearch = debounce((query: string) => {
    setSearchQuery(query);
  }, 300);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 space-x-reverse">
              <div className="h-8 w-8 rounded bg-primary"></div>
              <span className="font-bold text-xl">نکست‌ژن مارکت</span>
            </Link>

            {/* Search */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="جستجو در محصولات..."
                  className="pr-9 rtl"
                  onChange={(e) => debouncedSearch(e.target.value)}
                  aria-label="جستجو در محصولات"
                />
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-4 space-x-reverse">
              <Button 
                variant="ghost" 
                size="icon" 
                className="hidden md:flex"
                aria-label="علاقه‌مندی‌ها"
              >
                <Heart className="h-5 w-5" />
              </Button>
              
              <Link href="/cart">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative"
                  aria-label={`سبد خرید - ${cart?.totalItems ?? 0} آیتم`}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {(cart?.totalItems ?? 0) > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -left-1 h-5 w-5 rounded-full p-0 text-xs"
                    >
                      {cart?.totalItems ?? 0}
                    </Badge>
                  )}
                </Button>
              </Link>

              <Link href="/auth/login">
                <Button 
                  variant="ghost" 
                  size="icon"
                  aria-label="حساب کاربری"
                >
                  <User className="h-5 w-5" />
                </Button>
              </Link>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="منوی موبایل"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Mobile search */}
          <div className="md:hidden pb-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="جستجو در محصولات..."
                className="pr-9 rtl"
                onChange={(e) => debouncedSearch(e.target.value)}
                aria-label="جستجو در محصولات"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Categories Navigation */}
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-8 space-x-reverse py-3 overflow-x-auto">
            <Link 
              href="/categories" 
              className="whitespace-nowrap text-sm font-medium hover:text-primary transition-colors"
            >
              همه دسته‌ها
            </Link>
            {categories?.slice(0, 6).map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="whitespace-nowrap text-sm font-medium hover:text-primary transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-l from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="lg:w-1/2 space-y-6 text-center lg:text-right mb-10 lg:mb-0">
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground">
                خرید آنلاین با
                <span className="text-primary block mt-2">بهترین قیمت</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                هزاران محصول اصل با گارانتی، ارسال سریع و پرداخت امن در نکست‌ژن مارکت
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/products">
                  <Button size="lg" className="px-8">
                    مشاهده محصولات
                  </Button>
                </Link>
                <Link href="/categories">
                  <Button variant="outline" size="lg" className="px-8">
                    دسته‌بندی‌ها
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="lg:w-1/2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent rounded-lg blur-xl transform -rotate-6"></div>
                <Card className="relative bg-card/50 backdrop-blur">
                  <CardContent className="p-8 text-center">
                    <div className="text-6xl mb-4">🛍️</div>
                    <h3 className="text-2xl font-bold mb-2">پیشنهاد ویژه امروز</h3>
                    <p className="text-muted-foreground">تا ۵۰٪ تخفیف روی محصولات منتخب</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">محصولات پیشنهادی</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              انتخابی از بهترین و پرفروش‌ترین محصولات بازار
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products?.data?.map((product) => (
              <Card key={product.id} className="group card-hover">
                <CardContent className="p-4">
                  <div className="aspect-square bg-muted rounded-lg mb-4 relative overflow-hidden">
                    <img 
                      src={product.images[0] || '/placeholder-product.jpg'} 
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                    {product.discountPrice && (
                      <Badge 
                        variant="destructive" 
                        className="absolute top-2 left-2"
                      >
                        {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% تخفیف
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-sm line-clamp-2 mb-2 rtl:text-right">
                    {product.title}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex flex-col">
                      {product.discountPrice ? (
                        <>
                          <span className="text-lg font-bold text-primary">
                            {product.discountPrice.toLocaleString('fa-IR')} ریال
                          </span>
                          <span className="text-sm text-muted-foreground line-through">
                            {product.price.toLocaleString('fa-IR')} ریال
                          </span>
                        </>
                      ) : (
                        <span className="text-lg font-bold">
                          {product.price.toLocaleString('fa-IR')} ریال
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span className="ml-1">⭐</span>
                      {product.rating.toFixed(1)}
                    </div>
                  </div>

                  <Link href={`/products/${product.id}`}>
                    <Button className="w-full" size="sm">
                      مشاهده محصول
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/products">
              <Button variant="outline" size="lg">
                مشاهده همه محصولات
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* AI Recommendations Placeholder */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">پیشنهادات هوشمند</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              بر اساس سلیقه و تاریخچه خرید شما
            </p>
          </div>

          <Card className="text-center py-16">
            <CardContent>
              <div className="text-6xl mb-4">🤖</div>
              <h3 className="text-2xl font-bold mb-2">هوش مصنوعی در حال بارگذاری</h3>
              <p className="text-muted-foreground">
                در حال تحلیل سلیقه شما برای ارائه بهترین پیشنهادات...
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 space-x-reverse mb-4">
                <div className="h-8 w-8 rounded bg-primary"></div>
                <span className="font-bold text-xl">نکست‌ژن مارکت</span>
              </div>
              <p className="text-muted-foreground">
                بزرگترین فروشگاه آنلاین ایران با بیش از ۱ میلیون محصول اصل و باکیفیت
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">خدمات مشتریان</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/contact" className="hover:text-foreground">تماس با ما</Link></li>
                <li><Link href="/faq" className="hover:text-foreground">سؤالات متداول</Link></li>
                <li><Link href="/returns" className="hover:text-foreground">مرجوعی</Link></li>
                <li><Link href="/warranty" className="hover:text-foreground">گارانتی</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">راهنمای خرید</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/how-to-buy" className="hover:text-foreground">نحوه خرید</Link></li>
                <li><Link href="/payment" className="hover:text-foreground">روش‌های پرداخت</Link></li>
                <li><Link href="/shipping" className="hover:text-foreground">ارسال</Link></li>
                <li><Link href="/terms" className="hover:text-foreground">شرایط استفاده</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">نکست‌ژن مارکت</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground">درباره ما</Link></li>
                <li><Link href="/careers" className="hover:text-foreground">فرصت‌های شغلی</Link></li>
                <li><Link href="/sellers" className="hover:text-foreground">فروش در نکست‌ژن</Link></li>
                <li><Link href="/blog" className="hover:text-foreground">وبلاگ</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-8 mt-8 text-center text-sm text-muted-foreground">
            <p>&copy; ۱۴۰۳ نکست‌ژن مارکت. تمامی حقوق محفوظ است.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}