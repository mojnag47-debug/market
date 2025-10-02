import { NextResponse } from 'next/server';
import { productService } from 'backend/src/services/product/product.service';

export async function GET() {
  try {
    const products = await productService.getFeaturedProducts();
    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to load featured products' },
      { status: 500 }
    );
  }
}