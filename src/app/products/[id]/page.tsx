import React from 'react';
import { ProductARViewer } from '@/components/ProductARViewer';

async function fetchProduct(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/products/${id}`);
  if (!res.ok) throw new Error('Failed to fetch product');
  return res.json();
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  let product;
  try {
    product = await fetchProduct(params.id);
  } catch (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px]">
        <p className="text-red-500">Error loading product.</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px]">
        <p className="text-gray-500">Product not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
      <p className="text-lg text-gray-700 mb-4">${product.price}</p>
      <ProductARViewer name={product.name} modelUrl={product.modelUrl} />
    </div>
  );
}
import React from 'react';
import ProductARViewer from '../../../components/ProductARViewer';

interface Product {
  id: string;
  name: string;
  price: number;
  modelUrl: string;
}

/**
 * Product detail page using Next.js App Router. Fetches product data from the API and renders the AR viewer.
 * @param params route params with product id
 */
export default async function ProductPage({ params }: { params: { id: string } }) {
  const id = params.id;

  // Server-side fetch (Next.js App Router supports async server components).
  // We fetch product data from the internal API. For local dev this should hit /api/products/[id]
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/products/${id}`, {
    cache: 'no-store',
    headers: {
      // Ensure internal calls do not leak credentials
      accept: 'application/json',
    },
  });

  if (!res.ok) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-semibold">Product not found</h1>
        <p className="mt-2 text-gray-600">Unable to load product {id}</p>
      </div>
    );
  }

  const product = (await res.json()) as Product;

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <ProductARViewer id={product.id} name={product.name} price={product.price} modelUrl={product.modelUrl} />
    </main>
  );
}
