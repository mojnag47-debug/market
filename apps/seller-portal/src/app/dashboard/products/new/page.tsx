'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import styles from '../../../page.module.css';

const productSchema = z.object({
  name: z.string().min(3, 'نام محصول باید حداقل ۳ کاراکتر باشد'),
  description: z.string().min(20, 'توضیحات باید حداقل ۲۰ کاراکتر باشد'),
  price: z.number().min(1000, 'قیمت نباید کمتر از ۱٬۰۰۰ تومان باشد'),
  stock: z.number().min(0, 'تعداد موجودی نمی‌تواند منفی باشد'),
  images: z.array(z.string().url('آدرس تصویر معتبر نیست')).min(1, 'حداقل یک تصویر نیاز است')
});

export default function NewProductPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema)
  });

  const onSubmit = (data: any) => {
    console.log('Product Data:', data);
    // TODO: Integrate with backend API
  };

  return (
    <div className={styles.container} dir="rtl">
      <h1 className={styles.formTitle}>افزودن محصول جدید</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className={styles.productForm}>
        <div className={styles.formGroup}>
          <label htmlFor="name">نام محصول:</label>
          <input
            {...register('name')}
            id="name"
            className={errors.name ? styles.inputError : ''}
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <p className={styles.errorMessage} role="alert">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description">توضیحات:</label>
          <textarea
            {...register('description')}
            id="description"
            rows={4}
            className={errors.description ? styles.inputError : ''}
            aria-invalid={!!errors.description}
          />
          {errors.description && (
            <p className={styles.errorMessage} role="alert">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="price">قیمت (تومان):</label>
            <input
              type="number"
              {...register('price', { valueAsNumber: true })}
              id="price"
              className={errors.price ? styles.inputError : ''}
              aria-invalid={!!errors.price}
            />
            {errors.price && (
              <p className={styles.errorMessage} role="alert">
                {errors.price.message}
              </p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="stock">تعداد موجودی:</label>
            <input
              type="number"
              {...register('stock', { valueAsNumber: true })}
              id="stock"
              className={errors.stock ? styles.inputError : ''}
              aria-invalid={!!errors.stock}
            />
            {errors.stock && (
              <p className={styles.errorMessage} role="alert">
                {errors.stock.message}
              </p>
            )}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>آدرس تصاویر:</label>
          {[0, 1, 2].map((index) => (
            <input
              key={index}
              {...register(`images.${index}`)}
              className={errors.images ? styles.inputError : ''}
              aria-invalid={!!errors.images}
            />
          ))}
          {errors.images && (
            <p className={styles.errorMessage} role="alert">
              {errors.images.message}
            </p>
          )}
        </div>

        <button type="submit" className={styles.submitButton}>
          ثبت محصول
        </button>
      </form>
    </div>
  );
}