'use client';

import { useState } from 'react';
import { Minus, Plus, Trash2, ArrowRight, ShoppingCart } from 'lucide-react';
import { Button, Card, CardContent, Input, Badge } from '@nextgen-marketplace/ui';
import { useCart, useUpdateCartItem, useRemoveFromCart } from '@nextgen-marketplace/api';
import { formatPrice } from '@nextgen-marketplace/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function CartPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  const { data: cart, isLoading } = useCart();
  const updateCartItem = useUpdateCartItem();
  const removeFromCart = useRemoveFromCart();

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setLoading(itemId);
    try {
      await updateCartItem.mutateAsync({ itemId, quantity: newQuantity });
      toast.success('تعداد محصول به‌روزرسانی شد');
    } catch (error) {
      toast.error('خطا در به‌روزرسانی سبد خرید');
    } finally {
      setLoading(null);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    setLoading(itemId);
    try {
      await removeFromCart.mutateAsync(itemId);
      toast.success('محصول از سبد خرید حذف شد');
    } catch (error) {
      toast.error('خطا در حذف محصول');
    } finally {
      setLoading(null);
    }
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-48 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <div className="h-20 w-20 bg-muted rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">سبد خرید</h1>
            <p className="text-muted-foreground">
              {cart?.totalItems ? `${cart.totalItems} آیتم در سبد خرید` : 'سبد خرید خالی است'}
            </p>
          </div>
          <Link href="/" className="flex items-center space-x-2 space-x-reverse text-primary hover:text-primary/80">
            <ArrowRight className="h-5 w-5" />
            <span>ادامه خرید</span>
          </Link>
        </div>

        {!cart?.items?.length ? (
          /* Empty Cart */
          <div className="text-center py-16">
            <Card className="max-w-md mx-auto">
              <CardContent className="p-8">
                <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">سبد خرید شما خالی است</h2>
                <p className="text-muted-foreground mb-6">
                  محصولی به سبد خرید اضافه نکرده‌اید. برای شروع خرید به فروشگاه بروید.
                </p>
                <Link href="/products">
                  <Button className="w-full">شروع خرید</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 space-x-reverse">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.product.images[0] || '/placeholder-product.jpg'}
                          alt={item.product.title}
                          className="h-20 w-20 rounded-lg object-cover"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${item.product.id}`}>
                          <h3 className="font-semibold text-lg line-clamp-2 hover:text-primary transition-colors">
                            {item.product.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">
                          فروشنده: {item.product.seller.businessName}
                        </p>
                        
                        {/* Variations */}
                        {item.selectedVariations && Object.keys(item.selectedVariations).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {Object.entries(item.selectedVariations).map(([key, value]) => (
                              <Badge key={key} variant="secondary" className="text-xs">
                                {key}: {value}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-4">
                          {/* Price */}
                          <div className="flex flex-col">
                            {item.product.discountPrice ? (
                              <>
                                <span className="font-bold text-primary">
                                  {formatPrice(item.product.discountPrice)}
                                </span>
                                <span className="text-sm text-muted-foreground line-through">
                                  {formatPrice(item.product.price)}
                                </span>
                              </>
                            ) : (
                              <span className="font-bold">
                                {formatPrice(item.product.price)}
                              </span>
                            )}
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1 || loading === item.id}
                              aria-label="کاهش تعداد"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                if (value > 0) {
                                  handleQuantityChange(item.id, value);
                                }
                              }}
                              className="w-16 text-center"
                              min="1"
                              max={item.product.stock}
                              disabled={loading === item.id}
                            />
                            
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.product.stock || loading === item.id}
                              aria-label="افزایش تعداد"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Stock Warning */}
                        {item.product.stock < 5 && (
                          <p className="text-sm text-warning mt-2">
                            تنها {item.product.stock} عدد در انبار موجود است!
                          </p>
                        )}
                      </div>

                      {/* Remove Button */}
                      <div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={loading === item.id}
                          aria-label="حذف از سبد خرید"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="text-left mt-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground">مجموع این آیتم:</p>
                      <p className="font-bold">
                        {formatPrice((item.product.discountPrice || item.product.price) * item.quantity)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">خلاصه سفارش</h2>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span>قیمت کالاها ({cart.totalItems} آیتم)</span>
                      <span>{formatPrice(cart.totalPrice)}</span>
                    </div>
                    
                    {cart.discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>تخفیف</span>
                        <span>-{formatPrice(cart.discountAmount)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-muted-foreground">
                      <span>هزینه ارسال</span>
                      <span>محاسبه در مرحله بعد</span>
                    </div>
                    
                    <hr />
                    
                    <div className="flex justify-between text-lg font-bold">
                      <span>جمع کل</span>
                      <span className="text-primary">{formatPrice(cart.finalPrice)}</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full mb-4"
                    size="lg"
                    onClick={handleCheckout}
                  >
                    ادامه فرآیند خرید
                  </Button>

                  <div className="text-sm text-muted-foreground space-y-2">
                    <div className="flex items-center">
                      <span>✅ ضمانت بازگشت پول</span>
                    </div>
                    <div className="flex items-center">
                      <span>🚚 ارسال رایگان بالای ۵۰۰ هزار تومان</span>
                    </div>
                    <div className="flex items-center">
                      <span>🔒 پرداخت امن</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}